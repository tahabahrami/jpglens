/**
 * 🔍 jpglens + Playwright Example
 * Demonstrates AI-powered UI testing with real user scenarios
 * 
 * @author Taha Bahrami (Kaito)
 */

import { test, expect } from '@playwright/test';
import { analyzeUserJourney, analyzeCompleteJourney } from 'jpglens/playwright';

test.describe('E-commerce User Journey with jpglens', () => {
  
  test('homepage first impression analysis', async ({ page }) => {
    await page.goto('https://example-store.com');
    
    // 🔍 AI Analysis: First impression
    const result = await analyzeUserJourney(page, {
      stage: 'homepage-landing',
      userIntent: 'understand what this store offers',
      userContext: {
        persona: 'first-time-visitor',
        deviceContext: 'desktop-browser',
        expertise: 'novice',
        timeConstraint: 'limited',
        trustLevel: 'low'
      },
      businessContext: {
        industry: 'e-commerce',
        conversionGoal: 'product-discovery',
        competitiveAdvantage: 'wide-selection',
        brandPersonality: 'trustworthy-affordable'
      },
      criticalElements: ['hero-section', 'navigation', 'search-bar', 'featured-products']
    });

    // Assert based on AI analysis
    expect(result.overallScore).toBeGreaterThan(7);
    expect(result.criticalIssues).toHaveLength(0);
    
    // Log insights
    console.log('🎯 Homepage UX Score:', result.overallScore);
    console.log('✅ Strengths:', result.strengths);
    
    if (result.majorIssues.length > 0) {
      console.log('⚠️ Major Issues to Address:', result.majorIssues.map(i => i.title));
    }
  });

  test('product search and discovery flow', async ({ page }) => {
    await page.goto('https://example-store.com');
    
    // User searches for a product
    await page.fill('[data-testid="search-input"]', 'wireless headphones');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // 🔍 AI Analysis: Search results
    const searchResult = await analyzeUserJourney(page, {
      stage: 'search-results',
      userIntent: 'find the right wireless headphones for my needs',
      userContext: {
        persona: 'tech-savvy-consumer',
        deviceContext: 'desktop-browser',
        expertise: 'intermediate',
        businessGoals: ['find-best-value', 'compare-features']
      },
      businessContext: {
        industry: 'e-commerce',
        conversionGoal: 'product-selection',
        targetAudience: 'electronics-buyers'
      },
      criticalElements: ['search-results', 'filters', 'sort-options', 'product-cards']
    });

    expect(searchResult.overallScore).toBeGreaterThan(6);
    console.log('🔍 Search Experience Score:', searchResult.overallScore);

    // Click on a product
    await page.click('[data-testid="product-card"]:first-child');
    await page.waitForLoadState('networkidle');

    // 🔍 AI Analysis: Product detail page
    const productResult = await analyzeUserJourney(page, {
      stage: 'product-detail',
      userIntent: 'evaluate this product and decide whether to buy',
      userContext: {
        persona: 'comparison-shopper',
        deviceContext: 'desktop-browser',
        expertise: 'intermediate',
        urgency: 'medium'
      },
      businessContext: {
        industry: 'e-commerce',
        conversionGoal: 'add-to-cart',
        competitiveAdvantage: 'detailed-product-info'
      },
      criticalElements: ['product-images', 'price', 'reviews', 'add-to-cart-button', 'specifications']
    });

    expect(productResult.overallScore).toBeGreaterThan(7);
    console.log('🛍️ Product Page Score:', productResult.overallScore);
  });

  test('complete purchase journey analysis', async ({ page }) => {
    // Define complete user journey
    const purchaseJourney = {
      name: 'Complete Purchase Journey',
      description: 'First-time customer making their first purchase',
      persona: 'first-time-customer',
      device: 'desktop-browser',
      
      stages: [
        {
          name: 'homepage-discovery',
          page: 'https://example-store.com',
          userGoal: 'discover products and build trust',
          actions: [
            { type: 'wait', value: '2000', description: 'observe homepage' }
          ],
          aiAnalysis: 'first impression and value proposition clarity'
        },
        {
          name: 'product-search',
          page: 'https://example-store.com',
          userGoal: 'find specific product category',
          actions: [
            { type: 'type', selector: '[data-testid="search-input"]', value: 'bluetooth speakers', description: 'search for speakers' },
            { type: 'click', selector: '[data-testid="search-button"]', description: 'execute search' },
            { type: 'wait', value: '2000', description: 'wait for results' }
          ],
          aiAnalysis: 'search functionality and results presentation'
        },
        {
          name: 'product-selection',
          page: 'https://example-store.com/search?q=bluetooth+speakers',
          userGoal: 'choose the right product',
          actions: [
            { type: 'click', selector: '[data-testid="product-card"]:first-child', description: 'select first product' },
            { type: 'wait', value: '2000', description: 'wait for product page' }
          ],
          aiAnalysis: 'product information and decision support'
        },
        {
          name: 'add-to-cart',
          page: 'https://example-store.com/product/bluetooth-speaker-123',
          userGoal: 'add product to cart',
          actions: [
            { type: 'click', selector: '[data-testid="add-to-cart"]', description: 'add to cart' },
            { type: 'wait', value: '1000', description: 'wait for confirmation' }
          ],
          aiAnalysis: 'add to cart experience and feedback'
        },
        {
          name: 'checkout-initiation',
          page: 'https://example-store.com/cart',
          userGoal: 'proceed to checkout',
          actions: [
            { type: 'click', selector: '[data-testid="checkout-button"]', description: 'go to checkout' },
            { type: 'wait', value: '2000', description: 'wait for checkout page' }
          ],
          aiAnalysis: 'checkout flow initiation and trust signals'
        }
      ]
    };

    // 🔍 AI Analysis: Complete journey
    const journeyResults = await analyzeCompleteJourney(page, purchaseJourney);

    // Analyze journey results
    const avgScore = journeyResults.reduce((sum, r) => sum + r.overallScore, 0) / journeyResults.length;
    const criticalIssuesTotal = journeyResults.reduce((sum, r) => sum + r.criticalIssues.length, 0);

    expect(avgScore).toBeGreaterThan(6);
    expect(criticalIssuesTotal).toBeLessThan(3);

    console.log('🗺️ Complete Journey Analysis:');
    console.log(`   Average Score: ${avgScore.toFixed(1)}/10`);
    console.log(`   Total Critical Issues: ${criticalIssuesTotal}`);
    
    journeyResults.forEach((result, index) => {
      console.log(`   Stage ${index + 1} (${result.context.stage}): ${result.overallScore}/10`);
    });

    // Identify journey friction points
    const lowScoringStages = journeyResults.filter(r => r.overallScore < 7);
    if (lowScoringStages.length > 0) {
      console.log('⚠️ Journey Friction Points:');
      lowScoringStages.forEach(stage => {
        console.log(`   - ${stage.context.stage}: Score ${stage.overallScore}`);
        stage.majorIssues.forEach(issue => {
          console.log(`     • ${issue.title}`);
        });
      });
    }
  });
});

