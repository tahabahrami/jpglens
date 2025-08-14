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

// Import specific items for internal use
import * as ConfigModule from './core/config.js';
import * as AnalyzerModule from './core/ai-analyzer.js';
import * as ScreenshotModule from './core/screenshot-capture.js';

// Framework integrations - specific exports to avoid conflicts
// Note: Using specific exports instead of * to avoid naming conflicts

// AI providers
export * from './providers/openrouter.js';
export * from './providers/openai.js';
export * from './providers/anthropic.js';

// Convenience exports for common use cases
export { loadConfig, DEFAULT_CONFIG } from './core/config.js';
export { AIAnalyzer } from './core/ai-analyzer.js';
export { ScreenshotCapture } from './core/screenshot-capture.js';
export { ReportGenerator, DEFAULT_REPORT_CONFIG, DEFAULT_REPORT_TEMPLATES } from './core/report-generator.js';
export { APICompatibilityHandler, createAPICompatibilityHandler } from './core/api-compatibility.js';
export { ConsoleFormatter } from './core/console-formatter.js';

// Import for internal use
import { loadConfig } from './core/config.js';
import { AIAnalyzer } from './core/ai-analyzer.js';
import { ScreenshotCapture } from './core/screenshot-capture.js';

// Framework-specific convenience exports
export {
  playwrightAnalyze,
  playwrightAnalyzeState,
  quickAnalyze as playwrightQuickAnalyze,
  analyzeUserJourney,
  analyzeCurrentState,
  analyzeCompleteJourney as playwrightAnalyzeJourney,
} from './integrations/playwright.js';

export {
  analyzeCurrentState as seleniumAnalyze,
  analyze as seleniumAnalyzeQuick,
  analyzeCrossBrowser as seleniumCrossBrowser,
  analyzeCompleteJourney as seleniumAnalyzeJourney,
} from './integrations/selenium.js';

export {
  analyzeComponentStates as storybookAnalyze,
  analyzeComponent as storybookQuickAnalyze,
  analyzeComponentA11y as storybookA11y,
} from './integrations/storybook.js';

/**
 * Main jpglens class for universal usage
 */
export class JPGLens {
  private analyzer: any;
  private screenshotCapture: any;
  private config: any;

  constructor(config?: any) {
    this.config = config || ConfigModule.DEFAULT_CONFIG;
    this.analyzer = new AnalyzerModule.AIAnalyzer(this.config);
    this.screenshotCapture = new ScreenshotModule.ScreenshotCapture();
  }

  /**
   * Initialize with async config loading
   */
  static async create(config?: any): Promise<JPGLens> {
    const finalConfig = config || (await ConfigModule.loadConfig());
    return new JPGLens(finalConfig);
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
