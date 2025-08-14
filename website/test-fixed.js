// Fixed jpglens test with proper screenshot format
import { chromium } from 'playwright';

async function testFixed() {
  console.log('🔍 Testing jpglens with proper screenshot format...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://jpglens.dev', { waitUntil: 'networkidle' });
    
    console.log('📦 Importing jpglens...');
    const jpglensModule = await import('jpglens');
    
    console.log('🏗️ Creating JPGLens instance...');
    const jpglens = new jpglensModule.JPGLens({
      ai: {
        provider: 'openrouter',
        model: 'anthropic/claude-3-5-sonnet',
        apiKey: process.env.JPGLENS_API_KEY
      }
    });
    
    console.log('📸 Taking screenshot with proper format...');
    // Save screenshot to file path instead of buffer
    const screenshotPath = 'test-screenshot.png';
    await page.screenshot({ path: screenshotPath });
    
    console.log('🤖 Attempting analysis with file path...');
    const result = await jpglens.analyze({
      screenshot: screenshotPath,  // Use file path instead of buffer
      context: {
        userIntent: 'test jpglens functionality',
        currentPage: 'homepage',
        device: 'desktop'
      },
      analysisType: 'ui-functionality'
    });
    
    console.log('✅ Analysis successful!');
    console.log('Result summary:', {
      score: result.score,
      findings: result.findings?.length || 0,
      recommendations: result.recommendations?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Message:', error.message);
    
    if (error.message?.includes('pageInfo')) {
      console.log('🐛 Confirmed: This is the pageInfo bug in jpglens package');
      console.log('💡 The jpglens package needs to be fixed to handle undefined pageInfo');
    }
  } finally {
    await browser.close();
  }
}

testFixed();
