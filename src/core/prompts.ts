/**
 * 🔍 jpglens - Master Prompt System
 * Universal AI-Powered UI Testing
 *
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AnalysisContext, UserPersona, AnalysisType } from './types.js';

/**
 * Master prompt template that provides comprehensive context to AI models
 * This is the core intelligence that makes jpglens understand user experience
 */
export function createMasterPrompt(context: AnalysisContext, analysisTypes: AnalysisType[]): string {
  const { userContext, businessContext, technicalContext, stage, userIntent, criticalElements } = context;

  return `You are a world-class UX expert, accessibility specialist, and design systems consultant analyzing a user interface through the lens of REAL USER EXPERIENCE.

🎯 **ANALYSIS CONTEXT**
User Stage: ${stage}
User Intent: ${userIntent}
Critical Elements: ${criticalElements?.join(', ') || 'All visible elements'}

👤 **USER CONTEXT**
${formatUserContext(userContext)}

🏢 **BUSINESS CONTEXT**
${formatBusinessContext(businessContext)}

⚙️ **TECHNICAL CONTEXT**
${formatTechnicalContext(technicalContext)}

🔍 **ANALYSIS REQUIREMENTS**
You must analyze this interface for: ${analysisTypes.join(', ')}

${generateAnalysisInstructions(analysisTypes)}

📊 **RESPONSE FORMAT**
Provide your analysis in this EXACT format:

**🎯 OVERALL UX SCORE: X/10**

**✅ STRENGTHS:**
- [What works exceptionally well for this specific user context]

**🚨 CRITICAL ISSUES:** (Blocks user success)
- [Issues that prevent task completion or cause significant user frustration]

**⚠️ MAJOR ISSUES:** (Impacts user experience)
- [Problems that make the interface difficult or unpleasant to use]

**💡 MINOR ISSUES:** (Polish opportunities)
- [Small improvements that would enhance the experience]

**🛠️ SPECIFIC RECOMMENDATIONS:**
For each issue, provide:
1. **Problem**: Clear description
2. **Impact**: How it affects the user in this context
3. **Solution**: Specific, actionable fix
4. **Priority**: Critical/Major/Minor

**🎨 CONTEXTUAL INSIGHTS:**
- How well does this interface serve the user's specific intent: "${userIntent}"?
- What would make this experience more successful for this user context?
- Are there any missed opportunities for this business context?

**📱 DEVICE-SPECIFIC NOTES:**
- Any issues specific to the ${userContext.deviceContext} experience?
- Touch targets, readability, interaction patterns?

Remember: This user is ${getUserPersonaDescription(userContext.persona)} in the context of ${stage}. Every recommendation should consider their specific needs, constraints, and goals.

Be specific, actionable, and focused on REAL USER SUCCESS.`;
}

/**
 * Format user context for the prompt
 */
function formatUserContext(userContext: any): string {
  const persona =
    typeof userContext.persona === 'string'
      ? `Persona: ${userContext.persona}`
      : formatPersonaDetails(userContext.persona);

  return `${persona}
Device Context: ${userContext.deviceContext}
Expertise Level: ${userContext.expertise || 'Not specified'}
Time Constraint: ${userContext.timeConstraint || 'Normal'}
Trust Level: ${userContext.trustLevel || 'Medium'}
Business Goals: ${userContext.businessGoals?.join(', ') || 'Not specified'}`;
}

/**
 * Format business context for the prompt
 */
function formatBusinessContext(businessContext: any): string {
  if (!businessContext) return 'Not specified';

  return `Industry: ${businessContext.industry}
Conversion Goal: ${businessContext.conversionGoal}
Competitive Advantage: ${businessContext.competitiveAdvantage || 'Not specified'}
Brand Personality: ${businessContext.brandPersonality || 'Not specified'}
Target Audience: ${businessContext.targetAudience || 'Not specified'}`;
}

