// jpglens Configuration for Website Footer Testing
export default {
  // AI Provider Configuration
  ai: {
    provider: 'openrouter',
    model: 'anthropic/claude-3-5-sonnet',
    apiKey: process.env.JPGLENS_API_KEY,
    maxTokens: 4000,
    temperature: 0.1
  },

  // Analysis Configuration
  analysis: {
    types: ['usability', 'accessibility', 'visual-design', 'information-architecture'],
    depth: 'comprehensive',
    includeScreenshots: true,
    contextAware: true
  },

  // Reporting Configuration
  reporting: {
    enabled: true,
    outputDir: './jpglens-footer-reports',
    format: 'markdown',
    template: 'detailed',
    includeScreenshots: true,
    customPrompts: {
      'footer-specific': `
        This is a footer analysis for an open-source AI testing tool website.
        Focus on:
        1. Information architecture and link organization
        2. Community engagement elements (GitHub, npm, contributing)
        3. Trust signals and credibility indicators
        4. Accessibility and mobile usability
        5. Brand consistency and professional appearance
        6. Call-to-action effectiveness for developer adoption
      `,
      'open-source-focus': `
        Analyze from the perspective of developers evaluating an open-source tool:
        1. Are GitHub and community links prominent?
        2. Is the open-source nature clearly communicated?
        3. Are contribution opportunities visible?
        4. Does it build trust for adoption in production?
      `
    }
  },

  // User Personas for Footer Testing
  userPersonas: {
    'evaluating-developer': {
      expertise: 'intermediate',
      device: 'desktop',
      goals: ['evaluate-tool', 'check-community', 'assess-maturity'],
      concerns: ['reliability', 'support', 'maintenance']
    },
    'mobile-developer': {
      expertise: 'intermediate',
      device: 'mobile',
      goals: ['quick-access', 'resource-links'],
      constraints: ['small-screen', 'touch-interaction']
    },
    'accessibility-user': {
      expertise: 'intermediate',
      device: 'desktop',
      assistiveTech: 'screen-reader',
      goals: ['navigate-links', 'access-documentation'],
      needs: ['keyboard-navigation', 'semantic-structure']
    },
    'potential-contributor': {
      expertise: 'expert',
      device: 'desktop',
      goals: ['find-repository', 'understand-contribution', 'assess-project'],
      motivations: ['open-source-contribution', 'community-building']
    }
  },

  // Custom analysis types for footer testing
  customAnalysisTypes: {
    'footer-navigation': {
      focus: 'Link organization and information hierarchy in footer',
      criteria: ['logical-grouping', 'clear-labels', 'appropriate-prominence']
    },
    'community-engagement': {
      focus: 'Elements that encourage community participation',
      criteria: ['github-prominence', 'contribution-clarity', 'trust-building']
    },
    'brand-consistency': {
      focus: 'Visual and messaging consistency with overall site',
      criteria: ['color-consistency', 'typography-consistency', 'tone-alignment']
    }
  },

  // Screenshot configuration
  screenshots: {
    capture: true,
    fullPage: false,
    focusArea: 'footer',
    annotations: true
  }
};
