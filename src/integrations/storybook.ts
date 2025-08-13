/**
 * 🔍 jpglens - Storybook Integration
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AnalysisContext, AnalysisResult } from '../core/types.js';
import { AIAnalyzer } from '../core/ai-analyzer.js';
import { ScreenshotCapture } from '../core/screenshot-capture.js';
import { loadConfig } from '../core/config.js';

/**
 * Storybook integration for jpglens
 * Analyze component states and interactions within Storybook stories
 */
export class StorybookJPGLens {
  private aiAnalyzer: AIAnalyzer;
  private screenshotCapture: ScreenshotCapture;
  private config = loadConfig();

  constructor() {
    this.aiAnalyzer = new AIAnalyzer(this.config);
    this.screenshotCapture = new ScreenshotCapture();
  }

  /**
   * Analyze component states within Storybook
   */
  async analyzeComponentStates(
    canvas: any,
    context: AnalysisContext & {
      component: string;
      states: string[];
      designSystem?: string;
    }
  ): Promise<AnalysisResult> {
    try {
      // Get canvas element and convert to screenshot
      const canvasElement = canvas.container || canvas;
      const screenshot = await this.captureCanvasScreenshot(canvasElement);

      // Enhance context for component analysis
      const enhancedContext: AnalysisContext = {
        ...context,
        stage: `component-${context.component.toLowerCase()}`,
        userIntent: `evaluate ${context.component} component usability and design`,
        technicalContext: {
          ...context.technicalContext,
          framework: 'Storybook',
          designSystem: context.designSystem || 'unknown',
          deviceSupport: 'responsive'
        },
        componentInfo: {
          name: context.component,
          states: context.states,
          framework: 'Storybook'
        }
      };

      // Perform AI analysis
      const result = await this.aiAnalyzer.analyze(screenshot, enhancedContext);

      // Add Storybook-specific metadata
      result.storybookInfo = {
        component: context.component,
        states: context.states,
        designSystem: context.designSystem
      };

      return result;

    } catch (error) {
      throw new Error(`Storybook jpglens analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze complete component library
   */
  async analyzeComponentLibrary(
    components: Array<{
      name: string;
      canvas: any;
      states: string[];
      category?: string;
    }>
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const component of components) {
      try {
        const result = await this.analyzeComponentStates(component.canvas, {
          userContext: {
            persona: 'design-system-user',
            deviceContext: 'storybook-browser',
            expertise: 'intermediate'
          },
          stage: 'component-evaluation',
          userIntent: `evaluate ${component.name} for design system consistency`,
          component: component.name,
          states: component.states,
          businessContext: {
            industry: 'design-systems',
            conversionGoal: 'component-adoption',
            brandPersonality: 'consistent-professional'
          }
        });

        result.componentCategory = component.category;
        results.push(result);

      } catch (error) {
        console.error(`Failed to analyze component ${component.name}:`, error);
      }
    }

    return results;
  }

  /**
   * Analyze accessibility across component states
   */
  async analyzeComponentAccessibility(
    canvas: any,
    component: string,
    states: string[]
  ): Promise<AnalysisResult> {
    const context: AnalysisContext = {
      userContext: {
        persona: 'accessibility-user',
        deviceContext: 'screen-reader-desktop',
        expertise: 'intermediate'
      },
      stage: 'accessibility-evaluation',
      userIntent: 'ensure component is accessible across all states',
      businessContext: {
        industry: 'accessibility-compliance',
        conversionGoal: 'wcag-compliance',
        targetAudience: 'users-with-disabilities'
      },
      technicalContext: {
        framework: 'Storybook',
        accessibilityTarget: 'WCAG-AA',
        deviceSupport: 'responsive'
      }
    };

    return this.analyzeComponentStates(canvas, {
      ...context,
      component,
      states
    });
  }

  /**
   * Capture screenshot from Storybook canvas
   */
  private async captureCanvasScreenshot(canvasElement: HTMLElement): Promise<any> {
    // This would typically use html2canvas or similar library
    // For now, we'll simulate the screenshot capture
    
    const rect = canvasElement.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context for screenshot');
    }

    canvas.width = rect.width;
    canvas.height = rect.height;

    // In a real implementation, you'd use html2canvas:
    // const canvas = await html2canvas(canvasElement);
    // const buffer = Buffer.from(canvas.toDataURL('image/png').split(',')[1], 'base64');

    // For now, create a placeholder screenshot
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText('Storybook Component Screenshot', 10, 30);

    const dataUrl = canvas.toDataURL('image/png');
    const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');

    return this.screenshotCapture.createFromBuffer(buffer, {
      width: canvas.width,
      height: canvas.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Global functions for easy Storybook integration
 */

let storybookJPGLens: StorybookJPGLens;

function getStorybookJPGLens(): StorybookJPGLens {
  if (!storybookJPGLens) {
    storybookJPGLens = new StorybookJPGLens();
  }
  return storybookJPGLens;
}

/**
 * Analyze component states (main function for stories)
 */
export async function analyzeComponentStates(
  canvas: any,
  context: AnalysisContext & {
    component: string;
    states: string[];
    designSystem?: string;
  }
): Promise<AnalysisResult> {
  const jpglens = getStorybookJPGLens();
  return jpglens.analyzeComponentStates(canvas, context);
}

/**
 * Quick component analysis with minimal setup
 */
export async function analyzeComponent(
  canvas: any,
  componentName: string,
  options: {
    states?: string[];
    designSystem?: string;
    focus?: string;
  } = {}
): Promise<AnalysisResult> {
  const jpglens = getStorybookJPGLens();
  
  return jpglens.analyzeComponentStates(canvas, {
    userContext: {
      persona: 'component-user',
      deviceContext: 'storybook-browser',
      expertise: 'intermediate'
    },
    stage: 'component-review',
    userIntent: options.focus || `evaluate ${componentName} component`,
    component: componentName,
    states: options.states || ['default'],
    designSystem: options.designSystem
  });
}

/**
 * Accessibility-focused component analysis
 */
export async function analyzeComponentA11y(
  canvas: any,
  componentName: string,
  states: string[] = ['default', 'hover', 'focus', 'active', 'disabled']
): Promise<AnalysisResult> {
  const jpglens = getStorybookJPGLens();
  return jpglens.analyzeComponentAccessibility(canvas, componentName, states);
}

/**
 * Design system consistency analysis
 */
export async function analyzeDesignSystemConsistency(
  canvas: any,
  componentName: string,
  designSystemName: string
): Promise<AnalysisResult> {
  const jpglens = getStorybookJPGLens();
  
  return jpglens.analyzeComponentStates(canvas, {
    userContext: {
      persona: 'design-system-maintainer',
      deviceContext: 'design-review',
      expertise: 'expert'
    },
    stage: 'design-system-audit',
    userIntent: `ensure ${componentName} follows ${designSystemName} guidelines`,
    component: componentName,
    states: ['default', 'hover', 'active'],
    designSystem: designSystemName,
    businessContext: {
      industry: 'design-systems',
      conversionGoal: 'consistency-compliance',
      brandPersonality: 'systematic-professional'
    }
  });
}

// Export the class for advanced usage
// StorybookJPGLens already exported above
