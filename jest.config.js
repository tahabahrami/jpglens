/**
 * 🔍 jpglens - Jest Configuration
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // TypeScript support
  preset: 'ts-jest',
  
  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|js)',
    '<rootDir>/tests/**/*.(test|spec).(ts|js)'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/examples/**',
    '!src/cli/**', // CLI tested separately
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Coverage thresholds (enterprise-grade)
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^@providers/(.*)$': '<rootDir>/src/providers/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],
  
  // Test timeout
  testTimeout: 30000, // 30 seconds for AI API calls
  
  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/examples/',
    '/docs/'
  ],
  
  // Verbose output
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Performance
  maxWorkers: '50%',
  
  // Mock configurations for external dependencies
  moduleNameMapping: {
    // Mock Playwright
    '@playwright/test': '<rootDir>/tests/mocks/playwright.mock.ts',
    
    // Mock Cypress
    'cypress': '<rootDir>/tests/mocks/cypress.mock.ts',
    
    // Mock Selenium
    'selenium-webdriver': '<rootDir>/tests/mocks/selenium.mock.ts',
    
    // Mock Node.js modules
    'fs': '<rootDir>/tests/mocks/fs.mock.ts',
    'path': '<rootDir>/tests/mocks/path.mock.ts'
  }
};
