/**
 * 🔍 jpglens - Report Generator
 * Configurable AI Analysis Report Generation System
 *
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AnalysisResult, ReportConfig, ReportTemplate, ReportFormat } from './types.js';
import fs from 'fs';
import path from 'path';

/**
 * Default report templates for different output formats
 */
export const DEFAULT_REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  detailed: {
    name: 'Detailed Analysis Report',
    format: 'markdown',
    sections: [
      'executive_summary',
      'overall_score',
      'visual_hierarchy',
      'accessibility',
      'usability',
      'critical_issues',
      'recommendations',
      'technical_details',
    ],
    prompts: {
      executive_summary: 'Provide a comprehensive executive summary of the UI analysis',
      overall_score: 'Rate the overall UI quality from 1-10 with detailed reasoning',
      visual_hierarchy: 'Analyze the visual hierarchy and information architecture',
      accessibility: 'Evaluate accessibility compliance and provide specific recommendations',
      usability: 'Assess usability patterns and user experience quality',
      critical_issues: 'Identify critical issues that must be addressed immediately',
      recommendations: 'Provide actionable recommendations for improvement',
      technical_details: 'Include technical implementation details and metrics',
    },
  },

  summary: {
    name: 'Quick Summary Report',
    format: 'json',
    sections: ['overall_score', 'top_issues', 'quick_wins'],
    prompts: {
      overall_score: 'Provide an overall quality score from 1-10',
      top_issues: 'List the top 3 most critical issues',
      quick_wins: 'Suggest 3 quick improvements that can be implemented immediately',
    },
  },

  executive: {
    name: 'Executive Dashboard Report',
    format: 'json',
    sections: ['executive_summary', 'key_metrics', 'business_impact', 'next_actions'],
    prompts: {
      executive_summary: 'Provide a business-focused summary suitable for executives',
      key_metrics: 'Present key performance indicators and quality metrics',
      business_impact: 'Explain the business impact of identified issues and improvements',
      next_actions: 'Recommend prioritized actions with timeline and resource estimates',
    },
  },
};

/**
 * Default report configuration
 */
export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  enabled: true,
  outputDir: './jpglens-reports',
  template: 'detailed',
  format: 'markdown',
  includeScreenshots: true,
  includeRawAnalysis: false,
  timestampFormat: 'ISO',
  fileNaming: '{timestamp}-{component}-{page}',
  customPrompts: {},
  apiCompatibility: 'auto', // auto-detect based on provider
};

/**
 * Report Generator Class
 */
export class ReportGenerator {
  private config: ReportConfig;
  private templates: Record<string, ReportTemplate>;

  constructor(config: Partial<ReportConfig> = {}) {
    this.config = { ...DEFAULT_REPORT_CONFIG, ...config };
    this.templates = { ...DEFAULT_REPORT_TEMPLATES };

    // Ensure output directory exists
    this.ensureOutputDirectory();
  }

  /**
   * Generate a report from analysis results
   */
  async generateReport(analysisResult: AnalysisResult, customConfig?: Partial<ReportConfig>): Promise<string> {
    if (!this.config.enabled) {
      return '';
    }

    const reportConfig = { ...this.config, ...customConfig };
    const template = this.getTemplate(reportConfig.template);

    // Generate report content based on format
    const reportContent = await this.generateReportContent(analysisResult, template, reportConfig);

    // Save report to file
    const filePath = await this.saveReport(reportContent, analysisResult, reportConfig);

    return filePath;
  }

