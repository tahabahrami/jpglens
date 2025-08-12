/**
 * 🔍 jpglens - Screenshot Capture System
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ScreenshotData } from './types.js';

/**
 * Universal screenshot capture and management system
 * Handles screenshots from multiple testing frameworks
 */
export class ScreenshotCapture {
  constructor(private outputDir: string = './jpglens-screenshots') {
    this.ensureOutputDir();
  }

  /**
   * Capture screenshot from Playwright page
   */
  async capturePlaywrightPage(
    page: any, 
    options: {
      fullPage?: boolean;
      animations?: 'disabled' | 'allow';
      mask?: any[];
      quality?: number;
    } = {}
  ): Promise<ScreenshotData> {
    const timestamp = new Date().toISOString();
    const filename = `playwright-${Date.now()}.png`;
    const filepath = join(this.outputDir, filename);

    // Capture screenshot with Playwright
    const buffer = await page.screenshot({
      path: filepath,
      fullPage: options.fullPage ?? true,
      animations: options.animations ?? 'disabled',
      mask: options.mask ?? [],
      type: 'png'
    });

    // Get viewport information
    const viewport = page.viewportSize() || { width: 1280, height: 720 };

    return {
      buffer,
      path: filepath,
      metadata: {
        width: viewport.width,
        height: viewport.height,
        devicePixelRatio: await page.evaluate(() => window.devicePixelRatio) || 1,
        timestamp
      }
    };
  }

  /**
   * Capture screenshot from Selenium WebDriver
   */
  async captureSeleniumDriver(driver: any): Promise<ScreenshotData> {
    const timestamp = new Date().toISOString();
    const filename = `selenium-${Date.now()}.png`;
    const filepath = join(this.outputDir, filename);

    // Capture screenshot with Selenium
    const base64Data = await driver.takeScreenshot();
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Save to file
    writeFileSync(filepath, buffer);

    // Get window size
    const windowSize = await driver.manage().window().getSize();

    return {
      buffer,
      path: filepath,
      metadata: {
        width: windowSize.width,
        height: windowSize.height,
        devicePixelRatio: 1, // Selenium doesn't provide this easily
        timestamp
      }
    };
  }

  /**
   * Load screenshot from Cypress (which saves to filesystem)
   */
  async loadFromPath(
    filepath: string, 
    metadata: {
      width: number;
      height: number;
      devicePixelRatio: number;
      timestamp: string;
    }
  ): Promise<ScreenshotData> {
    const buffer = readFileSync(filepath);

    return {
      buffer,
      path: filepath,
      metadata
    };
  }

