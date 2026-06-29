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
  log('🚀 Bắt đầu điền thông tin chiến dịch...');
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
  
  // Click checkbox "Lượt truy cập trang web"
  log('👉 Chọn "Lượt truy cập trang web"...');
  const webChecked = await adsPage.evaluate(() => {
    const checkboxes = Array.from(document.querySelectorAll('material-checkbox, [role="checkbox"]'));
    const cb = checkboxes.find(c => c.textContent?.includes('Lượt truy cập trang web') || c.textContent?.includes('Website visits'));
    if (cb) {
      const rect = cb.getBoundingClientRect();
      return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });
  
  if (webChecked.found) {
    await adsPage.mouse.click(webChecked.x, webChecked.y);
    log('🖱️ Đã click checkbox Lượt truy cập trang web.');
    await delay(1000);
  }
  
  // Click checkbox "Cuộc gọi điện thoại"
  log('👉 Chọn "Cuộc gọi điện thoại"...');
  const callChecked = await adsPage.evaluate(() => {
    const checkboxes = Array.from(document.querySelectorAll('material-checkbox, [role="checkbox"]'));
    const cb = checkboxes.find(c => c.textContent?.includes('Cuộc gọi điện thoại') || c.textContent?.includes('Phone calls'));
    if (cb) {
      const rect = cb.getBoundingClientRect();
      return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });
  
  if (callChecked.found) {
    await adsPage.mouse.click(callChecked.x, callChecked.y);
    log('🖱️ Đã click checkbox Cuộc gọi điện thoại.');
    await delay(2000);
  }
  
  await screenshot(adsPage, '10_checkboxes_selected');
  
  // Quét các input mới xuất hiện
  log('👉 Điền URL trang web và số điện thoại...');
  await adsPage.evaluate(() => {
    // Tìm các input nhập URL và số điện thoại
    const inputs = Array.from(document.querySelectorAll('input'));
    
    // 1. Điền URL trang web (thường là input có type="url" hoặc placeholder chứa "example.com" hoặc "thành phố")
    const urlInput = inputs.find(i => {
      const placeholder = i.getAttribute('placeholder') || '';
      const ariaLabel = i.getAttribute('aria-label') || '';
      return placeholder.includes('example.com') || ariaLabel.includes('Trang web') || ariaLabel.includes('Website') || i.outerHTML.includes('website') || i.outerHTML.includes('url');
    });
    
    if (urlInput) {
      urlInput.value = 'https://thongtaccongquangninh.com/';
      urlInput.dispatchEvent(new Event('input', { bubbles: true }));
      urlInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // 2. Điền Số điện thoại (thường là input có type="tel" hoặc aria-label/placeholder chứa "số điện thoại" hoặc "phone")
    const phoneInput = inputs.find(i => {
      const ariaLabel = i.getAttribute('aria-label') || '';
      const type = i.getAttribute('type') || '';
      return type === 'tel' || ariaLabel.includes('Số điện thoại') || ariaLabel.includes('Phone number');
    });
    
    if (phoneInput) {
      phoneInput.value = '0963953533';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // 3. Đổi tên chiến dịch
    const nameInput = inputs.find(i => {
      const ariaLabel = i.getAttribute('aria-label') || '';
      return ariaLabel.includes('Tên chiến dịch') || ariaLabel.includes('Campaign name');
    });
    
    if (nameInput) {
      nameInput.value = '';
      nameInput.focus();
      // Trigger change detection
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(nameInput, 'QN_Search_Leads_ThongTac-HutBePot_HaLong-CamPha-UongBi-QuangYen_2026');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  await delay(2000);
  await screenshot(adsPage, '11_inputs_filled');
  
  // Click nút "Tiếp tục"
  log('👉 Click nút "Tiếp tục"...');
  const continueClicked = await adsPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
    const btn = buttons.find(b => b.textContent?.trim() === 'Tiếp tục' || b.textContent?.trim() === 'Continue');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });
  
  if (continueClicked.found) {
    await adsPage.mouse.click(continueClicked.x, continueClicked.y);
    log('🖱️ Đã click Tiếp tục.');
    await delay(10000); // Đợi load trang tiếp theo (Bidding hoặc Campaign Settings)
    await screenshot(adsPage, '12_bidding_settings_loaded');
  } else {
    log('❌ Không tìm thấy nút "Tiếp tục" ở cuối trang.');
  }
  
  await browser.disconnect();
}

main().catch(console.error);
