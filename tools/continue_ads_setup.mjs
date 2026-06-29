import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '_tmp', 'ads-screenshots');

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('vi-VN')}] ${msg}`);
}

async function main() {
  log('🔌 Kết nối Chrome để tiếp tục setup...');
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
    log('❌ Không tìm thấy tab Google Ads đang mở.');
    return;
  }

  await adsPage.bringToFront();
  
  // 1. Click nút Hủy (Cancel) trên popup "Thêm nguyên tắc về văn bản" nếu nó đang mở
  log('1️⃣ Đang đóng popup "Thêm nguyên tắc về văn bản"...');
  const modalClosed = await adsPage.evaluate(() => {
    // Tìm button Hủy hoặc nút X đóng
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button, span, div'));
    
    // Thử click nút "Hủy" chính xác trước
    for (const btn of buttons) {
      const text = btn.textContent?.trim();
      if (text === 'Hủy' || text === 'Cancel') {
        btn.click();
        return 'Đã click nút "Hủy" để đóng popup';
      }
    }
    
    // Thử click nút Đóng (X)
    const closeBtn = document.querySelector('[aria-label*="Đóng"], [aria-label*="Close"], [class*="close-button"], [class*="dismiss"]');
    if (closeBtn) {
      closeBtn.click();
      return 'Đã click nút X để đóng popup';
    }
    
    return 'Không tìm thấy popup cần đóng, có thể nó đã được đóng hoặc không có.';
  });
  log(`✅ Kết quả: ${modalClosed}`);
  await new Promise(r => setTimeout(r, 2000));

  // 2. Click nút Tiếp tục trên trang chính để chuyển sang bước tiếp theo
  log('2️⃣ Đang click nút "Tiếp tục" trên trang chính...');
  const mainContinued = await adsPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase();
      // Tìm button Tiếp tục / Continue không nằm trong modal/popup (thường là button chính ở thanh dưới cùng)
      if (text === 'tiếp tục' || text === 'continue' || text === 'next' || text === 'tiếp') {
        // Kiểm tra xem button này có hiển thị không
        const style = window.getComputedStyle(btn);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          btn.click();
          return `Đã click nút Tiếp tục chính: "${btn.textContent?.trim()}"`;
        }
      }
    }
    return 'Không tìm thấy nút Tiếp tục hiển thị trên trang chính.';
  });
  log(`✅ Kết quả: ${mainContinued}`);

  await new Promise(r => setTimeout(r, 4000));
  
  // Chụp ảnh kết quả
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const shotPath = path.join(SCREENSHOTS_DIR, '08_after_maximizing_ai.png');
  await adsPage.screenshot({ path: shotPath });
  log(`📸 Đã lưu ảnh màn hình mới tại: ${shotPath}`);
}

main().catch(console.error);
