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
  log('🔌 Kết nối Chrome để điền Từ khóa...');
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

  log('1️⃣ Đang điền URL cuối cùng và từ khóa mẫu...');
  const filled = await adsPage.evaluate(() => {
    // Tìm input URL cuối cùng
    const inputs = Array.from(document.querySelectorAll('input'));
    let urlInput = null;
    for (const input of inputs) {
      const label = input.getAttribute('aria-label') || input.placeholder || '';
      if (label.toLowerCase().includes('url') || label.includes('URL')) {
        urlInput = input;
        break;
      }
    }

    if (urlInput) {
      urlInput.value = '';
      urlInput.focus();
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(urlInput, 'https://thongtaccongquangninh.com/');
      urlInput.dispatchEvent(new Event('input', { bubbles: true }));
      urlInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Tìm textarea nhập từ khóa
    const textareas = Array.from(document.querySelectorAll('textarea'));
    let kwTextarea = null;
    for (const ta of textareas) {
      const label = ta.getAttribute('aria-label') || ta.placeholder || '';
      if (label.toLowerCase().includes('từ khóa') || label.toLowerCase().includes('keyword') || label.includes('dán từ khoá') || label.includes('dán từ khóa')) {
        kwTextarea = ta;
        break;
      }
    }

    if (kwTextarea) {
      kwTextarea.value = '';
      kwTextarea.focus();
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(kwTextarea, 'thông tắc cống\nhút bể phốt\nthông bồn cầu');
      kwTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      kwTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    }

    return {
      urlInputFound: !!urlInput,
      kwTextareaFound: !!kwTextarea
    };
  });
  
  log(`✅ Kết quả điền: ${JSON.stringify(filled)}`);
  await new Promise(r => setTimeout(r, 2000));

  // Click Tiếp tục
  log('2️⃣ Click Tiếp tục chuyển sang bước viết Quảng cáo...');
  const clickedNext = await adsPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase();
      if (text === 'tiếp tục' || text === 'continue' || text === 'next' || text === 'tiếp') {
        const style = window.getComputedStyle(btn);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          btn.click();
          return `Đã click button: "${btn.textContent?.trim()}"`;
        }
      }
    }
    return 'Không tìm thấy nút Tiếp tục';
  });
  log(`✅ Kết quả click: ${clickedNext}`);

  await new Promise(r => setTimeout(r, 4000));

  // Chụp ảnh màn hình mới
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const shotPath = path.join(SCREENSHOTS_DIR, '10_after_keywords.png');
  await adsPage.screenshot({ path: shotPath });
  log(`📸 Đã lưu ảnh màn hình mới tại: ${shotPath}`);
}

main().catch(console.error);
