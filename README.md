# 🔍 jpglens

<div align="center">

**Universal AI-Powered UI Testing**  
*See your interfaces through the lens of intelligence*

[![npm version](https://badge.fury.io/js/jpglens.svg)](https://www.npmjs.com/package/jpglens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/🎭-Playwright-45ba4b)](https://playwright.dev/)
[![Cypress](https://img.shields.io/badge/🌲-Cypress-17202c)](https://cypress.io/)
[![Storybook](https://img.shields.io/badge/📖-Storybook-ff4785)](https://storybook.js.org/)

*From the creators of [jpgos design system](https://github.com/tahabahrami/jpgos)*

</div>

---

## 🌟 **What is jpglens?**

**jpglens** is a revolutionary AI-powered testing tool that analyzes your user interfaces through the **context of real user journeys**. Unlike traditional testing tools that check functionality, jpglens understands **user experience, accessibility, and visual design** using advanced AI models.

### 🎯 **The Problem We Solved**

Traditional UI testing tools can tell you if a button *works*, but they can't tell you if it's **intuitive**, **accessible**, or **delightful** to use. jpglens bridges this gap by:

- 🧠 **Understanding Context** - Analyzes components within complete user workflows
- 👁️ **Seeing Like Users** - Evaluates visual design, accessibility, and usability  
- 🚀 **Universal Integration** - Works with your existing testing tools
- 📊 **Actionable Insights** - Provides specific recommendations for improvement

---

## 🏆 **Why We Built This**

> *"After building jpgos design system for millions of users, we realized that traditional testing wasn't enough. We needed a way to ensure our components weren't just functional, but truly **user-centered**. jpglens was born from this need - to test not just if something works, but if it works **beautifully** for real humans."*
> 
> **— Taha Bahrami (Kaito)**, *Creator of jpgos & jpglens*

### 📈 **Our Journey**

1. **The Challenge** - jpgos serves millions of users daily, but traditional testing couldn't catch UX issues
2. **The Experiment** - We integrated AI analysis into our testing workflow  
3. **The Breakthrough** - AI could identify usability issues that humans missed
4. **The Solution** - jpglens was born, making this power available to everyone

*Special thanks to **Ashkan** for his invaluable support and guidance throughout this journey.*

---

## ⚡ **Quick Start**

### Installation

```bash
# Install jpglens
npm install --save-dev jpglens

# Install your preferred testing framework
npm install --save-dev @playwright/test
# or
npm install --save-dev cypress  
# or  
npm install --save-dev selenium-webdriver
```

### 🔑 **Setup AI Provider**

jpglens works with any OpenAI-compatible API:

```bash
# Set your API key (OpenRouter, OpenAI, etc.)
export JPGLENS_API_KEY="your-api-key-here"
export JPGLENS_MODEL="openai/gpt-4-vision-preview"

# Optional: Set custom base URL for Azure OpenAI, local servers, or proxies otherwise it works with https://api.openai.com
export JPGLENS_BASE_URL="https://my-resource.openai.azure.com/v1"
```

### 🎭 **Playwright Integration**

```javascript
// tests/ai-visual.spec.js
import { test } from '@playwright/test';
import { analyzeUserJourney } from 'jpglens/playwright';

test.describe('E-commerce Purchase Flow', () => {
  test('user can complete purchase', async ({ page }) => {
    await page.goto('/product/123');
    
    // Standard Playwright actions
    await page.click('[data-testid="add-to-cart"]');
    await page.fill('[data-testid="quantity"]', '2');
    
    // 🔍 AI Analysis - Understands user context
    await analyzeUserJourney(page, {
      stage: 'product-selection',
      userIntent: 'add item to cart',
      context: 'e-commerce purchase decision',
      criticalElements: ['add-to-cart button', 'price display', 'stock status']
    });
    
    await page.click('[data-testid="checkout"]');
    
    // 🔍 AI Analysis - Checkout flow
    await analyzeUserJourney(page, {
      stage: 'checkout-initiation', 
      userIntent: 'complete purchase',
      context: 'high-intent purchase flow',
      criticalElements: ['form fields', 'payment options', 'security indicators']
    });
  });
});
```

### 🌲 **Cypress Integration**

```javascript
// cypress/e2e/user-journey.cy.js
import 'jpglens/cypress';

describe('Dashboard User Flow', () => {
  it('user analyzes business metrics', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy="date-filter"]').select('last-30-days');
    
    // 🔍 AI Analysis with Cypress
    cy.analyzeUserExperience({
      journey: 'data-analysis-workflow',
      userType: 'business-analyst', 
      expectation: 'quickly understand key metrics',
      context: 'daily business review meeting preparation'
    });
  });
});
```

### 📖 **Storybook Integration**

```javascript
// Button.stories.js
import { analyzeComponentStates } from 'jpglens/storybook';

export const InteractiveStates = {
  args: { variant: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test different states
    await userEvent.hover(button);
    await userEvent.focus(button);
    
    // 🔍 AI Analysis of component states
    await analyzeComponentStates(canvas, {
      component: 'Primary Button',
      states: ['default', 'hover', 'focus', 'active'],
      context: 'critical call-to-action in checkout flow',
      designSystem: 'jpgos'
    });
  }
};
```

---

## 🎯 **Core Features**

### 🧠 **Contextual Intelligence**
jpglens doesn't just see components - it understands **user context**:

```javascript
// Context-aware analysis
await analyzeUserJourney(page, {
  userType: 'first-time-visitor',     // Affects expectations
  deviceContext: 'mobile-on-the-go',  // Affects interaction patterns  
  urgency: 'high',                    // Affects tolerance for friction
  expertise: 'novice',                // Affects need for guidance
  businessContext: 'e-commerce-conversion' // Affects success metrics
});
```

### 🎭 **Universal Framework Support**

<table>
<tr>
<td align="center"><img src="https://playwright.dev/img/playwright-logo.svg" width="48"><br><strong>Playwright</strong></td>
<td align="center"><img src="https://docs.cypress.io/img/logo/cypress-logo-dark.png" width="48"><br><strong>Cypress</strong></td>
<td align="center"><img src="https://selenium.dev/images/selenium_logo_square_green.png" width="48"><br><strong>Selenium</strong></td>
<td align="center"><img src="https://storybook.js.org/images/logos/icon-storybook.png" width="48"><br><strong>Storybook</strong></td>
</tr>
<tr>
<td><code>jpglens/playwright</code></td>
<td><code>jpglens/cypress</code></td>
<td><code>jpglens/selenium</code></td>
<td><code>jpglens/storybook</code></td>
</tr>
</table>

### 🗺️ **User Journey Mapping**

Map complete user workflows and analyze them holistically:

```javascript
const userJourney = {
  name: 'New User Onboarding',
  persona: 'tech-savvy-millennial',
  device: 'mobile-primary',
  
  stages: [
    {
      name: 'discovery',
      page: '/landing',
      userGoal: 'understand value proposition',
      aiAnalysis: 'first-impression and trust signals'
    },
    {
      name: 'signup', 
      page: '/register',
      userGoal: 'create account with minimal friction',
      aiAnalysis: 'form usability and conversion optimization'
    },
    {
      name: 'activation',
      page: '/welcome',  
      userGoal: 'understand next steps',
      aiAnalysis: 'onboarding clarity and engagement'
    }
  ]
};

await analyzeCompleteJourney(userJourney);
```

### 🔌 **Plugin Architecture**

Extend jpglens with specialized analysis:

```javascript
// jpglens.config.js
export default {
  plugins: [
    '@jpglens/accessibility',    // WCAG compliance focus
    '@jpglens/performance',      // Core Web Vitals analysis  
    '@jpglens/mobile-first',     // Mobile UX optimization
    '@jpglens/conversion',       // E-commerce conversion analysis
    '@jpglens/design-systems'    // Component consistency analysis
  ]
};
```

---

## 📊 **Analysis Types**

### 🎨 **Visual Design Analysis**
- Typography hierarchy and readability
- Color contrast and accessibility  
- Visual balance and composition
- Brand consistency
- Responsive design effectiveness

### 🧭 **User Experience Analysis**  
- Information architecture clarity
- Navigation intuitiveness
- User flow optimization
- Error prevention and handling
- Cognitive load assessment

### ♿ **Accessibility Analysis**
- WCAG 2.1 AA/AAA compliance
- Keyboard navigation flow
- Screen reader compatibility
- Color contrast ratios
- Focus management

### 📱 **Device-Specific Analysis**
- Touch target sizing (mobile)
- Thumb-friendly layouts
- Performance on different devices
- Responsive breakpoint effectiveness
- Cross-browser compatibility

### 🧠 **Contextual Intelligence**
- User intent understanding
- Task completion likelihood  
- Friction point identification
- Conversion optimization
- Business goal alignment

---

## 🛠️ **Advanced Configuration**

### 🎛️ **Master Configuration**

```javascript
// jpglens.config.js
export default {
  // AI Provider Configuration
  ai: {
    provider: 'openrouter',
    apiKey: process.env.JPGLENS_API_KEY,
    model: 'anthropic/claude-3-5-sonnet',
    fallbackModel: 'openai/gpt-4-vision-preview',
    baseUrl: 'https://openrouter.ai/api/v1', // Optional: Custom API endpoint
    maxTokens: 4000,
    temperature: 0.1
  },

  // Analysis Configuration
  analysis: {
    types: ['usability', 'accessibility', 'visual-design', 'performance'],
    depth: 'comprehensive', // 'quick' | 'standard' | 'comprehensive'
    includeScreenshots: true,
    generateReports: true
  },

  // User Context Templates
  userPersonas: {
    'business-user': {
      expertise: 'intermediate',
      device: 'desktop-primary',
      urgency: 'medium',
      goals: ['efficiency', 'accuracy', 'professional-appearance']
    },
    'mobile-consumer': {
      expertise: 'novice',
      device: 'mobile-only', 
      urgency: 'high',
      goals: ['speed', 'simplicity', 'trust']
    }
  },

  // Journey Templates  
  journeyTemplates: {
    'e-commerce': ['discovery', 'product-selection', 'checkout', 'confirmation'],
    'saas-onboarding': ['landing', 'signup', 'setup', 'first-use', 'activation'],
    'content-consumption': ['discovery', 'engagement', 'sharing', 'return-visit']
  }
};
```

### � **Custom Base URLs**

jpglens supports custom base URLs for AI providers, allowing you to use Azure OpenAI, local AI servers, or proxy endpoints:

#### OpenAI with Azure Deployment

```javascript
// jpglens.config.js
export default {
  ai: {
    provider: 'openai',
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    model: 'gpt-4-vision-preview',
    baseUrl: 'https://my-resource.openai.azure.com/openai/deployments/my-deployment',
    maxTokens: 4000
  }
  // ... rest of config
};
```

#### OpenRouter with Custom Proxy

```javascript
// jpglens.config.js  
export default {
  ai: {
    provider: 'openrouter',
    apiKey: process.env.JPGLENS_API_KEY,
    model: 'anthropic/claude-3.5-sonnet',
    baseUrl: 'https://my-proxy.openrouter.com/api/v1',
    maxTokens: 4000
  }
  // ... rest of config
};
```

#### Local AI Server

```javascript
// jpglens.config.js
export default {
  ai: {
    provider: 'openai', // Use OpenAI-compatible format
    apiKey: 'local-key-or-empty',
    model: 'llava-1.5-7b-hf',
    baseUrl: 'http://localhost:8080/v1',
    maxTokens: 2000
  }
  // ... rest of config
};
```

**Default Base URLs** (when not specified):
- **OpenAI**: `https://api.openai.com/v1`
- **OpenRouter**: `https://openrouter.ai/api/v1`
- **Anthropic**: `https://api.anthropic.com`

### �🎯 **Context-Rich Prompts**

jpglens uses sophisticated prompting to provide contextual analysis:

```javascript
// Example: E-commerce checkout analysis
const contextPrompt = {
  userContext: {
    persona: 'busy-parent-shopping-online',
    device: 'mobile-during-commute', 
    timeConstraint: 'limited-attention',
    trustLevel: 'medium-new-customer'
  },
  businessContext: {
    industry: 'e-commerce',
    conversionGoal: 'complete-purchase',
    competitiveAdvantage: 'fast-checkout',
    brandPersonality: 'trustworthy-efficient'
  },
  technicalContext: {
    framework: 'react',
    designSystem: 'material-ui',
    deviceSupport: 'mobile-first',
    performanceTarget: 'sub-3s-load'
  }
};
```

---

## 📈 **Reporting & Analytics**

### 📊 **Rich Visual Reports**

jpglens generates comprehensive reports with:

- 📸 **Screenshot Analysis** - Visual annotations and recommendations
- 📈 **Trend Tracking** - UX quality over time
- 🎯 **Actionable Insights** - Specific code changes and design recommendations  
- 📱 **Multi-Device Views** - Analysis across different screen sizes
- ♿ **Accessibility Scores** - WCAG compliance tracking

### 🔍 **Sample Report Output**

```markdown
# 🔍 jpglens Analysis Report

## 📊 Overall UX Score: 8.2/10

### 🎯 Key Findings

**✅ Strengths:**
- Clear visual hierarchy guides user attention effectively
- Consistent design system implementation
- Strong accessibility compliance (WCAG 2.1 AA)

**⚠️ Areas for Improvement:**
- Mobile touch targets below 44px minimum (checkout button)
- Form error messages appear after 3s delay - too slow for user context
- Color contrast ratio 3.8:1 on secondary buttons (needs 4.5:1)

### 🛠️ Specific Recommendations

1. **Checkout Button (Mobile)**
   ```css
   .checkout-btn {
     min-height: 44px; /* Current: 38px */
     min-width: 44px;
   }
   ```

2. **Form Validation**
   ```javascript
   // Show errors immediately on blur, not on submit
   onBlur={() => validateField(fieldName)}
   ```

3. **Color Contrast**
   ```css
   .btn-secondary {
     background-color: #5a6c7d; /* Current: #8a9ba8 */
   }
   ```
```

---

## 🌍 **Community & Ecosystem**

### 🤝 **Contributing**

jpglens is open source and thrives on community contributions:

- 🐛 **Bug Reports** - Help us improve reliability
- 💡 **Feature Requests** - Shape the future of AI testing
- 🔌 **Plugin Development** - Extend jpglens for specialized use cases
- 📚 **Documentation** - Help others learn and succeed

### 🏗️ **Built With jpglens**

Organizations using JPGLens to deliver exceptional user experiences:

- **jpgos Design System** - The original use case that started it all
- **Enterprise SaaS Platforms** - Ensuring accessibility and usability
- **E-commerce Leaders** - Optimizing conversion funnels
- **Design System Teams** - Maintaining consistency at scale

### 🎓 **Learning Resources**

- 📖 **[Complete Documentation](https://jpglens.dev/docs)**
- 🎥 **[Video Tutorials](https://jpglens.dev/tutorials)**  
- 💬 **[Community Discord](https://discord.gg/jpglens)**
- 📝 **[Blog & Case Studies](https://jpglens.dev/blog)**

---

## 🚀 **What's Next?**

### 🗺️ **Roadmap**

- **Q1 2024**: WebDriver BiDi support, Visual regression testing
- **Q2 2024**: Figma plugin, Design token analysis
- **Q3 2024**: Real user monitoring integration, A/B test analysis  
- **Q4 2024**: Multi-language support, Advanced AI models

### 💫 **Vision**

*"We envision a world where every digital interface is not just functional, but truly **human-centered**. jpglens is our contribution to making an exceptional user experience accessible to every development team."*

---

## 📄 **License & Credits**

**MIT License** - Free for commercial and personal use

### 👨‍💻 **Created By**
**Taha Bahrami (Kaito)** - *Visionary behind jpgos design system and jpglens*  
🐙 [GitHub](https://github.com/tahabahrami) • 🐦 [Twitter](https://twitter.com/tahabahrami) • 💼 [LinkedIn](https://linkedin.com/in/taha-bahrami)

### 🙏 **Special Thanks**
**Ashkan** [github](https://github.com/ashkansirous) - *For invaluable support, and belief in this vision*

### 🌟 **Powered By**
- [jpgos](https://github.com/jpgos/jpgos) - The design system that started it all
- [OpenRouter](https://openrouter.ai) - AI model access and routing
- [Playwright](https://playwright.dev) - Cross-browser automation  
- [TypeScript](https://typescriptlang.org) - Type-safe development

---

<!-- BEGIN: MCP SECTION -->
## Use with Model Context Protocol (MCP)

Let AI agents (Cursor/Claude/OpenAI) run jpglens analyses via an MCP server.

### Quickstart
1. Build:
```bash
pnpm -F @jpglens/mcp-server build
```
2. Cursor → Settings → Features → MCP → **Add**
- Type: `stdio`
- Command: `/ABS/PATH/TO/repo/packages/mcp-server/dist/index.js`

**SSE (optional):**
Run `PORT=3333 node packages/mcp-server/dist/sse.js` and point hosted agents to `http://localhost:3333`.

### Advanced
- Retries/backoff in batch runs
- Reporters: JSONL, S3 (set `JPGLENS_REPORTER=both` to enable both)
- Normalized `structuredIssues` for auto-fix agents
<!-- END: MCP SECTION -->

---

<div align="center">

**🔍 See your interfaces through the lens of intelligence**

[![Star on GitHub](https://img.shields.io/github/stars/jpgos/jpglens?style=social)](https://github.com/jpgos/jpglens)
[![Follow on Twitter](https://img.shields.io/twitter/follow/jpglens?style=social)](https://twitter.com/jpglens)
[![Join Discord](https://img.shields.io/discord/123456789?style=social&logo=discord)](https://discord.gg/jpglens)

*Built with ❤️ for the developer community*

</div>
