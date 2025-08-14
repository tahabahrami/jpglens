/**
 * 🔍 jpglens - OpenRouter AI Provider
 * Universal AI-Powered UI Testing
 *
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AIProvider, AnalysisContext, AnalysisResult, ScreenshotData, JPGLensConfig } from '../core/types.js';

/**
 * OpenRouter AI provider for jpglens
 * Supports multiple AI models through OpenRouter's unified API
 */
export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(private config: JPGLensConfig) {
    this.baseUrl = config.ai.baseUrl || 'https://openrouter.ai/api/v1';
    this.apiKey = config.ai.apiKey;
    this.model = config.ai.model;

    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required. Set JPGLENS_API_KEY environment variable.');
    }
  }

  /**
   * Check if OpenRouter is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://jpglens.dev',
          'X-Title': 'jpglens - Universal AI UI Testing',
        },
      });

      return response.ok;
    } catch (error) {
      console.warn('OpenRouter availability check failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; capabilities: string[] } {
    return {
      name: this.model,
      capabilities: ['vision', 'text-analysis', 'code-generation', 'accessibility-analysis'],
    };
  }

  /**
   * Analyze screenshot with OpenRouter
   */
  async analyze(screenshot: ScreenshotData, context: AnalysisContext, prompt: string): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      // Validate inputs
      if (!screenshot.buffer || screenshot.buffer.length === 0) {
        throw new Error('Invalid screenshot data');
      }

      // Convert screenshot to base64
      const base64Image = screenshot.buffer.toString('base64');

      // Prepare request body
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                  detail: this.config.analysis.depth === 'comprehensive' ? 'high' : 'auto',
                },
              },
            ],
          },
        ],
        max_tokens: this.config.ai.maxTokens || 4000,
        temperature: this.config.ai.temperature || 0.1,
        stream: false,
      };

      // Make API request
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://jpglens.dev',
          'X-Title': 'jpglens - Universal AI UI Testing',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.choices || result.choices.length === 0) {
        throw new Error('No analysis result returned from OpenRouter');
      }

      const analysisText = result.choices[0].message.content;
      const tokensUsed = result.usage?.total_tokens || 0;

      // Parse the analysis text into structured result
      const structuredResult = this.parseAnalysisResult(analysisText, context, tokensUsed, startTime);

      return structuredResult;
    } catch (error) {
      console.error('OpenRouter analysis failed:', error);
      throw new Error(`OpenRouter analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse AI analysis text into structured result
   */
  private parseAnalysisResult(
    analysisText: string,
    context: AnalysisContext,
    tokensUsed: number,
    startTime: number
  ): AnalysisResult {
    const analysisTime = Date.now() - startTime;

    // Extract overall score
    const scoreMatch = analysisText.match(/(?:OVERALL UX SCORE|QUALITY SCORE):\s*(\d+)\/10/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    // Extract sections using regex patterns
    const strengths = this.extractSection(analysisText, 'STRENGTHS');
    const criticalIssues = this.extractIssues(analysisText, 'CRITICAL ISSUES', 'critical');
    const majorIssues = this.extractIssues(analysisText, 'MAJOR ISSUES', 'major');
    const minorIssues = this.extractIssues(analysisText, 'MINOR ISSUES', 'minor');
    const recommendations = this.extractRecommendations(analysisText);

    // Extract specific scores if available
    const scores = {
      usability: this.extractSpecificScore(analysisText, 'usability') || overallScore,
      accessibility: this.extractSpecificScore(analysisText, 'accessibility') || overallScore,
      visualDesign: this.extractSpecificScore(analysisText, 'visual') || overallScore,
      performance: this.extractSpecificScore(analysisText, 'performance') || overallScore,
    };

    return {
      id: `jpglens-openrouter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      page: context.pageInfo?.url || 'unknown',
      context,
      overallScore,
      scores,
      strengths,
      criticalIssues,
      majorIssues,
      minorIssues,
      recommendations,
      model: this.model,
      tokensUsed,
      analysisTime,
      provider: 'OpenRouter',
      rawAnalysis: analysisText, // Keep raw text for debugging
    };
  }

  /**
   * Extract a section from the analysis text
   */
  private extractSection(text: string, sectionName: string): string[] {
    const regex = new RegExp(`\\*\\*${sectionName}[:\\s]*\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = text.match(regex);

    if (!match) return [];

    return match[1]
      .split(/[-•]\s+/)
      .filter(item => item.trim().length > 0)
      .map(item => item.trim().replace(/\n/g, ' '));
  }

  /**
   * Extract issues from a section
   */
  private extractIssues(text: string, sectionName: string, severity: 'critical' | 'major' | 'minor'): any[] {
    const items = this.extractSection(text, sectionName);

    return items.map(item => ({
      severity,
      category: this.categorizeIssue(item),
      title: this.extractTitle(item),
      description: item,
      impact: this.getImpactBySeverity(severity),
      selector: this.extractSelector(item),
      fix: this.extractFix(item),
    }));
  }

  /**
   * Extract recommendations from text
   */
  private extractRecommendations(text: string): any[] {
    const items = this.extractSection(text, 'RECOMMENDATIONS');

    return items.map(item => ({
      type: this.categorizeRecommendation(item),
      title: this.extractTitle(item),
      description: item,
      implementation: this.extractCodeBlock(item) || item,
      impact: this.assessImpact(item),
      effort: this.assessEffort(item),
    }));
  }

  /**
   * Categorize issue by analyzing content
   */
  private categorizeIssue(issueText: string): string {
    const text = issueText.toLowerCase();

    if (
      text.includes('contrast') ||
      text.includes('accessibility') ||
      text.includes('wcag') ||
      text.includes('screen reader')
    ) {
      return 'accessibility';
    }
    if (text.includes('mobile') || text.includes('touch') || text.includes('responsive') || text.includes('44px')) {
      return 'mobile-optimization';
    }
    if (text.includes('performance') || text.includes('loading') || text.includes('speed') || text.includes('slow')) {
      return 'performance';
    }
    if (text.includes('visual') || text.includes('design') || text.includes('color') || text.includes('typography')) {
      return 'visual-design';
    }
    if (text.includes('conversion') || text.includes('cta') || text.includes('purchase') || text.includes('signup')) {
      return 'conversion-optimization';
    }

    return 'usability';
  }

  /**
   * Extract title from text (first sentence or 50 chars)
   */
  private extractTitle(text: string): string {
    const firstSentence = text.split('.')[0];
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
  }

  /**
   * Get impact description by severity
   */
  private getImpactBySeverity(severity: 'critical' | 'major' | 'minor'): string {
    const impacts = {
      critical: 'Prevents users from completing their tasks or causes significant frustration',
      major: 'Makes the interface difficult or unpleasant to use, reducing user satisfaction',
      minor: 'Small improvement that would enhance the overall user experience',
    };
    return impacts[severity];
  }

  /**
   * Extract CSS selector from issue text
   */
  private extractSelector(text: string): string | undefined {
    const selectorPatterns = [
      /\.[\w-]+/g, // CSS classes
      /#[\w-]+/g, // CSS IDs
      /\[[\w-]+=[\w-]+\]/g, // Attribute selectors
      /button|input|form|div|span|a/gi, // HTML elements
    ];

    for (const pattern of selectorPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        return matches[0];
      }
    }

    return undefined;
  }

  /**
   * Extract fix suggestion from text
   */
  private extractFix(text: string): string | undefined {
    const fixPatterns = [/(?:fix|solution|recommend)[:\s]+([^.]+)/i, /should[:\s]+([^.]+)/i, /change[:\s]+([^.]+)/i];

    for (const pattern of fixPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Categorize recommendation type
   */
  private categorizeRecommendation(text: string): 'code' | 'design' | 'content' | 'process' {
    const lower = text.toLowerCase();

    if (lower.includes('css') || lower.includes('html') || lower.includes('javascript') || lower.includes('```')) {
      return 'code';
    }
    if (lower.includes('content') || lower.includes('copy') || lower.includes('text') || lower.includes('wording')) {
      return 'content';
    }
    if (
      lower.includes('process') ||
      lower.includes('workflow') ||
      lower.includes('team') ||
      lower.includes('testing')
    ) {
      return 'process';
    }

    return 'design';
  }

  /**
   * Extract code block from text
   */
  private extractCodeBlock(text: string): string | undefined {
    const codeMatch = text.match(/```[\s\S]*?```/);
    return codeMatch ? codeMatch[0] : undefined;
  }

  /**
   * Assess recommendation impact
   */
  private assessImpact(text: string): 'high' | 'medium' | 'low' {
    const lower = text.toLowerCase();

    if (
      lower.includes('critical') ||
      lower.includes('conversion') ||
      lower.includes('accessibility') ||
      lower.includes('revenue')
    ) {
      return 'high';
    }
    if (lower.includes('major') || lower.includes('usability') || lower.includes('satisfaction')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Assess implementation effort
   */
  private assessEffort(text: string): 'low' | 'medium' | 'high' {
    const lower = text.toLowerCase();

    if (
      lower.includes('simple') ||
      lower.includes('quick') ||
      lower.includes('css change') ||
      lower.includes('one line')
    ) {
      return 'low';
    }
    if (
      lower.includes('redesign') ||
      lower.includes('refactor') ||
      lower.includes('complex') ||
      lower.includes('major change')
    ) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Extract specific score from text
   */
  private extractSpecificScore(text: string, category: string): number | undefined {
    const regex = new RegExp(`${category}[:\\s]*([\\d]+)(?:\/10)?`, 'i');
    const match = text.match(regex);
    return match ? parseInt(match[1]) : undefined;
  }
}
