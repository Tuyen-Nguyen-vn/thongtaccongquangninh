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
    if (p.url().includes('ads.google.com')) {
      adsPage = p;
      break;
    }
  }
  
  if (!adsPage) {
    console.log('No active setup page found.');
    process.exit(1);
  }
  
  await adsPage.bringToFront();
  
  console.log('1️⃣ Clicking "Xem" next to "Thêm ngân sách"...');
  const clickedFix = await adsPage.evaluate(() => {
    // Tìm phần tử chứa chữ "Thêm ngân sách"
    const items = Array.from(document.querySelectorAll('div, span, li, p'));
    const budgetItem = items.find(el => el.textContent?.trim().includes('Thêm ngân sách'));
    
    if (budgetItem) {
      // Tìm thẻ "Xem" hoặc "Fix" gần nhất hoặc bên trong nó
      const links = Array.from(budgetItem.querySelectorAll('a, span, [role="button"], button'));
      const viewLink = links.find(l => l.textContent?.trim() === 'Xem' || l.textContent?.trim() === 'View');
      if (viewLink) {
        viewLink.click();
        return 'Clicked View/Xem link in budget item row';
      }
      
      // Nếu không thấy bên trong, thử tìm thẻ Xem xung quanh
      const parent = budgetItem.parentElement;
      if (parent) {
        const pLinks = Array.from(parent.querySelectorAll('a, span, [role="button"], button'));
        const pView = pLinks.find(l => l.textContent?.trim() === 'Xem' || l.textContent?.trim() === 'View');
        if (pView) {
          pView.click();
          return 'Clicked View/Xem link in budget item parent container';
        }
      }
    }
    
    // Cách 2: Tìm text "Xem" (View) trên toàn trang và lọc phần tử nhỏ nhất
    const allLinks = Array.from(document.querySelectorAll('a, span, [role="button"], button'));
    const viewButtons = allLinks.filter(l => l.textContent?.trim() === 'Xem' || l.textContent?.trim() === 'View');
    if (viewButtons.length > 0) {
      // Click cái cuối cùng hoặc cái chứa thông tin ngân sách (thường là cái cuối trong list lỗi)
      const target = viewButtons[viewButtons.length - 1];
      target.click();
      return `Clicked fallback View/Xem button index ${viewButtons.length - 1}`;
    }
    
    // Cách 3: Click thẳng vào step "Ngân sách" ở thanh menu bên trái
    const steps = Array.from(document.querySelectorAll('div, span, p'));
    const budgetStep = steps.find(s => s.textContent?.trim() === 'Ngân sách' || s.textContent?.trim() === 'Budget');
    if (budgetStep) {
      const clickable = budgetStep.closest('[role="button"]') || budgetStep;
      clickable.click();
      return 'Clicked Budget step in sidebar';
    }
    
    return 'Could not find budget fix link';
  });
  
  console.log(`Fix action result: ${clickedFix}`);
  
  console.log('Waiting 6 seconds for Budget page to load...');
  await delay(6000);
  
  // Chụp ảnh màn hình bước Ngân sách
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const shotPath = path.join(SCREENSHOTS_DIR, '08_budget_page.png');
  await adsPage.screenshot({ path: shotPath });
  console.log(`Saved screenshot to: ${shotPath}`);
  
  console.log('2️⃣ Finding budget input...');
  const budgetFilled = await adsPage.evaluate(() => {
    // Tìm các input text/number có khả năng là ô nhập ngân sách
    const inputs = Array.from(document.querySelectorAll('input'));
    
    // Lọc các input số hoặc input không có type cụ thể
    const numInputs = inputs.filter(i => {
      const type = i.getAttribute('type') || '';
      const style = window.getComputedStyle(i);
      const visible = i.offsetWidth > 0 && i.offsetHeight > 0 && style.display !== 'none';
      return visible && (type === 'number' || type === 'text' || type === '');
    });
    
    // Tìm input nằm gần text "ngân sách" hoặc có placeholder/aria-label liên quan
    let budgetInput = numInputs.find(i => {
      const label = i.getAttribute('aria-label') || i.placeholder || '';
      return label.toLowerCase().includes('ngân sách') || label.toLowerCase().includes('budget') || label.toLowerCase().includes('số tiền') || label.toLowerCase().includes('amount');
    });
    
    if (!budgetInput && numInputs.length > 0) {
      // Fallback: Lấy input đầu tiên hiển thị trên trang ngân sách (thường chỉ có 1 input số)
      budgetInput = numInputs[0];
    }
    
    if (budgetInput) {
      budgetInput.scrollIntoView({ block: 'center' });
      budgetInput.focus();
      
      // Clear input
      budgetInput.value = '';
      
      // Điền 300000
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(budgetInput, '300000');
      
      budgetInput.dispatchEvent(new Event('input', { bubbles: true }));
      budgetInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      return { found: true, id: budgetInput.id, value: budgetInput.value };
    }
    
    return { found: false };
  });
  
  console.log(`Budget input result: ${JSON.stringify(budgetFilled)}`);
  
  if (budgetFilled.found) {
    console.log('Daily budget filled. Waiting 2 seconds...');
    await delay(2000);
    
    console.log('3️⃣ Clicking "Tiếp" (Next) button to return...');
    const clickedNext = await adsPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
      const nextBtn = buttons.find(b => {
        const text = b.textContent?.trim() || '';
        const style = window.getComputedStyle(b);
        const visible = b.offsetWidth > 0 && b.offsetHeight > 0 && style.display !== 'none';
        return visible && (text === 'Tiếp' || text === 'Next' || text === 'Tiếp tục' || text === 'Continue');
      });
      
      if (nextBtn) {
        nextBtn.click();
        return `Clicked next button: "${nextBtn.textContent?.trim()}"`;
      }
      return 'Next button not found';
    });
    
    console.log(`Next action result: ${clickedNext}`);
    console.log('Waiting 8 seconds for page transition...');
    await delay(8000);
    
    const shotPathReview = path.join(SCREENSHOTS_DIR, '09_returned_to_review.png');
    await adsPage.screenshot({ path: shotPathReview });
    console.log(`Saved screenshot after budget fix: ${shotPathReview}`);
  }
  
  await browser.disconnect();
}

main().catch(console.error);
