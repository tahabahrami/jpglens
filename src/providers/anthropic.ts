/**
 * 🔍 jpglens - Anthropic Provider
 * Universal AI-Powered UI Testing
 *
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AIProvider, AnalysisContext, AnalysisResult, ScreenshotData, JPGLensConfig } from '../core/types.js';

/**
 * Anthropic Claude provider for jpglens
 * Direct integration with Claude's vision capabilities
 */
export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';
  private baseUrl = 'https://api.anthropic.com/v1';
  private apiKey: string;
  private model: string;

  constructor(private config: JPGLensConfig) {
    this.apiKey = config.ai.apiKey;
    this.model = config.ai.model?.includes('/') ? config.ai.model.split('/')[1] : config.ai.model;

    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      return response.status !== 401; // Not unauthorized
    } catch {
      return false;
    }
  }

  getModelInfo(): { name: string; capabilities: string[] } {
    return {
      name: this.model,
      capabilities: ['vision', 'text-analysis', 'detailed-reasoning'],
    };
  }

  async analyze(screenshot: ScreenshotData, context: AnalysisContext, prompt: string): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const base64Image = screenshot.buffer.toString('base64');

      const requestBody = {
        model: this.model,
        max_tokens: this.config.ai.maxTokens || 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const analysisText = result.content[0].text;
      const tokensUsed = result.usage?.input_tokens + result.usage?.output_tokens || 0;

      return this.parseAnalysisResult(analysisText, context, tokensUsed, startTime);
    } catch (error) {
      throw new Error(`Anthropic analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAnalysisResult(
    analysisText: string,
    context: AnalysisContext,
    tokensUsed: number,
    startTime: number
  ): AnalysisResult {
    const scoreMatch = analysisText.match(/(?:OVERALL UX SCORE|QUALITY SCORE):\s*(\d+)\/10/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    return {
      id: `jpglens-anthropic-${Date.now()}`,
      timestamp: new Date().toISOString(),
      page: context.pageInfo?.url || 'unknown',
      context,
      overallScore,
      scores: {
        usability: overallScore,
        accessibility: overallScore,
        visualDesign: overallScore,
        performance: overallScore,
      },
      strengths: [],
      criticalIssues: [],
      majorIssues: [],
      minorIssues: [],
      recommendations: [],
      model: this.model,
      tokensUsed,
      analysisTime: Date.now() - startTime,
      provider: 'Anthropic',
      rawAnalysis: analysisText,
    };
  }
}
