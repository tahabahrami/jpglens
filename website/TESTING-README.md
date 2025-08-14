# jpglens Website Footer Testing

This directory contains tests that use **jpglens** (our own AI-powered UI testing tool) to analyze the footer of the jpglens website at https://jpglens.dev.

## 🎯 What We're Testing

The footer analysis test evaluates:

### 📊 **Information Architecture**
- Link organization and hierarchy
- Content categorization and grouping
- Navigation clarity and logic

### 🤝 **Community Engagement**
- GitHub repository prominence
- npm package accessibility
- Contribution opportunities visibility
- Open source messaging effectiveness

### 📱 **Responsive Design**
- Mobile footer layout and usability
- Touch target sizing and spacing
- Information hierarchy on small screens

### ♿ **Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management and indicators

### 🎨 **Brand Consistency**
- Visual alignment with site design
- Messaging tone consistency
- jpglens brand reinforcement

### 🚀 **Conversion Optimization**
- Call-to-action effectiveness
- Trust signal placement
- Developer adoption encouragement

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set API Key
Choose one of these AI providers and set your API key:

**Option A: OpenRouter (Recommended)**
```bash
# PowerShell (Windows)
$env:JPGLENS_API_KEY="your-openrouter-api-key"

# Bash (macOS/Linux)
export JPGLENS_API_KEY="your-openrouter-api-key"
```

**Option B: OpenAI**
```bash
$env:JPGLENS_API_KEY="your-openai-api-key"
```

**Option C: Anthropic**
```bash
$env:JPGLENS_API_KEY="your-anthropic-api-key"
```

### 3. Run the Footer Analysis
```bash
# Run the comprehensive footer test
npm run test:footer

# Or run with visual browser (helpful for debugging)
npm run test:headed

# Or run in debug mode (step through the test)
npm run test:debug
```

## 📋 Test Scenarios

### **Scenario 1: Desktop Footer Analysis**
- **User Persona**: Developer evaluating jpglens
- **Device**: Desktop (1280x720)
- **Focus**: Information architecture, community links, brand consistency
- **Analysis Types**: Usability, trust signals, navigation clarity

### **Scenario 2: Mobile Footer Analysis**
- **User Persona**: Mobile developer
- **Device**: Mobile (375x667)
- **Focus**: Touch usability, responsive layout, information hierarchy
- **Analysis Types**: Mobile usability, touch accessibility

### **Scenario 3: Accessibility Analysis**
- **User Persona**: Screen reader user
- **Device**: Desktop with keyboard navigation
- **Focus**: WCAG compliance, semantic structure, keyboard navigation
- **Analysis Types**: Accessibility, screen reader compatibility

### **Scenario 4: Community Engagement Analysis**
- **User Persona**: Potential contributor
- **Device**: Desktop
- **Focus**: GitHub/npm prominence, contribution clarity, trust building
- **Analysis Types**: Community onboarding, engagement motivation

### **Scenario 5: Brand Consistency Analysis**
- **User Persona**: Design-conscious developer
- **Device**: Desktop
- **Focus**: Visual consistency, messaging alignment, professional appearance
- **Analysis Types**: Brand consistency, visual design

## 📊 Expected AI Insights

The jpglens AI analysis will provide insights on:

### ✅ **Strengths**
- Clear link organization
- Prominent GitHub/npm links
- Professional appearance
- Good mobile responsiveness
- Accessible design elements

### 🔍 **Areas for Improvement**
- Link prominence optimization
- Community messaging enhancement
- Mobile touch target improvements
- Accessibility refinements
- Brand consistency tweaks

### 💡 **Recommendations**
- Specific actionable improvements
- Priority-ranked suggestions
- User experience enhancements
- Community engagement optimizations

## 📁 Output Files

After running the tests, you'll find:

### **jpglens Reports** (`./jpglens-footer-reports/`)
- Detailed AI analysis in Markdown format
- Screenshots with annotations
- Specific improvement recommendations
- User experience insights

### **Playwright Reports** (`./playwright-report/`)
- Test execution results
- Screenshots and videos (on failure)
- Performance metrics
- Test step details

## 🎯 Success Metrics

The footer should score well on:

1. **Information Findability** (8+/10)
2. **Community Engagement** (8+/10) 
3. **Mobile Usability** (8+/10)
4. **Accessibility Compliance** (9+/10)
5. **Brand Consistency** (8+/10)

## 🔧 Troubleshooting

### **Test Fails to Start**
- Check API key is set correctly
- Verify internet connection
- Ensure jpglens.dev is accessible

### **AI Analysis Errors**
- Verify API key has sufficient credits
- Check API provider status
- Try with a different model in jpglens.config.js

### **Playwright Errors**
- Run `npx playwright install` to update browsers
- Check if website is accessible
- Try running with `--headed` flag for visual debugging

## 🚀 Running in CI/CD

For automated testing in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run jpglens Footer Analysis
  env:
    JPGLENS_API_KEY: ${{ secrets.JPGLENS_API_KEY }}
  run: |
    npm install
    npm run test:footer
```

## 📈 Continuous Improvement

Use this test to:
- **Monitor footer performance** after design changes
- **A/B test** different footer layouts
- **Track accessibility** compliance over time
- **Optimize community engagement** elements
- **Maintain brand consistency** across updates

---

**This is jpglens testing jpglens! 🔍✨**

A perfect example of "eating our own dog food" - using our AI-powered UI testing tool to ensure our own website provides an excellent user experience.
