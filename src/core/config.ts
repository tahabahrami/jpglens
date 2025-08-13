/**
 * 🔍 jpglens - Configuration Management
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { JPGLensConfig, UserPersona } from './types.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

/**
 * Default configuration for jpglens
 */
export const DEFAULT_CONFIG: JPGLensConfig = {
  ai: {
    provider: 'openrouter',
    apiKey: process.env.JPGLENS_API_KEY || '',
    model: process.env.JPGLENS_MODEL || 'openai/gpt-4-vision-preview',
    fallbackModel: 'anthropic/claude-3-5-sonnet',
    maxTokens: 4000,
    temperature: 0.1,
    baseUrl: 'https://openrouter.ai/api/v1'
  },

  analysis: {
    types: ['usability', 'accessibility', 'visual-design'],
    depth: 'standard',
    includeScreenshots: true,
    generateReports: true,
    outputDir: './jpglens-reports'
  },

  // Reporting configuration
  reporting: {
    enabled: true,
    outputDir: './jpglens-reports',
    template: 'detailed',
    format: 'markdown',
    includeScreenshots: true,
    includeRawAnalysis: false,
    timestampFormat: 'ISO',
    fileNaming: '{timestamp}-{component}-{page}',
    customPrompts: {},
    apiCompatibility: 'auto'
  },

  // Pre-built user personas for common use cases
  userPersonas: {
    'business-user': {
      name: 'Business Professional',
      expertise: 'intermediate',
      device: 'desktop-primary',
      urgency: 'medium',
      goals: ['efficiency', 'accuracy', 'professional-appearance'],
      painPoints: ['complex interfaces', 'slow loading', 'unclear navigation'],
      context: 'Professional work environment, needs reliable tools'
    },

    'mobile-consumer': {
      name: 'Mobile Consumer',
      expertise: 'novice',
      device: 'mobile-primary',
      urgency: 'high',
      goals: ['speed', 'simplicity', 'trust'],
      painPoints: ['small touch targets', 'slow loading', 'complex forms'],
      context: 'On-the-go usage, limited attention, thumb navigation'
    },

    'power-user': {
      name: 'Power User',
      expertise: 'expert',
      device: 'mixed',
      urgency: 'low',
      goals: ['customization', 'advanced-features', 'keyboard-shortcuts'],
      painPoints: ['lack of shortcuts', 'limited customization', 'dumbed-down interfaces'],
      context: 'Daily heavy usage, values efficiency over simplicity'
    },

    'accessibility-user': {
      name: 'Accessibility User',
      expertise: 'intermediate',
      device: 'desktop-primary',
      urgency: 'medium',
      goals: ['screen-reader-compatibility', 'keyboard-navigation', 'high-contrast'],
      painPoints: ['poor alt text', 'keyboard traps', 'low contrast'],
      context: 'Uses assistive technologies, relies on semantic HTML'
    },

    'first-time-visitor': {
      name: 'First-Time Visitor',
      expertise: 'novice',
      device: 'mixed',
      urgency: 'high',
      goals: ['understand-value', 'quick-trial', 'low-commitment'],
      painPoints: ['unclear value prop', 'complex signup', 'information overload'],
      context: 'Evaluating product, high bounce risk, needs immediate value'
    }
  },

  // Pre-built journey templates for common scenarios
  journeyTemplates: {
    'e-commerce': ['discovery', 'product-selection', 'add-to-cart', 'checkout', 'confirmation'],
    'saas-onboarding': ['landing', 'signup', 'email-verification', 'setup', 'first-use', 'activation'],
    'content-consumption': ['discovery', 'article-reading', 'engagement', 'sharing', 'related-content'],
    'form-completion': ['form-discovery', 'field-entry', 'validation', 'review', 'submission', 'confirmation'],
    'dashboard-analysis': ['login', 'overview', 'drill-down', 'filter-data', 'export-results'],
    'mobile-app': ['app-launch', 'onboarding', 'core-feature', 'settings', 'sharing']
  }
};

/**
 * Load configuration from file or environment
 */
