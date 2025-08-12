#!/usr/bin/env node

/**
 * 🔍 jpglens - CLI Interface
 * Universal AI-Powered UI Testing
 * 
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ASCII Art Logo
const logo = chalk.cyan(`
🔍 jpglens
Universal AI-Powered UI Testing
Created by Taha Bahrami (Kaito)
`);

console.log(logo);

program
  .name('jpglens')
  .description('Universal AI-Powered UI Testing - See your interfaces through the lens of intelligence')
  .version('1.0.0');

/**
 * Initialize jpglens in current project
 */
program
  .command('init')
  .description('Initialize jpglens in your project')
  .option('-f, --framework <framework>', 'Testing framework (playwright, cypress, selenium, storybook)')
  .option('-p, --provider <provider>', 'AI provider (openrouter, openai, anthropic)')
  .action(async (options) => {
    const spinner = ora('Initializing jpglens...').start();

    try {
      // Interactive setup if no options provided
      let framework = options.framework;
      let provider = options.provider;

      if (!framework || !provider) {
        spinner.stop();
        
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'framework',
            message: 'Which testing framework are you using?',
            choices: [
              { name: '🎭 Playwright (Recommended)', value: 'playwright' },
              { name: '🌲 Cypress', value: 'cypress' },
              { name: '🔧 Selenium WebDriver', value: 'selenium' },
              { name: '📖 Storybook', value: 'storybook' },
              { name: '🧪 Jest/Testing Library', value: 'testing-library' }
            ],
            when: !framework
          },
          {
            type: 'list',
            name: 'provider',
            message: 'Which AI provider would you like to use?',
            choices: [
              { name: '🔀 OpenRouter (Multiple models, recommended)', value: 'openrouter' },
              { name: '🤖 OpenAI (GPT-4 Vision)', value: 'openai' },
              { name: '🧠 Anthropic (Claude Vision)', value: 'anthropic' }
            ],
            when: !provider
          },
          {
            type: 'input',
            name: 'apiKey',
            message: 'Enter your AI provider API key:',
            validate: (input) => input.length > 0 || 'API key is required'
          },
          {
            type: 'input',
            name: 'model',
            message: 'AI model to use:',
            default: (answers) => {
              switch (answers.provider || provider) {
                case 'openrouter': return 'openai/gpt-4-vision-preview';
                case 'openai': return 'gpt-4-vision-preview';
                case 'anthropic': return 'claude-3-5-sonnet';
                default: return 'gpt-4-vision-preview';
              }
            }
          }
        ]);

        framework = framework || answers.framework;
        provider = provider || answers.provider;
        
        // Set environment variable
        process.env.JPGLENS_API_KEY = answers.apiKey;
        process.env.JPGLENS_MODEL = answers.model;
      }

      spinner.start('Creating configuration files...');

      // Create jpglens.config.js
      const configContent = generateConfig(framework, provider);
      writeFileSync('jpglens.config.js', configContent);

      // Create example test file
      const exampleContent = generateExampleTest(framework);
      const exampleDir = getExampleDirectory(framework);
      
      if (!existsSync(exampleDir)) {
        mkdirSync(exampleDir, { recursive: true });
      }
      
      const exampleFile = join(exampleDir, getExampleFileName(framework));
      writeFileSync(exampleFile, exampleContent);

      // Create .env file for API key
      if (process.env.JPGLENS_API_KEY) {
        const envContent = `JPGLENS_API_KEY=${process.env.JPGLENS_API_KEY}\nJPGLENS_MODEL=${process.env.JPGLENS_MODEL}\n`;
        writeFileSync('.env', envContent);
      }

      spinner.succeed(chalk.green('jpglens initialized successfully! 🎉'));

      console.log(chalk.cyan('\n📁 Created files:'));
      console.log(`  ✅ jpglens.config.js - Configuration`);
      console.log(`  ✅ ${exampleFile} - Example test`);
      console.log(`  ✅ .env - API key configuration`);

      console.log(chalk.yellow('\n🚀 Next steps:'));
      console.log(`  1. Review jpglens.config.js`);
      console.log(`  2. Run your example test: ${getRunCommand(framework)}`);
      console.log(`  3. Check out the documentation: https://jpglens.dev/docs`);

    } catch (error) {
      spinner.fail(chalk.red('Initialization failed'));
      console.error(error);
      process.exit(1);
    }
  });

/**
 * Analyze current directory
 */
