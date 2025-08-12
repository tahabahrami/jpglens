/**
 * 🔍 jpglens + Cypress Example
 * Demonstrates AI-powered UI testing with Cypress
 * 
 * @author Taha Bahrami (Kaito)
 */

import 'jpglens/cypress';

describe('SaaS Dashboard with jpglens', () => {
  
  beforeEach(() => {
    // Set up optimal conditions for AI analysis
    cy.prepareForJPGLensAnalysis();
  });

  it('analyzes dashboard user experience', () => {
    cy.visit('https://example-dashboard.com/login');
    
    // Login flow
    cy.get('[data-cy="email-input"]').type('user@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="dashboard-content"]').should('be.visible');

    // 🔍 AI Analysis: Dashboard first impression
    cy.analyzeUserExperience({
      stage: 'dashboard-overview',
      userIntent: 'quickly understand business metrics and take action',
      userContext: {
        persona: 'business-user',
        deviceContext: 'desktop-work-environment',
        expertise: 'intermediate',
        urgency: 'medium',
        businessGoals: ['monitor-kpis', 'identify-issues', 'make-decisions']
      },
      businessContext: {
        industry: 'saas',
        conversionGoal: 'user-engagement',
        competitiveAdvantage: 'intuitive-analytics',
        brandPersonality: 'professional-reliable'
      },
      criticalElements: ['main-metrics', 'navigation', 'charts', 'action-buttons'],
      technicalContext: {
        framework: 'react',
        designSystem: 'custom',
        performanceTarget: 'sub-2s-interaction'
      }
    }).then((result) => {
      // Assertions based on AI analysis
      expect(result.overallScore).to.be.greaterThan(7);
      expect(result.criticalIssues).to.have.length(0);
      
      cy.log(`🎯 Dashboard UX Score: ${result.overallScore}/10`);
      
      // Log key insights
      if (result.strengths.length > 0) {
        cy.log('✅ Dashboard Strengths:');
        result.strengths.forEach(strength => cy.log(`  - ${strength}`));
      }
      
      if (result.recommendations.length > 0) {
        cy.log('💡 Improvement Recommendations:');
        result.recommendations.slice(0, 3).forEach(rec => {
          cy.log(`  - ${rec.title}: ${rec.description}`);
        });
      }
    });
  });

  it('analyzes data filtering workflow', () => {
    cy.visit('https://example-dashboard.com/dashboard');
    
    // User wants to filter data by date range
    cy.get('[data-cy="date-filter"]').click();
    cy.get('[data-cy="date-picker-start"]').type('2024-01-01');
    cy.get('[data-cy="date-picker-end"]').type('2024-01-31');
    cy.get('[data-cy="apply-filter"]').click();
    
    // Wait for filtered results
    cy.get('[data-cy="loading-indicator"]').should('not.exist');
    cy.get('[data-cy="filtered-results"]').should('be.visible');

    // 🔍 AI Analysis: Data filtering experience
    cy.analyzeUserExperience({
      stage: 'data-filtering',
      userIntent: 'filter data to analyze specific time period',
      userContext: {
        persona: 'data-analyst',
        deviceContext: 'desktop-analysis-session',
        expertise: 'expert',
        urgency: 'high',
        businessGoals: ['accurate-analysis', 'efficient-workflow']
      },
      businessContext: {
        industry: 'saas',
        conversionGoal: 'feature-adoption',
        targetAudience: 'business-analysts'
      },
      criticalElements: ['date-picker', 'filter-controls', 'results-display', 'loading-states']
    }).then((result) => {
      expect(result.overallScore).to.be.greaterThan(6);
      
      // Check for workflow efficiency issues
      const workflowIssues = result.majorIssues.filter(issue => 
        issue.description.toLowerCase().includes('workflow') ||
        issue.description.toLowerCase().includes('efficiency')
      );
      
      if (workflowIssues.length > 0) {
        cy.log('⚠️ Workflow Efficiency Issues:');
        workflowIssues.forEach(issue => {
          cy.log(`  - ${issue.title}: ${issue.fix || issue.description}`);
        });
      }
    });
  });

  it('analyzes mobile dashboard experience', () => {
    // Set mobile viewport
    cy.viewport(375, 812);
    cy.visit('https://example-dashboard.com/dashboard');

    // 🔍 AI Analysis: Mobile dashboard
    cy.analyzeUserExperience({
      stage: 'mobile-dashboard',
      userIntent: 'check key metrics while on mobile',
      userContext: {
        persona: 'mobile-executive',
        deviceContext: 'mobile-on-the-go',
        expertise: 'intermediate',
        urgency: 'high',
        timeConstraint: 'limited'
      },
      businessContext: {
        industry: 'saas',
        conversionGoal: 'mobile-engagement',
        targetAudience: 'executives-on-mobile'
      },
      criticalElements: ['mobile-navigation', 'key-metrics', 'charts', 'touch-targets'],
      technicalContext: {
        deviceSupport: 'mobile-first',
        performanceTarget: 'sub-3s-load'
      }
    }).then((result) => {
      expect(result.overallScore).to.be.greaterThan(6);
      
      // Mobile-specific validations
      const mobileIssues = result.criticalIssues.concat(result.majorIssues)
        .filter(issue => 
          issue.category === 'mobile-optimization' ||
          issue.description.toLowerCase().includes('mobile') ||
          issue.description.toLowerCase().includes('touch')
        );
      
      cy.log(`📱 Mobile Dashboard Score: ${result.overallScore}/10`);
      cy.log(`📱 Mobile-Specific Issues: ${mobileIssues.length}`);
      
      if (mobileIssues.length > 0) {
        cy.log('📱 Mobile Issues to Address:');
        mobileIssues.forEach(issue => {
          cy.log(`  - ${issue.title}`);
        });
      }
    });
  });
});

