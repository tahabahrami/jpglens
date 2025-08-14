// jpglens Footer Analysis Test
// Testing the footer of jpglens.dev website using jpglens AI analysis

import { test, expect } from '@playwright/test';
import { analyzeUserJourney, quickAnalyze } from 'jpglens/playwright';

test.describe('jpglens Website Footer Analysis', () => {
  test('comprehensive footer UX analysis', async ({ page }) => {
    // Navigate to the jpglens website
    await page.goto('https://jpglens.dev');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Scroll to the footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Wait a moment for any animations
    await page.waitForTimeout(1000);
    
    // Comprehensive AI analysis of the footer
    await analyzeUserJourney(page, {
      stage: 'footer-exploration',
      userIntent: 'find additional information and resources',
      userContext: {
        persona: 'developer-evaluating-tool',
        device: 'desktop',
        expertise: 'intermediate',
        currentPage: 'homepage',
        scrollPosition: 'footer',
        userGoal: 'explore-project-resources'
      },
      criticalElements: [
        'footer-brand',
        'footer-links',
        'footer-sections',
        'github-links',
        'npm-links',
        'license-info',
        'creator-attribution'
      ],
      analysisTypes: [
        'information-architecture',
        'link-organization',
        'brand-consistency',
        'community-engagement',
        'trust-signals',
        'navigation-clarity'
      ],
      customPrompts: {
        'footer-analysis': `
          Analyze this footer specifically for:
          1. Information hierarchy and organization
          2. Link accessibility and clarity
          3. Community engagement opportunities (GitHub, npm)
          4. Trust signals and credibility indicators
          5. Brand consistency with the overall site
          6. Mobile responsiveness and usability
          7. Call-to-action effectiveness for community growth
          Focus on how well it serves developers looking to adopt jpglens.
        `
      },
      businessContext: {
        industry: 'open-source-software',
        projectType: 'developer-tool',
        primaryGoals: [
          'github-stars',
          'npm-downloads',
          'community-building',
          'documentation-access',
          'credibility-building'
        ]
      }
    });
    
    // Test specific footer interactions
    await test.step('Analyze footer link interactions', async () => {
      // Hover over GitHub link to test interaction
      const githubLink = page.locator('footer a[href*="github.com/tahabahrami/jpglens"]');
      await githubLink.hover();
      
      // Quick analysis of GitHub link prominence
      await quickAnalyze(page, {
        focus: 'github-link-prominence',
        context: 'Community engagement for open source project',
        analysisType: 'cta-effectiveness'
      });
    });
    
    await test.step('Analyze footer navigation structure', async () => {
      // Check if all important sections are present
      const footerSections = page.locator('footer .footer-section');
      const sectionCount = await footerSections.count();
      
      console.log(`Footer has ${sectionCount} main sections`);
      
      // Analyze footer organization
      await analyzeUserJourney(page, {
        stage: 'footer-navigation-review',
        userIntent: 'understand project ecosystem and resources',
        userContext: {
          persona: 'new-user',
          device: 'desktop',
          informationNeed: 'high'
        },
        criticalElements: [
          'product-links',
          'community-links', 
          'resource-links',
          'footer-hierarchy'
        ],
        analysisTypes: [
          'information-scannability',
          'cognitive-load',
          'link-categorization'
        ]
      });
    });
    
    await test.step('Mobile footer analysis', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Analyze mobile footer experience
      await analyzeUserJourney(page, {
        stage: 'mobile-footer-interaction',
        userIntent: 'access footer resources on mobile',
        userContext: {
          persona: 'mobile-developer',
          device: 'mobile',
          screenSize: 'small',
          interactionMethod: 'touch'
        },
        criticalElements: [
          'mobile-footer-layout',
          'touch-target-sizes',
          'mobile-link-spacing',
          'mobile-readability'
        ],
        analysisTypes: [
          'mobile-usability',
          'touch-accessibility',
          'mobile-information-hierarchy'
        ],
        customPrompts: {
          'mobile-footer': `
            Specifically analyze this footer for mobile users:
            1. Are touch targets appropriately sized?
            2. Is the information hierarchy clear on small screens?
            3. Are links easily tappable without accidental touches?
            4. Does the layout work well in portrait orientation?
            5. Is the text readable without zooming?
          `
        }
      });
    });
    
    await test.step('Footer accessibility analysis', async () => {
      // Reset to desktop view
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.locator('footer').scrollIntoViewIfNeeded();
      
      // Test keyboard navigation in footer
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Analyze footer accessibility
      await analyzeUserJourney(page, {
        stage: 'footer-accessibility-review',
        userIntent: 'navigate footer using assistive technology',
        userContext: {
          persona: 'screen-reader-user',
          assistiveTechnology: 'NVDA',
          device: 'desktop',
          navigationMethod: 'keyboard'
        },
        criticalElements: [
          'footer-landmarks',
          'link-descriptions',
          'focus-indicators',
          'semantic-structure'
        ],
        analysisTypes: [
          'wcag-compliance',
          'screen-reader-compatibility',
          'keyboard-navigation',
          'semantic-markup'
        ],
        accessibilityFocus: {
          wcagLevel: 'AA',
          priorities: ['perceivable', 'operable', 'understandable'],
          assistiveTech: ['screen-reader', 'keyboard-only']
        }
      });
    });
  });
  
  test('footer community engagement analysis', async ({ page }) => {
    await page.goto('https://jpglens.dev');
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Focus specifically on community engagement elements
    await analyzeUserJourney(page, {
      stage: 'community-engagement-evaluation',
      userIntent: 'find ways to contribute or engage with jpglens community',
      userContext: {
        persona: 'potential-contributor',
        device: 'desktop',
        motivationLevel: 'high',
        technicalLevel: 'expert'
      },
      criticalElements: [
        'github-repository-link',
        'npm-package-link',
        'issues-link',
        'contributing-guide-link',
        'community-messaging'
      ],
      analysisTypes: [
        'community-onboarding',
        'contribution-clarity',
        'engagement-motivation',
        'trust-building'
      ],
      customPrompts: {
        'community-analysis': `
          Evaluate how well this footer encourages community engagement:
          1. Are GitHub and npm links prominent enough?
          2. Is there clear messaging about the open-source nature?
          3. Are contribution opportunities well-communicated?
          4. Does it build trust and credibility for the project?
          5. Are there clear next steps for interested developers?
          6. Does it convey the project's maturity and activity level?
        `
      },
      businessContext: {
        projectPhase: 'growth',
        communityGoals: ['github-stars', 'contributors', 'npm-adoption'],
        competitorContext: 'open-source-developer-tools'
      }
    });
  });
  
  test('footer brand consistency analysis', async ({ page }) => {
    await page.goto('https://jpglens.dev');
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Analyze brand consistency between header and footer
    await analyzeUserJourney(page, {
      stage: 'brand-consistency-check',
      userIntent: 'verify brand coherence across site elements',
      userContext: {
        persona: 'design-conscious-developer',
        device: 'desktop',
        designSensitivity: 'high'
      },
      criticalElements: [
        'footer-brand-elements',
        'color-consistency',
        'typography-consistency',
        'tone-of-voice',
        'visual-hierarchy'
      ],
      analysisTypes: [
        'brand-consistency',
        'visual-design',
        'messaging-alignment',
        'professional-appearance'
      ],
      customPrompts: {
        'brand-consistency': `
          Compare the footer with the overall site design and messaging:
          1. Does the footer maintain the same professional tone?
          2. Are colors, fonts, and spacing consistent?
          3. Does the jpglens brand feel cohesive throughout?
          4. Is the "lens" metaphor reinforced appropriately?
          5. Does it maintain the "AI-powered" and "developer-friendly" positioning?
        `
      }
    });
  });
});

// Configuration for the test
test.beforeEach(async ({ page }) => {
  // Set up any necessary configurations
  await page.setExtraHTTPHeaders({
    'User-Agent': 'jpglens-testing-bot/1.0.0'
  });
});

test.afterEach(async ({ page }) => {
  // Clean up if needed
  await page.close();
});
