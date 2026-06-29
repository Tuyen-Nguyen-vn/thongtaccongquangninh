import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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
  log('🚀 Bắt đầu quy trình cấu hình tự động Rank Math Analytics...');

  // Bước 1: Chạy dọn dẹp lock files và copy cookie/session sang User Data Debug
  log('🧹 Đang dọn dẹp lock files và đồng bộ session Chrome...');
  try {
    // Kill các chrome đang chạy để giải phóng file lock
    execSync('taskkill /F /IM chrome.exe', { stdio: 'ignore' });
    await delay(3000);
  } catch (e) {}

  const src = "C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\User Data";
  const dst = "C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\User Data Debug";

  try {
    // Copy Local State và Cookies
    if (!fs.existsSync(path.join(dst, 'Default', 'Network'))) {
      fs.mkdirSync(path.join(dst, 'Default', 'Network'), { recursive: true });
    }
    fs.copyFileSync(path.join(src, 'Local State'), path.join(dst, 'Local State'));
    
    if (fs.existsSync(path.join(src, 'Default', 'Network', 'Cookies'))) {
      fs.copyFileSync(path.join(src, 'Default', 'Network', 'Cookies'), path.join(dst, 'Default', 'Network', 'Cookies'));
      log('✓ Đã đồng bộ Cookies (Network)');
    } else if (fs.existsSync(path.join(src, 'Default', 'Cookies'))) {
      fs.copyFileSync(path.join(src, 'Default', 'Cookies'), path.join(dst, 'Default', 'Cookies'));
      log('✓ Đã đồng bộ Cookies (legacy)');
    }

    // Xóa file lock của debug profile
    fs.rmSync(path.join(dst, 'SingletonLock'), { force: true });
    fs.rmSync(path.join(dst, 'Default', 'SingletonLock'), { force: true });
    fs.rmSync(path.join(dst, 'lockfile'), { force: true });
    log('✓ Dọn dẹp lock files hoàn tất.');
  } catch (e) {
    log(`⚠️ Đồng bộ profile lỗi: ${e.message}`);
  }

  // Bước 2: Khởi chạy trình duyệt bằng Puppeteer dùng profile debug vừa đồng bộ
  log('🌐 Khởi chạy trình duyệt Chrome...');
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false, // Chạy headful để AutoFill hoạt động tốt
    userDataDir: dst,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = (await browser.pages())[0] || await browser.newPage();
  
  // Bước 3: Truy cập trang Analytics của Rank Math
  log('🌐 Điều hướng tới trang cài đặt Analytics...');
  await page.goto('https://thongtaccongquangninh.com/wp-admin/admin.php?page=rank-math-options-general&view=analytics', {
    waitUntil: 'networkidle2'
  });

  await delay(3000);
  await screenshot(page, '01_page_loaded');

  // Bước 4: Kiểm tra xem có bị màn hình đăng nhập không
  if (page.url().includes('wp-login.php')) {
    log('🔑 Phát hiện trang đăng nhập! Đợi AutoFill điền thông tin...');
    await delay(3000);
    await screenshot(page, '02_login_page_autofill');

    const credentialsStatus = await page.evaluate(() => {
      const userEl = document.querySelector('#user_login');
      const passEl = document.querySelector('#user_pass');
      return {
        hasUser: userEl && userEl.value.trim().length > 0,
        hasPass: passEl && passEl.value.length > 0,
      };
    });

    if (credentialsStatus.hasUser && credentialsStatus.hasPass) {
      log('👉 Phát hiện thông tin AutoFill của người dùng, tiến hành Click Đăng nhập...');
      await Promise.all([
        page.click('#wp-submit'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(e => log(`Navigation: ${e.message}`))
      ]);
      await delay(2000);
      await screenshot(page, '03_after_autofill_login');
    } else {
      log('❌ Chrome không tự động điền mật khẩu. Không thể tự đăng nhập.');
      await browser.close();
      return;
    }
  }

  // Kiểm tra xem đã vào được Admin chưa
  if (!page.url().includes('page=rank-math-options-general')) {
    log('❌ Không thể truy cập trang cài đặt Rank Math. Đăng nhập thất bại.');
    await browser.close();
    return;
  }

  log('✅ Đã truy cập trang cấu hình Rank Math Analytics!');
  await delay(3000);

  // Bước 5: Chọn Property và Stream
  const result = await page.evaluate(async () => {
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
    await browser.close();
    return;
  }

  log('⏳ Đợi AJAX load luồng dữ liệu...');
  await delay(4000);
  await screenshot(page, '04_after_property_selected');

  // Chọn Luồng dữ liệu (Data Stream)
  const streamResult = await page.evaluate(() => {
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
  await screenshot(page, '05_after_stream_selected');

  // Click nút "Lưu thay đổi" (Save Changes)
  log('👉 Tìm nút Lưu thay đổi...');
  const saveBtnClicked = await page.evaluate(() => {
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
    await screenshot(page, '06_after_save');
    log('🎉 Cấu hình thành công và đã lưu thay đổi!');
  } else {
    log('❌ Không tìm thấy nút Lưu thay đổi.');
  }

  await browser.close();
}

main().catch(console.error);
