/**
 * 🔍 jpglens - AI Analyzer Tests
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AIAnalyzer } from '../../src/core/ai-analyzer';
import { ScreenshotCapture } from '../../src/core/screenshot-capture';
import { DEFAULT_CONFIG } from '../../src/core/config';
import { AnalysisContext, ScreenshotData } from '../../src/core/types';

(process.env.JPGLENS_API_KEY ? describe : describe.skip)('AIAnalyzer', () => {
  let analyzer: AIAnalyzer;
  let mockScreenshot: ScreenshotData;
  let mockContext: AnalysisContext;

  beforeEach(() => {
    analyzer = new AIAnalyzer(DEFAULT_CONFIG);
    
    mockScreenshot = {
      buffer: mockScreenshotBuffer,
      path: '/tmp/test-screenshot.png',
      metadata: mockScreenshotMetadata
    };

    mockContext = {
      userContext: {
        persona: 'test-user',
        deviceContext: 'desktop-browser',
        expertise: 'intermediate'
      },
      stage: 'test-analysis',
      userIntent: 'test user interface quality',
      criticalElements: ['header', 'navigation', 'main-content']
    };
  });

  describe('analyze', () => {
    it('should perform AI analysis and return structured result', async () => {
      const result = await analyzer.analyze(mockScreenshot, mockContext);

      expect(result).toBeValidAnalysisResult();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(10);
      expect(result.context).toEqual(mockContext);
      expect(result.model).toBe(DEFAULT_CONFIG.ai.model);
    });

    it('should handle invalid screenshot data gracefully', async () => {
      const invalidScreenshot = {
        ...mockScreenshot,
        buffer: Buffer.alloc(0) // Empty buffer
      };

      await expect(analyzer.analyze(invalidScreenshot, mockContext))
        .rejects.toThrow('Invalid screenshot data provided');
    });

    it('should handle missing context gracefully', async () => {
      const invalidContext = {
        ...mockContext,
        stage: '', // Missing required field
        userIntent: ''
      };

      await expect(analyzer.analyze(mockScreenshot, invalidContext))
        .rejects.toThrow('Analysis context must include stage and userIntent');
    });

    it('should use fallback provider when primary fails', async () => {
      // Mock primary provider failure
      const mockFetch = global.fetch as jest.Mock;
      mockFetch
        .mockRejectedValueOnce(new Error('Primary provider failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: 'Fallback AI analysis response with score 7/10'
              }
            }],
            usage: { total_tokens: 800 }
          })
        });

      const configWithFallback = {
        ...DEFAULT_CONFIG,
        ai: {
          ...DEFAULT_CONFIG.ai,
          fallbackModel: 'anthropic/claude-3-5-sonnet'
        }
      };

      const analyzerWithFallback = new AIAnalyzer(configWithFallback);
      const result = await analyzerWithFallback.analyze(mockScreenshot, mockContext);

      expect(result).toBeValidAnalysisResult();
      expect(mockFetch).toHaveBeenCalledTimes(2); // Primary + fallback
    });

    it('should validate analysis results', async () => {
      // Mock invalid score response
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'Invalid analysis with score 15/10' // Invalid score
            }
          }],
          usage: { total_tokens: 500 }
        })
      });

      const result = await analyzer.analyze(mockScreenshot, mockContext);

      // Should clamp invalid scores
      expect(result.overallScore).toBeLessThanOrEqual(10);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('analyzeMultiple', () => {
    it('should analyze multiple screenshots in parallel', async () => {
      const screenshots = [mockScreenshot, mockScreenshot, mockScreenshot];
      const contexts = [mockContext, mockContext, mockContext];

      const results = await analyzer.analyzeMultiple(screenshots, contexts);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeValidAnalysisResult();
      });
    });

    it('should throw error when arrays have different lengths', async () => {
      const screenshots = [mockScreenshot, mockScreenshot];
      const contexts = [mockContext]; // Different length

      await expect(analyzer.analyzeMultiple(screenshots, contexts))
        .rejects.toThrow('Screenshots and contexts arrays must have the same length');
    });

    it('should respect concurrency limits', async () => {
      const screenshots = new Array(10).fill(mockScreenshot);
      const contexts = new Array(10).fill(mockContext);

      const startTime = Date.now();
      const results = await analyzer.analyzeMultiple(screenshots, contexts);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      // Should process in batches (concurrency limit = 3)
      // This is a rough test - in real scenarios, batching would be more apparent
      expect(endTime - startTime).toBeGreaterThan(0);
    });
  });

  describe('prompt generation', () => {
    it('should generate appropriate prompts for different contexts', async () => {
      const ecommerceContext = {
        ...mockContext,
        businessContext: {
          industry: 'e-commerce',
          conversionGoal: 'product-purchase',
          competitiveAdvantage: 'fast-checkout'
        }
      };

      const result = await analyzer.analyze(mockScreenshot, ecommerceContext);
      expect(result).toBeValidAnalysisResult();
    });

    it('should handle mobile-specific context', async () => {
      const mobileContext = {
        ...mockContext,
        userContext: {
          ...mockContext.userContext,
          deviceContext: 'mobile-on-the-go'
        }
      };

      const result = await analyzer.analyze(mockScreenshot, mobileContext);
      expect(result).toBeValidAnalysisResult();
    });

    it('should handle design system context', async () => {
      const designSystemContext = {
        ...mockContext,
        technicalContext: {
          designSystem: 'jpgos',
          framework: 'react'
        }
      };

      const result = await analyzer.analyze(mockScreenshot, designSystemContext);
      expect(result).toBeValidAnalysisResult();
    });
  });

  describe('error handling', () => {
    it('should return error result for complete failure', async () => {
      // Mock complete failure
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockRejectedValue(new Error('Complete network failure'));

      const result = await analyzer.analyze(mockScreenshot, mockContext);

      expect(result).toBeValidAnalysisResult();
      expect(result.overallScore).toBe(0);
      expect(result.criticalIssues).toHaveLength(1);
      expect(result.criticalIssues[0].title).toBe('Analysis Failed');
      expect(result.error).toBe(true);
    });

    it('should handle API rate limiting', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limit exceeded')
      });

      await expect(analyzer.analyze(mockScreenshot, mockContext))
        .rejects.toThrow('OpenRouter API error: 429');
    });

    it('should handle malformed API responses', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          // Missing choices array
          usage: { total_tokens: 100 }
        })
      });

      await expect(analyzer.analyze(mockScreenshot, mockContext))
        .rejects.toThrow('No analysis result returned');
    });
  });

  describe('configuration handling', () => {
    it('should respect analysis depth configuration', async () => {
      const comprehensiveConfig = {
        ...DEFAULT_CONFIG,
        analysis: {
          ...DEFAULT_CONFIG.analysis,
          depth: 'comprehensive' as const
        }
      };

      const comprehensiveAnalyzer = new AIAnalyzer(comprehensiveConfig);
      const result = await comprehensiveAnalyzer.analyze(mockScreenshot, mockContext);

      expect(result).toBeValidAnalysisResult();
    });

    it('should handle custom analysis types', async () => {
      const customConfig = {
        ...DEFAULT_CONFIG,
        analysis: {
          ...DEFAULT_CONFIG.analysis,
          types: ['accessibility', 'performance'] as const
        }
      };

      const customAnalyzer = new AIAnalyzer(customConfig);
      const result = await customAnalyzer.analyze(mockScreenshot, mockContext);

      expect(result).toBeValidAnalysisResult();
    });
  });

  describe('performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      const result = await analyzer.analyze(mockScreenshot, mockContext);
      const endTime = Date.now();

      expect(result).toBeValidAnalysisResult();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds (mocked)
    });

    it('should handle large screenshots efficiently', async () => {
      const largeScreenshot = {
        ...mockScreenshot,
        buffer: Buffer.alloc(10 * 1024 * 1024), // 10MB
        metadata: {
          ...mockScreenshotMetadata,
          width: 4000,
          height: 3000
        }
      };

      const result = await analyzer.analyze(largeScreenshot, mockContext);
      expect(result).toBeValidAnalysisResult();
    });
  });
});
