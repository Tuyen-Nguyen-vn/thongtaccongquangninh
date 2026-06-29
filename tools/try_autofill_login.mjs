import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '_tmp', 'login-screenshots');

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
  log('🚀 Khởi động script kiểm tra AutoFill login...');
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  });

  const pages = await browser.pages();
  let loginPage = pages.find(p => p.url().includes('wp-login.php'));
  
  if (!loginPage) {
    log('🌐 Mở tab login mới...');
    loginPage = await browser.newPage();
  }
  
  await loginPage.goto('https://thongtaccongquangninh.com/wp-login.php?redirect_to=https%3A%2F%2Fthongtaccongquangninh.com%2Fwp-admin%2Fadmin.php%3Fpage%3Drank-math-options-general%26view%3Danalytics&reauth=1', {
    waitUntil: 'networkidle2'
  });

  log('⏳ Chờ 3 giây để Chrome AutoFill điền mật khẩu...');
  await delay(3000);
  await screenshot(loginPage, 'autofill_01_loaded');

  // Kiểm tra xem input username và password có giá trị không
  const credentialsStatus = await loginPage.evaluate(() => {
    const userEl = document.querySelector('#user_login');
    const passEl = document.querySelector('#user_pass');
    return {
      hasUser: userEl && userEl.value.trim().length > 0,
      userVal: userEl ? userEl.value : null,
      hasPass: passEl && passEl.value.length > 0,
      passLength: passEl ? passEl.value.length : 0
    };
  });

  log(`Trạng thái AutoFill: ${JSON.stringify(credentialsStatus, null, 2)}`);

  if (credentialsStatus.hasUser && credentialsStatus.hasPass) {
    log('✅ Tìm thấy thông tin đăng nhập tự động! Đang tiến hành click Log In...');
    await Promise.all([
      loginPage.click('#wp-submit'),
      loginPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(e => log(`Navigation: ${e.message}`))
    ]);

    await screenshot(loginPage, 'autofill_02_after_login');
    log(`URL hiện tại: ${loginPage.url()}`);
    
    if (loginPage.url().includes('wp-admin')) {
      log('🎉 Đăng nhập thành công bằng AutoFill!');
    } else {
      log('❌ Đăng nhập thất bại, có thể mật khẩu AutoFill sai hoặc không được chấp nhận.');
    }
  } else {
    log('❌ Chrome không tự động điền mật khẩu (AutoFill rỗng).');
  }

  await browser.disconnect();
}

main().catch(console.error);
