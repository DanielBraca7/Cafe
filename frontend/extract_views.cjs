const { chromium } = require('playwright');

async function run() {
    console.log("Launching browser...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log("Logging in...");
    await page.goto('https://padelpro.2getherrewards.com/login');
    await page.waitForTimeout(3000);
    await page.fill('input[type="email"]', 'u3058171184@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(6000);

    const urls = [
        { name: 'designer', url: 'https://padelpro.2getherrewards.com/designer/loyalty' },
        { name: 'scan', url: 'https://padelpro.2getherrewards.com/scan' },
        { name: 'gift_cards', url: 'https://padelpro.2getherrewards.com/gift-cards' }
    ];

    for (const item of urls) {
        console.log(`Navigating to ${item.name} (${item.url})...`);
        await page.goto(item.url);
        await page.waitForTimeout(6000); // Wait for animations / charts to load
        
        const path = `C:\\Users\\Daniel\\.gemini\antigravity-ide\\brain\\f5c8cecc-1a3b-4f0d-bc4b-5ef46aea710c\\${item.name}_view.png`;
        await page.screenshot({ path, fullPage: false });
        console.log(`Screenshot saved to: ${path}`);
    }

    await browser.close();
    console.log("Done extracting views!");
}

run().catch(err => {
    console.error("Error extracting views:", err);
});