/**
 * Format technical context for the prompt
 */
function formatTechnicalContext(technicalContext: any): string {
  if (!technicalContext) return 'Not specified';

  return `Framework: ${technicalContext.framework || 'Not specified'}
Design System: ${technicalContext.designSystem || 'Not specified'}
Device Support: ${technicalContext.deviceSupport}
Performance Target: ${technicalContext.performanceTarget || 'Not specified'}
Accessibility Target: ${technicalContext.accessibilityTarget || 'WCAG AA'}`;
}

/**
 * Format persona details for the prompt
 */
function formatPersonaDetails(persona: UserPersona): string {
  return `Persona: ${persona.name}
Expertise: ${persona.expertise}
Primary Device: ${persona.device}
Urgency: ${persona.urgency}
Goals: ${persona.goals.join(', ')}
Pain Points: ${persona.painPoints?.join(', ') || 'Not specified'}
Context: ${persona.context || 'Not specified'}`;
}

/**
 * Get user persona description for contextual understanding
 */
function getUserPersonaDescription(persona: string | UserPersona | undefined): string {
  if (!persona) return 'a general user';
  if (typeof persona === 'string') return persona;
  return `${persona.name} (${persona.expertise} level, ${persona.device} user, ${persona.urgency} urgency)`;
}

/**
 * Generate specific analysis instructions based on requested types
 */
function generateAnalysisInstructions(analysisTypes: AnalysisType[]): string {
  const instructions: string[] = [];

  if (analysisTypes.includes('usability')) {
    instructions.push(`
**🧭 USABILITY ANALYSIS:**
- Is the interface intuitive for this user's expertise level?
- Can the user complete their intended task efficiently?
- Are there any confusing or misleading elements?
- Does the information architecture make sense?
- Are interactive elements clearly identifiable?`);
  }

  if (analysisTypes.includes('accessibility')) {
    instructions.push(`
**♿ ACCESSIBILITY ANALYSIS:**
- WCAG 2.1 compliance (AA minimum, AAA preferred)
- Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation support
- Screen reader compatibility (semantic HTML, ARIA labels)
- Focus management and visual focus indicators
- Alternative text for images
- Form labels and error handling`);
  }

  if (analysisTypes.includes('visual-design')) {
    instructions.push(`
**🎨 VISUAL DESIGN ANALYSIS:**
- Typography hierarchy and readability
- Color usage and brand consistency
- Visual balance and composition
- Spacing and layout effectiveness
- Responsive design quality
- Visual feedback for interactions
- Overall aesthetic appeal and professionalism`);
  }

  if (analysisTypes.includes('performance')) {
    instructions.push(`
**⚡ PERFORMANCE ANALYSIS:**
- Perceived performance and loading states
- Image optimization and lazy loading
- Critical rendering path
- User perception of speed
- Progressive enhancement
- Mobile performance considerations`);
  }

  if (analysisTypes.includes('mobile-optimization')) {
    instructions.push(`
**📱 MOBILE OPTIMIZATION ANALYSIS:**
- Touch target sizes (minimum 44px)
- Thumb-friendly navigation
- Mobile-first responsive design
- Portrait/landscape orientation support
- Mobile-specific interaction patterns
- One-handed usage considerations`);
  }

  if (analysisTypes.includes('conversion-optimization')) {
    instructions.push(`
**💰 CONVERSION OPTIMIZATION ANALYSIS:**
- Clear value proposition presentation
- Friction points in the conversion funnel
- Trust signals and credibility indicators
- Call-to-action effectiveness
- Form optimization
- User motivation and persuasion elements`);
  }

  if (analysisTypes.includes('brand-consistency')) {
    instructions.push(`
**🎯 BRAND CONSISTENCY ANALYSIS:**
- Design system adherence
- Brand voice and tone in copy
- Visual identity consistency
- Component usage patterns
- Brand personality reflection
- Cross-platform consistency`);
  }

  if (analysisTypes.includes('error-handling')) {
    instructions.push(`
**🚨 ERROR HANDLING ANALYSIS:**
- Error prevention strategies
- Clear error messaging
- Recovery path availability
- User guidance during errors
- Validation feedback timing
- Graceful degradation`);
  }

  return instructions.join('\n');
}

