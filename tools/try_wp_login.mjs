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
  log('🚀 Khởi động script thử đăng nhập WordPress...');
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  });

  const pages = await browser.pages();
  let loginPage = pages.find(p => p.url().includes('wp-login.php'));
  
  if (!loginPage) {
    log('🌐 Không tìm thấy tab login, mở tab mới...');
    loginPage = await browser.newPage();
    await loginPage.goto('https://thongtaccongquangninh.com/wp-login.php', { waitUntil: 'networkidle2' });
  } else {
    log(`✅ Tìm thấy tab login: ${loginPage.url()}`);
    await loginPage.bringToFront();
  }

  await screenshot(loginPage, '01_before_login');

  // Đọc credentials từ .env
  const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
  const env = {};
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }

  const username = env.WP_USERNAME || 'cuben01';
  const appPassword = env.WP_APP_PASSWORD;

  log(`Điền user: ${username}`);
  await loginPage.type('#user_login', username);
  
  log('Điền app password...');
  await loginPage.type('#user_pass', appPassword);

  await screenshot(loginPage, '02_filled_form');

  log('Click Log In...');
  await Promise.all([
    loginPage.click('#wp-submit'),
    loginPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(e => log(`Navigation: ${e.message}`))
  ]);

  await screenshot(loginPage, '03_after_login_attempt');
  log(`URL hiện tại: ${loginPage.url()}`);

  await browser.disconnect();
}

main().catch(console.error);
