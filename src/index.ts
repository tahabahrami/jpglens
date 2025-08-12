/**
 * 🔍 jpglens - Universal AI-Powered UI Testing
 * Main entry point for the jpglens library
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

// Core exports
export * from './core/types.js';
export * from './core/config.js';
export * from './core/ai-analyzer.js';
export * from './core/screenshot-capture.js';

// Framework integrations
export * from './integrations/playwright.js';
export * from './integrations/cypress.js';
export * from './integrations/selenium.js';
export * from './integrations/storybook.js';

// AI providers
export * from './providers/openrouter.js';
export * from './providers/openai.js';
export * from './providers/anthropic.js';

// Convenience exports for common use cases
export { loadConfig, DEFAULT_CONFIG } from './core/config.js';
export { AIAnalyzer } from './core/ai-analyzer.js';
export { ScreenshotCapture } from './core/screenshot-capture.js';

// Framework-specific convenience exports
export { 
  analyzeUserJourney as playwrightAnalyze,
  analyzeCurrentState as playwrightAnalyzeState,
  analyzeCompleteJourney as playwrightAnalyzeJourney
} from './integrations/playwright.js';

export {
  analyzeCurrentState as seleniumAnalyze,
  analyze as seleniumAnalyzeQuick,
  analyzeCrossBrowser as seleniumCrossBrowser
} from './integrations/selenium.js';

export {
  analyzeComponentStates as storybookAnalyze,
  analyzeComponent as storybookQuickAnalyze,
  analyzeComponentA11y as storybookA11y
} from './integrations/storybook.js';

/**
 * Main jpglens class for universal usage
 */
export class JPGLens {
  private analyzer: any;
  private screenshotCapture: any;
  private config: any;

  constructor(config?: any) {
    this.config = config || loadConfig();
    this.analyzer = new AIAnalyzer(this.config);
    this.screenshotCapture = new ScreenshotCapture();
  }

  /**
   * Universal analysis method
   */
  async analyze(screenshot: any, context: any): Promise<any> {
    return this.analyzer.analyze(screenshot, context);
  }

  /**
   * Create screenshot from various sources
   */
  createScreenshot(source: any, metadata: any): any {
    return this.screenshotCapture.createFromBuffer(source, metadata);
  }

  /**
   * Get configuration
   */
  getConfig(): any {
    return this.config;
  }
}

/**
 * Quick start function for immediate usage
 */
export function createJPGLens(config?: any): JPGLens {
  return new JPGLens(config);
}

// Default export
export default JPGLens;
