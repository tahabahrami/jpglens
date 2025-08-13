# 🔍 jpglens API Reference

Complete API documentation for jpglens - Universal AI-Powered UI Testing.

## Table of Contents

- [Core API](#core-api)
- [Framework Integrations](#framework-integrations)
- [Configuration](#configuration)
- [Types & Interfaces](#types--interfaces)
- [Utilities](#utilities)

---

## Core API

### `createJPGLens(config?: JPGLensConfig)`

Creates a new jpglens analyzer instance.

```typescript
import { createJPGLens } from 'jpglens';

const jpglens = createJPGLens({
  ai: {
    provider: 'openrouter',
    model: 'anthropic/claude-3-5-sonnet',
    apiKey: process.env.JPGLENS_API_KEY
  }
});
```

### `analyze(screenshot, context, options?)`

Performs AI-powered analysis of a screenshot with user context.

```typescript
const result = await jpglens.analyze(screenshot, {
  userContext: {
    persona: 'business-user',
    deviceContext: 'desktop',
    expertise: 'intermediate'
  },
  stage: 'form-completion',
  userIntent: 'submit contact form',
  criticalElements: ['form fields', 'submit button', 'validation messages']
});
```

**Parameters:**
- `screenshot: ScreenshotData` - Image data (Buffer, base64, or file path)
- `context: AnalysisContext` - User and business context for analysis
- `options?: AnalysisOptions` - Optional analysis configuration

**Returns:** `Promise<AnalysisResult>`

### `analyzeMultiple(screenshots, contexts)`

Analyzes multiple screenshots in batch with individual contexts.

```typescript
const results = await jpglens.analyzeMultiple([
  { screenshot: img1, context: ctx1 },
  { screenshot: img2, context: ctx2 }
]);
```

### `createScreenshot(source, metadata?)`

Creates a screenshot object from various sources.

```typescript
// From file path
const screenshot1 = jpglens.createScreenshot('./screenshot.png');

// From buffer with metadata
const screenshot2 = jpglens.createScreenshot(buffer, {
  component: 'login-form',
  timestamp: new Date(),
  device: 'mobile'
});

// From base64
const screenshot3 = jpglens.createScreenshot(base64Data, { format: 'base64' });
```

---

## Framework Integrations

### Playwright Integration

```typescript
import { analyzeUserJourney, createJPGLens } from 'jpglens/playwright';
```

#### `analyzeUserJourney(page, context)`

```typescript
await analyzeUserJourney(page, {
  stage: 'checkout-process',
  userIntent: 'complete purchase',
  userContext: {
    persona: 'mobile-shopper',
    deviceContext: 'mobile',
    urgency: 'high'
  }
});
```

#### `analyzeCompleteJourney(journey)`

```typescript
const journey = {
  name: 'user-onboarding',
  persona: 'first-time-user',
  device: 'desktop',
  stages: [
    {
      name: 'landing',
      page: '/',
      userGoal: 'understand value proposition',
      aiAnalysis: 'first-impression analysis'
    }
  ]
};

const results = await analyzeCompleteJourney(journey);
```

#### `quickAnalyze(page, component?)`

```typescript
// Quick analysis with minimal configuration
const result = await quickAnalyze(page, 'navigation-menu');
```

### Cypress Integration

```typescript
import 'jpglens/cypress';
```

#### Cypress Commands

```typescript
// In your test
cy.analyzeUserExperience({
  journey: 'product-search',
  userType: 'returning-customer',
  expectation: 'find specific product quickly'
});

cy.analyzePageState({
  component: 'search-results',
  stage: 'product-discovery',
  userIntent: 'evaluate search results'
});
```

### Selenium Integration

```typescript
import { analyzeCurrentState, analyzeCrossBrowser } from 'jpglens/selenium';
```

#### `analyzeCurrentState(driver, context)`

```typescript
const result = await analyzeCurrentState(driver, {
  stage: 'form-interaction',
  userIntent: 'fill registration form',
  userContext: { persona: 'business-user', device: 'desktop' }
});
```

#### `analyzeCrossBrowser(driver, context, browsers?)`

```typescript
const results = await analyzeCrossBrowser(driver, context, [
  'chrome', 'firefox', 'safari', 'edge'
]);
```

### Storybook Integration

```typescript
import { analyzeComponentStates, analyzeComponent } from 'jpglens/storybook';
```

#### `analyzeComponentStates(canvas, context)`

```typescript
await analyzeComponentStates(canvas, {
  component: 'Button',
  states: ['default', 'hover', 'focus', 'disabled'],
  context: 'critical-action-button',
  designSystem: 'material-ui'
});
```

---

## Configuration

### JPGLensConfig

```typescript
interface JPGLensConfig {
  ai: {
    provider: 'openrouter' | 'openai' | 'anthropic';
    model: string;
    apiKey: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
  };
  
  analysis: {
    types: AnalysisType[];
    depth: 'quick' | 'standard' | 'comprehensive';
    includeScreenshots: boolean;
    concurrency: number;
  };
  
  reporting: {
    enabled: boolean;
    outputDir: string;
    format: 'markdown' | 'json' | 'html';
    template: string;
    customPrompts: Record<string, string>;
  };
  
  userPersonas: Record<string, UserPersona>;
  plugins?: string[];
}
```

### Configuration File

```javascript
// jpglens.config.js
export default {
  ai: {
    provider: 'openrouter',
    model: 'anthropic/claude-3-5-sonnet',
    apiKey: process.env.JPGLENS_API_KEY,
    maxTokens: 4000,
    temperature: 0.1
  },
  
  analysis: {
    types: ['usability', 'accessibility', 'visual-design'],
    depth: 'comprehensive',
    includeScreenshots: true,
    concurrency: 3
  },
  
  reporting: {
    enabled: true,
    outputDir: './jpglens-reports',
    format: 'markdown',
    template: 'detailed',
    customPrompts: {
      'mobile-focus': 'Analyze specifically for mobile usability',
      'accessibility-deep': 'Deep dive into WCAG 2.1 compliance'
    }
  },
  
  userPersonas: {
    'power-user': {
      expertise: 'expert',
      device: 'desktop',
      goals: ['efficiency', 'advanced-features']
    },
    'casual-user': {
      expertise: 'novice',
      device: 'mobile',
      goals: ['simplicity', 'guidance']
    }
  }
};
```

---

## Types & Interfaces

### AnalysisContext

```typescript
interface AnalysisContext {
  userContext: UserContext;
  businessContext?: BusinessContext;
  technicalContext?: TechnicalContext;
  stage: string;
  userIntent: string;
  criticalElements?: string[];
}
```

### UserContext

```typescript
interface UserContext {
  persona: string | UserPersona;
  deviceContext: string;
  expertise: 'novice' | 'intermediate' | 'expert';
  urgency?: 'low' | 'medium' | 'high';
  goals?: string[];
}
```

### AnalysisResult

```typescript
interface AnalysisResult {
  overallScore: number;
  analysisTime: number;
  timestamp: Date;
  
  strengths: string[];
  criticalIssues: Issue[];
  majorIssues: Issue[];
  minorIssues: Issue[];
  recommendations: Recommendation[];
  
  contextualInsights: string[];
  deviceSpecificNotes: string[];
  
  rawAnalysis: string;
  config: AnalysisConfig;
  reportPath?: string;
}
```

### Issue

```typescript
interface Issue {
  category: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  impact: string;
  solution: string;
  element?: string;
  location?: string;
}
```

### UserJourney

```typescript
interface UserJourney {
  name: string;
  description: string;
  persona: string | UserPersona;
  device: string;
  stages: UserJourneyStage[];
}

interface UserJourneyStage {
  name: string;
  page: string;
  userGoal: string;
  actions?: UserAction[];
  aiAnalysis: string;
  context?: Partial<AnalysisContext>;
}
```

### AnalysisType

```typescript
type AnalysisType = 
  | 'usability'
  | 'accessibility' 
  | 'visual-design'
  | 'performance'
  | 'mobile-optimization'
  | 'conversion-optimization'
  | 'brand-consistency'
  | 'error-handling';
```

---

## Utilities

### Screenshot Utilities

#### `validateScreenshot(screenshot)`

```typescript
const validation = jpglens.validateScreenshot(screenshot);
if (!validation.valid) {
  console.error('Screenshot validation failed:', validation.errors);
}
```

#### `optimizeScreenshot(screenshot, options?)`

```typescript
const optimized = await jpglens.optimizeScreenshot(screenshot, {
  maxWidth: 1920,
  quality: 0.8,
  format: 'png'
});
```

### Reporting Utilities

#### `generateReport(result, options?)`

```typescript
const reportPath = await jpglens.generateReport(result, {
  format: 'html',
  template: 'executive',
  outputPath: './reports/analysis.html'
});
```

#### `addReportTemplate(name, template)`

```typescript
jpglens.addReportTemplate('custom-template', {
  name: 'Custom Analysis Report',
  format: 'markdown',
  sections: ['overview', 'issues', 'recommendations'],
  prompts: {
    'overview': 'Provide executive summary',
    'issues': 'List critical issues only'
  }
});
```

### Configuration Utilities

#### `loadConfig(path?)`

```typescript
const config = await loadConfig('./jpglens.config.js');
```

#### `validateConfig(config)`

```typescript
const validation = validateConfig(config);
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

### AI Provider Utilities

#### `listAvailableModels(provider)`

```typescript
const models = await jpglens.listAvailableModels('openrouter');
console.log('Available models:', models);
```

#### `testConnection(config)`

```typescript
const connectionTest = await jpglens.testConnection({
  provider: 'openrouter',
  apiKey: 'your-key'
});

if (connectionTest.success) {
  console.log('Connection successful');
} else {
  console.error('Connection failed:', connectionTest.error);
}
```

---

## Error Handling

### Common Errors

```typescript
try {
  const result = await jpglens.analyze(screenshot, context);
} catch (error) {
  if (error instanceof JPGLensError) {
    switch (error.code) {
      case 'INVALID_SCREENSHOT':
        console.error('Screenshot validation failed');
        break;
      case 'API_KEY_INVALID':
        console.error('AI provider API key is invalid');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error('API rate limit exceeded');
        break;
      case 'ANALYSIS_TIMEOUT':
        console.error('Analysis timed out');
        break;
    }
  }
}
```

### Error Types

```typescript
class JPGLensError extends Error {
  code: string;
  details?: any;
}

// Specific error types
class ScreenshotError extends JPGLensError {}
class ConfigurationError extends JPGLensError {}
class APIError extends JPGLensError {}
class AnalysisError extends JPGLensError {}
```

---

## Performance Optimization

### Batch Processing

```typescript
// Process multiple screenshots efficiently
const results = await jpglens.analyzeMultiple(screenshots, {
  concurrency: 5, // Process 5 at a time
  progressCallback: (progress) => {
    console.log(`Progress: ${progress.completed}/${progress.total}`);
  }
});
```

### Caching

```typescript
// Enable result caching
const jpglens = createJPGLens({
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    storage: 'memory' // or 'file'
  }
});
```

### Memory Management

```typescript
// Clean up resources
jpglens.cleanup(); // Clears caches and temporary files
```

---

## Examples

See the `/examples` directory for complete usage examples:

- `playwright-example.spec.js` - Playwright integration
- `cypress-example.cy.js` - Cypress integration  
- `storybook-example.stories.js` - Storybook integration
- `batch-analysis.js` - Batch processing example
- `custom-prompts.js` - Custom prompt usage

---

For more detailed examples and tutorials, visit [jpglens.dev/docs](https://jpglens.dev/docs).
