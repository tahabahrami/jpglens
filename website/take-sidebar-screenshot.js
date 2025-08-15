import { chromium } from 'playwright';

async function takeScreenshot() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Go to the docs page
    await page.goto('https://www.jpglens.dev/docs');
    await page.waitForLoadState('networkidle');
    
    // Wait for sidebar to load
    await page.waitForSelector('.docs-sidebar', { timeout: 10000 });
    
    // Take screenshot of just the sidebar
    const sidebar = await page.locator('.docs-sidebar');
    await sidebar.screenshot({ path: 'docs-sidebar-screenshot.png' });
    
    // Also take full page screenshot for context
    await page.screenshot({ path: 'docs-full-page-screenshot.png', fullPage: true });
    
    await browser.close();
    console.log('✅ Screenshots saved!');
    console.log('📸 docs-sidebar-screenshot.png - Sidebar only');
    console.log('📸 docs-full-page-screenshot.png - Full page');
}

takeScreenshot().catch(console.error);
