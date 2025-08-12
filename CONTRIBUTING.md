# 🤝 Contributing to jpglens

Thank you for considering contributing to **jpglens** - Universal AI-Powered UI Testing! This document provides guidelines for contributing to make the process smooth and effective for everyone.

## 🌟 **How You Can Contribute**

- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new capabilities
- 🔧 **Code Contributions** - Implement features and fixes
- 📚 **Documentation** - Improve guides and examples
- 🧪 **Testing** - Add test cases and improve coverage
- 🎨 **Examples** - Create real-world usage examples
- 🔌 **Plugins** - Extend jpglens for specialized use cases

## 🚀 **Getting Started**

### Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git** for version control
- Basic understanding of TypeScript and testing frameworks

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/jpglens.git
   cd jpglens
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Add your test API keys
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run test:e2e
   ```

5. **Build Package**
   ```bash
   npm run build
   ```

## 📋 **Development Guidelines**

### Code Style

We use **ESLint** and **Prettier** to maintain consistent code style:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(playwright): add support for new screenshot options
fix(ai-analyzer): handle edge case in prompt generation
docs(readme): update installation instructions
test(core): add unit tests for security manager
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `test` - Adding or updating tests
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `chore` - Maintenance tasks

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `test/description` - Test improvements

## 🧪 **Testing Requirements**

### Test Coverage

All contributions must maintain **90%+ test coverage**:

```bash
# Run tests with coverage
npm test

# View coverage report
open coverage/lcov-report/index.html
```

### Test Types

1. **Unit Tests** - Test individual functions and classes
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test complete user workflows
4. **Compatibility Tests** - Test framework integrations

### Writing Tests

```typescript
// Example test structure
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle normal case', () => {
    // Test implementation
  });

  it('should handle edge cases', () => {
    // Edge case testing
  });

  it('should handle errors gracefully', () => {
    // Error handling
  });
});
```

## 🔒 **Security Guidelines**

### Security-First Development

- Never commit API keys or sensitive data
- Validate all user inputs
- Sanitize data before logging
- Use secure defaults
- Follow principle of least privilege

### Security Review Process

All contributions undergo security review:

1. **Automated Security Scanning** - Snyk, npm audit
2. **Code Review** - Manual security assessment
3. **Dependency Analysis** - Check for vulnerable packages
4. **Input Validation Review** - Ensure proper sanitization

## 📦 **Framework Integration Guidelines**

### Adding New Framework Support

When adding support for a new testing framework:

1. **Research Compatibility** - Check current API versions
2. **Create Integration Module** - Follow existing patterns
3. **Add Compatibility Layer** - Handle version differences
4. **Write Comprehensive Tests** - Cover all edge cases
5. **Update Documentation** - Include usage examples

### Framework Integration Structure

```
src/integrations/
├── new-framework.ts       # Main integration
├── __tests__/
│   └── new-framework.test.ts  # Tests
└── examples/
    └── new-framework-example.js  # Usage example
```

## 🤖 **AI Provider Guidelines**

### Adding New AI Providers

1. **Implement AIProvider Interface**
2. **Handle API Differences** - Request/response formats
3. **Add Error Handling** - Rate limits, failures
4. **Test with Real API** - Ensure compatibility
5. **Document Configuration** - API keys, models

### AI Provider Structure

```typescript
export class NewAIProvider implements AIProvider {
  name = 'NewProvider';
  
  async analyze(screenshot, context, prompt): Promise<AnalysisResult> {
    // Implementation
  }
  
  async isAvailable(): Promise<boolean> {
    // Availability check
  }
  
  getModelInfo(): { name: string; capabilities: string[] } {
    // Model information
  }
}
```

## 📚 **Documentation Standards**

### Documentation Requirements

- **README Updates** - For new features
- **API Documentation** - JSDoc comments
- **Usage Examples** - Real-world scenarios
- **Migration Guides** - For breaking changes

### Documentation Style

```typescript
/**
 * Analyze user interface with AI-powered insights
 * 
 * @param screenshot - Screenshot data to analyze
 * @param context - User and business context for analysis
 * @returns Promise resolving to structured analysis result
 * 
 * @example
 * ```typescript
 * const result = await analyzer.analyze(screenshot, {
 *   stage: 'checkout-flow',
 *   userIntent: 'complete purchase',
 *   userContext: { persona: 'mobile-user' }
 * });
 * ```
 */
