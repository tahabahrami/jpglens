// Simple Playwright jpglens test to isolate the issue
import { chromium } from 'playwright';
import { quickAnalyze } from 'jpglens/playwright';

async function testPlaywrightSimple() {
  console.log('🔍 Simple Playwright jpglens test...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://jpglens.dev');
    await page.waitForLoadState('networkidle');
    
    console.log('🤖 Testing quickAnalyze...');
    
    // Test the simplest possible quickAnalyze call
    const result = await quickAnalyze(page, {
      focus: 'test',
      context: 'simple test',
      analysisType: 'ui-functionality'
    });
    
    console.log('✅ quickAnalyze succeeded!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    // Check for the specific 'includes' error
    if (error.message?.includes('includes')) {
      console.log('🐛 This is the "includes" error');
      console.log('💡 The error is likely in the AI provider or console formatter');
    }
  } finally {
    await browser.close();
  }
}

testPlaywrightSimple();

