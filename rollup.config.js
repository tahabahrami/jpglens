/**
 * 🔍 jpglens - Rollup Build Configuration
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

// External dependencies (not bundled)
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'fs', 'path', 'crypto', 'util', 'stream', 'events', 'buffer', 'url'
];

const commonPlugins = [
  resolve({
    preferBuiltins: true,
    exportConditions: ['node']
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: './dist',
    rootDir: './src'
  })
];

export default [
  // Main library build (ESM)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      exports: 'named'
    },
    external,
    plugins: commonPlugins
  },

  // Main library build (CommonJS)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    external,
    plugins: commonPlugins
  },

  // Playwright integration
  {
    input: 'src/integrations/playwright.ts',
    output: [
      {
        file: 'dist/playwright.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/playwright.js',
        format: 'cjs'
      }
    ],
    external,
    plugins: commonPlugins
  },

  // Cypress integration
  {
    input: 'src/integrations/cypress.ts',
    output: [
      {
        file: 'dist/cypress.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/cypress.js',
        format: 'cjs'
      }
    ],
    external,
    plugins: commonPlugins
  },

  // Selenium integration
  {
    input: 'src/integrations/selenium.ts',
    output: [
      {
        file: 'dist/selenium.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/selenium.js',
        format: 'cjs'
      }
    ],
    external,
    plugins: commonPlugins
  },

  // Storybook integration
  {
    input: 'src/integrations/storybook.ts',
    output: [
      {
        file: 'dist/storybook.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/storybook.js',
        format: 'cjs'
      }
    ],
    external,
    plugins: commonPlugins
  },

  // Testing Library integration (if we add it)
  {
    input: 'src/integrations/testing-library.ts',
    output: [
      {
        file: 'dist/testing-library.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/testing-library.js',
        format: 'cjs'
      }
    ],
    external,
    plugins: commonPlugins
  }
];
