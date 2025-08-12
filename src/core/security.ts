/**
 * 🔍 jpglens - Security Layer
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { createHash, randomBytes } from 'crypto';

/**
 * Security utilities for jpglens
 * Implements enterprise-grade security practices
 */
export class SecurityManager {
  private static instance: SecurityManager;
  private sessionId: string;
  private allowedDomains: Set<string>;
  private rateLimiter: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.allowedDomains = new Set();
    this.rateLimiter = new Map();
    this.initializeDefaults();
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize default security settings
   */
  private initializeDefaults(): void {
    // Allow common development domains by default
    this.allowedDomains.add('localhost');
    this.allowedDomains.add('127.0.0.1');
    this.allowedDomains.add('0.0.0.0');
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Validate API key format (without exposing the key)
   */
  validateApiKey(apiKey: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!apiKey || typeof apiKey !== 'string') {
      errors.push('API key is required and must be a string');
      return { valid: false, errors };
    }

    if (apiKey.length < 10) {
      errors.push('API key appears to be too short');
    }

    // Check for common insecure patterns
    if (apiKey === 'test' || apiKey === 'demo' || apiKey === 'example') {
      errors.push('API key appears to be a placeholder value');
    }

    // Check if it looks like a real API key format
    const commonFormats = [
      /^sk-[a-zA-Z0-9]{48,}$/, // OpenAI format
      /^sk-or-v1-[a-zA-Z0-9-]{50,}$/, // OpenRouter format
      /^[a-zA-Z0-9_-]{40,}$/ // Generic long token
    ];

    const hasValidFormat = commonFormats.some(format => format.test(apiKey));
    if (!hasValidFormat && apiKey.length < 20) {
      errors.push('API key format appears invalid');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize screenshot data before AI analysis
   */
  sanitizeScreenshot(buffer: Buffer): Buffer {
    // Check for maximum size (prevent DoS)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (buffer.length > maxSize) {
      throw new Error(`Screenshot too large: ${Math.round(buffer.length / 1024 / 1024)}MB (max: 25MB)`);
    }

    // Validate it's actually an image
    if (!this.isValidImageBuffer(buffer)) {
      throw new Error('Invalid image format - only PNG, JPEG, WebP allowed');
    }

    return buffer;
  }

  /**
   * Check if buffer contains valid image data
   */
  private isValidImageBuffer(buffer: Buffer): boolean {
    if (buffer.length < 8) return false;

    // Check PNG signature
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
      return true;
    }

    // Check JPEG signature
    if (buffer.subarray(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]))) {
      return true;
    }

    // Check WebP signature
    if (buffer.subarray(0, 4).equals(Buffer.from('RIFF', 'ascii')) &&
        buffer.subarray(8, 12).equals(Buffer.from('WEBP', 'ascii'))) {
      return true;
    }

    return false;
  }

  /**
   * Validate URL for screenshot capture
   */
  validateUrl(url: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!url || typeof url !== 'string') {
      errors.push('URL is required and must be a string');
      return { valid: false, errors };
    }

    try {
      const parsedUrl = new URL(url);

      // Check protocol
      if (!['http:', 'https:', 'file:'].includes(parsedUrl.protocol)) {
        errors.push(`Unsupported protocol: ${parsedUrl.protocol}`);
      }

      // Check for suspicious patterns
      if (parsedUrl.hostname && this.isSuspiciousHostname(parsedUrl.hostname)) {
        errors.push('Potentially unsafe hostname detected');
      }

      // Validate domain if not localhost
      if (parsedUrl.protocol !== 'file:' && !this.isDomainAllowed(parsedUrl.hostname)) {
        console.warn(`Warning: ${parsedUrl.hostname} is not in allowed domains list`);
      }

    } catch (error) {
      errors.push('Invalid URL format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if hostname appears suspicious
   */
  private isSuspiciousHostname(hostname: string): boolean {
    const suspiciousPatterns = [
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // Raw IP addresses (except localhost)
      /.*\.onion$/, // Tor hidden services
      /.*\.i2p$/, // I2P domains
      /[^a-zA-Z0-9.-]/ // Non-standard characters
    ];

    // Allow localhost IPs
    if (hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return false;
    }

    return suspiciousPatterns.some(pattern => pattern.test(hostname));
  }

  /**
   * Check if domain is in allowed list
   */
  private isDomainAllowed(hostname: string): boolean {
    if (!hostname) return false;
    
    return this.allowedDomains.has(hostname) || 
           Array.from(this.allowedDomains).some(domain => 
             hostname.endsWith(`.${domain}`)
           );
  }

  /**
   * Add allowed domain
   */
  addAllowedDomain(domain: string): void {
    this.allowedDomains.add(domain);
  }

  /**
   * Rate limiting for AI API calls
   */
  checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    const entry = this.rateLimiter.get(identifier);
    
    if (!entry || entry.resetTime <= windowStart) {
      // Reset or create new entry
      this.rateLimiter.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    entry.count++;
    this.rateLimiter.set(identifier, entry);
    return true;
  }

  /**
   * Sanitize user context data
   */
  sanitizeUserContext(context: any): any {
    if (!context || typeof context !== 'object') {
      return {};
    }

    const sanitized = { ...context };

    // Remove potentially sensitive fields
    const sensitiveFields = ['apiKey', 'token', 'password', 'secret', 'auth', 'credential'];
    
    const removeSensitiveData = (obj: any): any => {
      if (obj && typeof obj === 'object') {
        const cleaned = { ...obj };
        
        for (const key of Object.keys(cleaned)) {
          const lowerKey = key.toLowerCase();
          
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            delete cleaned[key];
          } else if (typeof cleaned[key] === 'object') {
            cleaned[key] = removeSensitiveData(cleaned[key]);
          }
        }
        
        return cleaned;
      }
      return obj;
    };

    return removeSensitiveData(sanitized);
  }

  /**
   * Generate secure hash for caching
   */
  generateCacheKey(data: any): string {
    const serialized = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Validate AI response for potential security issues
   */
  validateAIResponse(response: string): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (!response || typeof response !== 'string') {
      return { valid: false, warnings: ['Invalid response format'] };
    }

    // Check for potential injection attempts in AI response
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi // Event handlers like onclick=
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(response)) {
        warnings.push('Potentially unsafe content detected in AI response');
        break;
      }
    }

    // Check for excessively long responses (potential DoS)
    if (response.length > 50000) {
      warnings.push('Response is unusually long - potential DoS attempt');
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Cleanup sensitive data from logs
   */
  sanitizeLogData(data: any): any {
    if (typeof data === 'string') {
      // Mask API keys in strings
      return data.replace(/sk-[a-zA-Z0-9]{48,}/g, 'sk-***MASKED***')
                 .replace(/sk-or-v1-[a-zA-Z0-9-]{50,}/g, 'sk-or-v1-***MASKED***');
    }

    if (data && typeof data === 'object') {
      const sanitized = { ...data };
      
      for (const key of Object.keys(sanitized)) {
        if (key.toLowerCase().includes('key') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          sanitized[key] = '***MASKED***';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeLogData(sanitized[key]);
        } else if (typeof sanitized[key] === 'string') {
          sanitized[key] = this.sanitizeLogData(sanitized[key]);
        }
      }
      
      return sanitized;
    }

    return data;
  }

  /**
   * Get security headers for API requests
   */
  getSecurityHeaders(userAgent: string = 'jpglens/1.0.0'): Record<string, string> {
    return {
      'User-Agent': userAgent,
      'X-Session-ID': this.sessionId,
      'X-Requested-With': 'jpglens',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
  }

  /**
   * Audit log entry
   */
  createAuditLog(action: string, data: any, success: boolean): any {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      action,
      success,
      data: this.sanitizeLogData(data),
      checksum: this.generateCacheKey({ action, success, timestamp: Date.now() })
    };
  }
}
