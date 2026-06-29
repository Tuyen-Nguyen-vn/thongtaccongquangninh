import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '_tmp', 'ads-screenshots');

function log(msg) {
  const ts = new Date().toLocaleTimeString('vi-VN');
  console.log(`[${ts}] ${msg}`);
}

async function screenshot(page, name) {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath });
  log(`📸 Screenshot: ${filePath}`);
  return filePath;
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  log('🚀 Bắt đầu xử lý hộp thoại bản nháp...');
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  });
  
  const pages = await browser.pages();
  let adsPage = null;
  for (const p of pages) {
    if (p.url().includes('/campaigns/new') || p.url().includes('/setup')) {
      adsPage = p;
      break;
    }
  }
  
  if (!adsPage) {
    log('❌ Không tìm thấy tab tạo chiến dịch.');
    process.exit(1);
  }
  
  log(`✅ Kết nối thành công: ${adsPage.url()}`);
  await adsPage.bringToFront();
  
  // Click nút "Bắt đầu chiến dịch mới"
  log('👉 Tìm nút "Bắt đầu chiến dịch mới"...');
  const btnClicked = await adsPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button, div, span'));
    const btn = buttons.find(b => b.textContent?.trim() === 'Bắt đầu chiến dịch mới' || b.textContent?.trim() === 'Start new campaign');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });
  
  if (btnClicked.found) {
    log(`✅ Click nút Bắt đầu chiến dịch mới tại (${btnClicked.x}, ${btnClicked.y})`);
    await adsPage.mouse.click(btnClicked.x, btnClicked.y);
    await delay(10000); // Đợi trang tiếp theo load
    await screenshot(adsPage, '13_after_start_new_campaign');
  } else {
    log('❌ Không tìm thấy nút "Bắt đầu chiến dịch mới".');
  }
  
  await browser.disconnect();
}

main().catch(console.error);
