/**
 * 🔍 jpglens - Core Type Definitions
 * Universal AI-Powered UI Testing
 *
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

export interface JPGLensConfig {
  ai: {
    provider: 'openrouter' | 'openai' | 'anthropic' | 'custom';
    apiKey: string;
    model: string;
    fallbackModel?: string;
    maxTokens?: number;
    temperature?: number;
    baseUrl?: string;
    messageFormat?: 'openai' | 'anthropic' | 'auto';
  };

  analysis: {
    types: AnalysisType[];
    depth: 'quick' | 'standard' | 'comprehensive';
    includeScreenshots: boolean;
    generateReports: boolean;
    outputDir?: string;
  };

  reporting?: ReportConfig;
  userPersonas?: Record<string, UserPersona>;
  journeyTemplates?: Record<string, string[]>;
  plugins?: string[];
}

export type AnalysisType =
  | 'usability'
  | 'accessibility'
  | 'visual-design'
  | 'performance'
  | 'mobile-optimization'
  | 'conversion-optimization'
  | 'brand-consistency'
  | 'error-handling';

export interface UserPersona {
  name: string;
  expertise: 'novice' | 'intermediate' | 'expert';
  device: 'mobile-primary' | 'desktop-primary' | 'mixed';
  urgency: 'low' | 'medium' | 'high';
  goals: string[];
  painPoints?: string[];
  context?: string;
}

export interface UserContext {
  persona?: string | UserPersona;
  deviceContext: string;
  timeConstraint?: 'none' | 'limited' | 'urgent';
  trustLevel?: 'low' | 'medium' | 'high';
  expertise?: 'novice' | 'intermediate' | 'expert';
  businessGoals?: string[];
}

export interface BusinessContext {
  industry: string;
  conversionGoal: string;
  competitiveAdvantage?: string;
  brandPersonality?: string;
  targetAudience?: string;
}

export interface TechnicalContext {
  framework?: string;
  designSystem?: string;
  deviceSupport?: 'mobile-first' | 'desktop-first' | 'responsive';
  performanceTarget?: string;
  accessibilityTarget?: 'WCAG-A' | 'WCAG-AA' | 'WCAG-AAA';
  detectedFramework?: string;
  detectedDesignSystem?: string;
  testFramework?: string;
  browser?: string;
  renderMethod?: string;
  queryMethods?: string[];
}

export interface AnalysisContext {
  userContext: UserContext;
  businessContext?: BusinessContext;
  technicalContext?: TechnicalContext;
  stage: string;
  userIntent: string;
  criticalElements?: string[];
  pageInfo?: any;
  componentInfo?: any;
  interactionInfo?: any;
}

export interface UserJourneyStage {
  name: string;
  page: string;
  userGoal: string;
  actions?: UserAction[];
  aiAnalysis: string;
  context?: Partial<AnalysisContext>;
}

export interface UserAction {
  type: 'click' | 'type' | 'hover' | 'scroll' | 'wait';
  selector?: string;
  value?: string;
  description: string;
}

export interface UserJourney {
  name: string;
  description: string;
  persona: string | UserPersona;
  device: string;
  stages: UserJourneyStage[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  component?: string;
  page: string;
  context: AnalysisContext;

  // Analysis Results
  overallScore: number;
  scores: {
    usability?: number;
    accessibility?: number;
    visualDesign?: number;
    performance?: number;
  };

  // Findings
  strengths: string[];
  criticalIssues: Issue[];
  majorIssues: Issue[];
  minorIssues: Issue[];
  recommendations: Recommendation[];

  // Metadata
  screenshot?: string;
  model: string;
  tokensUsed: number;
  analysisTime: number;
  config?: {
    provider?: string;
    model?: string;
    analysisTypes?: string[];
    depth?: string;
  };
  error?: boolean;
  journeyContext?: any;
  browserInfo?: any;
  storybookInfo?: any;
  componentCategory?: any;
  provider?: string;
  rawAnalysis?: string;
  reportPath?: string;
}

export interface Issue {
  severity: 'critical' | 'major' | 'minor';
  category: AnalysisType;
  title: string;
  description: string;
  impact: string;
  selector?: string;
  fix?: string;
}

export interface Recommendation {
  type: 'code' | 'design' | 'content' | 'process';
  title: string;
  description: string;
  implementation: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface ScreenshotData {
  buffer: Buffer;
  path: string;
  metadata: {
    width: number;
    height: number;
    devicePixelRatio: number;
    timestamp: string;
  };
  stageInfo?: {
    name?: string;
    userGoal?: string;
    actions?: any[];
    stageName?: string;
    stageIndex?: number;
    totalStages?: number;
  };
  annotations?: any;
}

export interface AIProvider {
  name: string;
  analyze(screenshot: ScreenshotData, context: AnalysisContext, prompt: string): Promise<AnalysisResult>;
  isAvailable(): Promise<boolean>;
  getModelInfo(): { name: string; capabilities: string[] };
}

export interface JPGLensPlugin {
  name: string;
  version: string;
  description: string;

  // Plugin Hooks
  beforeAnalysis?(context: AnalysisContext): Promise<void>;
  afterAnalysis?(result: AnalysisResult): Promise<AnalysisResult>;
  customPrompts?(): Record<string, string>;
  customAnalysis?(screenshot: ScreenshotData, context: AnalysisContext): Promise<Partial<AnalysisResult>>;
}

// Framework Integration Types
export interface PlaywrightIntegration {
  page: any; // Playwright Page
  analyzeUserJourney(context: AnalysisContext): Promise<AnalysisResult>;
  analyzeCurrentState(context: AnalysisContext): Promise<AnalysisResult>;
}

export interface CypressIntegration {
  analyzeUserExperience(context: AnalysisContext): any; // Cypress.Chainable<AnalysisResult>
  analyzePageState(context: AnalysisContext): any; // Cypress.Chainable<AnalysisResult>
}

export interface StorybookIntegration {
  canvas: any; // Storybook Canvas
  analyzeComponentStates(
    context: AnalysisContext & {
      component: string;
      states: string[];
      designSystem?: string;
    }
  ): Promise<AnalysisResult>;
}

export interface SeleniumIntegration {
  driver: any; // WebDriver
  analyzeCurrentState(context: AnalysisContext): Promise<AnalysisResult>;
}

// Reporting System Types
export type ReportFormat = 'markdown' | 'json' | 'html';

export interface ReportTemplate {
  name: string;
  format: ReportFormat;
  sections: string[];
  prompts: Record<string, string>;
}

export interface ReportConfig {
  enabled: boolean;
  outputDir: string;
  template: string;
  format: ReportFormat;
  includeScreenshots: boolean;
  includeRawAnalysis: boolean;
  timestampFormat: 'ISO' | 'filename' | 'readable';
  fileNaming: string;
  customPrompts: Record<string, string>;
  apiCompatibility: 'openai' | 'anthropic' | 'auto';
}

export interface AIProviderConfig {
  provider: 'openrouter' | 'openai' | 'anthropic';
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  messageFormat?: 'openai' | 'anthropic' | 'auto';
}
