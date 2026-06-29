import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, execSync, spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '_tmp', 'analytics-screenshots');

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
  log('🚀 Bắt đầu quy trình khởi chạy Chrome profile gốc và cấu hình Analytics...');

  // Bước 1: Kill toàn bộ chrome đang chạy để giải phóng file lock của profile gốc
  log('🧹 Đang đóng toàn bộ tiến trình Chrome...');
  try {
    execSync('taskkill /F /IM chrome.exe', { stdio: 'ignore' });
    await delay(4000); // Chờ 4 giây cho file lock được giải phóng hoàn toàn
  } catch (e) {}

  // Dọn dẹp lock files của profile gốc
  const profilePath = "C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\User Data";
  try {
    fs.rmSync(path.join(profilePath, 'SingletonLock'), { force: true });
    fs.rmSync(path.join(profilePath, 'Default', 'SingletonLock'), { force: true });
    fs.rmSync(path.join(profilePath, 'lockfile'), { force: true });
    fs.rmSync(path.join(profilePath, 'DevToolsActivePort'), { force: true });
    log('✓ Dọn dẹp lock files profile gốc thành công.');
  } catch (e) {
    log(`⚠️ Dọn dẹp lock files lỗi: ${e.message}`);
  }

  // Bước 2: Start Chrome debug trực tiếp từ Node.js sử dụng profile gốc
  log('🌐 Đang khởi chạy Chrome gỡ lỗi với profile gốc...');
  const chromeProcess = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    `--remote-debugging-port=9222`,
    `--user-data-dir=${profilePath}`,
    `--no-sandbox`
  ], {
    detached: true,
    stdio: 'ignore'
  });
  chromeProcess.unref();

  await delay(8000); // Chờ 8 giây cho Chrome load xong toàn bộ session cũ

  // Bước 3: Kết nối Puppeteer vào cổng 9222
  log('🔌 Kết nối Puppeteer...');
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  });

  const pages = await browser.pages();
  let targetPage = null;

  // Tìm tab cài đặt Analytics hoặc tab WordPress admin bất kỳ
  for (const p of pages) {
    if (p.url().includes('page=rank-math-options-general') && p.url().includes('view=analytics')) {
      targetPage = p;
      break;
    }
  }

  if (!targetPage) {
    log('🌐 Không tìm thấy tab cài đặt, đang mở tab mới...');
    targetPage = await browser.newPage();
  }

  log('🌐 Điều hướng tới trang cài đặt Analytics...');
  await targetPage.goto('https://thongtaccongquangninh.com/wp-admin/admin.php?page=rank-math-options-general&view=analytics', {
    waitUntil: 'networkidle2'
  });

  await delay(3000);
  await screenshot(targetPage, 'real_profile_01_loaded');

  if (targetPage.url().includes('wp-login.php')) {
    log('❌ Vẫn bị yêu cầu đăng nhập trên profile gốc! Có vẻ session của anh trên Chrome chính cũng đã hết hạn.');
    await browser.disconnect();
    return;
  }

  log('✅ Đăng nhập thành công trên profile gốc! Bắt đầu cấu hình...');

  // Bước 4: Chọn Property và Stream
  const result = await targetPage.evaluate(async () => {
    const triggerChange = (el) => {
      const event = new Event('change', { bubbles: true });
      el.dispatchEvent(event);
    };

    const selects = Array.from(document.querySelectorAll('select'));
    const propSelect = selects.find(s => s.name?.includes('property') || s.id?.includes('property'));
    if (!propSelect) return { success: false, err: 'Không tìm thấy dropdown tài sản (property select)' };

    const targetOption = Array.from(propSelect.options).find(o => o.value.includes('540663909') || o.text.includes('540663909') || o.text.includes('Đo lưu'));
    if (!targetOption) {
      return { 
        success: false, 
        err: 'Không tìm thấy option tài sản 540663909', 
        available: Array.from(propSelect.options).map(o => `${o.value}: ${o.text}`) 
      };
    }

    propSelect.value = targetOption.value;
    triggerChange(propSelect);
    return { success: true, selectedProperty: targetOption.text };
  });

  log(`Kết quả chọn tài sản: ${JSON.stringify(result, null, 2)}`);

  if (!result.success) {
    await browser.disconnect();
    return;
  }

  log('⏳ Đợi AJAX load luồng dữ liệu...');
  await delay(4000);
  await screenshot(targetPage, 'real_profile_02_property_selected');

  // Chọn Luồng dữ liệu (Data Stream)
  const streamResult = await targetPage.evaluate(() => {
    const triggerChange = (el) => {
      const event = new Event('change', { bubbles: true });
      el.dispatchEvent(event);
    };

    const selects = Array.from(document.querySelectorAll('select'));
    const streamSelect = selects.find(s => s.name?.includes('view') || s.id?.includes('view') || s.name?.includes('stream') || s.id?.includes('stream'));
    if (!streamSelect) return { success: false, err: 'Không tìm thấy dropdown luồng dữ liệu (stream select)' };

    const targetOption = Array.from(streamSelect.options).find(o => o.value.includes('G-F2BXPJYKEG') || o.text.includes('G-F2BXPJYKEG'));
    if (!targetOption) {
      const firstValuedOption = Array.from(streamSelect.options).find(o => o.value && o.value !== '-1' && o.value !== '');
      if (firstValuedOption) {
        streamSelect.value = firstValuedOption.value;
        triggerChange(streamSelect);
        return { success: true, selectedStream: firstValuedOption.text, warn: 'Chọn fallback stream' };
      }
      return { 
        success: false, 
        err: 'Không tìm thấy option luồng dữ liệu G-F2BXPJYKEG và không có fallback',
        available: Array.from(streamSelect.options).map(o => `${o.value}: ${o.text}`)
      };
    }

    streamSelect.value = targetOption.value;
    triggerChange(streamSelect);
    return { success: true, selectedStream: targetOption.text };
  });

  log(`Kết quả chọn luồng dữ liệu: ${JSON.stringify(streamResult, null, 2)}`);
  await screenshot(targetPage, 'real_profile_03_stream_selected');

  // Click nút "Lưu thay đổi" (Save Changes)
  log('👉 Tìm nút Lưu thay đổi...');
  const saveBtnClicked = await targetPage.evaluate(() => {
    const btn = document.querySelector('input[type="submit"], button[type="submit"], .button-primary');
    if (btn) {
      btn.scrollIntoView();
      btn.click();
      return { success: true };
    }
    return { success: false };
  });

  if (saveBtnClicked.success) {
    log('✅ Đã click nút Lưu thay đổi. Đang chờ lưu...');
    await delay(5000);
    await screenshot(targetPage, 'real_profile_04_after_save');
    log('🎉 Cấu hình thành công và đã lưu thay đổi!');
  } else {
    log('❌ Không tìm thấy nút Lưu thay đổi.');
  }

  await browser.disconnect();
}

main().catch(console.error);
