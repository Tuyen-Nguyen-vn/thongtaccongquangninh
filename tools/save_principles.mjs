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
  log('🔌 Kết nối Chrome để lưu nguyên tắc văn bản...');
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
    log('❌ Không tìm thấy tab Google Ads.');
    return;
  }

  // Click nút "Lưu" (Save) màu xanh trong drawer
  log('1️⃣ Đang click nút "Lưu" trong drawer...');
  const clickedSave = await adsPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
    for (const btn of buttons) {
      const text = btn.textContent?.trim();
      // Tìm nút "Lưu" chính xác (màu xanh hoặc chứa chữ Lưu)
      if (text === 'Lưu' || text === 'Save') {
        btn.click();
        return `Đã click nút "${text}"`;
      }
    }
    return 'Không tìm thấy nút Lưu';
  });
  log(`✅ Kết quả: ${clickedSave}`);

  await new Promise(r => setTimeout(r, 3000));

  // Chụp ảnh màn hình mới
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const shotPath = path.join(SCREENSHOTS_DIR, '09_after_saving_principles.png');
  await adsPage.screenshot({ path: shotPath });
  log(`📸 Đã lưu ảnh màn hình mới tại: ${shotPath}`);
}

main().catch(console.error);
