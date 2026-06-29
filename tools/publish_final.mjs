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
  log('🔌 Kết nối Chrome để xuất bản chiến dịch cuối cùng...');
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

  log('1️⃣ Đợi kiểm tra lỗi hoàn tất và cuộn xuống cuối...');
  await new Promise(r => setTimeout(r, 4000)); // Đợi thêm cho hệ thống kiểm tra xong
  
  const scrolled = await adsPage.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
    return 'Đã cuộn xuống cuối trang';
  });
  log(`✅ ${scrolled}`);

  // Chụp ảnh để xem giao diện nút bấm cuối trang
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  let shotPath = path.join(SCREENSHOTS_DIR, '12_scrolled_to_bottom.png');
  await adsPage.screenshot({ path: shotPath });
  log(`📸 Đã lưu ảnh màn hình cuối trang tại: ${shotPath}`);

  log('2️⃣ Tìm và click nút Xuất bản (Publish)...');
  const clicked = await adsPage.evaluate(() => {
    // Tìm tất cả các button
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
    
    // Tìm nút chứa từ khóa "xuất bản" hoặc "publish" trước
    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase();
      if (text.includes('xuất bản') || text.includes('publish') || text.includes('hoàn tất') || text.includes('finish') || text === 'tiếp tục') {
        const style = window.getComputedStyle(btn);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          btn.click();
          return `Đã click button xuất bản: "${btn.textContent?.trim()}"`;
        }
      }
    }

    // Nếu không tìm thấy, click bất kỳ button nào màu xanh ở dưới cùng bên phải
    // Thường có class 'blue' hoặc vị trí bên phải
    return 'Không tìm thấy nút Xuất bản nào hiển thị';
  });
  log(`✅ Kết quả: ${clicked}`);

  await new Promise(r => setTimeout(r, 5000));

  // Chụp ảnh kết quả cuối cùng
  shotPath = path.join(SCREENSHOTS_DIR, '13_after_final_publish_click.png');
  await adsPage.screenshot({ path: shotPath });
  log(`📸 Đã lưu ảnh màn hình sau khi click tại: ${shotPath}`);
}

main().catch(console.error);