  /**
   * Generate report content based on template and format
   */
  private async generateReportContent(
    result: AnalysisResult,
    template: ReportTemplate,
    config: ReportConfig
  ): Promise<string> {
    switch (template.format) {
      case 'markdown':
        return this.generateMarkdownReport(result, template, config);
      case 'json':
        return this.generateJsonReport(result, template, config);
      case 'html':
        return this.generateHtmlReport(result, template, config);
      default:
        throw new Error(`Unsupported report format: ${template.format}`);
    }
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(result: AnalysisResult, template: ReportTemplate, config: ReportConfig): string {
    let markdown = `# ${template.name}\n\n`;
    markdown += `**Generated:** ${this.formatTimestamp(result.timestamp, config.timestampFormat)}\n`;
    markdown += `**Component:** ${result.component || 'N/A'}\n`;
    markdown += `**Page:** ${result.page}\n`;
    markdown += `**Model:** ${result.model}\n`;
    markdown += `**Analysis Time:** ${result.analysisTime}ms\n\n`;

    // Add sections based on template
    for (const section of template.sections) {
      markdown += this.generateMarkdownSection(section, result, template, config);
    }

    // Add technical details if requested
    if (config.includeRawAnalysis && result.rawAnalysis) {
      markdown += `## Raw Analysis\n\n\`\`\`\n${result.rawAnalysis}\n\`\`\`\n\n`;
    }

    return markdown;
  }

  /**
   * Generate JSON report
   */
  private generateJsonReport(result: AnalysisResult, template: ReportTemplate, config: ReportConfig): string {
    const jsonReport: any = {
      metadata: {
        generated: this.formatTimestamp(result.timestamp, config.timestampFormat),
        template: template.name,
        component: result.component,
        page: result.page,
        model: result.model,
        analysisTime: result.analysisTime,
        tokensUsed: result.tokensUsed,
      },
      analysis: {},
    };

    // Add sections based on template
    for (const section of template.sections) {
      jsonReport.analysis[section] = this.extractSectionData(section, result);
    }

    if (config.includeRawAnalysis) {
      jsonReport.rawAnalysis = result.rawAnalysis;
    }

    return JSON.stringify(jsonReport, null, 2);
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(result: AnalysisResult, template: ReportTemplate, config: ReportConfig): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2rem; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
        .section { margin: 2rem 0; }
        .score { font-size: 2rem; font-weight: bold; color: #007acc; }
        .issue { background: #fee; padding: 1rem; border-left: 4px solid #e74c3c; margin: 1rem 0; }
        .recommendation { background: #efe; padding: 1rem; border-left: 4px solid #27ae60; margin: 1rem 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.name}</h1>
        <p><strong>Generated:</strong> ${this.formatTimestamp(result.timestamp, config.timestampFormat)}</p>
        <p><strong>Component:</strong> ${result.component || 'N/A'}</p>
        <p><strong>Page:</strong> ${result.page}</p>
    </div>`;

    // Add sections
    for (const section of template.sections) {
      html += this.generateHtmlSection(section, result, template, config);
    }

    html += `</body></html>`;
    return html;
  }

  /**
   * Generate markdown section
   */
  private generateMarkdownSection(
    section: string,
    result: AnalysisResult,
    template: ReportTemplate,
    config: ReportConfig
  ): string {
    let content = `## ${this.formatSectionTitle(section)}\n\n`;

    switch (section) {
      case 'executive_summary':
        content += `${this.extractExecutiveSummary(result)}\n\n`;
        break;
      case 'overall_score':
        content += `**Score:** ${result.overallScore}/10\n\n`;
        break;
      case 'visual_hierarchy':
        content += `**Visual Design Score:** ${result.scores.visualDesign || 'N/A'}/10\n\n`;
        break;
      case 'accessibility':
        content += `**Accessibility Score:** ${result.scores.accessibility || 'N/A'}/10\n\n`;
        break;
      case 'usability':
        content += `**Usability Score:** ${result.scores.usability || 'N/A'}/10\n\n`;
        break;
      case 'critical_issues':
        content += this.formatIssues(result.criticalIssues, 'Critical');
        break;
      case 'recommendations':
        content += this.formatRecommendations(result.recommendations);
        break;
      case 'technical_details':
        content += this.formatTechnicalDetails(result);
        break;
      default:
        content += `Data for ${section} not available.\n\n`;
    }

    return content;
  }

  /**
   * Generate HTML section
   */
  private generateHtmlSection(
    section: string,
    result: AnalysisResult,
    template: ReportTemplate,
    config: ReportConfig
  ): string {
    let content = `<div class="section"><h2>${this.formatSectionTitle(section)}</h2>`;

    switch (section) {
      case 'overall_score':
        content += `<div class="score">${result.overallScore}/10</div>`;
        break;
      case 'critical_issues':
        result.criticalIssues.forEach(issue => {
          content += `<div class="issue"><strong>${issue.title}</strong><br>${issue.description}</div>`;
        });
        break;
      case 'recommendations':
        result.recommendations.forEach(rec => {
          content += `<div class="recommendation"><strong>${rec.title}</strong><br>${rec.description}</div>`;
        });
        break;
      default:
        content += `<p>Data for ${section} not available.</p>`;
    }

    content += `</div>`;
    return content;
  }

  /**
   * Extract section data for JSON format
   */
  private extractSectionData(section: string, result: AnalysisResult): any {
    switch (section) {
      case 'overall_score':
        return result.overallScore;
      case 'top_issues':
        return result.criticalIssues.slice(0, 3).map(issue => ({
          title: issue.title,
          severity: issue.severity,
          impact: issue.impact,
        }));
      case 'quick_wins':
        return result.recommendations.slice(0, 3).map(rec => ({
          title: rec.title,
          effort: rec.effort,
          impact: rec.impact,
        }));
      default:
        return null;
    }
  }

  /**
   * Save report to file
   */
  private async saveReport(content: string, result: AnalysisResult, config: ReportConfig): Promise<string> {
    const fileName = this.generateFileName(result, config);
    const filePath = path.join(config.outputDir, fileName);

    await fs.promises.writeFile(filePath, content, 'utf-8');

    return filePath;
  }

  /**
   * Generate file name based on configuration
   */
  private generateFileName(result: AnalysisResult, config: ReportConfig): string {
    const template = config.fileNaming;
    const timestamp = this.formatTimestamp(result.timestamp, 'filename');
    const extension = this.getFileExtension(config.format);

    return (
      template
        .replace('{timestamp}', timestamp)
        .replace('{component}', result.component || 'unknown')
        .replace('{page}', result.page || 'unknown')
        .replace('{id}', result.id) + extension
    );
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: ReportFormat): string {
    switch (format) {
      case 'markdown':
        return '.md';
      case 'json':
        return '.json';
      case 'html':
        return '.html';
      default:
        return '.txt';
    }
  }

  /**
   * Format timestamp based on configuration
   */
  private formatTimestamp(timestamp: string, format: string): string {
    const date = new Date(timestamp);

    switch (format) {
      case 'ISO':
        return date.toISOString();
      case 'filename':
        return date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      case 'readable':
        return date.toLocaleString();
      default:
        return timestamp;
    }
  }

  /**
   * Format section title
   */
  private formatSectionTitle(section: string): string {
    return section
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract executive summary from result
   */
  private extractExecutiveSummary(result: AnalysisResult): string {
    // Try to extract from raw analysis or generate from available data
    if (result.rawAnalysis && result.rawAnalysis.includes('EXECUTIVE SUMMARY')) {
      const match = result.rawAnalysis.match(/EXECUTIVE SUMMARY[:\n]+(.*?)(?=\n\n|\n[A-Z]|$)/s);
      if (match) return match[1].trim();
    }

    // Generate summary from available data
    return (
      `UI analysis completed with an overall score of ${result.overallScore}/10. ` +
      `${result.criticalIssues.length} critical issues identified. ` +
      `${result.recommendations.length} recommendations provided for improvement.`
    );
  }

  /**
   * Format issues for display
   */
  private formatIssues(issues: any[], severity: string): string {
    if (!issues.length) return `No ${severity.toLowerCase()} issues found.\n\n`;

    let content = '';
    issues.forEach((issue, index) => {
      content += `### ${index + 1}. ${issue.title}\n`;
      content += `**Severity:** ${issue.severity}\n`;
      content += `**Description:** ${issue.description}\n`;
      if (issue.fix) content += `**Fix:** ${issue.fix}\n`;
      content += '\n';
    });

    return content;
  }

  /**
   * Format recommendations for display
   */
  private formatRecommendations(recommendations: any[]): string {
    if (!recommendations.length) return `No recommendations available.\n\n`;

    let content = '';
    recommendations.forEach((rec, index) => {
      content += `### ${index + 1}. ${rec.title}\n`;
      content += `**Impact:** ${rec.impact}\n`;
      content += `**Effort:** ${rec.effort}\n`;
      content += `**Description:** ${rec.description}\n\n`;
    });

    return content;
  }

  /**
   * Format technical details
   */
  private formatTechnicalDetails(result: AnalysisResult): string {
    return (
      `**Analysis ID:** ${result.id}\n` +
      `**Model Used:** ${result.model}\n` +
      `**Tokens Used:** ${result.tokensUsed}\n` +
      `**Analysis Time:** ${result.analysisTime}ms\n` +
      `**Provider:** ${result.provider || 'Unknown'}\n\n`
    );
  }

  /**
   * Get template by name
   */
  private getTemplate(templateName: string): ReportTemplate {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    return template;
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    try {
      if (!fs.existsSync(this.config.outputDir)) {
        fs.mkdirSync(this.config.outputDir, { recursive: true });
      }
    } catch (error) {
      console.warn(`Failed to create report output directory: ${error}`);
    }
  }

  /**
   * Add custom template
   */
  addTemplate(name: string, template: ReportTemplate): void {
    this.templates[name] = template;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ReportConfig>): void {
    this.config = { ...this.config, ...config };
    this.ensureOutputDirectory();
  }

  /**
   * Get current configuration
   */
  getConfig(): ReportConfig {
    return { ...this.config };
  }
}

/**
 * Create report generator with default configuration
 */
export function createReportGenerator(config?: Partial<ReportConfig>): ReportGenerator {
  return new ReportGenerator(config);
}