describe('Form User Experience Analysis', () => {
  
  it('analyzes user onboarding form', () => {
    cy.visit('https://example-app.com/signup');

    // Fill out signup form step by step
    cy.get('[data-cy="first-name"]').type('John');
    cy.get('[data-cy="last-name"]').type('Doe');
    cy.get('[data-cy="email"]').type('john.doe@example.com');

    // 🔍 AI Analysis: Form completion experience
    cy.analyzeUserExperience({
      stage: 'signup-form-completion',
      userIntent: 'create account quickly and securely',
      userContext: {
        persona: 'new-user',
        deviceContext: 'desktop-signup-flow',
        expertise: 'novice',
        urgency: 'medium',
        trustLevel: 'low'
      },
      businessContext: {
        industry: 'saas',
        conversionGoal: 'user-registration',
        competitiveAdvantage: 'simple-onboarding',
        brandPersonality: 'trustworthy-professional'
      },
      criticalElements: ['form-fields', 'validation-messages', 'submit-button', 'privacy-policy'],
      technicalContext: {
        accessibilityTarget: 'WCAG-AA'
      }
    }).then((result) => {
      expect(result.overallScore).to.be.greaterThan(7);
      
      // Form-specific validations
      const formIssues = result.criticalIssues.concat(result.majorIssues)
        .filter(issue => 
          issue.description.toLowerCase().includes('form') ||
          issue.description.toLowerCase().includes('field') ||
          issue.description.toLowerCase().includes('validation')
        );
      
      cy.log(`📝 Form UX Score: ${result.overallScore}/10`);
      
      if (formIssues.length > 0) {
        cy.log('📝 Form Issues:');
        formIssues.forEach(issue => {
          cy.log(`  - ${issue.title}: ${issue.impact}`);
        });
      }
    });

    // Continue with form submission
    cy.get('[data-cy="password"]').type('SecurePassword123!');
    cy.get('[data-cy="confirm-password"]').type('SecurePassword123!');
    cy.get('[data-cy="terms-checkbox"]').check();
    cy.get('[data-cy="submit-button"]').click();

    // Wait for success state
    cy.get('[data-cy="success-message"]').should('be.visible');

    // 🔍 AI Analysis: Form submission success
    cy.analyzeUserExperience({
      stage: 'signup-success',
      userIntent: 'understand next steps after successful signup',
      userContext: {
        persona: 'newly-registered-user',
        deviceContext: 'post-signup-flow',
        expertise: 'novice',
        urgency: 'medium'
      },
      businessContext: {
        industry: 'saas',
        conversionGoal: 'user-activation',
        targetAudience: 'new-users'
      },
      criticalElements: ['success-message', 'next-steps', 'navigation-options']
    }).then((result) => {
      expect(result.overallScore).to.be.greaterThan(8);
      
      cy.log(`🎉 Signup Success UX Score: ${result.overallScore}/10`);
      
      // Check for onboarding guidance
      const guidanceIssues = result.minorIssues.filter(issue =>
        issue.description.toLowerCase().includes('guidance') ||
        issue.description.toLowerCase().includes('next step')
      );
      
      if (guidanceIssues.length > 0) {
        cy.log('💡 Onboarding Guidance Opportunities:');
        guidanceIssues.forEach(issue => {
          cy.log(`  - ${issue.title}`);
        });
      }
    });
  });
});

