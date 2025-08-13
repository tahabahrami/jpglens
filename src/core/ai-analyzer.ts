/**
 * 🔍 jpglens - AI Analyzer Core
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { 
  AnalysisContext, 
  AnalysisResult, 
  ScreenshotData, 
  AIProvider, 
  JPGLensConfig,
  Issue,
  Recommendation,
  ReportConfig
} from './types.js';
import { createMasterPrompt, SpecializedPrompts } from './prompts.js';
import { OpenRouterProvider } from '../providers/openrouter.js';
import { OpenAIProvider } from '../providers/openai.js';
import { AnthropicProvider } from '../providers/anthropic.js';
import { ReportGenerator, DEFAULT_REPORT_CONFIG } from './report-generator.js';
import { APICompatibilityHandler } from './api-compatibility.js';
import { ConsoleFormatter } from './console-formatter.js';

/**
 * Core AI analysis engine for jpglens
 * Orchestrates AI providers and manages analysis workflow
 */
export class AIAnalyzer {
  private providers: Map<string, AIProvider> = new Map();
  private primaryProvider: AIProvider;
  private fallbackProvider?: AIProvider;
  private reportGenerator: ReportGenerator;
  private apiHandler: APICompatibilityHandler;

  constructor(private config: JPGLensConfig) {
    this.initializeProviders();
    this.primaryProvider = this.getProvider(config.ai.provider);
    
    if (config.ai.fallbackModel) {
      this.fallbackProvider = this.getProvider(this.extractProviderFromModel(config.ai.fallbackModel));
    }

    // Initialize reporting system
    const reportConfig = { ...DEFAULT_REPORT_CONFIG, ...(config.reporting || {}) };
    this.reportGenerator = new ReportGenerator(reportConfig);

    // Initialize API compatibility handler
    this.apiHandler = new APICompatibilityHandler({
      provider: config.ai.provider as any,
      model: config.ai.model,
      apiKey: config.ai.apiKey,
      baseUrl: config.ai.baseUrl,
      maxTokens: config.ai.maxTokens,
      temperature: config.ai.temperature,
      messageFormat: config.ai.messageFormat || 'auto'
    });
  }

  /**
   * Initialize available AI providers
   */
  private initializeProviders(): void {
    this.providers.set('openrouter', new OpenRouterProvider(this.config));
    this.providers.set('openai', new OpenAIProvider(this.config));
    this.providers.set('anthropic', new AnthropicProvider(this.config));
  }

