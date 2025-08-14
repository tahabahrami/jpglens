// Quick website debug script to take screenshots and analyze issues
import { chromium } from 'playwright';
import { quickAnalyze } from 'jpglens/playwright';

async function debugWebsite() {
  console.log('🔍 Debugging jpglens.dev website...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the website
    console.log('📱 Navigating to https://jpglens.dev...');
    await page.goto('https://jpglens.dev', { waitUntil: 'networkidle' });
    
    // Take a full page screenshot first
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: 'website-full-page.png', 
      fullPage: true 
    });
    
    // Take a screenshot of just the header/navigation
    console.log('📸 Taking navigation screenshot...');
    const nav = page.locator('nav, .navbar, header');
    await nav.screenshot({ path: 'website-navigation.png' });
    
    // Take a screenshot of the footer
    console.log('📸 Taking footer screenshot...');
    await page.locator('footer').scrollIntoViewIfNeeded();
    const footer = page.locator('footer');
    await footer.screenshot({ path: 'website-footer.png' });
    
    // Analyze the navigation issues
    console.log('🤖 Analyzing navigation with jpglens...');
    await quickAnalyze(page, {
      focus: 'navigation-functionality-and-design',
      context: 'Check if navigation links work and if the UI layout is broken',
      analysisType: 'ui-functionality'
    });
    
    // Test clicking on navigation links
    console.log('🔗 Testing navigation links...');
    
    // Test docs link
    try {
      await page.click('a[href="/docs/"]');
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`📍 Docs link leads to: ${currentUrl}`);
      
      if (currentUrl.includes('404') || currentUrl === 'https://jpglens.dev/') {
        console.log('❌ Docs link is broken!');
      } else {
        console.log('✅ Docs link works');
      }
    } catch (error) {
      console.log('❌ Error clicking docs link:', error.message);
    }
    
    // Go back to home
    await page.goto('https://jpglens.dev');
    
    // Test examples link
    try {
      await page.click('a[href="/examples/"]');
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`📍 Examples link leads to: ${currentUrl}`);
      
      if (currentUrl.includes('404') || currentUrl === 'https://jpglens.dev/') {
        console.log('❌ Examples link is broken!');
      } else {
        console.log('✅ Examples link works');
      }
    } catch (error) {
      console.log('❌ Error clicking examples link:', error.message);
    }
    
    // Go back to home
    await page.goto('https://jpglens.dev');
    
    // Test comparison link
    try {
      await page.click('a[href="/comparison/"]');
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`📍 Comparison link leads to: ${currentUrl}`);
      
      if (currentUrl.includes('404') || currentUrl === 'https://jpglens.dev/') {
        console.log('❌ Comparison link is broken!');
      } else {
        console.log('✅ Comparison link works');
      }
    } catch (error) {
      console.log('❌ Error clicking comparison link:', error.message);
    }
    
    // Go back to home and analyze footer
    await page.goto('https://jpglens.dev');
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    console.log('🤖 Analyzing footer with jpglens...');
    await quickAnalyze(page, {
      focus: 'footer-ui-layout-and-functionality',
      context: 'Check if footer layout is broken and links are working properly',
      analysisType: 'ui-design-issues'
    });
    
    console.log('\n✅ Debug analysis complete!');
    console.log('📸 Screenshots saved:');
    console.log('  - website-full-page.png');
    console.log('  - website-navigation.png');
    console.log('  - website-footer.png');
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugWebsite();
