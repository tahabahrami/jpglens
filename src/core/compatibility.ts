/**
 * 🔍 jpglens - Framework Compatibility Layer
 * Universal AI-Powered UI Testing
 *
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

/**
 * Version compatibility matrix for supported frameworks
 * This ensures jpglens works with both current and legacy versions
 */
export const FRAMEWORK_COMPATIBILITY = {
  playwright: {
    minVersion: '1.20.0',
    maxVersion: '1.50.0',
    currentVersion: '1.40.1',
    features: {
      screenshot: {
        '1.20.0': { animations: false, mask: false },
        '1.30.0': { animations: true, mask: true },
        '1.40.0': { animations: true, mask: true, clip: true },
      },
      viewport: {
        '1.20.0': 'viewportSize',
        '1.35.0': 'viewportSize', // No changes
      },
    },
  },
  cypress: {
    minVersion: '10.0.0',
    maxVersion: '13.7.0',
    currentVersion: '13.6.0',
    features: {
      commands: {
        '10.0.0': { customCommands: true, screenshot: true },
        '12.0.0': { customCommands: true, screenshot: true, intercept: true },
      },
    },
  },
  selenium: {
    minVersion: '4.0.0',
    maxVersion: '4.16.0',
    currentVersion: '4.15.0',
    features: {
      screenshot: {
        '4.0.0': 'takeScreenshot',
        '4.10.0': 'takeScreenshot', // No API changes
      },
    },
  },
  storybook: {
    minVersion: '6.5.0',
    maxVersion: '7.6.0',
    currentVersion: '7.0.0',
    features: {
      testing: {
        '6.5.0': '@storybook/testing-library',
        '7.0.0': '@storybook/test', // New testing package
      },
      interactions: {
        '6.5.0': { play: true, userEvent: 'testing-library' },
        '7.0.0': { play: true, userEvent: '@storybook/test' },
      },
    },
  },
};

/**
 * AI Provider API compatibility
 */
export const AI_PROVIDER_COMPATIBILITY = {
  openrouter: {
    apiVersion: 'v1',
    endpoint: 'https://openrouter.ai/api/v1',
    models: {
      vision: [
        'openai/gpt-4-vision-preview',
        'openai/gpt-4o',
        'anthropic/claude-3-5-sonnet',
        'google/gemini-pro-vision',
      ],
    },
    imageFormat: 'base64',
    maxImageSize: 20 * 1024 * 1024, // 20MB
    requestFormat: {
      messages: true,
      image_url: true,
      detail: true,
    },
  },
  openai: {
    apiVersion: 'v1',
    endpoint: 'https://api.openai.com/v1',
    models: {
      vision: ['gpt-4-vision-preview', 'gpt-4o', 'gpt-4o-mini'],
    },
    imageFormat: 'base64',
    maxImageSize: 20 * 1024 * 1024,
    requestFormat: {
      messages: true,
      image_url: true,
      detail: true,
    },
  },
  anthropic: {
    apiVersion: '2023-06-01',
    endpoint: 'https://api.anthropic.com/v1',
    models: {
      vision: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    },
    imageFormat: 'base64',
    maxImageSize: 5 * 1024 * 1024, // 5MB for Anthropic
    requestFormat: {
      messages: true,
      image: true,
      source: true,
    },
  },
};

/**
 * Check if a framework version is supported
 */
export function isFrameworkSupported(framework: string, version: string): boolean {
  const compatibility = FRAMEWORK_COMPATIBILITY[framework as keyof typeof FRAMEWORK_COMPATIBILITY];
  if (!compatibility) return false;

  return (
    compareVersions(version, compatibility.minVersion) >= 0 && compareVersions(version, compatibility.maxVersion) <= 0
  );
}

/**
 * Get feature availability for a framework version
 */
export function getFrameworkFeatures(framework: string, version: string): any {
  const compatibility = FRAMEWORK_COMPATIBILITY[framework as keyof typeof FRAMEWORK_COMPATIBILITY];
  if (!compatibility) return {};

  const features = compatibility.features;
  const availableFeatures: any = {};

  for (const [featureName, featureVersions] of Object.entries(features)) {
    const sortedVersions = Object.keys(featureVersions).sort(compareVersions);

    for (const featureVersion of sortedVersions) {
      if (compareVersions(version, featureVersion) >= 0) {
        availableFeatures[featureName] = featureVersions[featureVersion];
      }
    }
  }

  return availableFeatures;
}

