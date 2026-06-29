import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '_tmp', 'ads-screenshots');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Connecting to Chrome...');
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
    console.log('No active setup page found.');
    process.exit(1);
  }
  
  await adsPage.bringToFront();
  
  const selector = 'input.input-area'; // Dựa vào class
  console.log(`Focusing input with selector: ${selector}`);
  
  // Clear input
  await adsPage.click(selector, { clickCount: 3 });
  await adsPage.keyboard.press('Backspace');
  await delay(500);
  
  // Type
  await adsPage.type(selector, 'Hạ Long', { delay: 100 });
  console.log('Typed "Hạ Long". Waiting 3 seconds...');
  await delay(3000);
  
  // Inspect cấu trúc chi tiết của dropdown suggestions
  const dump = await adsPage.evaluate(() => {
    // Tìm các phần tử chứa text "Hạ Long" trong dropdown suggestions
    const suggestionRows = Array.from(document.querySelectorAll('div, [role="option"], li'))
      .filter(el => {
        const text = el.textContent || '';
        return text.includes('Hạ Long') && (text.includes('Mục tiêu') || text.includes('Target') || text.includes('Loại trừ') || text.includes('Exclude'));
      });
      
    return suggestionRows.map((row, idx) => {
      // Tìm các button con của row này
      const buttons = Array.from(row.querySelectorAll('button, material-button, [role="button"], div, span'))
        .filter(b => {
          const t = b.textContent?.trim() || '';
          return t === 'Mục tiêu' || t === 'Target' || t === 'Loại trừ' || t === 'Exclude';
        })
        .map(b => ({
          tagName: b.tagName,
          className: b.className,
          text: b.textContent?.trim(),
          rect: {
            left: b.getBoundingClientRect().left,
            top: b.getBoundingClientRect().top,
            width: b.getBoundingClientRect().width,
            height: b.getBoundingClientRect().height
          }
        }));
        
      return {
        idx,
        rowTagName: row.tagName,
        rowClassName: row.className,
        rowText: row.textContent?.trim().substring(0, 100),
        buttons
      };
    });
  });
  
  console.log('Detailed suggestion rows found:', JSON.stringify(dump, null, 2));
  
  await browser.disconnect();
}

main().catch(console.error);
