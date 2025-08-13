/**
 * 🔍 jpglens - Cypress Integration
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

// Declare global cy and Cypress for TypeScript
declare const cy: any;
declare const Cypress: any;

import { AnalysisContext, AnalysisResult, UserJourney, JPGLensConfig } from '../core/types.js';
import { AIAnalyzer } from '../core/ai-analyzer.js';
import { ScreenshotCapture } from '../core/screenshot-capture.js';
import { loadConfig, DEFAULT_CONFIG } from '../core/config.js';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Analyze current page state with jpglens AI
       */
      analyzeUserExperience(context: AnalysisContext): any; // Chainable<AnalysisResult>
      
      /**
       * Analyze page state after user actions
       */
      analyzePageState(context: Partial<AnalysisContext>): any; // Chainable<AnalysisResult>
      
      /**
       * Analyze complete user journey
       */
      analyzeCompleteJourney(journey: UserJourney): any; // Chainable<AnalysisResult[]>

      /**
       * Prepare page for optimal AI analysis
       */
      prepareForJPGLensAnalysis(): any; // Chainable<void>
    }
  }
}

/**
 * Cypress jpglens analyzer class
 */
class CypressJPGLens {
  private aiAnalyzer: AIAnalyzer;
  private screenshotCapture: ScreenshotCapture;
  private config: JPGLensConfig;

  constructor(config?: JPGLensConfig) {
    this.config = config || DEFAULT_CONFIG;
    this.aiAnalyzer = new AIAnalyzer(this.config);
    this.screenshotCapture = new ScreenshotCapture();
  }

  static async create(config?: JPGLensConfig): Promise<CypressJPGLens> {
    const finalConfig = config || await loadConfig();
    return new CypressJPGLens(finalConfig);
  }

  /**
   * Analyze current Cypress page state
   */
  async analyzeUserExperience(context: AnalysisContext): Promise<AnalysisResult> {
    try {
      // Get current page information from Cypress
      const url = await cy.url();
      const title = await cy.title();
      const viewport = Cypress.config('viewportWidth') && Cypress.config('viewportHeight') 
        ? { width: Cypress.config('viewportWidth'), height: Cypress.config('viewportHeight') }
        : { width: 1280, height: 720 };

      // Capture screenshot using Cypress
      const screenshotPath = `jpglens-${Date.now()}.png`;
      await cy.screenshot(screenshotPath, {
        capture: 'fullPage',
        disableTimersAndAnimations: true
      });

      // Convert Cypress screenshot to our format
      const screenshot = await this.screenshotCapture.loadFromPath(
        `cypress/screenshots/${screenshotPath}`,
        {
          width: viewport.width,
          height: viewport.height,
          devicePixelRatio: 1,
          timestamp: new Date().toISOString()
        }
      );

      // Enhance context with page information
      const enhancedContext = await this.enhanceContextWithPageInfo(context, url, title, viewport);

      // Perform AI analysis
      const result = await this.aiAnalyzer.analyze(screenshot, enhancedContext);

      // Log result if debugging enabled
      if (Cypress.env('JPGLENS_DEBUG')) {
        cy.log(`🔍 jpglens analysis completed for ${context.stage}: Score ${result.overallScore}/10`);
      }

      return result;

    } catch (error) {
      throw new Error(`jpglens Cypress analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze page state with minimal context
   */
  async analyzePageState(context: Partial<AnalysisContext>): Promise<AnalysisResult> {
    const fullContext: AnalysisContext = {
      userContext: context.userContext || {
        deviceContext: 'cypress-browser',
        expertise: 'intermediate'
      },
      stage: context.stage || 'cypress-test',
      userIntent: context.userIntent || 'test-validation',
      criticalElements: context.criticalElements,
      businessContext: context.businessContext,
      technicalContext: context.technicalContext
    };

    return this.analyzeUserExperience(fullContext);
  }

  /**
   * Execute a complete user journey analysis
   */
  async analyzeCompleteJourney(journey: UserJourney): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const completedStages: string[] = [];

    for (const stage of journey.stages) {
      try {
        // Navigate to stage page
        cy.visit(stage.page);

        // Execute any required actions
        if (stage.actions) {
          await this.executeUserActions(stage.actions);
        }

        // Wait for page stability
        cy.wait(1000);

        // Create context for this stage
        const stageContext: AnalysisContext = {
          userContext: {
            persona: journey.persona,
            deviceContext: journey.device,
            ...(stage.context?.userContext || {})
          },
          stage: stage.name,
          userIntent: stage.userGoal,
          criticalElements: stage.context?.criticalElements,
          businessContext: stage.context?.businessContext,
          technicalContext: stage.context?.technicalContext
        };

        // Analyze this stage
        const result = await this.analyzeUserExperience(stageContext);
        
        // Add journey context
        result.journeyContext = {
          journeyName: journey.name,
          currentStage: stage.name,
          completedStages: [...completedStages],
          totalStages: journey.stages.length
        };

        results.push(result);
        completedStages.push(stage.name);

      } catch (error) {
        cy.log(`Failed to analyze journey stage ${stage.name}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Execute user actions in Cypress
   */
  private async executeUserActions(actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'click':
            if (action.selector) {
              cy.get(action.selector).click();
            }
            break;

          case 'type':
            if (action.selector && action.value) {
              cy.get(action.selector).clear().type(action.value);
            }
            break;

          case 'hover':
            if (action.selector) {
              cy.get(action.selector).trigger('mouseover');
            }
            break;

          case 'scroll':
            if (action.selector) {
              cy.get(action.selector).scrollIntoView();
            } else {
              cy.scrollTo('bottom');
            }
            break;

          case 'wait':
            const timeout = action.value ? parseInt(action.value) : 1000;
            cy.wait(timeout);
            break;

          default:
            cy.log(`Unknown action type: ${action.type}`);
        }

        // Brief pause between actions
        cy.wait(300);

      } catch (error) {
        cy.log(`Failed to execute action ${action.type}: ${error}`);
      }
    }
  }