/**
 * Create specialized prompts for specific scenarios
 */
export const SpecializedPrompts = {
  /**
   * E-commerce focused analysis
   */
  ecommerce: (context: AnalysisContext) => `
${createMasterPrompt(context, ['usability', 'conversion-optimization', 'mobile-optimization'])}

**🛒 E-COMMERCE SPECIFIC FOCUS:**
- Product discoverability and presentation
- Shopping cart and checkout flow optimization
- Trust signals and security indicators
- Mobile shopping experience
- Price presentation and value communication
- Return policy and customer service accessibility`,

  /**
   * SaaS application analysis
   */
  saas: (context: AnalysisContext) => `
${createMasterPrompt(context, ['usability', 'accessibility', 'performance'])}

**💼 SAAS SPECIFIC FOCUS:**
- Dashboard clarity and information hierarchy
- Feature discoverability and onboarding
- Data visualization effectiveness
- Workflow efficiency
- User role and permission clarity
- Integration and API documentation accessibility`,

  /**
   * Design system component analysis
   */
  designSystem: (context: AnalysisContext) => `
${createMasterPrompt(context, ['visual-design', 'accessibility', 'brand-consistency'])}

**🎨 DESIGN SYSTEM SPECIFIC FOCUS:**
- Component consistency and reusability
- Documentation clarity and completeness
- Implementation flexibility
- Accessibility built-in by default
- Responsive behavior patterns
- Cross-browser compatibility`,

  /**
   * Mobile app analysis
   */
  mobileApp: (context: AnalysisContext) => `
${createMasterPrompt(context, ['mobile-optimization', 'usability', 'performance'])}

**📱 MOBILE APP SPECIFIC FOCUS:**
- Native platform conventions adherence
- Gesture support and touch interactions
- Offline functionality and sync
- App store guidelines compliance
- Battery and performance optimization
- Push notification integration`,
};

/**
 * Create journey-specific prompts that understand multi-step flows
 */
export function createJourneyPrompt(
  journeyName: string,
  currentStage: string,
  previousStages: string[],
  context: AnalysisContext
): string {
  return `${createMasterPrompt(context, ['usability', 'conversion-optimization'])}

🗺️ **USER JOURNEY CONTEXT:**
Journey: ${journeyName}
Current Stage: ${currentStage}
Previous Stages: ${previousStages.join(' → ')}

**JOURNEY-SPECIFIC ANALYSIS:**
- Does this stage logically follow from the previous ones?
- Is the user's mental model being maintained?
- Are there clear next steps or exit points?
- How does this stage contribute to the overall journey success?
- What context from previous stages should be preserved?
- Are there opportunities to reduce cognitive load by leveraging previous interactions?

Consider the cumulative user experience, not just this isolated screen.`;
}

/**
 * Create comparative analysis prompts for A/B testing or design variations
 */
export function createComparativePrompt(
  variant: 'A' | 'B',
  comparisonContext: string,
  context: AnalysisContext
): string {
  return `${createMasterPrompt(context, ['usability', 'conversion-optimization', 'visual-design'])}

🔬 **COMPARATIVE ANALYSIS - VARIANT ${variant}:**
Comparison Context: ${comparisonContext}

**COMPARATIVE FOCUS:**
- How does this variant serve the user's needs compared to alternatives?
- What are the unique strengths and weaknesses of this approach?
- Which user types would prefer this variant and why?
- What metrics would this variant likely improve or worsen?
- Are there any unintended consequences of this design choice?

Provide insights that would help decide between design alternatives.`;
}
