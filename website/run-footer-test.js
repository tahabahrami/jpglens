#!/usr/bin/env node

// jpglens Footer Test Runner
// This script runs the footer analysis test with proper setup

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runFooterTest() {
  console.log('🔍 jpglens Footer Analysis Test');
  console.log('================================\n');
  
  // Check if API key is set
  if (!process.env.JPGLENS_API_KEY) {
    console.log('❌ JPGLENS_API_KEY environment variable is not set!');
    console.log('\n📝 To set up your API key:');
    console.log('1. Copy env.example to .env');
    console.log('2. Add your OpenRouter/OpenAI/Anthropic API key');
    console.log('3. Run: npm run test:footer\n');
    console.log('💡 Example:');
    console.log('   $env:JPGLENS_API_KEY="your-api-key-here"; npm run test:footer');
    console.log('   # or on Unix: JPGLENS_API_KEY="your-api-key-here" npm run test:footer\n');
    return;
  }
  
  console.log('✅ API key found, starting footer analysis...\n');
  
  try {
    console.log('🚀 Running jpglens footer analysis on https://jpglens.dev');
    console.log('📊 This will analyze:');
    console.log('   • Information architecture and link organization');
    console.log('   • Community engagement elements (GitHub, npm)');
    console.log('   • Mobile responsiveness and accessibility');
    console.log('   • Brand consistency and trust signals');
    console.log('   • Call-to-action effectiveness\n');
    
    const { stdout, stderr } = await execAsync('npx playwright test footer-analysis.spec.js --reporter=line');
    
    console.log('📋 Test Output:');
    console.log(stdout);
    
    if (stderr) {
      console.log('⚠️  Warnings/Errors:');
      console.log(stderr);
    }
    
    console.log('\n✅ Footer analysis completed!');
    console.log('📊 Check the jpglens-footer-reports directory for detailed AI insights');
    console.log('🎭 Check the playwright-report directory for test results');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure jpglens.dev is accessible');
    console.log('2. Check your API key is valid');
    console.log('3. Verify internet connection');
    console.log('4. Run: npm run test:debug for detailed debugging');
  }
}

// Run the test
runFooterTest();
