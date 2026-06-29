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
  log('🔌 Kết nối Chrome để sửa tên chiến dịch và xuất bản...');
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

  log('1️⃣ Đang điền tên chiến dịch chính xác vào ô nhập liệu...');
  const nameFixed = await adsPage.evaluate(() => {
    // Tìm tất cả các thẻ input trên trang
    const inputs = Array.from(document.querySelectorAll('input'));
    let nameInput = null;
    
    for (const input of inputs) {
      const val = input.value || '';
      // Tìm input có giá trị hiện tại chứa tên chiến dịch
      if (val.includes('QN_Search_Leads_ThongTac') || val.includes('ThongTac-HutBePot')) {
        nameInput = input;
        break;
      }
    }

    // Nếu không tìm thấy bằng value, tìm input ở phần tên chiến dịch
    if (!nameInput) {
      for (const input of inputs) {
        const parent = input.closest('[class*="name"], [class*="title"], [class*="campaign"]');
        if (parent) {
          nameInput = input;
          break;
        }
      }
    }

    if (nameInput) {
      nameInput.value = '';
      nameInput.focus();
      // Thiết lập value qua setter bản địa của HTML để kích hoạt change detection của framework (Angular/React)
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(nameInput, 'QN_Search_Leads_ThongTac-HutBePot_HaLong-CamPha_2026');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Trigger blur/focus để tắt thông báo đỏ
      nameInput.blur();
      nameInput.focus();
      return `Đã điền thành công tên chiến dịch vào input: ${nameInput.className}`;
    }
    
    return 'Không tìm thấy ô nhập tên chiến dịch trên trang này.';
  });
  
  log(`✅ Kết quả: ${nameFixed}`);
  await new Promise(r => setTimeout(r, 2000));

  // 2. Chụp màn hình để xem lỗi đỏ đã biến mất chưa
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  let shotPath = path.join(SCREENSHOTS_DIR, '11_campaign_name_fixed.png');
  await adsPage.screenshot({ path: shotPath });
  log(`📸 Đã lưu ảnh màn hình đã sửa tên tại: ${shotPath}`);

  // 3. Cuộn xuống cuối trang và click nút Xuất bản (Publish)
  log('2️⃣ Đang tìm nút "Xuất bản chiến dịch" ở cuối trang...');
  const published = await adsPage.evaluate(() => {
    // Cuộn xuống cuối trang
    window.scrollTo(0, document.body.scrollHeight);
    
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase();
      if (text.includes('xuất bản') || text.includes('publish') || text.includes('hoàn tất') || text.includes('finish')) {
        const style = window.getComputedStyle(btn);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          btn.click();
          return `Đã click nút xuất bản: "${btn.textContent?.trim()}"`;
        }
      }
    }
    return 'Không tìm thấy nút Xuất bản chiến dịch hiển thị';
  });
  log(`✅ Kết quả xuất bản: ${published}`);

  await new Promise(r => setTimeout(r, 5000));

  // 4. Chụp ảnh màn hình cuối cùng sau khi bấm Xuất bản
  shotPath = path.join(SCREENSHOTS_DIR, '12_after_publish.png');
  await adsPage.screenshot({ path: shotPath });
  log(`📸 Đã lưu ảnh màn hình cuối cùng tại: ${shotPath}`);
}

main().catch(console.error);
