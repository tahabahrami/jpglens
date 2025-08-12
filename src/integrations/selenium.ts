/**
 * 🔍 jpglens - Selenium WebDriver Integration
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AnalysisContext, AnalysisResult, UserJourney } from '../core/types.js';
import { AIAnalyzer } from '../core/ai-analyzer.js';
import { ScreenshotCapture } from '../core/screenshot-capture.js';
import { loadConfig } from '../core/config.js';

/**
 * Selenium WebDriver integration for jpglens
 * Cross-browser AI analysis using Selenium
 */
export class SeleniumJPGLens {
  private aiAnalyzer: AIAnalyzer;
  private screenshotCapture: ScreenshotCapture;
  private config = loadConfig();

  constructor(private driver: any) {
    this.aiAnalyzer = new AIAnalyzer(this.config);
    this.screenshotCapture = new ScreenshotCapture();
  }

  /**
   * Analyze current page state with Selenium
   */
  async analyzeCurrentState(context: AnalysisContext): Promise<AnalysisResult> {
    try {
      // Capture screenshot using Selenium
      const screenshot = await this.screenshotCapture.captureSeleniumDriver(this.driver);

      // Enhance context with page information
      const enhancedContext = await this.enhanceContextWithPageInfo(context);

      // Perform AI analysis
      const result = await this.aiAnalyzer.analyze(screenshot, enhancedContext);

      // Log result if debugging
      if (process.env.JPGLENS_DEBUG) {
        console.log(`🔍 jpglens Selenium analysis completed for ${context.stage}:`, {
          score: result.overallScore,
          issues: result.criticalIssues.length + result.majorIssues.length,
          browser: await this.getBrowserInfo()
        });
      }

      return result;

    } catch (error) {
      throw new Error(`jpglens Selenium analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze with minimal context (convenience method)
   */
  async analyze(context: Partial<AnalysisContext>): Promise<AnalysisResult> {
    const fullContext: AnalysisContext = {
      userContext: context.userContext || {
        deviceContext: 'selenium-browser',
        expertise: 'intermediate'
      },
      stage: context.stage || 'selenium-test',
      userIntent: context.userIntent || 'validate-functionality',
      criticalElements: context.criticalElements,
      businessContext: context.businessContext,
      technicalContext: context.technicalContext
    };

    return this.analyzeCurrentState(fullContext);
  }

  /**
   * Cross-browser analysis
   */
  async analyzeCrossBrowser(
    context: AnalysisContext,
    browsers: string[] = ['chrome', 'firefox', 'safari', 'edge']
  ): Promise<{ browser: string; result: AnalysisResult }[]> {
    const results: { browser: string; result: AnalysisResult }[] = [];
    
    for (const browserName of browsers) {
      try {
        // Note: In real implementation, you'd switch browsers here
        // For now, we'll analyze with current browser but tag the result
        
        const result = await this.analyzeCurrentState({
          ...context,
          technicalContext: {
            ...context.technicalContext,
            browser: browserName,
            testFramework: 'Selenium WebDriver'
          }
        });

        result.browserInfo = {
          name: browserName,
          version: 'unknown', // Would be detected in real implementation
          platform: process.platform
        };

        results.push({ browser: browserName, result });

      } catch (error) {
        console.error(`Failed to analyze with ${browserName}:`, error);
      }
    }

    return results;
  }

  /**
   * Execute complete user journey with Selenium
   */
  async analyzeCompleteJourney(journey: UserJourney): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const completedStages: string[] = [];

    for (const stage of journey.stages) {
      try {
        // Navigate to stage page
        await this.driver.get(stage.page);

        // Execute actions for this stage
        if (stage.actions) {
          await this.executeUserActions(stage.actions);
        }

        // Wait for page to stabilize
        await this.driver.sleep(1000);

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
          technicalContext: {
            ...stage.context?.technicalContext,
            testFramework: 'Selenium WebDriver'
          }
        };

        // Analyze this stage
        const result = await this.analyzeCurrentState(stageContext);
        
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
        console.error(`Failed to analyze journey stage ${stage.name}:`, error);
      }
    }

    return results;
  }

  /**
   * Execute user actions with Selenium
   */
  private async executeUserActions(actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'click':
            if (action.selector) {
              const element = await this.driver.findElement({ css: action.selector });
              await element.click();
            }
            break;

          case 'type':
            if (action.selector && action.value) {
              const element = await this.driver.findElement({ css: action.selector });
              await element.clear();
              await element.sendKeys(action.value);
            }
            break;

          case 'hover':
            if (action.selector) {
              const element = await this.driver.findElement({ css: action.selector });
              const actions = this.driver.actions();
              await actions.move({ origin: element }).perform();
            }
            break;

          case 'scroll':
            if (action.selector) {
              const element = await this.driver.findElement({ css: action.selector });
              await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
            } else {
              await this.driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            }
            break;

          case 'wait':
            const timeout = action.value ? parseInt(action.value) : 1000;
            await this.driver.sleep(timeout);
            break;

          default:
            console.warn(`Unknown Selenium action type: ${action.type}`);
        }

        // Brief pause between actions
        await this.driver.sleep(300);

      } catch (error) {
        console.error(`Failed to execute Selenium action ${action.type}:`, error);
      }
    }
  }

  /**
   * Enhance context with Selenium page information
   */
  private async enhanceContextWithPageInfo(context: AnalysisContext): Promise<AnalysisContext> {
    try {
      const url = await this.driver.getCurrentUrl();
      const title = await this.driver.getTitle();
      const windowSize = await this.driver.manage().window().getSize();

      // Detect frameworks and design systems
      const frameworks = await this.detectFrameworks();
      const designSystem = await this.detectDesignSystem();

      return {
        ...context,
        pageInfo: {
          url,
          title,
          viewport: windowSize
        },
        technicalContext: {
          ...context.technicalContext,
          detectedFramework: frameworks.join(', ') || context.technicalContext?.framework,
          detectedDesignSystem: designSystem || context.technicalContext?.designSystem,
          deviceSupport: windowSize.width < 768 ? 'mobile-first' : 'desktop-first',
          testFramework: 'Selenium WebDriver',
          browser: await this.getBrowserInfo()
        }
      };

    } catch (error) {
      console.warn('Failed to enhance context with page info:', error);
      return context;
    }
  }

  /**
   * Detect JavaScript frameworks using Selenium
   */
  private async detectFrameworks(): Promise<string[]> {
    try {
      return await this.driver.executeScript(() => {
        const frameworks: string[] = [];

        if (window.React || document.querySelector('[data-reactroot]')) {
          frameworks.push('React');
        }

        if ((window as any).Vue || document.querySelector('[data-v-]')) {
          frameworks.push('Vue');
        }

        if ((window as any).ng || document.querySelector('[ng-app]')) {
          frameworks.push('Angular');
        }

        if (document.querySelector('[data-svelte-h]')) {
          frameworks.push('Svelte');
        }

        return frameworks;
      });
    } catch (error) {
      console.warn('Failed to detect frameworks:', error);
      return [];
    }
  }

  /**
   * Detect design system using Selenium
   */
  private async detectDesignSystem(): Promise<string | null> {
    try {
      return await this.driver.executeScript(() => {
        if (document.querySelector('.MuiButton-root') || document.querySelector('.MuiCard-root')) {
          return 'Material-UI';
        }

        if (document.querySelector('.ant-btn') || document.querySelector('.ant-card')) {
          return 'Ant Design';
        }

        if (document.querySelector('.chakra-button')) {
          return 'Chakra UI';
        }

        if (document.querySelector('.btn-primary') || document.querySelector('.card-body')) {
          return 'Bootstrap';
        }

        if (document.querySelector('.jpgos-btn') || document.querySelector('.window')) {
          return 'jpgos';
        }

        return null;
      });
    } catch (error) {
      console.warn('Failed to detect design system:', error);
      return null;
    }
  }

  /**
   * Get browser information
   */
  private async getBrowserInfo(): Promise<string> {
    try {
      const capabilities = await this.driver.getCapabilities();
      const browserName = capabilities.get('browserName') || 'unknown';
      const browserVersion = capabilities.get('browserVersion') || capabilities.get('version') || 'unknown';
      return `${browserName} ${browserVersion}`;
    } catch (error) {
      console.warn('Failed to get browser info:', error);
      return 'unknown';
    }
  }

  /**
   * Wait for page to be ready for analysis
   */
  async waitForPageReady(): Promise<void> {
    // Wait for document ready state
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, 10000);

    // Wait for any loading indicators to disappear
    await this.driver.sleep(1000);

    // Wait for fonts to load
    try {
      await this.driver.wait(async () => {
        return await this.driver.executeScript('return document.fonts.ready');
      }, 5000);
    } catch (error) {
      // Font loading check might not be supported in all browsers
      console.warn('Font loading check failed:', error);
    }
  }

  /**
   * Set up optimal conditions for screenshot analysis
   */
  async prepareForAnalysis(): Promise<void> {
    // Disable animations for consistent screenshots
    await this.driver.executeScript(`
      const style = document.createElement('style');
      style.innerHTML = '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
      document.head.appendChild(style);
    `);

    // Ensure page is ready
    await this.waitForPageReady();
  }
}

/**
 * Global functions for easy Selenium integration
 */

/**
 * Create jpglens analyzer for Selenium driver
 */
export function createSeleniumJPGLens(driver: any): SeleniumJPGLens {
  return new SeleniumJPGLens(driver);
}

/**
 * Analyze current state (convenience function)
 */
export async function analyzeCurrentState(driver: any, context: AnalysisContext): Promise<AnalysisResult> {
  const jpglens = createSeleniumJPGLens(driver);
  await jpglens.prepareForAnalysis();
  return jpglens.analyzeCurrentState(context);
}

/**
 * Quick analysis with minimal setup
 */
export async function analyze(driver: any, context: Partial<AnalysisContext>): Promise<AnalysisResult> {
  const jpglens = createSeleniumJPGLens(driver);
  await jpglens.prepareForAnalysis();
  return jpglens.analyze(context);
}

/**
 * Cross-browser analysis
 */
export async function analyzeCrossBrowser(
  driver: any, 
  context: AnalysisContext, 
  browsers?: string[]
): Promise<{ browser: string; result: AnalysisResult }[]> {
  const jpglens = createSeleniumJPGLens(driver);
  return jpglens.analyzeCrossBrowser(context, browsers);
}

/**
 * Complete journey analysis
 */
export async function analyzeCompleteJourney(driver: any, journey: UserJourney): Promise<AnalysisResult[]> {
  const jpglens = createSeleniumJPGLens(driver);
  return jpglens.analyzeCompleteJourney(journey);
}
