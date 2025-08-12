/**
 * 🔍 jpglens - Test Setup
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

// Setup environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JPGLENS_API_KEY = 'test-api-key-mock';
process.env.JPGLENS_MODEL = 'test-model';
process.env.JPGLENS_DEBUG = 'false';

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Mock console.error and console.warn to capture them in tests
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test utilities
global.mockScreenshotBuffer = Buffer.from('mock-screenshot-data');
global.mockScreenshotMetadata = {
  width: 1280,
  height: 720,
  devicePixelRatio: 1,
  timestamp: new Date().toISOString()
};

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      choices: [{
        message: {
          content: 'Mock AI analysis response with score 8/10'
        }
      }],
      usage: {
        total_tokens: 1000
      }
    }),
    text: () => Promise.resolve('Mock response text')
  })
) as jest.Mock;

// Setup custom matchers
expect.extend({
  toBeValidAnalysisResult(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.overallScore === 'number' &&
      received.overallScore >= 0 &&
      received.overallScore <= 10 &&
      Array.isArray(received.strengths) &&
      Array.isArray(received.criticalIssues) &&
      Array.isArray(received.majorIssues) &&
      Array.isArray(received.minorIssues) &&
      Array.isArray(received.recommendations)
    );

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid analysis result`
          : `Expected ${received} to be a valid analysis result with overallScore (0-10), strengths, issues arrays, and recommendations`,
      pass,
    };
  },

  toBeValidScreenshotData(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      Buffer.isBuffer(received.buffer) &&
      typeof received.path === 'string' &&
      received.metadata &&
      typeof received.metadata.width === 'number' &&
      typeof received.metadata.height === 'number' &&
      typeof received.metadata.timestamp === 'string'
    );

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be valid screenshot data`
          : `Expected ${received} to be valid screenshot data with buffer, path, and metadata`,
      pass,
    };
  },

  toBeValidJPGLensConfig(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      received.ai &&
      typeof received.ai.provider === 'string' &&
      typeof received.ai.apiKey === 'string' &&
      typeof received.ai.model === 'string' &&
      received.analysis &&
      Array.isArray(received.analysis.types) &&
      typeof received.analysis.depth === 'string'
    );

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid jpglens config`
          : `Expected ${received} to be a valid jpglens config with ai and analysis sections`,
      pass,
    };
  }
});

// Mock timers for consistent testing
jest.useFakeTimers();

// Increase timeout for tests that involve AI API calls (even mocked)
jest.setTimeout(10000);

// Global cleanup
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Add custom test types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidAnalysisResult(): R;
      toBeValidScreenshotData(): R;
      toBeValidJPGLensConfig(): R;
    }
  }

  var mockScreenshotBuffer: Buffer;
  var mockScreenshotMetadata: {
    width: number;
    height: number;
    devicePixelRatio: number;
    timestamp: string;
  };
}