  /**
   * Create screenshot data from buffer
   */
  createFromBuffer(
    buffer: Buffer,
    metadata: {
      width: number;
      height: number;
      devicePixelRatio?: number;
      timestamp?: string;
    }
  ): ScreenshotData {
    const timestamp = metadata.timestamp || new Date().toISOString();
    const filename = `buffer-${Date.now()}.png`;
    const filepath = join(this.outputDir, filename);

    // Save buffer to file
    writeFileSync(filepath, buffer);

    return {
      buffer,
      path: filepath,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        devicePixelRatio: metadata.devicePixelRatio || 1,
        timestamp
      }
    };
  }

  /**
   * Capture multiple screenshots for user journey
   * Returns them in a zip-like structure for batch AI analysis
   */
  async captureJourneyScreenshots(
    captureFunction: () => Promise<ScreenshotData>,
    stages: string[]
  ): Promise<{ screenshots: ScreenshotData[]; zipPath?: string }> {
    const screenshots: ScreenshotData[] = [];

    for (const stage of stages) {
      try {
        const screenshot = await captureFunction();
        
        // Add stage metadata
        screenshot.stageInfo = {
          stageName: stage,
          stageIndex: stages.indexOf(stage),
          totalStages: stages.length
        };

        screenshots.push(screenshot);
      } catch (error) {
        console.error(`Failed to capture screenshot for stage ${stage}:`, error);
      }
    }

    // For user journey analysis, we can create a zip file
    // This allows sending all screenshots to AI in one request for better context
    const zipPath = await this.createScreenshotZip(screenshots);

    return { screenshots, zipPath };
  }

  /**
   * Create a zip file containing all screenshots for batch analysis
   * This enables better contextual analysis across user journey stages
   */
  private async createScreenshotZip(screenshots: ScreenshotData[]): Promise<string | undefined> {
    try {
      // This is a placeholder for zip creation
      // In a real implementation, you'd use a library like 'adm-zip'
      const zipPath = join(this.outputDir, `journey-${Date.now()}.zip`);
      
      // For now, we'll create a JSON manifest of the screenshots
      // Real implementation would create actual zip file
      const manifest = {
        screenshots: screenshots.map(s => ({
          path: s.path,
          metadata: s.metadata,
          stageInfo: (s as any).stageInfo
        })),
        createdAt: new Date().toISOString(),
        totalScreenshots: screenshots.length
      };

      writeFileSync(zipPath.replace('.zip', '.json'), JSON.stringify(manifest, null, 2));
      
      return zipPath;

    } catch (error) {
      console.warn('Failed to create screenshot zip:', error);
      return undefined;
    }
  }

  /**
   * Optimize screenshot for AI analysis
   * Reduces file size while maintaining quality for AI vision models
   */
  async optimizeForAI(screenshot: ScreenshotData): Promise<ScreenshotData> {
    // For now, return as-is
    // Real implementation could:
    // - Resize if too large (AI models have input limits)
    // - Compress to reduce API costs
    // - Convert format if needed
    // - Add visual annotations for focus areas

    return screenshot;
  }

  /**
   * Add visual annotations to screenshot for better AI analysis
   */
  async annotateScreenshot(
    screenshot: ScreenshotData,
    annotations: {
      criticalElements?: { selector: string; label: string }[];
      userFlow?: { x: number; y: number; step: number }[];
      focusAreas?: { x: number; y: number; width: number; height: number; label: string }[];
    }
  ): Promise<ScreenshotData> {
    // This would use a library like 'sharp' or 'jimp' to add annotations
    // For now, we'll store the annotation data in metadata
    
    const annotatedScreenshot = { ...screenshot };
    annotatedScreenshot.annotations = annotations;
    
    return annotatedScreenshot;
  }

  /**
   * Convert screenshot to base64 for API transmission
   */
  toBase64(screenshot: ScreenshotData): string {
    return screenshot.buffer.toString('base64');
  }

  /**
   * Get screenshot file size in bytes
   */
  getFileSize(screenshot: ScreenshotData): number {
    return screenshot.buffer.length;
  }

  /**
   * Validate screenshot data
   */
  validateScreenshot(screenshot: ScreenshotData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!screenshot.buffer || screenshot.buffer.length === 0) {
      errors.push('Screenshot buffer is empty');
    }

    if (!screenshot.path) {
      errors.push('Screenshot path is missing');
    }

    if (!screenshot.metadata) {
      errors.push('Screenshot metadata is missing');
    } else {
      if (!screenshot.metadata.width || !screenshot.metadata.height) {
        errors.push('Screenshot dimensions are missing');
      }

      if (screenshot.metadata.width < 100 || screenshot.metadata.height < 100) {
        errors.push('Screenshot dimensions are too small');
      }

      if (screenshot.metadata.width > 5000 || screenshot.metadata.height > 5000) {
        errors.push('Screenshot dimensions are too large');
      }
    }

    // Check file size limits (most AI APIs have limits)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (screenshot.buffer.length > maxSize) {
      errors.push(`Screenshot file size (${Math.round(screenshot.buffer.length / 1024 / 1024)}MB) exceeds maximum (20MB)`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    try {
      const fs = require('fs');
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
    } catch (error) {
      console.warn(`Failed to create screenshot output directory: ${error}`);
    }
  }

  /**
   * Clean up old screenshots to save disk space
   */
  async cleanup(olderThanHours: number = 24): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(this.outputDir)) return;

      const files = fs.readdirSync(this.outputDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(this.outputDir, file);
        const stats = fs.statSync(filepath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`🧹 jpglens cleaned up ${deletedCount} old screenshots`);
      }

    } catch (error) {
      console.warn('Failed to cleanup old screenshots:', error);
    }
  }
}