```

## 🔄 **Pull Request Process**

### Before Submitting

1. **Run Full Test Suite**
   ```bash
   npm run test:all
   npm run lint
   npm run build
   ```

2. **Update Documentation**
   - README if needed
   - API documentation
   - Examples

3. **Add Tests**
   - Unit tests for new code
   - Integration tests for features
   - Update existing tests if needed

### PR Template

```markdown
## 🎯 **What This PR Does**

Brief description of changes

## 🧪 **Testing**

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Documentation updated

## 🔒 **Security**

- [ ] No sensitive data exposed
- [ ] Input validation added
- [ ] Security review completed

## 📋 **Checklist**

- [ ] Code follows style guidelines
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] Breaking changes documented
```

### Review Process

1. **Automated Checks** - CI/CD pipeline
2. **Code Review** - Maintainer review
3. **Security Review** - Security assessment
4. **Community Feedback** - Open discussion
5. **Final Approval** - Merge decision

## 🌍 **Community Guidelines**

### Code of Conduct

We are committed to providing a welcoming and inclusive environment:

- **Be Respectful** - Treat everyone with respect
- **Be Inclusive** - Welcome diverse perspectives
- **Be Constructive** - Provide helpful feedback
- **Be Patient** - Help others learn and grow

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord Community** - Real-time chat and support
- **Email** - Security issues and private matters

## 🎖️ **Recognition**

### Contributor Recognition

We recognize contributions through:

- **Contributors List** - README.md acknowledgment
- **Release Notes** - Feature attribution
- **Discord Roles** - Community recognition
- **Swag** - jpglens merchandise for significant contributions

### Becoming a Maintainer

Regular contributors may be invited to become maintainers:

- **Consistent Quality** - High-quality contributions
- **Community Engagement** - Helping other contributors
- **Technical Expertise** - Deep understanding of jpglens
- **Reliability** - Dependable and responsive

## 🚨 **Reporting Issues**

### Bug Reports

Use the bug report template and include:

- **Environment Details** - OS, Node.js version, framework versions
- **Reproduction Steps** - Clear steps to reproduce
- **Expected Behavior** - What should happen
- **Actual Behavior** - What actually happens
- **Screenshots/Logs** - Visual evidence if applicable

### Security Issues

**Do NOT open public issues for security vulnerabilities.**

Instead, email: security@jpglens.dev

Include:
- Detailed description
- Reproduction steps
- Potential impact
- Suggested fixes (if any)

## 📈 **Roadmap Participation**

### Feature Planning

We welcome input on:

- **Roadmap Priorities** - What features matter most
- **Technical Approaches** - How to implement features
- **Use Case Validation** - Real-world scenarios
- **Performance Requirements** - Optimization needs

### RFC Process

For major changes, we use an RFC (Request for Comments) process:

1. **Create RFC Document** - Detailed proposal
2. **Community Discussion** - Gather feedback
3. **Iteration** - Refine based on input
4. **Decision** - Accept or reject proposal
5. **Implementation** - Build the feature

## 🎯 **Getting Help**

### Where to Get Help

- **Documentation** - Check docs first
- **Examples** - Review usage examples
- **GitHub Issues** - Search existing issues
- **Discord Community** - Ask questions
- **Stack Overflow** - Tag with `jpglens`

### Mentorship Program

New contributors can request mentorship:

- **Getting Started** - Help with first contributions
- **Technical Guidance** - Code review and feedback
- **Career Development** - Open source experience

---

## 💝 **Thank You!**

Every contribution, no matter how small, makes jpglens better for millions of users worldwide. Your efforts help create more accessible, usable, and delightful user interfaces.

**Together, we're revolutionizing UI testing with AI! 🚀**

---

*Created with ❤️ by [Taha Bahrami (Kaito)](https://github.com/kaito)*  
*Special thanks to [Ashkan](https://github.com/ashkan) for invaluable support*