program
  .command('analyze [url]')
  .description('Analyze a URL or local file')
  .option('-c, --config <path>', 'Config file path')
  .option('-o, --output <path>', 'Output directory for reports')
  .option('--depth <level>', 'Analysis depth (quick|standard|comprehensive)', 'standard')
  .action(async (url, options) => {
    const spinner = ora('Starting analysis...').start();

    try {
      // Dynamic import to avoid loading heavy dependencies during init
      const { runAnalysis } = await import('../dist/cli/analyzer.js');
      
      const result = await runAnalysis(url || 'http://localhost:3000', {
        config: options.config,
        output: options.output || './jpglens-reports',
        depth: options.depth
      });

      spinner.succeed(chalk.green(`Analysis completed! Score: ${result.overallScore}/10`));

      console.log(chalk.cyan('\n📊 Results:'));
      console.log(`  🎯 Overall Score: ${result.overallScore}/10`);
      console.log(`  ✅ Strengths: ${result.strengths.length}`);
      console.log(`  🚨 Critical Issues: ${result.criticalIssues.length}`);
      console.log(`  ⚠️  Major Issues: ${result.majorIssues.length}`);
      console.log(`  💡 Minor Issues: ${result.minorIssues.length}`);

      if (result.criticalIssues.length > 0) {
        console.log(chalk.red('\n🚨 Critical Issues:'));
        result.criticalIssues.slice(0, 3).forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue.title}`);
        });
      }

      console.log(chalk.green(`\n📄 Full report saved to: ${options.output || './jpglens-reports'}`));

    } catch (error) {
      spinner.fail(chalk.red('Analysis failed'));
      console.error(error);
      process.exit(1);
    }
  });

/**
 * Run journey analysis
 */
program
  .command('journey <file>')
  .description('Analyze a complete user journey')
  .option('-c, --config <path>', 'Config file path')
  .option('-o, --output <path>', 'Output directory for reports')
  .action(async (file, options) => {
    const spinner = ora('Analyzing user journey...').start();

    try {
      const { runJourneyAnalysis } = await import('../dist/cli/journey-analyzer.js');
      
      const results = await runJourneyAnalysis(file, {
        config: options.config,
        output: options.output || './jpglens-reports'
      });

      spinner.succeed(chalk.green(`Journey analysis completed! ${results.length} stages analyzed`));

      console.log(chalk.cyan('\n🗺️  Journey Results:'));
      results.forEach((result, i) => {
        console.log(`  Stage ${i + 1}: ${result.context.stage} - Score: ${result.overallScore}/10`);
      });

      const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
      console.log(chalk.green(`\n📊 Average Journey Score: ${avgScore.toFixed(1)}/10`));

    } catch (error) {
      spinner.fail(chalk.red('Journey analysis failed'));
      console.error(error);
      process.exit(1);
    }
  });

/**
 * Generate reports
 */
program
  .command('report')
  .description('Generate comprehensive reports from analysis results')
  .option('-i, --input <path>', 'Input directory with analysis results', './jpglens-reports')
  .option('-o, --output <path>', 'Output directory for reports', './jpglens-reports/html')
  .option('-f, --format <format>', 'Report format (html|pdf|json)', 'html')
  .action(async (options) => {
    const spinner = ora('Generating reports...').start();

    try {
      const { generateReports } = await import('../dist/cli/report-generator.js');
      
      await generateReports({
        input: options.input,
        output: options.output,
        format: options.format
      });

      spinner.succeed(chalk.green('Reports generated successfully!'));
      console.log(chalk.cyan(`📄 Reports available at: ${options.output}`));

    } catch (error) {
      spinner.fail(chalk.red('Report generation failed'));
      console.error(error);
      process.exit(1);
    }
  });

/**
 * Configuration validation
 */
program
  .command('validate')
  .description('Validate jpglens configuration')
  .option('-c, --config <path>', 'Config file path')
  .action(async (options) => {
    const spinner = ora('Validating configuration...').start();

    try {
      const { validateConfiguration } = await import('../dist/cli/validator.js');
      
      const result = await validateConfiguration(options.config);

      if (result.valid) {
        spinner.succeed(chalk.green('Configuration is valid! ✅'));
      } else {
        spinner.fail(chalk.red('Configuration has errors'));
        console.log(chalk.red('\n❌ Errors:'));
        result.errors.forEach(error => {
          console.log(`  • ${error}`);
        });
        process.exit(1);
      }

    } catch (error) {
      spinner.fail(chalk.red('Validation failed'));
      console.error(error);
      process.exit(1);
    }
  });

/**
 * Interactive mode
 */
program
  .command('interactive')
  .alias('i')
  .description('Run jpglens in interactive mode')
  .action(async () => {
    console.log(chalk.cyan('🔍 Welcome to jpglens Interactive Mode!'));
    
    try {
      const { runInteractiveMode } = await import('../dist/cli/interactive.js');
      await runInteractiveMode();
    } catch (error) {
      console.error(chalk.red('Interactive mode failed:'), error);
      process.exit(1);
    }
  });

// Helper functions

function generateConfig(framework, provider) {
  return `/**
 * 🔍 jpglens Configuration
 * Generated by jpglens CLI
 */

export default {
  ai: {
    provider: '${provider}',
    apiKey: process.env.JPGLENS_API_KEY,
    model: process.env.JPGLENS_MODEL || '${getDefaultModel(provider)}',
    maxTokens: 4000,
    temperature: 0.1
  },

  analysis: {
    types: ['usability', 'accessibility', 'visual-design', 'performance'],
    depth: 'standard',
    includeScreenshots: true,
    generateReports: true,
    outputDir: './jpglens-reports'
  },

  // Framework-specific configuration
  framework: '${framework}',

  // User personas for contextual analysis
  userPersonas: {
    'primary-user': {
      name: 'Primary User',
      expertise: 'intermediate',
      device: 'desktop-primary',
      urgency: 'medium',
      goals: ['complete-task', 'efficient-workflow']
    }
  }
};
`;
}

function generateExampleTest(framework) {
  switch (framework) {
    case 'playwright':
      return `/**
 * 🔍 jpglens + Playwright Example
 * Generated by jpglens CLI
 */

import { test, expect } from '@playwright/test';
import { analyzeUserJourney } from 'jpglens/playwright';

test.describe('jpglens Analysis', () => {
  test('analyze homepage user experience', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Perform user actions
    await page.click('[data-testid="hero-cta"]');
    
    // 🔍 AI Analysis
    const result = await analyzeUserJourney(page, {
      stage: 'homepage-interaction',
      userIntent: 'explore product features',
      userContext: {
        persona: 'first-time-visitor',
        deviceContext: 'desktop-browser',
        expertise: 'novice'
      },
      criticalElements: ['navigation', 'hero-section', 'call-to-action']
    });

    // Assertions based on AI analysis
    expect(result.overallScore).toBeGreaterThan(7);
    expect(result.criticalIssues).toHaveLength(0);
    
    console.log('🎯 UX Score:', result.overallScore);
    console.log('✅ Strengths:', result.strengths);
    if (result.criticalIssues.length > 0) {
      console.log('🚨 Critical Issues:', result.criticalIssues);
    }
  });
});
`;

    case 'cypress':
      return `/**
 * 🔍 jpglens + Cypress Example
 * Generated by jpglens CLI
 */

import 'jpglens/cypress';

describe('jpglens Analysis', () => {
  it('analyzes user experience', () => {
    cy.visit('http://localhost:3000');
    
    // User actions
    cy.get('[data-cy="hero-cta"]').click();
    
    // 🔍 AI Analysis
    cy.analyzeUserExperience({
      stage: 'homepage-interaction',
      userIntent: 'explore product features',
      userContext: {
        persona: 'first-time-visitor',
        deviceContext: 'cypress-browser',
        expertise: 'novice'
      },
      criticalElements: ['navigation', 'hero-section', 'call-to-action']
    }).then((result) => {
      expect(result.overallScore).to.be.greaterThan(7);
      expect(result.criticalIssues).to.have.length(0);
      
      cy.log(\`🎯 UX Score: \${result.overallScore}\`);
    });
  });
});
`;

    case 'storybook':
      return `/**
 * 🔍 jpglens + Storybook Example
 * Generated by jpglens CLI
 */

import { within, userEvent } from '@storybook/testing-library';
import { analyzeComponentStates } from 'jpglens/storybook';

export default {
  title: 'Components/Button',
  component: Button
};

export const WithJPGLensAnalysis = {
  args: {
    variant: 'primary',
    children: 'Click me'
  },
  
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test different states
    await userEvent.hover(button);
    await userEvent.focus(button);
    
    // 🔍 AI Analysis
    const result = await analyzeComponentStates(canvas, {
      component: 'Button',
      states: ['default', 'hover', 'focus'],
      userContext: {
        persona: 'component-user',
        deviceContext: 'storybook-browser',
        expertise: 'intermediate'
      },
      stage: 'component-evaluation',
      userIntent: 'evaluate button usability and design'
    });

    console.log('🎯 Component Score:', result.overallScore);
    console.log('✅ Strengths:', result.strengths);
  }
};
`;

    default:
      return `// jpglens example for ${framework}
// Please refer to the documentation for framework-specific examples
`;
  }
}

function getDefaultModel(provider) {
  switch (provider) {
    case 'openrouter': return 'openai/gpt-4-vision-preview';
    case 'openai': return 'gpt-4-vision-preview';
    case 'anthropic': return 'claude-3-5-sonnet';
    default: return 'gpt-4-vision-preview';
  }
}

function getExampleDirectory(framework) {
  switch (framework) {
    case 'playwright': return 'tests';
    case 'cypress': return 'cypress/e2e';
    case 'storybook': return 'src/stories';
    default: return 'tests';
  }
}

function getExampleFileName(framework) {
  switch (framework) {
    case 'playwright': return 'jpglens-example.spec.js';
    case 'cypress': return 'jpglens-example.cy.js';
    case 'storybook': return 'jpglens-example.stories.js';
    default: return 'jpglens-example.test.js';
  }
}

function getRunCommand(framework) {
  switch (framework) {
    case 'playwright': return 'npx playwright test';
    case 'cypress': return 'npx cypress run';
    case 'storybook': return 'npm run storybook';
    default: return 'npm test';
  }
}

// Parse command line arguments
program.parse();
`;
