# Security Policy

## Supported Versions

We provide security updates for the following versions of jpglens:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in jpglens, please report it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@jpglens.dev**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if you have one)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your report within 24 hours
- **Initial Assessment**: We'll provide an initial assessment within 72 hours
- **Regular Updates**: We'll keep you updated on our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 7 days

### Security Considerations

jpglens handles sensitive data including:
- Screenshots of user interfaces
- API keys for AI providers
- User context and business information

We implement the following security measures:

#### Data Protection
- API keys are never logged or stored in plain text
- Screenshots are processed in memory and cleaned up after analysis
- All network communications use HTTPS
- Input validation and sanitization for all user data

#### AI Provider Security
- API calls are made over secure connections
- We don't store or cache AI responses containing sensitive data
- API keys are validated before use
- Rate limiting and error handling prevent abuse

#### Code Security
- Regular dependency updates and security audits
- Input validation for all user-provided data
- Secure handling of file system operations
- No execution of user-provided code

## Best Practices for Users

### API Key Management
```bash
# Use environment variables
export JPGLENS_API_KEY="your-key-here"

# Never commit API keys to version control
echo "JPGLENS_API_KEY=*" >> .gitignore
```

### Screenshot Security
```javascript
// Be mindful of sensitive data in screenshots
await jpglens.analyze(screenshot, {
  // Avoid including sensitive user data in context
  userContext: {
    persona: 'business-user', // Generic, not specific
    device: 'desktop'
  }
});
```

### Configuration Security
```javascript
// jpglens.config.js
export default {
  ai: {
    apiKey: process.env.JPGLENS_API_KEY, // From environment
    // Don't hardcode keys in config files
  }
};
```

## Responsible Disclosure

We follow responsible disclosure practices:

1. **Private Reporting**: Security issues are reported privately first
2. **Coordinated Disclosure**: We work with reporters to understand and fix issues
3. **Public Disclosure**: After fixes are released, we may publish security advisories
4. **Credit**: We acknowledge security researchers who report issues responsibly

## Security Updates

Security updates are released as:
- **Patch releases** (1.0.x) for non-breaking security fixes
- **Minor releases** (1.x.0) for security improvements with new features
- **Major releases** (x.0.0) for breaking changes required for security

Subscribe to our security notifications:
- Watch our [GitHub repository](https://github.com/jpgos/jpglens) for security advisories
- Follow [@jpglens](https://twitter.com/jpglens) on Twitter for announcements

## Contact

For security-related questions or concerns:
- **Email**: security@jpgos.com
- **PGP Key**: Available upon request
- **Response Time**: Within 24 hours for security issues

Thank you for helping keep jpglens and our users safe!
