// Minimal test to isolate the jpglens issue
import { chromium } from 'playwright';

async function testMinimal() {
  console.log('🔍 Minimal jpglens test...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://jpglens.dev');
    
    // Try the most basic import and usage
    console.log('📦 Importing jpglens...');
    const jpglensModule = await import('../jpglens/dist/index.esm.js');
    console.log('✅ Import successful, available exports:', Object.keys(jpglensModule));
    
    // Try creating a basic instance
    console.log('🏗️ Creating JPGLens instance...');
    const jpglens = new jpglensModule.JPGLens({
      ai: {
        provider: 'openrouter',
        model: 'anthropic/claude-3-5-sonnet',
        apiKey: process.env.JPGLENS_API_KEY
      },
      analysis: {
        types: ['usability', 'accessibility', 'visual-design'],
        depth: 'comprehensive'
      }
    });
    console.log('✅ JPGLens instance created');
    
    // Try a basic screenshot analysis
    console.log('📸 Taking screenshot...');
    const screenshotBuffer = await page.screenshot();
    
    // Create proper ScreenshotData object
    const screenshot = {
      buffer: screenshotBuffer,
      path: 'test-screenshot.png',
      metadata: {
        width: 1280,
        height: 720,
        devicePixelRatio: 1,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('🤖 Attempting basic analysis...');
    const result = await jpglens.analyze(screenshot, {
      stage: 'test-stage',
      userIntent: 'test jpglens functionality',
      userContext: {
        persona: 'developer',
        device: 'desktop',
        expertise: 'intermediate'
      }
    });
    
    console.log('✅ Analysis successful!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    // Check if it's an API key issue
    if (error.message?.includes('API key') || error.message?.includes('apiKey')) {
      console.log('🔑 API Key issue detected');
    }
    
    // Check if it's a provider issue
    if (error.message?.includes('provider') || error.message?.includes('openrouter')) {
      console.log('🌐 Provider configuration issue detected');
    }
    
    // Check if it's the specific 'includes' error
    if (error.message?.includes('includes')) {
      console.log('🐛 This is the "includes" error - likely a bug in jpglens package');
      console.log('💡 The jpglens package is trying to call .includes() on an undefined variable');
    }
  } finally {
    await browser.close();
  }
}

testMinimal();