test.describe('Mobile E-commerce Experience', () => {
  
  test('mobile-first purchase flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://example-store.com');

    // 🔍 AI Analysis: Mobile homepage
    const mobileResult = await analyzeUserJourney(page, {
      stage: 'mobile-homepage',
      userIntent: 'quickly browse products on mobile',
      userContext: {
        persona: 'mobile-consumer',
        deviceContext: 'mobile-on-the-go',
        expertise: 'novice',
        urgency: 'high',
        timeConstraint: 'urgent'
      },
      businessContext: {
        industry: 'e-commerce',
        conversionGoal: 'mobile-conversion',
        targetAudience: 'mobile-shoppers'
      },
      criticalElements: ['mobile-navigation', 'search-bar', 'product-grid', 'cart-icon'],
      technicalContext: {
        deviceSupport: 'mobile-first',
        performanceTarget: 'sub-3s-load'
      }
    });

    expect(mobileResult.overallScore).toBeGreaterThan(6);
    console.log('📱 Mobile Experience Score:', mobileResult.overallScore);

    // Check for mobile-specific issues
    const mobileIssues = mobileResult.criticalIssues.concat(mobileResult.majorIssues)
      .filter(issue => issue.category === 'mobile-optimization');
    
    if (mobileIssues.length > 0) {
      console.log('📱 Mobile-Specific Issues:');
      mobileIssues.forEach(issue => {
        console.log(`   - ${issue.title}: ${issue.description}`);
      });
    }
  });
});

test.describe('Accessibility-Focused Analysis', () => {
  
  test('screen reader user journey', async ({ page }) => {
    await page.goto('https://example-store.com');

    // 🔍 AI Analysis: Accessibility perspective
    const a11yResult = await analyzeUserJourney(page, {
      stage: 'accessibility-evaluation',
      userIntent: 'navigate and shop using assistive technology',
      userContext: {
        persona: 'accessibility-user',
        deviceContext: 'screen-reader-desktop',
        expertise: 'intermediate',
        assistiveTechnology: 'screen-reader'
      },
      businessContext: {
        industry: 'e-commerce',
        conversionGoal: 'inclusive-shopping',
        targetAudience: 'users-with-disabilities'
      },
      criticalElements: ['navigation', 'search', 'product-listings', 'forms'],
      technicalContext: {
        accessibilityTarget: 'WCAG-AA',
        framework: 'react'
      }
    });

    // Accessibility should be high priority
    expect(a11yResult.overallScore).toBeGreaterThan(8);
    
    const a11yIssues = a11yResult.criticalIssues.concat(a11yResult.majorIssues)
      .filter(issue => issue.category === 'accessibility');
    
    expect(a11yIssues).toHaveLength(0); // No accessibility issues allowed

    console.log('♿ Accessibility Score:', a11yResult.overallScore);
    console.log('♿ Accessibility Issues:', a11yIssues.length);
  });
});
