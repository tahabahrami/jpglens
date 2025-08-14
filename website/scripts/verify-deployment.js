#!/usr/bin/env node

/**
 * 🔍 Deployment Verification Script
 * 
 * Verifies that your website is ready for deployment
 * Run with: node scripts/verify-deployment.js
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(path, description) {
  const exists = existsSync(path);
  log(`  ${exists ? '✅' : '❌'} ${description}`, exists ? 'green' : 'red');
  return exists;
}

function checkCommand(cmd, description) {
  try {
    execSync(cmd, { stdio: 'ignore' });
    log(`  ✅ ${description}`, 'green');
    return true;
  } catch {
    log(`  ❌ ${description}`, 'red');
    return false;
  }
}

async function main() {
  log(`${colors.bold}${colors.blue}🔍 JPGLens Website Deployment Verification${colors.reset}\n`);

  let score = 0;
  let total = 0;

  // Check essential files
  log('📁 Essential Files:', 'bold');
  total += 4;
  score += checkFile('package.json', 'package.json exists') ? 1 : 0;
  score += checkFile('vercel.json', 'vercel.json configuration') ? 1 : 0;
  score += checkFile('vite.config.js', 'Vite configuration') ? 1 : 0;
  score += checkFile('index.html', 'Main HTML file') ? 1 : 0;

  // Check build system
  log('\n🔨 Build System:', 'bold');
  total += 3;
  score += checkCommand('npm list vite', 'Vite installed') ? 1 : 0;
  
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const hasBuildScript = pkg.scripts && pkg.scripts.build;
    log(`  ${hasBuildScript ? '✅' : '❌'} Build script configured`, hasBuildScript ? 'green' : 'red');
    score += hasBuildScript ? 1 : 0;
    total += 1;
    
    const hasDeployScript = pkg.scripts && pkg.scripts.deploy;
    log(`  ${hasDeployScript ? '✅' : '❌'} Deploy script configured`, hasDeployScript ? 'green' : 'red');
    score += hasDeployScript ? 1 : 0;
    total += 1;
  } catch {
    log('  ❌ Could not read package.json', 'red');
    total += 2;
  }

  // Check documentation sync
  log('\n📚 Documentation System:', 'bold');
  total += 2;
  score += checkFile('scripts/sync-docs.js', 'Documentation sync script') ? 1 : 0;
  score += checkFile('../README.md', 'Main README exists') ? 1 : 0;

  // Check deployment files
  log('\n🚀 Deployment Configuration:', 'bold');
  total += 3;
  score += checkFile('.github/workflows/deploy.yml', 'GitHub Actions workflow') ? 1 : 0;
  score += checkFile('deployment.env.example', 'Environment variables template') ? 1 : 0;
  score += checkFile('../DEPLOYMENT.md', 'Deployment guide') ? 1 : 0;

  // Test build process
  log('\n🧪 Build Test:', 'bold');
  total += 2;
  
  try {
    log('  🔄 Testing documentation sync...', 'blue');
    execSync('node scripts/sync-docs.js', { stdio: 'ignore' });
    log('  ✅ Documentation sync works', 'green');
    score += 1;
  } catch (error) {
    log('  ❌ Documentation sync failed', 'red');
    log(`      Error: ${error.message}`, 'yellow');
  }

  try {
    log('  🔄 Testing build process...', 'blue');
    execSync('npm run build', { stdio: 'ignore' });
    log('  ✅ Build process works', 'green');
    score += 1;
    
    // Check if dist directory was created
    if (existsSync('dist')) {
      log('  ✅ Build output created (dist/)', 'green');
    } else {
      log('  ⚠️  Build completed but no dist/ directory found', 'yellow');
    }
  } catch (error) {
    log('  ❌ Build process failed', 'red');
    log(`      Error: ${error.message}`, 'yellow');
  }

  // Final score
  log(`\n📊 Deployment Readiness Score: ${score}/${total}`, 'bold');
  
  if (score === total) {
    log('🎉 Perfect! Your website is ready for deployment!', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Set up Vercel project (see DEPLOYMENT.md)', 'blue');
    log('  2. Add GitHub secrets', 'blue');
    log('  3. Push to main branch', 'blue');
    log('  4. Your website will be live! 🚀', 'blue');
  } else if (score >= total * 0.8) {
    log('✅ Good! Your website is mostly ready. Fix the issues above.', 'yellow');
  } else {
    log('❌ Your website needs more setup. Check DEPLOYMENT.md for help.', 'red');
  }

  log('\n📖 For detailed instructions, see: DEPLOYMENT.md', 'blue');
}

main().catch(console.error);
