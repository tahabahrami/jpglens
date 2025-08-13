/**
 * 🔍 jpglens - OpenAI Provider
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AIProvider, AnalysisContext, AnalysisResult, ScreenshotData, JPGLensConfig } from '../core/types.js';

/**
 * OpenAI provider for jpglens
 * Direct integration with OpenAI's GPT-4 Vision and other models
 */
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(private config: JPGLensConfig) {
    this.apiKey = config.ai.apiKey;
    this.model = config.ai.model?.includes('/') ? config.ai.model.split('/')[1] : config.ai.model;
    this.baseUrl = config.ai.baseUrl || 'https://api.openai.com/v1';

    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getModelInfo(): { name: string; capabilities: string[] } {
    return {
      name: this.model,
      capabilities: ['vision', 'text-analysis', 'code-generation']
    };
  }

  async analyze(screenshot: ScreenshotData, context: AnalysisContext, prompt: string): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const base64Image = screenshot.buffer.toString('base64');

      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                  detail: this.config.analysis.depth === 'comprehensive' ? 'high' : 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: this.config.ai.maxTokens || 4000,
        temperature: this.config.ai.temperature || 0.1
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const analysisText = result.choices[0].message.content;
      const tokensUsed = result.usage?.total_tokens || 0;

      return this.parseAnalysisResult(analysisText, context, tokensUsed, startTime);

    } catch (error) {
      throw new Error(`OpenAI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAnalysisResult(
    analysisText: string, 
    context: AnalysisContext, 
    tokensUsed: number, 
    startTime: number
  ): AnalysisResult {
    // Similar parsing logic as OpenRouter provider
    // This is a simplified version - in production you'd want shared parsing utilities
    
    const scoreMatch = analysisText.match(/(?:OVERALL UX SCORE|QUALITY SCORE):\s*(\d+)\/10/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    return {
      id: `jpglens-openai-${Date.now()}`,
      timestamp: new Date().toISOString(),
      page: context.pageInfo?.url || 'unknown',
      context,
      overallScore,
      scores: {
        usability: overallScore,
        accessibility: overallScore,
        visualDesign: overallScore,
        performance: overallScore
      },
      strengths: [],
      criticalIssues: [],
      majorIssues: [],
      minorIssues: [],
      recommendations: [],
      model: this.model,
      tokensUsed,
      analysisTime: Date.now() - startTime,
      provider: 'OpenAI',
      rawAnalysis: analysisText
    };
  }
}