/**
 * Simple version comparison (semver-like)
 */
function compareVersions(a: string, b: string): number {
  const parseVersion = (v: string) => v.split('.').map(Number);
  const versionA = parseVersion(a);
  const versionB = parseVersion(b);

  for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
    const numA = versionA[i] || 0;
    const numB = versionB[i] || 0;

    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }

  return 0;
}

/**
 * Auto-detect framework versions at runtime
 */
export async function detectFrameworkVersion(framework: string): Promise<string | null> {
  // For now, return null to avoid build-time dependency resolution issues
  // This can be enhanced in the future with runtime detection
  return null;
}

/**
 * Compatibility adapter for different framework versions
 */
export class FrameworkAdapter {
  private framework: string;
  private version: string;
  private features: any;

  constructor(framework: string, version?: string) {
    this.framework = framework;
    this.version = version || 'latest';
    this.features = getFrameworkFeatures(framework, this.version);
  }

  /**
   * Get compatible screenshot options for the framework version
   */
  getScreenshotOptions(userOptions: any = {}): any {
    const baseOptions: any = { type: 'png', fullPage: true };

    switch (this.framework) {
      case 'playwright':
        const playwrightOptions: any = { ...baseOptions };

        // Add animations option if supported
        if (this.features.screenshot?.animations) {
          playwrightOptions.animations = userOptions.animations || 'disabled';
        }

        // Add mask option if supported
        if (this.features.screenshot?.mask) {
          playwrightOptions.mask = userOptions.mask || [];
        }

        return playwrightOptions;

      case 'cypress':
        return {
          capture: 'fullPage',
          disableTimersAndAnimations: true,
          ...userOptions,
        };

      case 'selenium':
        // Selenium has consistent API
        return baseOptions;

      default:
        return baseOptions;
    }
  }

  /**
   * Get compatible viewport method for the framework version
   */
  getViewportMethod(): string {
    switch (this.framework) {
      case 'playwright':
        return this.features.viewport || 'viewportSize';
      default:
        return 'getSize';
    }
  }

  /**
   * Check if a specific feature is available
   */
  hasFeature(featureName: string): boolean {
    return !!this.features[featureName];
  }
}

/**
 * Runtime compatibility checker
 */
export class CompatibilityChecker {
  private warnings: string[] = [];
  private errors: string[] = [];

  /**
   * Check all framework compatibility
   */
  async checkAll(): Promise<{ warnings: string[]; errors: string[]; compatible: boolean }> {
    const frameworks = ['playwright', 'cypress', 'selenium', 'storybook'];

    for (const framework of frameworks) {
      await this.checkFramework(framework);
    }

    return {
      warnings: this.warnings,
      errors: this.errors,
      compatible: this.errors.length === 0,
    };
  }

  /**
   * Check specific framework compatibility
   */
  async checkFramework(framework: string): Promise<void> {
    const version = await detectFrameworkVersion(framework);

    if (!version) {
      this.warnings.push(`${framework} not detected - will use fallback compatibility mode`);
      return;
    }

    if (!isFrameworkSupported(framework, version)) {
      const compatibility = FRAMEWORK_COMPATIBILITY[framework as keyof typeof FRAMEWORK_COMPATIBILITY];
      this.errors.push(
        `${framework} v${version} is not supported. ` +
          `Supported range: ${compatibility.minVersion} - ${compatibility.maxVersion}`
      );
    } else {
      console.log(`✅ ${framework} v${version} is compatible with jpglens`);
    }
  }

  /**
   * Get recommendations for compatibility issues
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.errors.length > 0) {
      recommendations.push('Update incompatible frameworks to supported versions');
      recommendations.push('Check jpglens documentation for version compatibility matrix');
    }

    if (this.warnings.length > 0) {
      recommendations.push('Install optional frameworks for full jpglens functionality');
    }

    return recommendations;
  }
}