  /**
   * Get provider by name
   */
  private getProvider(providerName: string): AIProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`AI provider '${providerName}' not found. Available: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return provider;
  }

  /**
   * Extract provider name from model string (e.g., "openai/gpt-4" -> "openai")
   */
  private extractProviderFromModel(model: string): string {
    if (model.includes('/')) {
      const [provider] = model.split('/');
      return provider;
    }
    return this.config.ai.provider; // Default to primary provider
  }

  /**
   * Main analysis method - the heart of jpglens
   */
  async analyze(screenshot: ScreenshotData, context: AnalysisContext): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      this.validateInputs(screenshot, context);

      // Generate appropriate prompt based on context
      const prompt = this.generatePrompt(context);

      // Log analysis start (if debugging)
      if (process.env.JPGLENS_DEBUG) {
        console.log(`🔍 Starting jpglens analysis:`, {
          stage: context.stage,
          userIntent: context.userIntent,
          provider: this.config.ai.provider,
          model: this.config.ai.model
        });
      }

      // Attempt analysis with primary provider
      let result: AnalysisResult;
      try {
        result = await this.primaryProvider.analyze(screenshot, context, prompt);
      } catch (primaryError) {
        console.warn(`Primary AI provider failed, trying fallback:`, primaryError);
        
        if (this.fallbackProvider) {
          result = await this.fallbackProvider.analyze(screenshot, context, prompt);
        } else {
          throw primaryError;
        }
      }

      // Post-process and enhance the result
      const enhancedResult = await this.enhanceResult(result, context, startTime);

      // Log successful analysis
      if (process.env.JPGLENS_DEBUG) {
        console.log(`✅ jpglens analysis completed:`, {
          score: enhancedResult.overallScore,
          issues: enhancedResult.criticalIssues.length + enhancedResult.majorIssues.length,
          analysisTime: enhancedResult.analysisTime
        });
      }

      return enhancedResult;

    } catch (error) {
      const analysisTime = Date.now() - startTime;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      ConsoleFormatter.showError(
        'jpglens analysis failed: ' + errorMessage,
        'Check your configuration and try again'
      );
      
      // Return error result instead of throwing
      return this.createErrorResult(error, context, analysisTime);
    }
  }

  /**
   * Analyze multiple screenshots in parallel (for journey analysis)
   */
  async analyzeMultiple(
    screenshots: ScreenshotData[], 
    contexts: AnalysisContext[]
  ): Promise<AnalysisResult[]> {
    if (screenshots.length !== contexts.length) {
      throw new Error('Screenshots and contexts arrays must have the same length');
    }

    // Process in parallel with concurrency limit
    const concurrencyLimit = 3; // Avoid overwhelming AI providers
    const results: AnalysisResult[] = [];

    for (let i = 0; i < screenshots.length; i += concurrencyLimit) {
      const batch = screenshots.slice(i, i + concurrencyLimit);
      const batchContexts = contexts.slice(i, i + concurrencyLimit);
      
      const batchPromises = batch.map((screenshot, index) => 
        this.analyze(screenshot, batchContexts[index])
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Generate appropriate prompt based on context
   */
  private generatePrompt(context: AnalysisContext): string {
    const analysisTypes = this.config.analysis.types;

    // Use specialized prompts for specific scenarios
    if (context.businessContext?.industry === 'e-commerce') {
      return SpecializedPrompts.ecommerce(context);
    }

    if (context.businessContext?.industry === 'saas') {
      return SpecializedPrompts.saas(context);
    }

    if (context.technicalContext?.designSystem) {
      return SpecializedPrompts.designSystem(context);
    }

    if (context.userContext?.deviceContext?.includes('mobile')) {
      return SpecializedPrompts.mobileApp(context);
    }

    // Default to master prompt
    return createMasterPrompt(context, analysisTypes);
  }



  /**
   * Validate analysis inputs
   */
  private validateInputs(screenshot: ScreenshotData, context: AnalysisContext): void {
    if (!screenshot?.buffer || screenshot.buffer.length === 0) {
      throw new Error('Invalid screenshot data provided');
    }

    if (!context.stage || !context.userIntent) {
      throw new Error('Analysis context must include stage and userIntent');
    }

    if (!context.userContext) {
      throw new Error('User context is required for meaningful analysis');
    }
  }

  /**
   * Enhance AI result with additional processing
   */
  private async enhanceResult(
    result: AnalysisResult, 
    context: AnalysisContext, 
    startTime: number
  ): Promise<AnalysisResult> {
    const analysisTime = Date.now() - startTime;

    // Parse and structure the AI response if needed
    const structuredResult = this.parseAIResponse(result, context);

    // Add metadata
    structuredResult.analysisTime = analysisTime;
    structuredResult.config = {
      provider: this.config.ai.provider,
      model: this.config.ai.model,
      analysisTypes: this.config.analysis.types,
      depth: this.config.analysis.depth
    };

    // Validate and score the result
    this.validateResult(structuredResult);

    // Generate report if enabled, otherwise show console output
    const reportingConfig = this.reportGenerator.getConfig();
    
    if (reportingConfig.enabled) {
      try {
        const reportPath = await this.reportGenerator.generateReport(structuredResult);
        if (reportPath) {
          structuredResult.reportPath = reportPath;
          ConsoleFormatter.showProgress(`📄 Report saved: ${reportPath}`);
        }
      } catch (error) {
        console.warn('Failed to generate report:', error);
        // Fallback to console output
        ConsoleFormatter.formatAnalysisResult(structuredResult, {
          showTechnicalDetails: true,
          compact: false
        });
      }
    } else {
      // Show beautiful console output when reports are disabled
      ConsoleFormatter.formatAnalysisResult(structuredResult, {
        showTechnicalDetails: true,
        showRawAnalysis: false,
        compact: false
      });
    }

    return structuredResult;
  }

  /**
   * Parse AI response and structure it properly
   */
  private parseAIResponse(result: AnalysisResult, context: AnalysisContext): AnalysisResult {
    // If the result is already structured, return as-is
    if (result.overallScore !== undefined && result.criticalIssues) {
      return result;
    }

    // Parse raw AI text response (fallback for simpler providers)
    if (typeof result === 'string' || (result as any).rawResponse) {
      const rawText = typeof result === 'string' ? result : (result as any).rawResponse;
      return this.parseTextResponse(rawText, context);
    }

    return result;
  }

  /**
   * Parse raw text response from AI
   */
  private parseTextResponse(rawText: string, context: AnalysisContext): AnalysisResult {
    // Extract overall score
    const scoreMatch = rawText.match(/(?:OVERALL UX SCORE|QUALITY SCORE):\s*(\d+)\/10/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    // Extract issues by section
    const criticalIssues = this.extractIssues(rawText, 'CRITICAL ISSUES', 'critical');
    const majorIssues = this.extractIssues(rawText, 'MAJOR ISSUES', 'major');
    const minorIssues = this.extractIssues(rawText, 'MINOR ISSUES', 'minor');

    // Extract strengths
    const strengths = this.extractListItems(rawText, 'STRENGTHS');

    // Extract recommendations
    const recommendations = this.extractRecommendations(rawText);

    return {
      id: `jpglens-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      page: (context as any).pageInfo?.url || context.stage || 'unknown',
      context,
      overallScore,
      scores: {
        usability: this.extractSpecificScore(rawText, 'usability') || overallScore,
        accessibility: this.extractSpecificScore(rawText, 'accessibility') || overallScore,
        visualDesign: this.extractSpecificScore(rawText, 'visual') || overallScore,
        performance: this.extractSpecificScore(rawText, 'performance') || overallScore
      },
      strengths,
      criticalIssues,
      majorIssues, 
      minorIssues,
      recommendations,
      model: this.config.ai.model,
      tokensUsed: 0, // Will be filled by provider
      analysisTime: 0 // Will be filled by enhanceResult
    };
  }

  /**
   * Extract issues from text by section
   */
  private extractIssues(text: string, sectionName: string, severity: 'critical' | 'major' | 'minor'): Issue[] {
    const issues: Issue[] = [];
    const items = this.extractListItems(text, sectionName);

    items.forEach(item => {
      issues.push({
        severity,
        category: this.categorizeIssue(item),
        title: this.extractIssueTitle(item),
        description: item,
        impact: this.assessImpact(item, severity),
        fix: this.extractFix(item)
      });
    });

    return issues;
  }

  /**
   * Extract list items from a section
   */
  private extractListItems(text: string, sectionName: string): string[] {
    const regex = new RegExp(`${sectionName}[:\\s]*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = text.match(regex);
    
    if (!match) return [];

    return match[1]
      .split(/[-•]\s+/)
      .filter(item => item.trim().length > 0)
      .map(item => item.trim());
  }

  /**
   * Categorize issue by content
   */
  private categorizeIssue(issueText: string): any {
    const text = issueText.toLowerCase();
    
    if (text.includes('contrast') || text.includes('accessibility') || text.includes('wcag')) {
      return 'accessibility';
    }
    if (text.includes('mobile') || text.includes('touch') || text.includes('responsive')) {
      return 'mobile-optimization';
    }
    if (text.includes('performance') || text.includes('loading') || text.includes('speed')) {
      return 'performance';
    }
    if (text.includes('visual') || text.includes('design') || text.includes('color')) {
      return 'visual-design';
    }
    
    return 'usability';
  }

  /**
   * Extract issue title from description
   */
  private extractIssueTitle(issueText: string): string {
    // Take first sentence or first 50 characters
    const firstSentence = issueText.split('.')[0];
    return firstSentence.length > 50 
      ? firstSentence.substring(0, 47) + '...'
      : firstSentence;
  }

  /**
   * Assess impact based on issue content and severity
   */
  private assessImpact(issueText: string, severity: 'critical' | 'major' | 'minor'): string {
    const impactMap = {
      critical: 'Blocks user task completion or causes significant frustration',
      major: 'Makes the interface difficult or unpleasant to use',
      minor: 'Small improvement opportunity that would enhance the experience'
    };

    return impactMap[severity];
  }

  /**
   * Extract fix suggestion from issue text
   */
  private extractFix(issueText: string): string | undefined {
    // Look for common fix patterns
    const fixPatterns = [
      /fix[:\s]+([^.]+)/i,
      /solution[:\s]+([^.]+)/i,
      /recommend[:\s]+([^.]+)/i,
      /should[:\s]+([^.]+)/i
    ];

    for (const pattern of fixPatterns) {
      const match = issueText.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract recommendations from text
   */
  private extractRecommendations(text: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const items = this.extractListItems(text, 'RECOMMENDATIONS');

    items.forEach(item => {
      recommendations.push({
        type: this.categorizeRecommendation(item),
        title: this.extractIssueTitle(item),
        description: item,
        implementation: this.extractImplementation(item),
        impact: this.assessRecommendationImpact(item),
        effort: this.assessRecommendationEffort(item)
      });
    });

    return recommendations;
  }

  /**
   * Categorize recommendation by type
   */
  private categorizeRecommendation(text: string): 'code' | 'design' | 'content' | 'process' {
    const lower = text.toLowerCase();
    
    if (lower.includes('css') || lower.includes('html') || lower.includes('javascript') || lower.includes('code')) {
      return 'code';
    }
    if (lower.includes('content') || lower.includes('copy') || lower.includes('text')) {
      return 'content';
    }
    if (lower.includes('process') || lower.includes('workflow') || lower.includes('team')) {
      return 'process';
    }
    
    return 'design';
  }

  /**
   * Extract implementation details
   */
  private extractImplementation(text: string): string {
    // Look for code blocks or specific instructions
    const codeMatch = text.match(/```[\s\S]*?```/);
    if (codeMatch) {
      return codeMatch[0];
    }

    // Look for implementation keywords
    const implMatch = text.match(/implement[:\s]+([^.]+)/i);
    if (implMatch) {
      return implMatch[1].trim();
    }

    return text;
  }

  /**
   * Assess recommendation impact
   */
  private assessRecommendationImpact(text: string): 'high' | 'medium' | 'low' {
    const lower = text.toLowerCase();
    
    if (lower.includes('critical') || lower.includes('conversion') || lower.includes('accessibility')) {
      return 'high';
    }
    if (lower.includes('major') || lower.includes('usability')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Assess recommendation effort
   */
  private assessRecommendationEffort(text: string): 'low' | 'medium' | 'high' {
    const lower = text.toLowerCase();
    
    if (lower.includes('simple') || lower.includes('quick') || lower.includes('css')) {
      return 'low';
    }
    if (lower.includes('redesign') || lower.includes('refactor') || lower.includes('complex')) {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * Extract specific score from text
   */
  private extractSpecificScore(text: string, category: string): number | undefined {
    const regex = new RegExp(`${category}[:\\s]*([\\d]+)\/10`, 'i');
    const match = text.match(regex);
    return match ? parseInt(match[1]) : undefined;
  }

  /**
   * Validate analysis result
   */
  private validateResult(result: AnalysisResult): void {
    if (result.overallScore < 0 || result.overallScore > 10) {
      console.warn('Invalid overall score, clamping to 0-10 range');
      result.overallScore = Math.max(0, Math.min(10, result.overallScore));
    }

    if (!result.criticalIssues) result.criticalIssues = [];
    if (!result.majorIssues) result.majorIssues = [];
    if (!result.minorIssues) result.minorIssues = [];
    if (!result.strengths) result.strengths = [];
    if (!result.recommendations) result.recommendations = [];
  }

  /**
   * Create error result for failed analyses
   */
  private createErrorResult(error: any, context: AnalysisContext, analysisTime: number): AnalysisResult {
    // Safely extract page information with proper null checks
    const pageUrl = context?.pageInfo?.url || context?.stage || 'unknown';
    
    return {
      id: `jpglens-error-${Date.now()}`,
      timestamp: new Date().toISOString(),
      page: pageUrl,
      context,
      overallScore: 0,
      scores: {},
      strengths: [],
      criticalIssues: [{
        severity: 'critical',
        category: 'error-handling',
        title: 'Analysis Failed',
        description: `jpglens analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        impact: 'Could not analyze user experience',
        fix: 'Check configuration and try again'
      }],
      majorIssues: [],
      minorIssues: [],
      recommendations: [],
      model: this.config.ai.model,
      tokensUsed: 0,
      analysisTime,
      error: true
    };
  }

  /**
   * Configure reporting system
   */
  configureReporting(config: Partial<ReportConfig>): void {
    this.reportGenerator.updateConfig(config);
  }

  /**
   * Get current reporting configuration
   */
  getReportingConfig(): ReportConfig {
    return this.reportGenerator.getConfig();
  }

  /**
   * Add custom report template
   */
  addReportTemplate(name: string, template: any): void {
    this.reportGenerator.addTemplate(name, template);
  }

  /**
   * Get API compatibility information
   */
  getAPICompatibilityInfo(): any {
    return this.apiHandler.getConfigSummary();
  }

  /**
   * Manually generate report for existing result
   */
  async generateReport(result: AnalysisResult, config?: Partial<ReportConfig>): Promise<string> {
    return this.reportGenerator.generateReport(result, config);
  }
}
