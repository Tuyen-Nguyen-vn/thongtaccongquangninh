import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '_tmp', 'ads-screenshots');

async function main() {
  console.log('Connecting to Chrome...');
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
    console.log('No active Google Ads page found.');
    process.exit(1);
  }
  
  await adsPage.bringToFront();
  
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const shotPath = path.join(SCREENSHOTS_DIR, 'current_state_ads.png');
  await adsPage.screenshot({ path: shotPath });
  console.log(`Saved current state screenshot to: ${shotPath}`);
  
  const textContent = await adsPage.evaluate(() => document.body.textContent || '');
  console.log('Page text length:', textContent.length);
  
  // Kiểm tra xem có chứa các từ khóa chính không
  const checkTexts = [
    'Chiến dịch của bạn gần như đã sẵn sàng để xuất bản',
    'Xuất bản',
    'Publish',
    'Vấn đề',
    'Khắc phục',
    'Đặt giá thầu',
    'Cài đặt chiến dịch',
    'Từ khóa và quảng cáo',
    'Ngân sách'
  ];
  
  console.log('--- Text checks ---');
  for (const txt of checkTexts) {
    console.log(`Contains "${txt}":`, textContent.includes(txt));
  }
  
  await browser.disconnect();
}

main().catch(console.error);
