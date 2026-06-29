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
  log('🚀 Bắt đầu cấu hình Đặt giá thầu (click nâng cao)...');
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
  
  // Thử mở dropdown bằng cách click và gửi phím
  log('👉 Thử các cách mở dropdown...');
  const opened = await adsPage.evaluate(() => {
    const comboboxes = Array.from(document.querySelectorAll('[role="combobox"], div.dropdown, material-select, [class*="select"]'));
    const target = comboboxes.find(cb => cb.textContent?.includes('Lượt chuyển đổi') || cb.textContent?.includes('Conversions'));
    if (target) {
      // Cách 1: Focus và click
      target.focus();
      target.click();
      
      // Cách 2: Tìm phần tử con click (như mũi tên)
      const arrow = target.querySelector('.arrow_drop_down, [class*="arrow"], material-icon');
      if (arrow) {
        arrow.click();
      }
      
      // Cách 3: Thử dispatch events click
      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      return { found: true, text: target.textContent?.trim() };
    }
    return { found: false };
  });
  
  if (opened.found) {
    log(`✅ Đã trigger mở dropdown: "${opened.text}"`);
    
    // Gửi phím Enter / Space phòng hờ
    await adsPage.keyboard.press('Space');
    await delay(3000);
    await screenshot(adsPage, '14_dropdown_opened_advanced');
    
    // Thử tìm các option Lượt nhấp
    const optionsFound = await adsPage.evaluate(() => {
      const all = Array.from(document.querySelectorAll('div, span, material-select-item, [role="option"]'));
      return all.map(el => el.textContent?.trim() || '')
        .filter(t => t.includes('Lượt nhấp') || t.includes('Clicks') || t.includes('Lần nhấp'));
    });
    log(`Các option tìm được: ${JSON.stringify(optionsFound)}`);
    
  } else {
    log('❌ Không tìm thấy dropdown.');
  }
  
  await browser.disconnect();
}

main().catch(console.error);
