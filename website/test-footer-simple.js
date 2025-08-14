// Simple footer test without AI analysis to verify footer functionality
import { chromium } from 'playwright';

async function testFooterSimple() {
  console.log('🔍 Simple Footer Test (No AI Analysis)...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to https://jpglens.dev...');
    await page.goto('https://jpglens.dev', { waitUntil: 'networkidle' });
    
    console.log('📸 Taking footer screenshot...');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'footer-test.png' });
    
    console.log('🔗 Testing footer links...');
    
    // Test footer structure
    const footer = page.locator('footer');
    const footerExists = await footer.count() > 0;
    console.log(`✅ Footer exists: ${footerExists}`);
    
    // Test footer sections
    const footerSections = page.locator('footer .footer-section');
    const sectionCount = await footerSections.count();
    console.log(`✅ Footer sections: ${sectionCount}`);
    
    // Test GitHub link
    const githubLink = page.locator('footer a[href*="github.com/tahabahrami/jpglens"]:has-text("GitHub")');
    const githubExists = await githubLink.count() > 0;
    console.log(`✅ GitHub link exists: ${githubExists}`);
    
    // Test npm link
    const npmLink = page.locator('footer a[href*="npmjs.com/package/jpglens"]');
    const npmExists = await npmLink.count() > 0;
    console.log(`✅ npm link exists: ${npmExists}`);
    
    // Test docs link
    const docsLink = page.locator('footer a[href="/docs/"]');
    const docsExists = await docsLink.count() > 0;
    console.log(`✅ Docs link exists: ${docsExists}`);
    
    // Test examples link
    const examplesLink = page.locator('footer a[href="/examples/"]');
    const examplesExists = await examplesLink.count() > 0;
    console.log(`✅ Examples link exists: ${examplesExists}`);
    
    // Test comparison link
    const comparisonLink = page.locator('footer a[href="/comparison/"]');
    const comparisonExists = await comparisonLink.count() > 0;
    console.log(`✅ Comparison link exists: ${comparisonExists}`);
    
    // Test footer brand
    const footerBrand = page.locator('footer .footer-brand');
    const brandExists = await footerBrand.count() > 0;
    console.log(`✅ Footer brand exists: ${brandExists}`);
    
    // Test footer bottom
    const footerBottom = page.locator('footer .footer-bottom');
    const bottomExists = await footerBottom.count() > 0;
    console.log(`✅ Footer bottom exists: ${bottomExists}`);
    
    console.log('\n🎉 Footer Structure Analysis:');
    console.log('=================================');
    console.log(`Footer sections: ${sectionCount}`);
    console.log(`GitHub link: ${githubExists ? '✅' : '❌'}`);
    console.log(`npm link: ${npmExists ? '✅' : '❌'}`);
    console.log(`Docs link: ${docsExists ? '✅' : '❌'}`);
    console.log(`Examples link: ${examplesExists ? '✅' : '❌'}`);
    console.log(`Comparison link: ${comparisonExists ? '✅' : '❌'}`);
    console.log(`Footer brand: ${brandExists ? '✅' : '❌'}`);
    console.log(`Footer bottom: ${bottomExists ? '✅' : '❌'}`);
    
    console.log('\n✅ Footer test completed successfully!');
    console.log('📸 Screenshot saved as footer-test.png');
    
  } catch (error) {
    console.error('❌ Footer test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testFooterSimple();

