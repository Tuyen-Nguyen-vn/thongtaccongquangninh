import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '_tmp', 'ads-screenshots');

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

async function clickElementByText(page, textOptions, description) {
  log(`👉 Tìm và click ${description}...`);
  const coords = await page.evaluate((texts) => {
    const all = Array.from(document.querySelectorAll('button, [role="button"], material-button, span, p, h3, h4, a, [role="radio"], [role="checkbox"], div'));
    const candidates = all.filter(el => {
      const t = el.textContent?.trim() || '';
      return texts.some(txt => t === txt || (t.includes(txt) && t.length < txt.length + 35));
    });
    
    if (candidates.length === 0) return { found: false };
    
    candidates.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    const target = candidates[0];
    const clickable = target.closest('material-button') || target.closest('button') || target.closest('[role="button"]') || target.closest('[class*="card"]') || target;
    clickable.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = clickable.getBoundingClientRect();
    
    return {
      found: true,
      tagName: clickable.tagName,
      text: clickable.textContent?.trim().substring(0, 50),
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }, textOptions);

  if (coords.found) {
    log(`✅ Tìm thấy ${description} (<${coords.tagName}> "${coords.text}") tại (${coords.x}, ${coords.y})`);
    await page.mouse.click(coords.x, coords.y);
    return true;
  }
  log(`❌ Không tìm thấy ${description} với các text: ${textOptions.join(', ')}`);
  return false;
}

async function main() {
  log('🚀 Bắt đầu tiếp tục từ Chọn loại chiến dịch (tối ưu scrollIntoView)...');
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
    log('❌ Không tìm thấy tab tạo chiến dịch.');
    process.exit(1);
  }
  
  log(`✅ Kết nối thành công: ${adsPage.url()}`);
  await adsPage.bringToFront();
  
  // 1. Click chọn card Tìm kiếm
  log('👉 Tìm và click card Tìm kiếm...');
  await clickElementByText(adsPage, ['Tìm kiếm', 'Search'], 'Card Tìm kiếm');
  await delay(4000);
  await screenshot(adsPage, '15_search_type_selected');
  
  // 2. Cuộn phần tiêu đề "Chọn các cách thức bạn muốn đạt được mục tiêu" vào view để các checkbox hiển thị
  log('👉 Cuộn phần cách thức đạt mục tiêu vào view...');
  const scrolledToWays = await adsPage.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('div, span, h3, p'));
    const target = titles.find(t => t.textContent?.includes('Chọn các cách thức bạn muốn đạt được mục tiêu') || t.textContent?.includes('Select the ways you want to reach your goal'));
    if (target) {
      target.scrollIntoView({ block: 'center' });
      return true;
    }
    return false;
  });
  
  if (scrolledToWays) {
    log('✅ Đã cuộn đến phần chọn cách thức đạt mục tiêu.');
    await delay(3000);
  } else {
    log('⚠️ Không tìm thấy tiêu đề cách thức đạt mục tiêu, tự động cuộn xuống...');
    await adsPage.evaluate(() => {
      // Tìm card Tìm kiếm và cuộn nó lên đầu trang để phần dưới hiện ra
      const cards = Array.from(document.querySelectorAll('div, span, p, h3, h4'));
      const target = cards.find(el => el.textContent?.trim() === 'Tìm kiếm' || el.textContent?.trim() === 'Search');
      if (target) {
        const clickable = target.closest('[role="button"]') || target;
        clickable.scrollIntoView({ block: 'start' });
      }
    });
    await delay(3000);
  }
  await screenshot(adsPage, '16_scrolled_to_checkboxes');
  
  // 3. Click checkbox "Lượt truy cập trang web"
  log('👉 Chọn "Lượt truy cập trang web"...');
  await clickElementByText(adsPage, ['Lượt truy cập trang web', 'Website visits'], 'Checkbox Lượt truy cập trang web');
  await delay(1500);
  
  // 4. Click checkbox "Cuộc gọi điện thoại"
  log('👉 Chọn "Cuộc gọi điện thoại"...');
  await clickElementByText(adsPage, ['Cuộc gọi điện thoại', 'Phone calls'], 'Checkbox Cuộc gọi điện thoại');
  await delay(2000);
  
  await screenshot(adsPage, '17_checkboxes_selected');
  
  // 5. Điền URL và Số điện thoại, Đổi tên chiến dịch
  log('👉 Điền thông tin vào các input...');
  await adsPage.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    
    // URL
    const urlInput = inputs.find(i => {
      const placeholder = i.getAttribute('placeholder') || '';
      const ariaLabel = i.getAttribute('aria-label') || '';
      return placeholder.includes('example.com') || ariaLabel.includes('Trang web') || ariaLabel.includes('Website') || i.outerHTML.includes('website') || i.outerHTML.includes('url');
    });
    if (urlInput) {
      urlInput.scrollIntoView({ block: 'center' });
      urlInput.value = 'https://thongtaccongquangninh.com/';
      urlInput.dispatchEvent(new Event('input', { bubbles: true }));
      urlInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // SĐT
    const phoneInput = inputs.find(i => {
      const ariaLabel = i.getAttribute('aria-label') || '';
      const type = i.getAttribute('type') || '';
      return type === 'tel' || ariaLabel.includes('Số điện thoại') || ariaLabel.includes('Phone number');
    });
    if (phoneInput) {
      phoneInput.value = '0963953533';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Tên chiến dịch
    const nameInput = inputs.find(i => i.getAttribute('aria-label')?.includes('Tên chiến dịch') || i.getAttribute('aria-label')?.includes('Campaign name'));
    if (nameInput) {
      nameInput.value = '';
      nameInput.focus();
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(nameInput, 'QN_Search_Leads_ThongTac-HutBePot_HaLong-CamPha-UongBi-QuangYen_2026');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  await delay(2000);
  await screenshot(adsPage, '18_filled_basic_info');
  
  // 6. Click nút "Tiếp tục" ở cuối trang
  log('👉 Bấm Tiếp tục ở cuối trang...');
  await clickElementByText(adsPage, ['Tiếp tục', 'Continue'], 'Nút Tiếp tục ở cuối trang');
  await delay(8000);
  await screenshot(adsPage, '19_bidding_page_loaded');
  
  // 7. Xử lý bản nháp nếu có
  const hasDraftPopup = await adsPage.evaluate(() => {
    return document.body.textContent.includes('Tạo một chiến dịch mới hoặc hoàn thành một bản nháp') || document.body.textContent.includes('Bắt đầu chiến dịch mới');
  });
  if (hasDraftPopup) {
    log('👉 Phát hiện hộp thoại bản nháp cũ. Chọn "Bắt đầu chiến dịch mới"...');
    await clickElementByText(adsPage, ['Bắt đầu chiến dịch mới', 'Start new campaign'], 'Nút bắt đầu chiến dịch mới');
    await delay(8000);
    await screenshot(adsPage, '20_after_draft_popup_bidding');
  }
  
  // 8. Click nút "Tiếp" trên trang Đặt giá thầu
  log('👉 Bấm Tiếp tục trên trang Đặt giá thầu...');
  await clickElementByText(adsPage, ['Tiếp', 'Next'], 'Nút Tiếp ở trang giá thầu');
  await delay(10000); // Đợi load trang thiết lập Mạng & Địa lý
  await screenshot(adsPage, '21_campaign_settings_loaded');
  
  log('✅ Đã hoàn thành luồng khởi tạo chiến dịch ban đầu!');
  await browser.disconnect();
}

main().catch(console.error);
