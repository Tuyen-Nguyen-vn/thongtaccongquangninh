const puppeteer = require('puppeteer');
const fs = require('fs');

async function debugRentry() {
    console.log("Debug Rentry.co...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
        await page.goto("https://rentry.co/", { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Chụp ảnh màn hình để xem có bị Cloudflare block không
        await page.screenshot({ path: 'D:\\.thongtaccongquangninh\\docs\\rentry_debug.png' });
        console.log("[+] Chụp màn hình xong, lưu tại docs/rentry_debug.png");
        
        // In ra các thẻ textarea và input hiện có trên trang
        const elements = await page.evaluate(() => {
            const textareas = Array.from(document.querySelectorAll('textarea')).map(el => ({
                id: el.id,
                name: el.name,
                class: el.className
            }));
            const inputs = Array.from(document.querySelectorAll('input')).map(el => ({
                id: el.id,
                name: el.name,
                type: el.type,
                class: el.className
            }));
            const bodyText = document.body.innerText.substring(0, 500);
            return { textareas, inputs, bodyText };
        });
        
        console.log("Textareas found:", elements.textareas);
        console.log("Inputs found:", elements.inputs);
        console.log("Body text snippet:", elements.bodyText);
        
    } catch (e) {
        console.error("Lỗi debug:", e.message);
    } finally {
        await browser.close();
    }
}

debugRentry();