  /**
   * Enhance context with Cypress page information
   */
  private async enhanceContextWithPageInfo(
    context: AnalysisContext, 
    url: string, 
    title: string, 
    viewport: { width: number; height: number }
  ): Promise<AnalysisContext> {
    try {
      // Detect frameworks and design systems
      const frameworks = await this.detectFrameworks();
      const designSystem = await this.detectDesignSystem();

      return {
        ...context,
        pageInfo: {
          url,
          title,
          viewport
        },
        technicalContext: {
          ...context.technicalContext,
          detectedFramework: frameworks.join(', ') || context.technicalContext?.framework,
          detectedDesignSystem: designSystem || context.technicalContext?.designSystem,
          deviceSupport: viewport.width < 768 ? 'mobile-first' : 'desktop-first',
          testFramework: 'Cypress'
        }
      };

    } catch (error) {
      cy.log(`Failed to enhance context: ${error}`);
      return context;
    }
  }

  /**
   * Detect frameworks using Cypress window object
   */
  private async detectFrameworks(): Promise<string[]> {
    return cy.window().then((win: any) => {
      const frameworks: string[] = [];

      if (win.React || win.document.querySelector('[data-reactroot]')) {
        frameworks.push('React');
      }

      if (win.Vue || win.document.querySelector('[data-v-]')) {
        frameworks.push('Vue');
      }

      if (win.ng || win.document.querySelector('[ng-app]')) {
        frameworks.push('Angular');
      }

      if (win.document.querySelector('[data-svelte-h]')) {
        frameworks.push('Svelte');
      }

      return frameworks;
    });
  }

  /**
   * Detect design system using Cypress DOM queries
   */
  private async detectDesignSystem(): Promise<string | null> {
    return cy.get('body').then(($body: any) => {
      const body = $body[0];

      // Material-UI
      if (body.querySelector('.MuiButton-root') || body.querySelector('.MuiCard-root')) {
        return 'Material-UI';
      }

      // Ant Design
      if (body.querySelector('.ant-btn') || body.querySelector('.ant-card')) {
        return 'Ant Design';
      }

      // Chakra UI
      if (body.querySelector('.chakra-button')) {
        return 'Chakra UI';
      }

      // Bootstrap
      if (body.querySelector('.btn-primary') || body.querySelector('.card-body')) {
        return 'Bootstrap';
      }

      // jpgos
      if (body.querySelector('.jpgos-btn') || body.querySelector('.window')) {
        return 'jpgos';
      }

      return null;
    });
  }
}

// Create singleton instance with default config
const cypressJPGLens = new CypressJPGLens(DEFAULT_CONFIG);

/**
 * Register Cypress commands
 */
Cypress.Commands.add('analyzeUserExperience', (context: AnalysisContext) => {
  return cy.wrap(cypressJPGLens.analyzeUserExperience(context));
});

Cypress.Commands.add('analyzePageState', (context: Partial<AnalysisContext>) => {
  return cy.wrap(cypressJPGLens.analyzePageState(context));
});

Cypress.Commands.add('analyzeCompleteJourney', (journey: UserJourney) => {
  return cy.wrap(cypressJPGLens.analyzeCompleteJourney(journey));
});

Cypress.Commands.add('prepareForJPGLensAnalysis', () => {
  // Disable animations for consistent screenshots
  cy.get('head').invoke('append', '<style>*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }</style>');
  
  // Wait for page to stabilize
  cy.wait(1000);
  
  // Wait for fonts to load
  cy.document().then((doc: any) => {
    return doc.fonts.ready;
  });
});

/**
 * Plugin registration function (to be called in cypress/support/index.js)
 */
export function registerJPGLensCommands(): void {
  // Commands are automatically registered when this module is imported
  console.log('🔍 jpglens Cypress commands registered');
}

/**
 * Convenience functions for direct use
 */
export const jpglens = {
  /**
   * Quick analysis with minimal setup
   */
  analyze: (context: Partial<AnalysisContext>) => {
    return cy.prepareForJPGLensAnalysis().then(() => {
      return cy.analyzePageState(context);
    });
  },

  /**
   * Full user experience analysis
   */
  analyzeUX: (context: AnalysisContext) => {
    return cy.prepareForJPGLensAnalysis().then(() => {
      return cy.analyzeUserExperience(context);
    });
  },

  /**
   * Journey analysis
   */
  analyzeJourney: (journey: UserJourney) => {
    return cy.analyzeCompleteJourney(journey);
  }
};

// Export for TypeScript support
export default cypressJPGLens;
