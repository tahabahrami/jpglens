/**
 * 🔍 jpglens - Console Output Formatter
 * Beautiful console display for AI analysis results when reports are disabled
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AnalysisResult } from './types.js';

/**
 * Console formatting utilities
 */
export class ConsoleFormatter {
  private static readonly COLORS = {
    // Text colors
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m'
  };

  private static readonly ICONS = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    score: '📊',
    issue: '🔍',
    recommendation: '💡',
    strength: '🎯',
    time: '⏱️',
    model: '🤖',
    tokens: '🔢',
    component: '🧩',
    page: '📄',
    user: '👤',
    device: '📱',
    critical: '🚨',
    major: '⚡',
    minor: '📝',
    fix: '🔧',
    impact: '📈',
    effort: '💪',
    accessibility: '♿',
    usability: '🎨',
    performance: '⚡',
    visual: '👁️',
    mobile: '📱',
    desktop: '💻',
    star: '⭐',
    arrow: '➤',
    bullet: '•',
    separator: '─'
  };

  /**
   * Format complete analysis result for console display
   */
  static formatAnalysisResult(result: AnalysisResult, options: {
    showRawAnalysis?: boolean;
    showTechnicalDetails?: boolean;
    compact?: boolean;
  } = {}): void {
    const { showRawAnalysis = false, showTechnicalDetails = true, compact = false } = options;

    // Clear console and show header
    this.showHeader(result);
    
    if (!compact) {
      this.showMetadata(result);
      this.showScores(result);
    }
    
    this.showStrengths(result);
    this.showIssues(result);
    this.showRecommendations(result);
    
    if (showTechnicalDetails && !compact) {
      this.showTechnicalDetails(result);
    }
    
    if (showRawAnalysis && result.rawAnalysis) {
      this.showRawAnalysis(result.rawAnalysis);
    }
    
    this.showFooter(result);
  }

  /**
   * Show analysis header
   */
  private static showHeader(result: AnalysisResult): void {
    const title = `${this.ICONS.success} jpglens AI Analysis Complete`;
    const line = '═'.repeat(60);
    
    console.log(`\n${this.color(line, 'cyan')}`);
    console.log(`${this.color(title, 'bright')}${this.color(' ' + this.ICONS.component, 'cyan')}`);
    console.log(`${this.color(line, 'cyan')}\n`);
  }

  /**
   * Show metadata information
   */
  private static showMetadata(result: AnalysisResult): void {
    const metadata = [
      `${this.ICONS.component} Component: ${this.color(result.component || 'Unknown', 'bright')}`,
      `${this.ICONS.page} Page: ${this.color(result.page || 'Unknown', 'bright')}`,
      `${this.ICONS.model} Model: ${this.color(result.model, 'cyan')}`,
      `${this.ICONS.time} Analysis Time: ${this.color(result.analysisTime + 'ms', 'yellow')}`
    ];

    if (result.context?.userContext) {
      const ctx = result.context.userContext;
      if (ctx.deviceContext) {
        const deviceIcon = ctx.deviceContext === 'mobile' ? this.ICONS.mobile : this.ICONS.desktop;
        metadata.push(`${deviceIcon} Device: ${this.color(ctx.deviceContext, 'magenta')}`);
      }
      if (ctx.persona) {
        const personaName = typeof ctx.persona === 'string' ? ctx.persona : ctx.persona.name || 'Unknown';
        metadata.push(`${this.ICONS.user} Persona: ${this.color(personaName, 'magenta')}`);
      }
    }

    metadata.forEach(item => console.log(`  ${item}`));
    console.log();
  }

  /**
   * Show scores section
   */
  private static showScores(result: AnalysisResult): void {
    console.log(`${this.color('📊 ANALYSIS SCORES', 'bright')}`);
    console.log(`${this.ICONS.separator.repeat(30)}`);
    
    // Overall score with visual bar
    const overallScore = result.overallScore || 0;
    const scoreBar = this.createScoreBar(overallScore);
    const scoreColor = this.getScoreColor(overallScore);
    
    console.log(`${this.ICONS.star} Overall Score: ${this.color(overallScore.toFixed(1) + '/10', scoreColor)} ${scoreBar}`);
    
    // Individual scores
    if (result.scores && Object.keys(result.scores).length > 0) {
      console.log();
      Object.entries(result.scores).forEach(([category, score]) => {
        const icon = this.getCategoryIcon(category);
        const bar = this.createScoreBar(score);
        const color = this.getScoreColor(score);
        const categoryName = this.formatCategoryName(category);
        
        console.log(`  ${icon} ${categoryName}: ${this.color(score.toFixed(1) + '/10', color)} ${bar}`);
      });
    }
    
    console.log();
  }

  /**
   * Show strengths section
   */
  private static showStrengths(result: AnalysisResult): void {
    if (!result.strengths || result.strengths.length === 0) return;
    
    console.log(`${this.color('🎯 STRENGTHS', 'green')}`);
    console.log(`${this.ICONS.separator.repeat(30)}`);
    
    result.strengths.forEach((strength, index) => {
      console.log(`  ${this.color(index + 1 + '.', 'dim')} ${this.ICONS.success} ${strength}`);
    });
    
    console.log();
  }

  /**
   * Show issues section
   */
  private static showIssues(result: AnalysisResult): void {
    const allIssues = [
      ...(result.criticalIssues || []).map(issue => ({ ...issue, type: 'critical' })),
      ...(result.majorIssues || []).map(issue => ({ ...issue, type: 'major' })),
      ...(result.minorIssues || []).map(issue => ({ ...issue, type: 'minor' }))
    ];

    if (allIssues.length === 0) {
      console.log(`${this.color('🎉 NO ISSUES FOUND', 'green')}`);
      console.log(`${this.ICONS.separator.repeat(30)}`);
      console.log(`  ${this.ICONS.success} Great job! No critical issues detected.\n`);
      return;
    }

    console.log(`${this.color('🔍 ISSUES FOUND', 'yellow')}`);
    console.log(`${this.ICONS.separator.repeat(30)}`);
    
    // Group by severity
    const critical = allIssues.filter(i => i.type === 'critical');
    const major = allIssues.filter(i => i.type === 'major');
    const minor = allIssues.filter(i => i.type === 'minor');

    if (critical.length > 0) {
      console.log(`\n  ${this.color('🚨 CRITICAL ISSUES', 'red')}`);
      critical.forEach((issue, index) => {
        this.formatIssue(issue, index + 1, 'critical');
      });
    }

    if (major.length > 0) {
      console.log(`\n  ${this.color('⚡ MAJOR ISSUES', 'yellow')}`);
      major.forEach((issue, index) => {
        this.formatIssue(issue, index + 1, 'major');
      });
    }

    if (minor.length > 0) {
      console.log(`\n  ${this.color('📝 MINOR ISSUES', 'cyan')}`);
      minor.forEach((issue, index) => {
        this.formatIssue(issue, index + 1, 'minor');
      });
    }
    
    console.log();
  }

  /**
   * Format individual issue
   */
  private static formatIssue(issue: any, index: number, type: 'critical' | 'major' | 'minor'): void {
    const icons = {
      critical: this.ICONS.critical,
      major: this.ICONS.major,
      minor: this.ICONS.minor
    };
    
    const colors = {
      critical: 'red',
      major: 'yellow',
      minor: 'cyan'
    };

    console.log(`    ${this.color(index + '.', 'dim')} ${icons[type]} ${this.color(issue.title, colors[type] as keyof typeof this.COLORS)}`);
    
    if (issue.description) {
      console.log(`       ${this.color('Description:', 'dim')} ${issue.description}`);
    }
    
    if (issue.impact) {
      console.log(`       ${this.ICONS.impact} ${this.color('Impact:', 'dim')} ${issue.impact}`);
    }
    
    if (issue.fix) {
      console.log(`       ${this.ICONS.fix} ${this.color('Fix:', 'green')} ${issue.fix}`);
    }
  }

  /**
   * Show recommendations section
   */
  private static showRecommendations(result: AnalysisResult): void {
    if (!result.recommendations || result.recommendations.length === 0) return;
    
    console.log(`${this.color('💡 RECOMMENDATIONS', 'blue')}`);
    console.log(`${this.ICONS.separator.repeat(30)}`);
    
    result.recommendations.forEach((rec, index) => {
      console.log(`  ${this.color(index + 1 + '.', 'dim')} ${this.ICONS.recommendation} ${this.color(rec.title, 'bright')}`);
      
      if (rec.description) {
        console.log(`     ${rec.description}`);
      }
      
      const details = [];
      if (rec.impact) details.push(`${this.ICONS.impact} Impact: ${this.color(rec.impact, 'green')}`);
      if (rec.effort) details.push(`${this.ICONS.effort} Effort: ${this.color(rec.effort, 'yellow')}`);
      
      if (details.length > 0) {
        console.log(`     ${details.join(' | ')}`);
      }
      
      if (index < result.recommendations.length - 1) console.log();
    });
    
    console.log();
  }

  /**
   * Show technical details
   */
  private static showTechnicalDetails(result: AnalysisResult): void {
    console.log(`${this.color('🔧 TECHNICAL DETAILS', 'dim')}`);
    console.log(`${this.ICONS.separator.repeat(30)}`);
    
    const details = [
      `${this.ICONS.info} Analysis ID: ${result.id}`,
      `${this.ICONS.tokens} Tokens Used: ${result.tokensUsed || 0}`,
      `${this.ICONS.time} Processing Time: ${result.analysisTime}ms`
    ];
    
    if (result.provider) {
      details.push(`${this.ICONS.model} Provider: ${result.provider}`);
    }
    
    details.forEach(detail => console.log(`  ${this.color(detail, 'dim')}`));
    console.log();
  }

  /**
   * Show raw analysis if requested
   */
  private static showRawAnalysis(rawAnalysis: string): void {
    console.log(`${this.color('📋 RAW AI ANALYSIS', 'dim')}`);
    console.log(`${this.ICONS.separator.repeat(30)}`);
    console.log(`${this.color(rawAnalysis, 'dim')}\n`);
  }

  /**
   * Show footer
   */
  private static showFooter(result: AnalysisResult): void {
    const line = '═'.repeat(60);
    const timestamp = new Date(result.timestamp).toLocaleString();
    
    console.log(`${this.color(line, 'cyan')}`);
    console.log(`${this.color('Analysis completed at ' + timestamp, 'dim')}`);
    console.log(`${this.color('Powered by jpglens AI 🔍', 'cyan')}`);
    console.log(`${this.color(line, 'cyan')}\n`);
  }

  /**
   * Create visual score bar
   */
  private static createScoreBar(score: number, width: number = 10): string {
    const filled = Math.round((score / 10) * width);
    const empty = width - filled;
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `[${this.color(filledBar, this.getScoreColor(score))}${this.color(emptyBar, 'dim')}]`;
  }

  /**
   * Get color for score
   */
  private static getScoreColor(score: number): keyof typeof ConsoleFormatter.COLORS {
    if (score >= 8) return 'green';
    if (score >= 6) return 'yellow';
    if (score >= 4) return 'yellow';
    return 'red';
  }

  /**
   * Get icon for category
   */
  private static getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      accessibility: this.ICONS.accessibility,
      usability: this.ICONS.usability,
      performance: this.ICONS.performance,
      visualDesign: this.ICONS.visual,
      'visual-design': this.ICONS.visual,
      mobile: this.ICONS.mobile,
      desktop: this.ICONS.desktop
    };
    
    return iconMap[category] || this.ICONS.info;
  }

  /**
   * Format category name
   */
  private static formatCategoryName(category: string): string {
    return category.split(/[-_]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Apply color to text
   */
  private static color(text: string, color: keyof typeof ConsoleFormatter.COLORS): string {
    return `${this.COLORS[color]}${text}${this.COLORS.reset}`;
  }

  /**
   * Show compact summary (for quick results)
   */
  static showCompactSummary(result: AnalysisResult): void {
    const score = result.overallScore || 0;
    const scoreColor = this.getScoreColor(score);
    const scoreBar = this.createScoreBar(score, 5);
    
    const criticalCount = result.criticalIssues?.length || 0;
    const majorCount = result.majorIssues?.length || 0;
    const recCount = result.recommendations?.length || 0;
    
    console.log(`\n${this.ICONS.success} ${this.color('jpglens Analysis:', 'bright')} ${this.color(score.toFixed(1) + '/10', scoreColor)} ${scoreBar}`);
    console.log(`${this.ICONS.issue} Issues: ${this.color(criticalCount + ' critical', criticalCount > 0 ? 'red' : 'green')}, ${this.color(majorCount + ' major', majorCount > 0 ? 'yellow' : 'green')}`);
    console.log(`${this.ICONS.recommendation} Recommendations: ${this.color(recCount.toString(), 'blue')}\n`);
  }

  /**
   * Show error message with formatting
   */
  static showError(error: string, details?: string): void {
    console.log(`\n${this.color('❌ jpglens Analysis Failed', 'red')}`);
    console.log(`${this.ICONS.separator.repeat(40)}`);
    console.log(`${this.ICONS.error} ${error}`);
    
    if (details) {
      console.log(`${this.ICONS.info} ${this.color('Details:', 'dim')} ${details}`);
    }
    
    console.log();
  }

  /**
   * Show loading/progress indicator
   */
  static showProgress(message: string): void {
    console.log(`${this.ICONS.info} ${this.color(message, 'cyan')}`);
  }
}