export async function loadConfig(configPath?: string): Promise<JPGLensConfig> {
  let userConfig: Partial<JPGLensConfig> = {};

  // Try to load from file
  if (configPath && existsSync(configPath)) {
    try {
      const configContent = readFileSync(configPath, 'utf-8');
      
      if (configPath.endsWith('.json')) {
        userConfig = JSON.parse(configContent);
      } else if (configPath.endsWith('.js') || configPath.endsWith('.mjs')) {
        // Dynamic import for ES modules
        const resolvedPath = resolve(configPath);
        const fileUrl = pathToFileURL(resolvedPath).href;
        const configModule = await import(fileUrl);
        userConfig = configModule.default || configModule;
      }
    } catch (error) {
      console.warn(`Failed to load config from ${configPath}:`, error);
    }
  } else {
    // Try common config file names
    const commonPaths = [
      './jpglens.config.js',
      './jpglens.config.mjs', 
      './jpglens.config.json',
      './.jpglensrc.json'
    ];

    for (const path of commonPaths) {
      if (existsSync(path)) {
        try {
          if (path.endsWith('.json')) {
            const content = readFileSync(path, 'utf-8');
            userConfig = JSON.parse(content);
          } else {
            const resolvedPath = resolve(path);
            const fileUrl = pathToFileURL(resolvedPath).href;
            const configModule = await import(fileUrl);
            userConfig = configModule.default || configModule;
          }
          break;
        } catch (error) {
          console.warn(`Failed to load config from ${path}:`, error);
        }
      }
    }
  }

  // Merge with defaults
  return mergeConfig(DEFAULT_CONFIG, userConfig);
}

/**
 * Deep merge configuration objects
 */
function mergeConfig(defaultConfig: JPGLensConfig, userConfig: Partial<JPGLensConfig>): JPGLensConfig {
  const merged = { ...defaultConfig };

  if (userConfig.ai) {
    merged.ai = { ...defaultConfig.ai, ...userConfig.ai };
  }

  if (userConfig.analysis) {
    merged.analysis = { ...defaultConfig.analysis, ...userConfig.analysis };
  }

  if (userConfig.userPersonas) {
    merged.userPersonas = { 
      ...defaultConfig.userPersonas, 
      ...userConfig.userPersonas 
    };
  }

  if (userConfig.journeyTemplates) {
    merged.journeyTemplates = { 
      ...defaultConfig.journeyTemplates, 
      ...userConfig.journeyTemplates 
    };
  }

  if (userConfig.plugins) {
    merged.plugins = userConfig.plugins;
  }

  return merged;
}

/**
 * Validate configuration
 */
export function validateConfig(config: JPGLensConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate AI configuration
  if (!config.ai.apiKey) {
    errors.push('AI API key is required. Set JPGLENS_API_KEY environment variable or provide in config.');
  }

  if (!config.ai.model) {
    errors.push('AI model is required.');
  }

  // Validate analysis configuration
  if (!config.analysis.types || config.analysis.types.length === 0) {
    errors.push('At least one analysis type must be specified.');
  }

  const validAnalysisTypes = [
    'usability', 'accessibility', 'visual-design', 'performance', 
    'mobile-optimization', 'conversion-optimization', 'brand-consistency', 'error-handling'
  ];

  if (config.analysis?.types) {
    for (const type of config.analysis.types) {
      if (!validAnalysisTypes.includes(type)) {
        errors.push(`Invalid analysis type: ${type}. Valid types: ${validAnalysisTypes.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get user persona by name or return the persona object
 */
export function getUserPersona(config: JPGLensConfig, personaOrName: string | UserPersona): UserPersona {
  if (typeof personaOrName === 'object') {
    return personaOrName;
  }

  const persona = config.userPersonas?.[personaOrName];
  if (!persona) {
    throw new Error(`User persona "${personaOrName}" not found. Available personas: ${Object.keys(config.userPersonas || {}).join(', ')}`);
  }

  return persona;
}

/**
 * Get journey template by name
 */
export function getJourneyTemplate(config: JPGLensConfig, templateName: string): string[] {
  const template = config.journeyTemplates?.[templateName];
  if (!template) {
    throw new Error(`Journey template "${templateName}" not found. Available templates: ${Object.keys(config.journeyTemplates || {}).join(', ')}`);
  }

  return template;
}
