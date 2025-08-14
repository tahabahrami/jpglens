/**
 * 🔍 jpglens - Testing Library Integration
 * Universal AI-Powered UI Testing
 *
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AnalysisContext, AnalysisResult, JPGLensConfig } from '../core/types.js';
import { AIAnalyzer } from '../core/ai-analyzer.js';
import { ScreenshotCapture } from '../core/screenshot-capture.js';
import { loadConfig, DEFAULT_CONFIG } from '../core/config.js';

/**
 * Testing Library integration for jpglens
 * Analyze React/Vue/Angular components rendered with Testing Library
 */
export class TestingLibraryJPGLens {
  private aiAnalyzer: AIAnalyzer;
  private screenshotCapture: ScreenshotCapture;
  private config: JPGLensConfig;

  constructor(config?: JPGLensConfig) {
    this.config = config || DEFAULT_CONFIG;
    this.aiAnalyzer = new AIAnalyzer(this.config);
    this.screenshotCapture = new ScreenshotCapture();
  }

  /**
   * Analyze rendered component with Testing Library
   */
  async analyzeComponent(container: HTMLElement, context: AnalysisContext): Promise<AnalysisResult> {
    try {
      // Create screenshot from DOM element
      const screenshot = await this.captureElementScreenshot(container);

      // Enhance context for Testing Library
      const enhancedContext: AnalysisContext = {
        ...context,
        technicalContext: {
          ...context.technicalContext,
          testFramework: 'Testing Library',
          renderMethod: 'jsdom',
        },
      };

      // Perform AI analysis
      const result = await this.aiAnalyzer.analyze(screenshot, enhancedContext);

      return result;
    } catch (error) {
      throw new Error(
        `Testing Library jpglens analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze user interactions and their outcomes
   */
  async analyzeUserInteraction(
    container: HTMLElement,
    interaction: {
      type: 'click' | 'type' | 'hover' | 'focus';
      element: string;
      value?: string;
    },
    context: Partial<AnalysisContext>
  ): Promise<AnalysisResult> {
    const fullContext: AnalysisContext = {
      userContext: context.userContext || {
        deviceContext: 'testing-library-jsdom',
        expertise: 'intermediate',
      },
      stage: context.stage || `after-${interaction.type}`,
      userIntent: context.userIntent || `validate ${interaction.type} interaction`,
      criticalElements: context.criticalElements || [interaction.element],
      businessContext: context.businessContext,
      technicalContext: context.technicalContext,
      interactionInfo: {
        type: interaction.type,
        element: interaction.element,
        value: interaction.value,
      },
    };

    return this.analyzeComponent(container, fullContext);
  }

  /**
   * Analyze accessibility with Testing Library queries
   */
  async analyzeAccessibility(
    container: HTMLElement,
    queries: {
      byRole?: string[];
      byLabelText?: string[];
      byPlaceholderText?: string[];
      byDisplayValue?: string[];
    }
  ): Promise<AnalysisResult> {
    const context: AnalysisContext = {
      userContext: {
        persona: 'accessibility-user',
        deviceContext: 'screen-reader-testing',
        expertise: 'intermediate',
      },
      stage: 'accessibility-evaluation',
      userIntent: 'ensure component is accessible via semantic queries',
      criticalElements: Object.values(queries).flat(),
      businessContext: {
        industry: 'accessibility-compliance',
        conversionGoal: 'inclusive-design',
        targetAudience: 'users-with-disabilities',
      },
      technicalContext: {
        testFramework: 'Testing Library',
        accessibilityTarget: 'WCAG-AA',
        queryMethods: Object.keys(queries),
      },
    };

    return this.analyzeComponent(container, context);
  }

  /**
   * Capture screenshot from DOM element (simulated for Testing Library)
   */
  private async captureElementScreenshot(element: HTMLElement): Promise<any> {
    // In Testing Library environment (jsdom), we can't capture real screenshots
    // This would typically use puppeteer or playwright to render the component
    // For now, we'll create a text-based representation

    const rect = element.getBoundingClientRect();
    const htmlContent = element.outerHTML;

    // Create a simple text representation
    const textRepresentation = this.createTextRepresentation(element);

    // Convert to buffer (in real implementation, this would be an actual screenshot)
    const buffer = Buffer.from(textRepresentation, 'utf-8');

    return this.screenshotCapture.createFromBuffer(buffer, {
      width: rect.width || 800,
      height: rect.height || 600,
      devicePixelRatio: 1,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create text representation of DOM element for AI analysis
   */
  private createTextRepresentation(element: HTMLElement): string {
    const getElementInfo = (el: Element, depth = 0): string => {
      const indent = '  '.repeat(depth);
      const tagName = el.tagName.toLowerCase();
      const attrs = Array.from(el.attributes)
        .map(attr => `${attr.name}="${attr.value}"`)
        .join(' ');

      const text = el.textContent?.trim().slice(0, 50) || '';
      const children = Array.from(el.children);

      let result = `${indent}<${tagName}${attrs ? ' ' + attrs : ''}>${text ? ' "' + text + '"' : ''}\n`;

      if (children.length > 0 && depth < 3) {
        children.forEach(child => {
          result += getElementInfo(child, depth + 1);
        });
      }

      return result;
    };

    return `DOM Structure for AI Analysis:
${getElementInfo(element)}

Computed Styles Summary:
- Display: ${getComputedStyle(element).display}
- Position: ${getComputedStyle(element).position}
- Color: ${getComputedStyle(element).color}
- Background: ${getComputedStyle(element).backgroundColor}
- Font: ${getComputedStyle(element).fontFamily} ${getComputedStyle(element).fontSize}

Accessibility Information:
- Role: ${element.getAttribute('role') || 'implicit'}
- Aria-label: ${element.getAttribute('aria-label') || 'none'}
- Aria-describedby: ${element.getAttribute('aria-describedby') || 'none'}
- Tabindex: ${element.getAttribute('tabindex') || 'default'}
`;
  }
}

/**
 * Global functions for Testing Library integration
 */

let testingLibraryJPGLens: TestingLibraryJPGLens;

function getTestingLibraryJPGLens(): TestingLibraryJPGLens {
  if (!testingLibraryJPGLens) {
    testingLibraryJPGLens = new TestingLibraryJPGLens();
  }
  return testingLibraryJPGLens;
}

/**
 * Analyze component rendered with Testing Library
 */
export async function analyzeComponent(container: HTMLElement, context: AnalysisContext): Promise<AnalysisResult> {
  const jpglens = getTestingLibraryJPGLens();
  return jpglens.analyzeComponent(container, context);
}

/**
 * Quick component analysis
 */
export async function analyzeRenderedComponent(
  container: HTMLElement,
  componentName: string,
  userIntent: string = 'evaluate component usability'
): Promise<AnalysisResult> {
  const jpglens = getTestingLibraryJPGLens();

  return jpglens.analyzeComponent(container, {
    userContext: {
      persona: 'component-tester',
      deviceContext: 'testing-environment',
      expertise: 'intermediate',
    },
    stage: 'component-test',
    userIntent,
    businessContext: {
      industry: 'software-development',
      conversionGoal: 'component-quality',
      targetAudience: 'end-users',
    },
  });
}

/**
 * Analyze user interaction outcome
 */
export async function analyzeUserInteraction(
  container: HTMLElement,
  interaction: {
    type: 'click' | 'type' | 'hover' | 'focus';
    element: string;
    value?: string;
  },
  context?: Partial<AnalysisContext>
): Promise<AnalysisResult> {
  const jpglens = getTestingLibraryJPGLens();
  return jpglens.analyzeUserInteraction(container, interaction, context || {});
}

/**
 * Accessibility-focused analysis
 */
export async function analyzeAccessibility(
  container: HTMLElement,
  queries: {
    byRole?: string[];
    byLabelText?: string[];
    byPlaceholderText?: string[];
    byDisplayValue?: string[];
  }
): Promise<AnalysisResult> {
  const jpglens = getTestingLibraryJPGLens();
  return jpglens.analyzeAccessibility(container, queries);
}

/**
 * Form-specific analysis
 */
export async function analyzeForm(container: HTMLElement, formFields: string[]): Promise<AnalysisResult> {
  const jpglens = getTestingLibraryJPGLens();

  return jpglens.analyzeComponent(container, {
    userContext: {
      persona: 'form-user',
      deviceContext: 'form-completion',
      expertise: 'novice',
    },
    stage: 'form-evaluation',
    userIntent: 'complete form efficiently and without errors',
    criticalElements: formFields,
    businessContext: {
      industry: 'form-design',
      conversionGoal: 'form-completion',
      targetAudience: 'general-users',
    },
  });
}

// Export the class for advanced usage
// TestingLibraryJPGLens already exported above