describe('Error Handling and Edge Cases', () => {
  
  it('analyzes error state user experience', () => {
    cy.visit('https://example-app.com/dashboard');
    
    // Simulate network error or server error
    cy.intercept('GET', '/api/data', { statusCode: 500 }).as('serverError');
    cy.get('[data-cy="refresh-button"]').click();
    cy.wait('@serverError');

    // 🔍 AI Analysis: Error state handling
    cy.analyzeUserExperience({
      stage: 'error-state-handling',
      userIntent: 'understand what went wrong and how to recover',
      userContext: {
        persona: 'frustrated-user',
        deviceContext: 'error-recovery-flow',
        expertise: 'intermediate',
        urgency: 'high',
        trustLevel: 'medium'
      },
      businessContext: {
        industry: 'saas',
        conversionGoal: 'error-recovery',
        competitiveAdvantage: 'reliable-service',
        brandPersonality: 'helpful-transparent'
      },
      criticalElements: ['error-message', 'recovery-options', 'support-links', 'retry-button']
    }).then((result) => {
      // Error handling should be excellent
      expect(result.overallScore).to.be.greaterThan(6);
      
      const errorHandlingIssues = result.criticalIssues.filter(issue =>
        issue.category === 'error-handling' ||
        issue.description.toLowerCase().includes('error') ||
        issue.description.toLowerCase().includes('recovery')
      );
      
      cy.log(`🚨 Error Handling Score: ${result.overallScore}/10`);
      
      if (errorHandlingIssues.length > 0) {
        cy.log('🚨 Error Handling Issues:');
        errorHandlingIssues.forEach(issue => {
          cy.log(`  - ${issue.title}: ${issue.fix || 'No fix provided'}`);
        });
        
        // Error handling issues should be addressed immediately
        expect(errorHandlingIssues.filter(i => i.severity === 'critical')).to.have.length(0);
      }
    });
  });
});

// Custom Cypress commands for jpglens integration
Cypress.Commands.add('analyzePageLoad', (pageName, userPersona = 'general-user') => {
  cy.analyzeUserExperience({
    stage: `${pageName}-page-load`,
    userIntent: `access ${pageName} efficiently`,
    userContext: {
      persona: userPersona,
      deviceContext: 'page-navigation',
      expertise: 'intermediate'
    },
    businessContext: {
      industry: 'web-application',
      conversionGoal: 'page-engagement'
    },
    criticalElements: ['loading-states', 'main-content', 'navigation']
  });
});

Cypress.Commands.add('analyzeFormSubmission', (formName, expectedOutcome) => {
  cy.analyzeUserExperience({
    stage: `${formName}-form-submission`,
    userIntent: `successfully submit ${formName} form`,
    userContext: {
      persona: 'form-user',
      deviceContext: 'form-completion',
      expertise: 'novice'
    },
    businessContext: {
      industry: 'form-processing',
      conversionGoal: 'form-completion'
    },
    criticalElements: ['form-fields', 'submit-button', 'feedback-messages'],
    expectedOutcome
  });
});
