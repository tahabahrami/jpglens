/**
 * 🔍 jpglens - Enterprise Validation Script
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

class EnterpriseValidator {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
    this.startTime = Date.now();
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
    this.warnings.push(message);
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
    this.errors.push(message);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  /**
   * Validate package.json structure and metadata
   */
  validatePackageJson() {
    this.info('Validating package.json structure...');
    
    const packagePath = path.join(__dirname, '../package.json');
    if (!fs.existsSync(packagePath)) {
      this.error('package.json not found');
      return;
    }

    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Essential fields
    const requiredFields = ['name', 'version', 'description', 'author', 'license', 'repository', 'keywords'];
    requiredFields.forEach(field => {
      if (!pkg[field]) {
        this.error(`Missing required field: ${field}`);
      } else {
        this.success(`package.json has ${field}`);
      }
    });

    // Scripts validation
    const requiredScripts = ['build', 'test', 'lint', 'prepublishOnly'];
    requiredScripts.forEach(script => {
      if (!pkg.scripts[script]) {
        this.error(`Missing required script: ${script}`);
      } else {
        this.success(`Script defined: ${script}`);
      }
    });

    // Exports field for modern npm packages
    if (!pkg.exports) {
      this.error('Missing exports field - required for modern npm packages');
    } else {
      this.success('Package has exports field');
    }

    // Peer dependencies
    if (!pkg.peerDependencies) {
      this.warning('No peer dependencies defined - consider framework peer deps');
    } else {
      this.success('Peer dependencies defined');
    }

    // Files field
    if (!pkg.files || pkg.files.length === 0) {
      this.error('Missing files field - required for npm publishing');
    } else {
      this.success(`Files field includes ${pkg.files.length} entries`);
    }

    // Keywords for discoverability
    if (!pkg.keywords || pkg.keywords.length < 5) {
      this.warning('Consider adding more keywords for better discoverability');
    } else {
      this.success(`Package has ${pkg.keywords.length} keywords`);
    }
  }

  /**
   * Validate TypeScript configuration
   */
  validateTypeScript() {
    this.info('Validating TypeScript configuration...');

    const tsconfigPath = path.join(__dirname, '../tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      this.error('tsconfig.json not found');
      return;
    }

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    // Essential compiler options
    const requiredOptions = ['target', 'module', 'declaration', 'outDir'];
    requiredOptions.forEach(option => {
      if (!tsconfig.compilerOptions[option]) {
        this.error(`Missing TypeScript option: ${option}`);
      } else {
        this.success(`TypeScript option set: ${option}`);
      }
    });

    // Strict mode
    if (!tsconfig.compilerOptions.strict) {
      this.warning('TypeScript strict mode is not enabled');
    } else {
      this.success('TypeScript strict mode enabled');
    }
  }

  /**
   * Validate project structure
   */
  validateProjectStructure() {
    this.info('Validating project structure...');

    const requiredDirs = [
      'src',
      'src/core',
      'src/integrations', 
      'src/providers',
      'tests',
      'examples',
      'docs'
    ];

    const requiredFiles = [
      'README.md',
      'LICENSE',
      'CHANGELOG.md',
      'CONTRIBUTING.md',
      '.gitignore',
      '.eslintrc.js',
      '.prettierrc'
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        this.error(`Missing directory: ${dir}`);
      } else {
        this.success(`Directory exists: ${dir}`);
      }
    });

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (!fs.existsSync(filePath)) {
        this.error(`Missing file: ${file}`);
      } else {
        this.success(`File exists: ${file}`);
      }
    });
  }

  /**
   * Validate documentation quality
   */
  validateDocumentation() {
    this.info('Validating documentation quality...');

    const readmePath = path.join(__dirname, '../README.md');
    if (!fs.existsSync(readmePath)) {
      this.error('README.md not found');
      return;
    }

    const readme = fs.readFileSync(readmePath, 'utf8');

    // Essential sections
    const requiredSections = [
      'installation',
      'usage',
      'examples',
      'api',
      'contributing',
      'license'
    ];

    requiredSections.forEach(section => {
      const regex = new RegExp(`#{1,3}.*${section}`, 'i');
      if (!regex.test(readme)) {
        this.warning(`README missing section: ${section}`);
      } else {
        this.success(`README has section: ${section}`);
      }
    });

    // Check for code examples
    const codeBlocks = readme.match(/```[\s\S]*?```/g);
    if (!codeBlocks || codeBlocks.length < 3) {
      this.warning('README should include more code examples');
    } else {
      this.success(`README has ${codeBlocks.length} code examples`);
    }

    // Check for badges
    const badges = readme.match(/!\[.*?\]\(.*?\)/g);
    if (!badges || badges.length < 3) {
      this.warning('Consider adding status badges to README');
    } else {
      this.success(`README has ${badges.length} badges`);
    }
  }

  /**
   * Validate security configuration
   */
  validateSecurity() {
    this.info('Validating security configuration...');

    // Check for .nvmrc or engines field
    const packagePath = path.join(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (!pkg.engines || !pkg.engines.node) {
      this.warning('Consider specifying Node.js version in engines field');
    } else {
      this.success(`Node.js version specified: ${pkg.engines.node}`);
    }

    // Check for security-related files
    const securityFiles = ['.github/workflows/ci.yml', '.snyk'];
    securityFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        this.success(`Security file exists: ${file}`);
      } else {
        this.warning(`Consider adding: ${file}`);
      }
    });

    // Check for audit script
    if (!pkg.scripts['test:security']) {
      this.warning('Consider adding security audit script');
    } else {
      this.success('Security audit script defined');
    }
  }

  /**
   * Validate build configuration
   */
  validateBuildConfig() {
    this.info('Validating build configuration...');

    const rollupConfigPath = path.join(__dirname, '../rollup.config.js');
    if (!fs.existsSync(rollupConfigPath)) {
      this.error('rollup.config.js not found');
      return;
    }

    this.success('Rollup configuration exists');

    // Check for multiple output formats
    const rollupConfig = fs.readFileSync(rollupConfigPath, 'utf8');
    if (!rollupConfig.includes('esm') || !rollupConfig.includes('cjs')) {
      this.warning('Build should support both ESM and CommonJS formats');
    } else {
      this.success('Build supports multiple formats');
    }
  }

  /**
   * Validate test configuration
   */
  validateTestConfig() {
    this.info('Validating test configuration...');

    const jestConfigPath = path.join(__dirname, '../jest.config.js');
    if (!fs.existsSync(jestConfigPath)) {
      this.error('jest.config.js not found');
      return;
    }

    const jestConfig = fs.readFileSync(jestConfigPath, 'utf8');

    // Check for coverage configuration
    if (!jestConfig.includes('collectCoverage') || !jestConfig.includes('coverageThreshold')) {
      this.warning('Jest should be configured for code coverage');
    } else {
      this.success('Jest configured for code coverage');
    }

    // Check for test setup
    if (!jestConfig.includes('setupFilesAfterEnv')) {
      this.warning('Consider adding test setup file');
    } else {
      this.success('Test setup configured');
    }
  }

  /**
   * Run linting and formatting checks
   */
  async validateCodeQuality() {
    this.info('Validating code quality...');

    try {
      // Run TypeScript check
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      this.success('TypeScript compilation check passed');
    } catch (error) {
      this.error('TypeScript compilation errors found');
    }

    try {
      // Run ESLint
      execSync('npx eslint src --ext .js,.ts', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      this.success('ESLint check passed');
    } catch (error) {
      this.error('ESLint errors found - run npm run lint:fix');
    }

    try {
      // Run Prettier check
      execSync('npx prettier --check src/', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      this.success('Prettier formatting check passed');
    } catch (error) {
      this.error('Prettier formatting errors found - run npm run format');
    }
  }

  /**
   * Validate package size
   */
  validatePackageSize() {
    this.info('Validating package size...');

    try {
      // Build the package
      execSync('npm run build', { stdio: 'pipe', cwd: path.join(__dirname, '..') });

      // Check dist size
      const distPath = path.join(__dirname, '../dist');
      if (fs.existsSync(distPath)) {
        const stats = this.getDirSize(distPath);
        const sizeMB = stats / (1024 * 1024);

        if (sizeMB > 10) {
          this.warning(`Package size is ${sizeMB.toFixed(2)}MB - consider optimization`);
        } else {
          this.success(`Package size is ${sizeMB.toFixed(2)}MB`);
        }
      }
    } catch (error) {
      this.error('Build failed - cannot validate package size');
    }
  }

  /**
   * Get directory size recursively
   */
  getDirSize(dirPath) {
    let size = 0;
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        size += this.getDirSize(filePath);
      } else {
        size += stats.size;
      }
    });

    return size;
  }

  /**
   * Generate enterprise quality report
   */
  generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;

    console.log('\n' + '='.repeat(60));
    this.log('🏆 ENTERPRISE VALIDATION REPORT', 'magenta');
    console.log('='.repeat(60));

    this.log(`⏱️  Validation completed in ${duration.toFixed(2)}s`, 'cyan');
    this.log(`✅ Successful checks: ${this.checks.length - this.errors.length - this.warnings.length}`, 'green');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'yellow');
    this.log(`❌ Errors: ${this.errors.length}`, 'red');

    if (this.warnings.length > 0) {
      console.log('\n📋 WARNINGS:');
      this.warnings.forEach((warning, i) => {
        this.log(`  ${i + 1}. ${warning}`, 'yellow');
      });
    }

    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      this.errors.forEach((error, i) => {
        this.log(`  ${i + 1}. ${error}`, 'red');
      });
    }

    // Overall quality score
    const totalChecks = this.checks.length || 1;
    const successfulChecks = totalChecks - this.errors.length - (this.warnings.length * 0.5);
    const qualityScore = Math.max(0, (successfulChecks / totalChecks) * 100);

    console.log('\n' + '='.repeat(60));
    this.log(`🎯 OVERALL QUALITY SCORE: ${qualityScore.toFixed(1)}%`, qualityScore >= 90 ? 'green' : qualityScore >= 70 ? 'yellow' : 'red');
    console.log('='.repeat(60));

    if (qualityScore >= 95) {
      this.log('🌟 EXCEPTIONAL! This package meets the highest enterprise standards!', 'green');
    } else if (qualityScore >= 85) {
      this.log('🚀 EXCELLENT! This package is ready for enterprise use!', 'green');
    } else if (qualityScore >= 70) {
      this.log('👍 GOOD! Address warnings to reach enterprise grade.', 'yellow');
    } else {
      this.log('⚠️  NEEDS IMPROVEMENT! Address errors before publishing.', 'red');
    }

    return {
      score: qualityScore,
      errors: this.errors.length,
      warnings: this.warnings.length,
      passed: this.errors.length === 0
    };
  }

  /**
   * Run all validation checks
   */
  async runAllChecks() {
    this.log('\n🔍 JPGLENS ENTERPRISE VALIDATION', 'cyan');
    this.log('Universal AI-Powered UI Testing Package Validation\n', 'cyan');

    // Run all validation checks
    this.validatePackageJson();
    this.validateTypeScript();
    this.validateProjectStructure();
    this.validateDocumentation();
    this.validateSecurity();
    this.validateBuildConfig();
    this.validateTestConfig();
    await this.validateCodeQuality();
    this.validatePackageSize();

    // Generate final report
    return this.generateReport();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new EnterpriseValidator();
  validator.runAllChecks().then(result => {
    process.exit(result.passed ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = EnterpriseValidator;
