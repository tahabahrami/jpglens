#!/usr/bin/env node

/**
 * 🚀 JPGLens Website Deployment Setup
 * 
 * This script helps you set up automated deployment to Vercel
 * Run with: node scripts/setup-deployment.js
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text) {
  log(`\n${colors.bold}🚀 ${text}${colors.reset}`, 'blue');
  log('='.repeat(text.length + 4), 'blue');
}

async function checkPrerequisites() {
  header('Checking Prerequisites');
  
  const checks = [
    {
      name: 'Node.js version',
      check: () => {
        const version = process.version;
        const major = parseInt(version.slice(1).split('.')[0]);
        return major >= 18;
      },
      fix: 'Please install Node.js 18+ from https://nodejs.org'
    },
    {
      name: 'Git repository',
      check: () => {
        try {
          execSync('git status', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      },
      fix: 'Initialize git: git init && git remote add origin <your-repo-url>'
    },
    {
      name: 'Website directory',
      check: () => {
        try {
          return readFileSync('website/package.json', 'utf8').includes('jpglens-website');
        } catch {
          return false;
        }
      },
      fix: 'Website directory not found. Make sure you have the website folder.'
    }
  ];

  let allPassed = true;
  for (const check of checks) {
    const passed = check.check();
    log(`  ${passed ? '✅' : '❌'} ${check.name}`, passed ? 'green' : 'red');
    if (!passed) {
      log(`     Fix: ${check.fix}`, 'yellow');
      allPassed = false;
    }
  }

  if (!allPassed) {
    log('\n❌ Please fix the issues above before continuing.', 'red');
    process.exit(1);
  }

  log('\n✅ All prerequisites met!', 'green');
}

function showDeploymentSteps() {
  header('Deployment Setup Steps');
  
  const steps = [
    {
      title: 'Create Vercel Account',
      description: 'Sign up at https://vercel.com if you haven\'t already'
    },
    {
      title: 'Install Vercel CLI (Optional)',
      description: 'npm i -g vercel',
      command: true
    },
    {
      title: 'Connect to Vercel',
      description: 'Go to Vercel dashboard → New Project → Import from GitHub',
      settings: {
        'Framework': 'Vite',
        'Root Directory': 'website',
        'Build Command': 'npm run build',
        'Output Directory': 'dist'
      }
    },
    {
      title: 'Get Required Tokens',
      description: 'You\'ll need these for GitHub secrets:',
      tokens: [
        'VERCEL_TOKEN (from https://vercel.com/account/tokens)',
        'VERCEL_ORG_ID (from project settings)',
        'VERCEL_PROJECT_ID (from project settings)'
      ]
    },
    {
      title: 'Add GitHub Secrets',
      description: 'Your repo → Settings → Secrets → Actions → New repository secret'
    }
  ];

  steps.forEach((step, i) => {
    log(`\n${i + 1}. ${step.title}`, 'bold');
    log(`   ${step.description}`);
    
    if (step.command) {
      log(`   Command: ${step.description}`, 'blue');
    }
    
    if (step.settings) {
      log('   Vercel Project Settings:', 'yellow');
      Object.entries(step.settings).forEach(([key, value]) => {
        log(`     ${key}: ${value}`);
      });
    }
    
    if (step.tokens) {
      step.tokens.forEach(token => {
        log(`     • ${token}`, 'yellow');
      });
    }
  });
}

function showFileStructure() {
  header('Created Files');
  
  const files = [
    '📋 DEPLOYMENT.md - Complete deployment guide',
    '⚙️  website/.github/workflows/deploy.yml - GitHub Actions workflow',
    '🔑 website/deployment.env.example - Environment variables template',
    '🚀 scripts/setup-deployment.js - This setup script'
  ];

  files.forEach(file => {
    log(`  ${file}`, 'green');
  });
}

function showNextSteps() {
  header('Next Steps');
  
  const steps = [
    'Read DEPLOYMENT.md for detailed instructions',
    'Set up your Vercel project using the guide',
    'Add GitHub secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)',
    'Push to main branch to trigger first deployment',
    'Your website will be live at: https://your-project-name.vercel.app'
  ];

  steps.forEach((step, i) => {
    log(`  ${i + 1}. ${step}`, 'blue');
  });

  log('\n🎉 Your JPGLens website will have:', 'green');
  log('  • Automatic deployments on every push', 'green');
  log('  • Preview builds for pull requests', 'green');
  log('  • Auto-synced documentation', 'green');
  log('  • Global CDN and optimizations', 'green');
  log('  • HTTPS by default', 'green');
}

async function main() {
  log(`${colors.bold}${colors.blue}`);
  log('╔══════════════════════════════════════════╗');
  log('║        JPGLens Deployment Setup          ║');
  log('║     🚀 Get your website live on Vercel   ║');
  log('╚══════════════════════════════════════════╝');
  log(colors.reset);

  await checkPrerequisites();
  showDeploymentSteps();
  showFileStructure();
  showNextSteps();

  log(`\n${colors.green}${colors.bold}✨ Setup complete! Check DEPLOYMENT.md for full details.${colors.reset}`);
}

main().catch(console.error);
