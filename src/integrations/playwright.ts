/**
 * 🔍 jpglens - Playwright Integration
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

// import { Page } from '@playwright/test'; // Commented to avoid build dependency
type Page = any; // Generic type for Playwright Page
import { AnalysisContext, AnalysisResult, UserJourney, UserJourneyStage } from '../core/types.js';
import { AIAnalyzer } from '../core/ai-analyzer.js';
import { ScreenshotCapture } from '../core/screenshot-capture.js';
import { loadConfig } from '../core/config.js';

/**
 * Playwright integration for jpglens AI analysis
 * Extends Playwright tests with contextual AI insights
 */
export class PlaywrightJPGLens {
  private aiAnalyzer: AIAnalyzer;
  private screenshotCapture: ScreenshotCapture;
  private config = loadConfig();

  constructor(private page: Page) {
    this.aiAnalyzer = new AIAnalyzer(this.config);
    this.screenshotCapture = new ScreenshotCapture();
  }

  /**
   * Analyze current page state with user context
   */
  async analyzeUserJourney(context: AnalysisContext): Promise<AnalysisResult> {
    try {
      // Capture screenshot with metadata
      const screenshot = await this.screenshotCapture.capturePlaywrightPage(this.page, {
        fullPage: true,
        animations: 'disabled', // Ensure consistent screenshots
        mask: [], // Could mask sensitive data
      });

      // Enhance context with page information
      const enhancedContext = await this.enhanceContextWithPageInfo(context);

      // Perform AI analysis
      const result = await this.aiAnalyzer.analyze(screenshot, enhancedContext);

      // Log result for debugging if needed
      if (process.env.JPGLENS_DEBUG) {
        console.log(`🔍 jpglens analysis completed for ${context.stage}:`, {
          score: result.overallScore,
          issues: result.criticalIssues.length + result.majorIssues.length,
          page: await this.page.url()
        });
      }

      return result;

    } catch (error) {
      throw new Error(`jpglens Playwright analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze current state after user actions
   */
  async analyzeCurrentState(context: Partial<AnalysisContext>): Promise<AnalysisResult> {
    const fullContext: AnalysisContext = {
      userContext: context.userContext || {
        deviceContext: 'desktop-browser',
        expertise: 'intermediate'
      },
      stage: context.stage || 'user-interaction',
      userIntent: context.userIntent || 'complete-task',
      criticalElements: context.criticalElements,
      businessContext: context.businessContext,
      technicalContext: context.technicalContext
    };

    return this.analyzeUserJourney(fullContext);
  }

  /**
   * Analyze a complete user journey with multiple stages
   */
  async analyzeCompleteJourney(journey: UserJourney): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const completedStages: string[] = [];

    for (const stage of journey.stages) {
      try {
        // Navigate to stage page
        await this.page.goto(stage.page, { waitUntil: 'networkidle' });

        // Execute any required actions for this stage
        if (stage.actions) {
          await this.executeUserActions(stage.actions);
        }

        // Wait for page to stabilize
        await this.page.waitForTimeout(1000);

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
        const result = await this.analyzeUserJourney(stageContext);
        
        // Add journey context to result
        result.journeyContext = {
          journeyName: journey.name,
          currentStage: stage.name,
          completedStages: [...completedStages],
          totalStages: journey.stages.length
        };

        results.push(result);
        completedStages.push(stage.name);

      } catch (error) {
        console.error(`Failed to analyze journey stage ${stage.name}:`, error);
        // Continue with next stage
      }
    }

    return results;
  }

  /**
   * Execute user actions for a journey stage
   */
  private async executeUserActions(actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'click':
            if (action.selector) {
              await this.page.click(action.selector);
            }
            break;

          case 'type':
            if (action.selector && action.value) {
              await this.page.fill(action.selector, action.value);
            }
            break;

          case 'hover':
            if (action.selector) {
              await this.page.hover(action.selector);
            }
            break;

          case 'scroll':
            if (action.selector) {
              await this.page.locator(action.selector).scrollIntoViewIfNeeded();
            } else {
              await this.page.evaluate(() => window.scrollTo(0, window.innerHeight));
            }
            break;

          case 'wait':
            const timeout = action.value ? parseInt(action.value) : 1000;
            await this.page.waitForTimeout(timeout);
            break;

          default:
            console.warn(`Unknown action type: ${action.type}`);
        }

        // Brief pause between actions to simulate human behavior
        await this.page.waitForTimeout(300);

      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  /**
   * Enhance analysis context with page information
   */
  private async enhanceContextWithPageInfo(context: AnalysisContext): Promise<AnalysisContext> {
    try {
      const url = this.page.url();
      const title = await this.page.title();
      const viewport = this.page.viewportSize();

      // Detect framework and design system if possible
      const frameworks = await this.detectFrameworks();
      const designSystem = await this.detectDesignSystem();

      return {
        ...context,
        pageInfo: {
          url,
          title,
          viewport: viewport || { width: 1280, height: 720 }
        },
        technicalContext: {
          ...context.technicalContext,
          detectedFramework: frameworks.join(', ') || context.technicalContext?.framework,
          detectedDesignSystem: designSystem || context.technicalContext?.designSystem,
          deviceSupport: viewport && viewport.width < 768 ? 'mobile-first' : 'desktop-first'
        }
      };

    } catch (error) {
      console.warn('Failed to enhance context with page info:', error);
      return context;
    }
  }

  /**
   * Detect JavaScript frameworks on the page
   */
  private async detectFrameworks(): Promise<string[]> {
    return this.page.evaluate(() => {
      const frameworks: string[] = [];

      // React
      if (window.React || document.querySelector('[data-reactroot]') || document.querySelector('[data-react-helmet]')) {
        frameworks.push('React');
      }

      // Vue
      if ((window as any).Vue || document.querySelector('[data-v-]') || document.querySelector('.__vue__')) {
        frameworks.push('Vue');
      }

      // Angular
      if ((window as any).ng || document.querySelector('[ng-app]') || document.querySelector('[ng-version]')) {
        frameworks.push('Angular');
      }

      // Svelte
      if (document.querySelector('[data-svelte-h]')) {
        frameworks.push('Svelte');
      }

      return frameworks;
    });
  }

  /**
   * Detect design system or UI library
   */
  private async detectDesignSystem(): Promise<string | null> {
    return this.page.evaluate(() => {
      // Material-UI / MUI
      if (document.querySelector('.MuiButton-root') || document.querySelector('.MuiCard-root')) {
        return 'Material-UI';
      }

      // Ant Design
      if (document.querySelector('.ant-btn') || document.querySelector('.ant-card')) {
        return 'Ant Design';
      }

      // Chakra UI
      if (document.querySelector('.chakra-button') || document.querySelector('.chakra-card')) {
        return 'Chakra UI';
      }

      // Bootstrap
      if (document.querySelector('.btn-primary') || document.querySelector('.card-body')) {
        return 'Bootstrap';
      }

      // Tailwind CSS
      const element = document.querySelector('*[class*="bg-"], *[class*="text-"], *[class*="p-"], *[class*="m-"]');
      if (element && element.className.includes('bg-') || element?.className.includes('text-')) {
        return 'Tailwind CSS';
      }

      // jpgos (our own design system!)
      if (document.querySelector('.jpgos-btn') || document.querySelector('.window')) {
        return 'jpgos';
      }

      return null;
    });
  }

  /**
   * Wait for page to be ready for analysis
   */
  async waitForPageReady(): Promise<void> {
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');

    // Wait for any animations to complete
    await this.page.waitForTimeout(1000);

    // Wait for fonts to load
    await this.page.evaluate(() => {
      return document.fonts.ready;
    });
  }

  /**
   * Set up optimal conditions for screenshot analysis
   */
  async prepareForAnalysis(): Promise<void> {
    // Disable animations for consistent screenshots
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });

    // Ensure page is ready
    await this.waitForPageReady();
  }
}

/**
 * Convenience function to create jpglens analyzer for Playwright page
 */
export function createJPGLens(page: Page): PlaywrightJPGLens {
  return new PlaywrightJPGLens(page);
}

/**
 * Global function to analyze user journey (for easier integration)
 */
export async function analyzeUserJourney(page: Page, context: AnalysisContext): Promise<AnalysisResult> {
  const jpglens = createJPGLens(page);
  await jpglens.prepareForAnalysis();
  return jpglens.analyzeUserJourney(context);
}

/**
 * Global function to analyze current state (for easier integration)
 */
export async function analyzeCurrentState(page: Page, context: Partial<AnalysisContext>): Promise<AnalysisResult> {
  const jpglens = createJPGLens(page);
  await jpglens.prepareForAnalysis();
  return jpglens.analyzeCurrentState(context);
}

/**
 * Global function to analyze complete journey (for easier integration)
 */
export async function analyzeCompleteJourney(page: Page, journey: UserJourney): Promise<AnalysisResult[]> {
  const jpglens = createJPGLens(page);
  return jpglens.analyzeCompleteJourney(journey);
}

/**
 * Main Playwright analyze function (for backward compatibility)
 * This is the function that was missing from exports
 */
export async function playwrightAnalyze(
  page: Page,
  options: {
    screenshot?: Buffer;
    component?: string;
    stage?: string;
    userIntent?: string;
    userContext?: any;
    context?: Partial<AnalysisContext>;
  } = {}
): Promise<AnalysisResult> {
  const jpglens = createJPGLens(page);
  
  // Take screenshot if not provided
  let screenshot: Buffer;
  if (options.screenshot) {
    screenshot = options.screenshot;
  } else {
    screenshot = await page.screenshot({ 
      fullPage: true,
      type: 'png'
    });
  }
  
  // Build analysis context with proper typing
  const analysisContext: AnalysisContext = {
    stage: options.stage || options.context?.stage || 'interaction',
    userIntent: options.userIntent || options.context?.userIntent || 'Navigate and interact with the interface',
    userContext: options.userContext || options.context?.userContext || {
      deviceContext: 'desktop',
      expertise: 'intermediate'
    },
    pageInfo: {
      component: options.component || 'page',
      page: page.url()
    },
    ...(options.context || {})
  };
  
  // Prepare for analysis and call the correct method
  await jpglens.prepareForAnalysis();
  
  // Use analyzeUserJourney which is the correct method for PlaywrightJPGLens
  return jpglens.analyzeUserJourney(analysisContext);
}

/**
 * Analyze current page state (alias for playwrightAnalyze)
 */
export async function playwrightAnalyzeState(
  page: Page,
  options: {
    screenshot?: Buffer;
    component?: string;
    stage?: string;
    userIntent?: string;
    userContext?: any;
    context?: Partial<AnalysisContext>;
  } = {}
): Promise<AnalysisResult> {
  return playwrightAnalyze(page, options);
}

/**
 * Quick analyze function with minimal configuration
 */
export async function quickAnalyze(
  page: Page,
  component?: string
): Promise<AnalysisResult> {
  return playwrightAnalyze(page, {
    component: component || 'page',
    stage: 'interaction',
    userIntent: 'Use the interface effectively'
  });
}
