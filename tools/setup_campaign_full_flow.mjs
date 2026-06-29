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
    
    // Lọc các phần tử chứa text cần tìm và không quá lớn
    const candidates = all.filter(el => {
      const t = el.textContent?.trim() || '';
      return texts.some(txt => t === txt || (t.includes(txt) && t.length < txt.length + 35));
    });
    
    if (candidates.length === 0) return { found: false };
    
    // Sắp xếp để lấy phần tử nhỏ nhất/sâu nhất (ít phần tử con nhất)
    candidates.sort((a, b) => {
      const aChildren = a.querySelectorAll('*').length;
      const bChildren = b.querySelectorAll('*').length;
      return aChildren - bChildren;
    });
    
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
  log('🚀 BẮT ĐẦU LUỒNG TẠO CHIẾN DỊCH GOOGLE ADS TỰ ĐỘNG (XỬ LÝ POPUP)');
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  });
  
  let pages = await browser.pages();
  let adsPage = null;
  for (const p of pages) {
    if (p.url().includes('ads.google.com')) {
      adsPage = p;
      break;
    }
  }
  
  if (!adsPage) {
    log('❌ Không tìm thấy tab Google Ads.');
    process.exit(1);
  }
  
  log(`✅ Đã kết nối Chrome: ${adsPage.url()}`);
  await adsPage.bringToFront();
  
  // 1. Nếu không ở trang overview, điều hướng về overview
  if (!adsPage.url().includes('/overview')) {
    log('👉 Điều hướng về trang Overview...');
    const urlObj = new URL(adsPage.url());
    const ocid = urlObj.searchParams.get('ocid') || '8272300684';
    await adsPage.goto(`https://ads.google.com/aw/overview?ocid=${ocid}`, { waitUntil: 'networkidle2', timeout: 45000 });
    await delay(6000);
  }
  
  await screenshot(adsPage, 'flow_01_overview');
  
  // 2. Click "+ Chiến dịch mới" màu xanh
  log('👉 Tìm và nhấp nút "+ Chiến dịch mới" màu xanh...');
  await clickElementByText(adsPage, ['+ Chiến dịch mới', 'Chiến dịch mới', '+ New campaign', 'New campaign'], 'Nút tạo chiến dịch mới màu xanh');
  await delay(3000); // Đợi popup hiện ra
  await screenshot(adsPage, 'flow_01_popup_opened');
  
  // 3. Click "Chiến dịch mới" trong menu popup
  log('👉 Chọn "Chiến dịch mới" trong menu popup...');
  const popupClicked = await adsPage.evaluate(() => {
    // Tìm trong các phần tử menu popup
    const popupItems = Array.from(document.querySelectorAll('div, span, a, [role="button"]'));
    // Lọc phần tử chứa đúng chữ "Chiến dịch mới" hoặc "New campaign"
    const target = popupItems.find(el => {
      const text = el.textContent?.trim() || '';
      return text === 'Chiến dịch mới' || text === 'New campaign' || text === '+ Chiến dịch mới' || text === '+ New campaign';
    });
    
    if (target) {
      const clickable = target.closest('[role="button"]') || target;
      const rect = clickable.getBoundingClientRect();
      return {
        found: true,
        tagName: clickable.tagName,
        text: clickable.textContent?.trim(),
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    return { found: false };
  });
  
  if (popupClicked.found) {
    log(`✅ Click mục menu tại (${popupClicked.x}, ${popupClicked.y})`);
    await adsPage.mouse.click(popupClicked.x, popupClicked.y);
    await delay(10000); // Đợi load trang tạo chiến dịch
  } else {
    log('❌ Không tìm thấy mục "Chiến dịch mới" trong popup.');
  }
  
  // Kiểm tra tab mới (nếu có)
  pages = await browser.pages();
  for (const p of pages) {
    if (p.url().includes('/campaigns/new') || p.url().includes('/setup')) {
      adsPage = p;
      await adsPage.bringToFront();
      break;
    }
  }
  
  await screenshot(adsPage, 'flow_02_campaign_wizard');
  
  // 4. Xử lý hộp thoại bản nháp (nếu xuất hiện)
  const hasDraftPopup = await adsPage.evaluate(() => {
    return document.body.textContent.includes('Tạo một chiến dịch mới hoặc hoàn thành một bản nháp') || document.body.textContent.includes('Bắt đầu chiến dịch mới');
  });
  
  if (hasDraftPopup) {
    log('👉 Phát hiện hộp thoại bản nháp cũ. Chọn "Bắt đầu chiến dịch mới"...');
    await clickElementByText(adsPage, ['Bắt đầu chiến dịch mới', 'Start new campaign'], 'Nút bắt đầu chiến dịch mới');
    await delay(8000);
    await screenshot(adsPage, 'flow_03_after_draft_popup');
  }
  
  // 5. Chọn mục tiêu "Khách hàng tiềm năng" (Leads)
  log('👉 Chọn mục tiêu "Khách hàng tiềm năng"...');
  const selectedLeads = await clickElementByText(adsPage, ['Khách hàng tiềm năng', 'Leads'], 'Card Khách hàng tiềm năng');
  if (selectedLeads) {
    await delay(3000);
    await clickElementByText(adsPage, ['Tiếp tục', 'Continue'], 'Nút Tiếp tục mục tiêu');
    await delay(6000);
    await screenshot(adsPage, 'flow_04_objective_continued');
  }
  
  // 6. Chọn loại chiến dịch "Tìm kiếm" (Search)
  log('👉 Chọn loại chiến dịch "Tìm kiếm"...');
  
  // Cuộn trang xuống để card Tìm kiếm hiển thị đầy đủ
  await adsPage.evaluate(() => {
    window.scrollTo(0, 600);
  });
  await delay(2000);
  
  const selectedSearch = await clickElementByText(adsPage, ['Tìm kiếm', 'Search'], 'Card Tìm kiếm');
  if (selectedSearch) {
    await delay(3000);
    
    // 7. Điền URL và Số điện thoại
    log('👉 Điền URL trang web, SĐT và Tên chiến dịch...');
    await adsPage.evaluate(() => {
      // 1. Tích chọn "Lượt truy cập trang web"
      const checkboxes = Array.from(document.querySelectorAll('material-checkbox, [role="checkbox"]'));
      const webCb = checkboxes.find(c => c.textContent?.includes('Lượt truy cập trang web') || c.textContent?.includes('Website visits'));
      if (webCb) webCb.click();
      
      // 2. Tích chọn "Cuộc gọi điện thoại"
      const callCb = checkboxes.find(c => c.textContent?.includes('Cuộc gọi điện thoại') || c.textContent?.includes('Phone calls'));
      if (callCb) callCb.click();
    });
    await delay(2000);
    
    // Điền giá trị
    await adsPage.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      
      // Điền URL
      const urlInput = inputs.find(i => {
        const placeholder = i.getAttribute('placeholder') || '';
        const ariaLabel = i.getAttribute('aria-label') || '';
        return placeholder.includes('example.com') || ariaLabel.includes('Trang web') || ariaLabel.includes('Website') || i.outerHTML.includes('website') || i.outerHTML.includes('url');
      });
      if (urlInput) {
        urlInput.value = 'https://thongtaccongquangninh.com/';
        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
        urlInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Điền SĐT
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
      
      // Điền Tên chiến dịch
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
    await screenshot(adsPage, 'flow_05_filled_basic_info');
    
    // Click Tiếp tục
    await clickElementByText(adsPage, ['Tiếp tục', 'Continue'], 'Nút Tiếp tục ở cuối trang');
    await delay(8000);
    await screenshot(adsPage, 'flow_06_bidding_page');
    
    // 8. Ở trang Bidding, click "Tiếp / Next" để đi tiếp sang Campaign Settings
    log('👉 Bấm Tiếp tục qua trang Bidding...');
    await clickElementByText(adsPage, ['Tiếp', 'Next'], 'Nút Tiếp ở trang giá thầu');
    await delay(10000); // Đợi load trang Campaign Settings (Mạng lưới & Địa lý)
    await screenshot(adsPage, 'flow_07_campaign_settings_loaded');
    
    log('✅ Đã hoàn thành luồng khởi tạo chiến dịch ban đầu!');
  } else {
    log('❌ Không tiến hành điền thông tin do không chọn được loại Tìm kiếm.');
  }
  
  await browser.disconnect();
}

main().catch(console.error);
