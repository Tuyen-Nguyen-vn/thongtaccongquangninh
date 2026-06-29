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
  log('🚀 Bắt đầu chọn loại chiến dịch (dùng scrollIntoView)...');
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
  
  // Tìm và cuộn card "Tìm kiếm" vào giữa màn hình
  log('👉 Tìm và cuộn card "Tìm kiếm" vào view...');
  const searchScroll = await adsPage.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('div, span, p, h3, h4'));
    const target = elements.find(el => el.textContent?.trim() === 'Tìm kiếm' || el.textContent?.trim() === 'Search');
    if (target) {
      const clickable = target.closest('[role="button"]') || target.closest('[role="radio"]') || target.closest('material-button') || target.closest('[class*="card"]') || target;
      clickable.scrollIntoView({ block: 'center', inline: 'center' });
      return { found: true };
    }
    return { found: false };
  });
  
  if (searchScroll.found) {
    log('✅ Đã ra lệnh cuộn card Tìm kiếm.');
    await delay(3000); // Đợi cuộn xong
    await screenshot(adsPage, '06_scrolled_to_search');
    
    // Lấy lại tọa độ card "Tìm kiếm" sau khi cuộn
    const searchCoords = await adsPage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div, span, p, h3, h4'));
      const target = elements.find(el => el.textContent?.trim() === 'Tìm kiếm' || el.textContent?.trim() === 'Search');
      if (target) {
        const clickable = target.closest('[role="button"]') || target.closest('[role="radio"]') || target.closest('material-button') || target.closest('[class*="card"]') || target;
        const rect = clickable.getBoundingClientRect();
        return {
          found: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
      return { found: false };
    });
    
    if (searchCoords.found) {
      log(`✅ Click card Tìm kiếm tại tọa độ mới: (${searchCoords.x}, ${searchCoords.y})`);
      await adsPage.mouse.click(searchCoords.x, searchCoords.y);
      await delay(3000);
      await screenshot(adsPage, '07_after_search_click');
      
      // Cuộn đến nút "Tiếp tục" tiếp theo ở dưới cùng
      log('👉 Tìm và cuộn đến nút "Tiếp tục" tiếp theo...');
      const btnScroll = await adsPage.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
        const btn = buttons.find(b => b.textContent?.trim() === 'Tiếp tục' || b.textContent?.trim() === 'Continue');
        if (btn) {
          btn.scrollIntoView({ block: 'center' });
          return { found: true };
        }
        return { found: false };
      });
      
      if (btnScroll.found) {
        log('✅ Đã ra lệnh cuộn đến nút Tiếp tục.');
        await delay(3000);
        await screenshot(adsPage, '08_scrolled_to_continue_btn');
        
        // Lấy tọa độ nút Tiếp tục mới để click
        const btnCoords = await adsPage.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
          const btn = buttons.find(b => b.textContent?.trim() === 'Tiếp tục' || b.textContent?.trim() === 'Continue');
          if (btn) {
            const rect = btn.getBoundingClientRect();
            return {
              found: true,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
          }
          return { found: false };
        });
        
        if (btnCoords.found) {
          log(`✅ Click nút Tiếp tục tại tọa độ mới: (${btnCoords.x}, ${btnCoords.y})`);
          await adsPage.mouse.click(btnCoords.x, btnCoords.y);
          await delay(8000); // Đợi load trang tiếp theo
          await screenshot(adsPage, '09_campaign_settings_loaded');
        } else {
          log('❌ Không lấy được tọa độ nút Tiếp tục.');
        }
      } else {
        log('❌ Không tìm thấy nút "Tiếp tục" để cuộn.');
      }
      
    } else {
      log('❌ Không lấy được tọa độ card Tìm kiếm sau khi cuộn.');
    }
  } else {
    log('❌ Không tìm thấy card "Tìm kiếm" để cuộn.');
  }
  
  await browser.disconnect();
}

main().catch(console.error);
