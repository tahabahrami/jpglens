module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: {
    node: true,
    es6: true,
    jest: true,
    browser: true,
  },
  rules: {
    // Allow unused variables that start with underscore
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // Allow any type in some cases
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow require statements
    '@typescript-eslint/no-var-requires': 'off',
    // Allow empty interfaces (useful for extending)
    '@typescript-eslint/no-empty-interface': 'off',
    // Allow non-null assertions
    '@typescript-eslint/no-non-null-assertion': 'off',
    // Turn off console warnings for now
    'no-console': 'off',
    // Turn off some problematic rules for now
    'no-useless-escape': 'warn',
    'no-case-declarations': 'warn',
    'no-undef': 'warn',
  },
  ignorePatterns: [
    'dist/',
    'coverage/',
    'node_modules/',
    '*.js',
    '*.d.ts',
    'rollup.config.js',
    'jest.config.js',
    '.eslintrc.js',
  ],
};