import { chromium } from 'playwright';

async function takeScreenshots() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        // Homepage screenshot
        console.log('📸 Taking homepage screenshot...');
        await page.goto('https://jpglens.dev', { waitUntil: 'networkidle' });
        await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
        
        // Docs page screenshot
        console.log('📸 Taking docs page screenshot...');
        await page.goto('https://jpglens.dev/docs', { waitUntil: 'networkidle' });
        await page.screenshot({ path: 'docs-screenshot.png', fullPage: true });
        
        console.log('✅ Screenshots saved!');
    } catch (error) {
        console.error('❌ Screenshot failed:', error);
    } finally {
        await browser.close();
    }
}

takeScreenshots();
