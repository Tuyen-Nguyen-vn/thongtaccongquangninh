import puppeteer from 'puppeteer-core';

async function main() {
  console.log('Connecting to Chrome...');
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  });
  
  const pages = await browser.pages();
  let adsPage = null;
  for (const p of pages) {
    if (p.url().includes('ads.google.com')) {
      adsPage = p;
      break;
    }
  }
  
  if (!adsPage) {
    console.log('No active setup page found.');
    process.exit(1);
  }
  
  const issues = await adsPage.evaluate(() => {
    // Tìm các phần tử chứa thông báo lỗi / cảnh báo
    // Thường nằm trong các thẻ dạng alert, card, error-text, hoặc các item có icon lỗi (như error, warning)
    const elements = Array.from(document.querySelectorAll('*'));
    
    const results = [];
    
    // Tìm các đoạn text có chứa từ khóa liên quan đến lỗi hoặc cảnh báo
    elements.forEach(el => {
      const text = el.textContent?.trim() || '';
      if (
        (text.includes('Khắc phục') || text.includes('vấn đề') || text.includes('lỗi') || text.includes('Error') || text.includes('Fix') || text.includes('thiếu') || text.includes('Missing')) &&
        text.length > 5 && text.length < 200
      ) {
        // Chỉ lưu phần tử lá (leaf element) để tránh trùng lặp container cha
        const childCount = el.querySelectorAll('*').length;
        if (childCount === 0) {
          results.push({
            tagName: el.tagName,
            className: el.className,
            text
          });
        }
      }
    });
    
    // Tìm cụ thể phần hiển thị tóm tắt lỗi ở sidebar hoặc main area
    const reviewCards = Array.from(document.querySelectorAll('[class*="review"], [class*="card"], [class*="error"], [class*="warning"]'))
      .filter(el => el.textContent?.includes('vấn đề') || el.textContent?.includes('Khắc phục'))
      .map(el => ({
        tagName: el.tagName,
        className: el.className,
        text: el.textContent?.trim().substring(0, 300) || ''
      }))
      .slice(0, 10);
      
    return { leafErrors: results, reviewCards };
  });
  
  console.log('--- LEAF ERROR TEXTS ---');
  issues.leafErrors.forEach((err, idx) => {
    console.log(`${idx + 1}. [${err.tagName}.${err.className}] -> "${err.text}"`);
  });
  
  console.log('\n--- REVIEW CARDS ---');
  issues.reviewCards.forEach((c, idx) => {
    console.log(`${idx + 1}. [${c.tagName}.${c.className}] -> "${c.text}"`);
  });
  
  await browser.disconnect();
}

main().catch(console.error);
