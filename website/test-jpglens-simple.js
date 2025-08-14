// Simple jpglens test to debug the configuration issue
import { chromium } from 'playwright';

async function testJpglensBasic() {
  console.log('🔍 Testing jpglens basic functionality...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to jpglens.dev...');
    await page.goto('https://jpglens.dev', { waitUntil: 'networkidle' });
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'test-screenshot.png' });
    
    console.log('🤖 Testing jpglens import...');
    try {
      // Test different import methods
      console.log('Trying quickAnalyze import...');
      const { quickAnalyze } = await import('jpglens/playwright');
      console.log('✅ quickAnalyze imported successfully');
      
      console.log('Trying basic analysis...');
      await quickAnalyze(page, {
        focus: 'basic-test',
        context: 'Testing if jpglens works',
        analysisType: 'ui-functionality'
      });
      
      console.log('✅ jpglens analysis completed successfully!');
      
    } catch (importError) {
      console.error('❌ jpglens import/analysis error:', importError);
      console.log('\n🔧 Debug info:');
      console.log('- API Key set:', !!process.env.JPGLENS_API_KEY);
      console.log('- API Key length:', process.env.JPGLENS_API_KEY?.length || 0);
      
      // Test if it's a configuration issue
      console.log('\n🧪 Testing with basic config...');
      try {
        const { JPGLens } = await import('jpglens');
        const jpglens = await JPGLens.create({
          ai: {
            provider: 'openrouter',
            model: 'anthropic/claude-3-5-sonnet',
            apiKey: process.env.JPGLENS_API_KEY
          }
        });
        console.log('✅ JPGLens instance created successfully');
      } catch (configError) {
        console.error('❌ JPGLens configuration error:', configError);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testJpglensBasic();
