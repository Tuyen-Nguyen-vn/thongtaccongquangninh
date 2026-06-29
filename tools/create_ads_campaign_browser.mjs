#!/usr/bin/env node
/**
 * create_ads_campaign_browser.mjs
 * ================================
 * Tự động tạo chiến dịch Google Ads Search qua giao diện web
 * bằng cách kết nối vào Chrome đang mở qua CDP (port 9222).
 *
 * Yêu cầu:
 *   1. Mở Chrome với: --remote-debugging-port=9222 --remote-allow-origins=*
 *   2. Đăng nhập sẵn vào ads.google.com (tài khoản 116-514-6070)
 *   3. Chạy: node tools/create_ads_campaign_browser.mjs
 *
 * Chiến dịch: QN_Search_Leads_ThongTac-HutBePot_HaLong-CamPha_2026
 * Trạng thái cuối: PAUSED — không tự bật
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '_tmp', 'ads-screenshots');
const CONFIG_PATH = path.join(__dirname, '..', 'google_ads_campaign_config.json');

// ─── Cấu hình chiến dịch (theo Walkthrough) ───
const CAMPAIGN = {
  name: 'QN_Search_Leads_ThongTac-HutBePot_HaLong-CamPha-UongBi-QuangYen_2026',
  customerId: '1165146070',       // 116-514-6070
  customerIdFormatted: '116-514-6070',
  ocid: '8272300684',
  dailyBudget: '300000',          // 300.000đ
  maxCpc: '8000',                 // 8.000đ
  bidStrategy: 'Maximize clicks',
  language: 'Vietnamese',
  // Locations
  includeLocations: ['Hạ Long', 'Cẩm Phả', 'Uông Bí', 'Quảng Yên'],
  excludeLocations: ['Ba Chẽ', 'Cô Tô', 'Bình Liêu', 'Tiên Yên', 'Đầm Hà', 'Hải Hà', 'Vân Đồn'],
};

const AD_GROUPS = [
  {
    name: 'QN_ThongTacCong_HaLong-CamPha-UongBi-QuangYen',
    keywords: [
      // Exact match
      '[thông tắc cống hạ long]',
      '[thông tắc cống cẩm phả]',
      '[thông tắc cống uông bí]',
      '[thông tắc cống quảng yên]',
      '[thông cống nghẹt hạ long]',
      '[thông cống nghẹt uông bí]',
      '[thông cống nghẹt quảng yên]',
      '[thông tắc cống quảng ninh]',
      '[thông ống cống hạ long]',
      '[thông ống cống uông bí]',
      '[thông ống cống quảng yên]',
      // Phrase match
      '"thông tắc cống hạ long"',
      '"thông tắc cống cẩm phả"',
      '"thông tắc cống uông bí"',
      '"thông tắc cống quảng yên"',
      '"thông cống nghẹt"',
      '"thông tắc cống 24/7"',
      '"thông tắc cống quảng ninh"',
      '"thông cống bằng máy lò xo"',
      '"thông tắc không đục phá"',
      '"thông cống bằng máy nén khí"',
      '"thông cống cao áp"',
      '"thông tắc cống bãi cháy"',
      '"thông cống hồng gai"',
      '"thông cống cửa ông"',
      '"thông tắc cống cao xanh"',
      '"thông cống quang hanh"',
      '"thông tắc cống thanh sơn"',
      '"thông cống quang trung"',
      '"thông cống minh thành"',
    ],
    ads: [
      {
        finalUrl: 'https://thongtaccongquangninh.com/thong-tac-cong-ha-long/',
        path1: 'thong-tac-cong',
        path2: 'ha-long',
        headlines: [
          'Thông Tắc Cống Hạ Long 24/7',
          'Thông Tắc Cống Cẩm Phả',
          'Thông Tắc Cống Uông Bí',
          'Thông Tắc Cống Quảng Yên',
          'Thông Cống Nghẹt - Gọi Ngay',
          'Thông Tắc Cống Quảng Ninh',
          'Máy Lò Xo - Không Đục Phá',
          'Có Mặt 15 Phút Sau Khi Gọi',
          'Miễn Phí Kiểm Tra Tình Trạng',
          'Báo Giá Trước Khi Thi Công',
          'Bảo Hành 6 Năm Sau Thi Công',
          'Phục Vụ Uông Bí & Quảng Yên',
          'Môi Trường Đô Thị Số 1 QN',
          'Thợ 10 Năm - Sạch 100%',
          'Xử Lý Mùi Hôi Đường Ống',
        ],
        descriptions: [
          'Thông tắc cống Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên bằng máy lò xo, không đục phá.',
          'Miễn phí kiểm tra, báo giá trước khi làm. Nhận nhà dân, nhà hàng, khách sạn, công trình.',
          'Thông cống nghẹt mùi hôi bằng công nghệ cao áp. Bảo hành 6 năm. Có hóa đơn VAT.',
          'Xe chuyên dụng đến tận nơi, xử lý cống nghẹt trong ngày. Phục vụ Quảng Ninh 24/7.',
        ],
      },
      {
        finalUrl: 'https://thongtaccongquangninh.com/thong-tac-cong-ha-long/',
        path1: 'thong-tac-cong',
        path2: 'ha-long',
        headlines: [
          'Thông Tắc Uông Bí - Gọi Ngay',
          'Cống Nghẹt Hạ Long - Gọi Ngay',
          'Thông Cống Không Đào Bới',
          'Thông Tắc Cống Quảng Yên',
          'Máy Nén Khí Áp Lực Cao',
          'Hỗ Trợ 24/7 Cả Ngày Lễ',
          'Báo Giá Qua Điện Thoại',
          'Cam Kết Thông Sạch Ngay',
          'Nhận Khu Công Nghiệp',
          'Thợ Lành Nghề 10 Năm',
          'Phục Vụ Cẩm Phả Uông Bí',
          'Môi Trường Đông Bắc QN',
          'Tư Vấn Miễn Phí Tại Nhà',
          'Không Ép Giá Sau Khi Làm',
          'Xử Lý Cống Tràn Ngập Nước',
        ],
        descriptions: [
          'Thông cống nghẹt tại Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên. Thợ đến sau 15-30 phút.',
          'Nhận xử lý cống tắc, tràn, mùi hôi. Kiểm tra tại nhà, báo giá trước. Bảo hành 6 năm.',
          'Thiết bị lò xo và cao áp chuyên dụng. Thông sạch 100%, đường ống không bị hư hại.',
          'Phục vụ hộ gia đình, nhà hàng, khách sạn, khu công nghiệp tại Quảng Ninh 24/7.',
        ],
      },
    ],
  },
  {
    name: 'QN_HutBePhot_HaLong-CamPha-UongBi-QuangYen',
    keywords: [
      // Exact match
      '[hút bể phốt hạ long]',
      '[hút bể phốt uông bí]',
      '[hút bể phốt quảng yên]',
      '[hút bể phốt cẩm phả]',
      '[hút hầm cầu hạ long]',
      '[hút hầm cầu uông bí]',
      '[hút hầm cầu quảng yên]',
      '[hút phốt cẩm phả]',
      '[hút phốt uông bí]',
      '[hút phốt quảng yên]',
      '[dịch vụ hút bể phốt quảng ninh]',
      '[thông bể phốt hạ long]',
      '[thông bể phốt uông bí]',
      '[thông bể phốt quảng yên]',
      // Phrase match
      '"hút bể phốt hạ long"',
      '"hút bể phốt uông bí"',
      '"hút bể phốt quảng yên"',
      '"hút bể phốt 24/7"',
      '"hút bể phốt quảng ninh"',
      '"xe hút bể phốt"',
      '"hút bể phốt xe chân không"',
      '"hút bể phốt công nghệ nhật"',
      '"hút bể phốt không đục phá"',
      '"xe hút 5 khối"',
      '"hút bể phốt bãi cháy"',
      '"hút bể phốt hồng gai"',
      '"hút hầm cầu cẩm phả"',
      '"hút hầm cầu uông bí"',
      '"hút hầm cầu quảng yên"',
      '"hút bể phốt cửa ông"',
      '"hút phốt quang hanh"',
      '"hút bể phốt thanh sơn"',
      '"hút bể phốt quang trung"',
      '"hút bể phốt minh thành"',
    ],
    ads: [
      {
        finalUrl: 'https://thongtaccongquangninh.com/hut-be-phot-ha-long/',
        path1: 'hut-be-phot',
        path2: 'ha-long',
        headlines: [
          'Hút Bể Phốt Hạ Long 24/7',
          'Hút Bể Phốt Cẩm Phả',
          'Hút Bể Phốt Uông Bí',
          'Hút Bể Phốt Quảng Yên',
          'Hút Hầm Cầu - Gọi Ngay',
          'Hút Bể Phốt Quảng Ninh',
          'Xe Hút Chân Không Nhật Bản',
          'Hút Xe 5 Khối - Đúng Thể Tích',
          'Có Mặt 15 Phút Sau Khi Gọi',
          'Miễn Phí Khảo Sát Tại Nhà',
          'Báo Giá Trước - Không Ép',
          'Bảo Hành 10 Năm Sau Khi Hút',
          'Môi Trường Đô Thị Số 1 QN',
          'Hút Sạch, Ít Mùi Hôi Nhất',
          'Nhận Nhà Hàng, Khách Sạn',
        ],
        descriptions: [
          'Hút bể phốt tại Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên bằng xe hút chân không Nhật Bản.',
          'Miễn phí khảo sát, báo giá trước khi hút. Bảo hành 10 năm. Nhà hàng, khách sạn.',
          'Xe hút đến tận nơi, có mặt sau 15 phút. Hút đúng đủ thể tích, có hóa đơn VAT.',
          'Hút bể phốt dân dụng và công nghiệp. Phục vụ 24/7 không nghỉ lễ tại Quảng Ninh.',
        ],
      },
      {
        finalUrl: 'https://thongtaccongquangninh.com/hut-be-phot-ha-long/',
        path1: 'hut-be-phot',
        path2: 'ha-long',
        headlines: [
          'Hút Bể Phốt Uông Bí',
          'Hút Bể Phốt Quảng Yên',
          'Bể Phốt Đầy Gọi Ngay',
          'Hút Phốt Không Đục Phá',
          'Xe Hút 5m³ Chuyên Dụng',
          'Hỗ Trợ Khẩn Cấp 24/7',
          'Báo Giá Nhanh Qua Zalo',
          'Ngõ Nhỏ Vẫn Phục Vụ Được',
          'Hút Sạch Bể Phốt Hôm Nay',
          'Thợ Có Mặt Trong 30 Phút',
          'Phục Vụ Cẩm Phả Nhanh',
          'Giá Rõ Ràng Không Phát Sinh',
          'Nhận Hút Bể Phốt Cửa Ông',
          'Không Để Mùi Hôi Lan Rộng',
          'Hút Phốt Dưới 1 Khối 600k',
        ],
        descriptions: [
          'Hút bể phốt tại Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên. Xe hút chân không chuyên dụng.',
          'Bể phốt đầy, mùi hôi, tràn ngược? Miễn phí khảo sát, báo giá thực tế trước khi xử lý.',
          'Xe hút đúng thể tích, không gian dối. Bảo hành 10 năm. Có hóa đơn VAT.',
          'Nhận hút bể phốt hộ gia đình, nhà hàng, khách sạn, khu công nghiệp tại Quảng Ninh.',
        ],
      },
    ],
  },
];

const NEGATIVE_KEYWORDS = [
  'tuyển dụng','việc làm','xin việc','lương','học nghề','đào tạo',
  'thợ thông cống','thợ hút bể phốt','tự làm','cách làm','hướng dẫn',
  'mẹo','diy','miễn phí','video','youtube','pdf','bài giảng','giáo trình',
  'máy thông cống','máy lò xo','mua máy','bán máy','thiết bị thông cống',
  'phụ kiện','dây lò xo','hóa chất','bột thông cống','nước thông cống',
  'men vi sinh','luận văn','đồ án','báo cáo','quy định','nghị định',
  'mẫu hợp đồng','file mẫu','ảnh','logo','wikipedia','wiki',
];

const SITELINKS = [
  { title: 'Bảng Giá Dịch Vụ', desc1: 'Báo giá rõ trước khi làm', desc2: 'Tư vấn theo tình trạng thực tế', url: '/bang-gia/' },
  { title: 'Quy Trình 5 Bước', desc1: 'Tiếp nhận, kiểm tra, xử lý', desc2: 'Bàn giao và bảo hành nếu có', url: '/quy-trinh/' },
  { title: 'Khu Vực Phục Vụ', desc1: 'Hạ Long, Cẩm Phả, Quảng Ninh', desc2: 'Có mặt 15-30 phút sau khi gọi', url: '/khu-vuc/' },
  { title: 'Hút Bể Phốt', desc1: 'Xe hút chân không tận nơi', desc2: 'Hỗ trợ hộ gia đình, công trình', url: '/hut-be-phot-ha-long/' },
  { title: 'Thông Tắc Cống', desc1: 'Xử lý cống nghẹt, mùi hôi', desc2: 'Máy lò xo và cao áp chuyên dụng', url: '/thong-tac-cong-ha-long/' },
  { title: 'Liên Hệ 24/7', desc1: 'Gọi hotline để được hỗ trợ', desc2: 'Nhận xử lý nhanh trong ngày', url: '/lien-he/' },
];

const CALLOUTS = [
  'Phục Vụ 24/7', 'Báo Giá Trước', 'Xe Chuyên Dụng', 'Thợ Đến Tận Nơi',
  'Miễn Phí Khảo Sát', 'Bảo Hành 6-10 Năm', 'Không Đục Phá', 'Xuất Hóa Đơn VAT',
];

const STRUCTURED_SNIPPETS = [
  { header: 'Dịch vụ', values: ['Hút bể phốt', 'Thông tắc cống', 'Thông tắc bồn cầu', 'Nạo vét hố ga', 'Xử lý mùi hôi', 'Vệ sinh đường ống'] },
  { header: 'Khu vực', values: ['Hạ Long', 'Cẩm Phả', 'Uông Bí', 'Quảng Ninh', 'Bãi Cháy', 'Hồng Gai'] },
];

// ─── Utility functions ───

function log(msg) {
  const ts = new Date().toLocaleTimeString('vi-VN');
  console.log(`[${ts}] ${msg}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function screenshot(page, name) {
  ensureDir(SCREENSHOTS_DIR);
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  log(`📸 Screenshot: ${filePath}`);
  return filePath;
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Wait for a selector and return the element handle.
 * Tries multiple strategies.
 */
async function waitAndClick(page, selector, description, timeout = 15000) {
  log(`⏳ Đợi: ${description}...`);
  try {
    await page.waitForSelector(selector, { visible: true, timeout });
    await delay(500);
    await page.click(selector);
    log(`✅ Click: ${description}`);
    await delay(1000);
  } catch (e) {
    log(`❌ Không tìm thấy: ${description} (${selector})`);
    throw e;
  }
}

/**
 * Click element by text content (XPath)
 */
async function clickByText(page, text, tag = '*', timeout = 10000) {
  log(`⏳ Tìm text "${text}"...`);
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const elements = await page.$$(`${tag}`);
      for (const el of elements) {
        const elText = await page.evaluate(e => e.textContent?.trim(), el);
        if (elText === text || elText?.includes(text)) {
          await el.click();
          log(`✅ Click text: "${text}"`);
          await delay(1000);
          return;
        }
      }
    } catch { /* retry */ }
    await delay(500);
  }
  throw new Error(`Không tìm thấy text: "${text}"`);
}

/**
 * Type text into input field
 */
async function typeInField(page, selector, text, description) {
  log(`⏳ Nhập: ${description}...`);
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.click(selector, { clickCount: 3 }); // select all
  await delay(200);
  await page.type(selector, text, { delay: 50 });
  log(`✅ Nhập xong: ${description} = "${text}"`);
  await delay(500);
}

// ─── Main flow ───

async function main() {
  log('🚀 BẮT ĐẦU TẠO CHIẾN DỊCH GOOGLE ADS QUA TRÌNH DUYỆT');
  log(`📋 Chiến dịch: ${CAMPAIGN.name}`);
  log(`📋 Tài khoản: ${CAMPAIGN.customerIdFormatted}`);
  log('');

  // Step 1: Connect to Chrome
  log('1️⃣ Kết nối Chrome trên port 9222...');
  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null,
    });
    log('✅ Đã kết nối Chrome');
  } catch (e) {
    console.error('');
    console.error('❌ KHÔNG KẾT NỐI ĐƯỢC CHROME.');
    console.error('');
    console.error('Hãy mở Chrome với lệnh sau rồi chạy lại script:');
    console.error('');
    console.error('  start chrome --remote-debugging-port=9222 --remote-allow-origins=* "https://ads.google.com/aw/overview"');
    console.error('');
    console.error('Đăng nhập vào tài khoản Google Ads (116-514-6070) trước khi chạy lại.');
    process.exit(1);
  }

  // Step 2: Find or open Google Ads page
  log('2️⃣ Tìm tab Google Ads...');
  const pages = await browser.pages();
  let adsPage = null;
  
  for (const p of pages) {
    const url = p.url();
    if (url.includes('ads.google.com')) {
      adsPage = p;
      log(`✅ Tìm thấy tab Google Ads: ${url}`);
      break;
    }
  }

  if (!adsPage) {
    log('📌 Chưa có tab Google Ads, mở mới...');
    adsPage = await browser.newPage();
  }
  
  log(`📌 Chuyển hướng tới Overview...`);
  await adsPage.goto(`https://ads.google.com/aw/overview?ocid=${CAMPAIGN.ocid}`, {
    waitUntil: 'networkidle2',
    timeout: 45000,
  });
  log('✅ Đã tải trang Overview');

  await adsPage.bringToFront();
  await screenshot(adsPage, '01_google_ads_overview');

  // Nhấp vào nút "+ Chiến dịch mới" (hoặc click bằng tạo chiến dịch trên giao diện)
  log('3️⃣ Tìm và nhấp nút "+ Chiến dịch mới" trên giao diện...');
  const clickedNewCampaign = await adsPage.evaluate(() => {
    // Tìm các thẻ chứa chữ "+ Chiến dịch mới" hoặc "+ New campaign" chính xác tuyệt đối
    const all = Array.from(document.querySelectorAll('button, [role="button"], material-button, div, span, a'));
    const targets = all.filter(el => {
      const text = el.textContent?.trim();
      return text === '+ Chiến dịch mới' || text === '+ New campaign' || text === 'Chiến dịch mới' || text === 'New campaign';
    });
    
    if (targets.length > 0) {
      // Ưu tiên thẻ BUTTON, MATERIAL-BUTTON hoặc A
      const bestTarget = targets.find(el => ['BUTTON', 'MATERIAL-BUTTON', 'A'].includes(el.tagName)) || targets[0];
      bestTarget.click();
      return `Đã nhấp button: <${bestTarget.tagName}> "${bestTarget.textContent?.trim()}"`;
    }
    
    // Fallback: Tìm nút "+" (Tạo) ở sidebar bên trái
    const createBtn = document.querySelector('[aria-label*="Tạo"], [aria-label*="Create"], .create-button, [class*="create"]');
    if (createBtn) {
      createBtn.click();
      return 'Đã nhấp nút "Tạo" ở sidebar';
    }
    return null;
  });

  if (clickedNewCampaign) {
    log(`✅ ${clickedNewCampaign}`);
  } else {
    log('⚠️ Không tìm thấy nút tạo chiến dịch, đang thử click theo selector đặc trưng...');
    try {
      await adsPage.evaluate(() => {
        const el = document.querySelector('material-button[aria-label="Chiến dịch mới"], button[aria-label="Chiến dịch mới"]');
        if (el) el.click();
      });
    } catch (e) {
      log('❌ Thử click fallback thất bại');
    }
  }

  await delay(5000);
  await screenshot(adsPage, '02_new_campaign_wizard');

  log('');
  log('═══════════════════════════════════════════════');
  log('⚡ GHI CHÚ QUAN TRỌNG:');
  log('═══════════════════════════════════════════════');
  log('');
  log('Script đã kết nối Chrome và mở trình tạo chiến dịch.');
  log('');
  log('Giao diện Google Ads thay đổi thường xuyên nên việc');
  log('tự động hóa 100% qua UI có thể không ổn định.');
  log('');
  log('👇 Tôi sẽ tạo chiến dịch TỪNG BƯỚC với screenshot:');
  log('');

  // Step 4: Try to select campaign objective - "Leads"
  try {
    log('4️⃣ Chọn mục tiêu chiến dịch: Leads...');
    await delay(2000);
    
    const found = await adsPage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const textMatches = elements.filter(el => {
        const text = el.textContent?.trim();
        return text === 'Khách hàng tiềm năng' || text === 'Leads';
      });
      
      for (const el of textMatches) {
        // Tìm element cha gần nhất có khả năng click (chứa card, goal, button, hoặc role=button)
        const clickable = el.closest('[role="button"]') || el.closest('[role="radio"]') || el.closest('material-button') || el.closest('[class*="card"]') || el.closest('[class*="goal"]') || el;
        if (clickable && clickable !== document.body && clickable.tagName !== 'HTML') {
          clickable.click();
          return `Clicked Leads card: <${clickable.tagName}> containing "${el.textContent}"`;
        }
      }
      return null;
    });

    if (found) {
      log(`✅ ${found}`);
    } else {
      log('⚠️ Không tìm thấy nút "Leads" tự động.');
    }
    
    await delay(2000);
    await screenshot(adsPage, '03_select_leads');

    // Click Continue (Tiếp tục) để lưu mục tiêu và chuyển sang chọn loại chiến dịch
    log('5️⃣ Click Tiếp tục chuyển sang Chọn loại chiến dịch...');
    await adsPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
      for (const btn of buttons) {
        const text = btn.textContent?.trim().toLowerCase();
        if (text === 'tiếp tục' || text === 'continue' || text === 'next' || text === 'tiếp') {
          btn.click();
          break;
        }
      }
    });
    await delay(3000);
    await screenshot(adsPage, '04_leads_goals_continue');

    // Step 5: Select campaign type - "Search"
    log('6️⃣ Chọn loại chiến dịch: Search (Tìm kiếm)...');
    
    const searchFound = await adsPage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const textMatches = elements.filter(el => {
        const text = el.textContent?.trim();
        return text === 'Tìm kiếm' || text === 'Search';
      });
      
      for (const el of textMatches) {
        const clickable = el.closest('[role="button"]') || el.closest('[role="radio"]') || el.closest('material-button') || el.closest('[class*="card"]') || el;
        if (clickable && clickable !== document.body && clickable.tagName !== 'HTML') {
          clickable.click();
          return `Clicked Search card: <${clickable.tagName}> containing "${el.textContent}"`;
        }
      }
      return null;
    });

    if (searchFound) {
      log(`✅ ${searchFound}`);
    } else {
      log('⚠️ Không tìm thấy "Search" tự động');
    }

    // Click Continue lần 2 để chuyển sang cài đặt chiến dịch
    log('7️⃣ Click Tiếp tục sang Cài đặt chiến dịch...');
    const continueClicked = await adsPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'));
      for (const btn of buttons) {
        const text = btn.textContent?.trim().toLowerCase();
        if (text === 'tiếp tục' || text === 'continue' || text === 'next' || text === 'tiếp') {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (continueClicked) {
      log('✅ Đã click Continue');
    } else {
      log('⚠️ Không tìm thấy nút Continue');
    }
    
    await delay(4000);
    await screenshot(adsPage, '06_campaign_settings_page');

    // Step 7: Campaign settings page
    log('7️⃣ Thiết lập cài đặt chiến dịch...');
    
    // Try to set campaign name
    const nameSet = await adsPage.evaluate((campaignName) => {
      const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
      for (const input of inputs) {
        const label = input.getAttribute('aria-label') || input.placeholder || '';
        const parent = input.closest('[class*="campaign-name"], [class*="name"]');
        if (label.toLowerCase().includes('campaign name') || label.includes('Tên chiến dịch') || parent) {
          input.value = '';
          input.focus();
          // Use native input setter to trigger React/Angular change detection
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, campaignName);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return `Set campaign name in input: ${label || 'no-label'}`;
        }
      }
      return null;
    }, CAMPAIGN.name);

    if (nameSet) {
      log(`✅ ${nameSet}`);
    } else {
      log('⚠️ Chưa tìm thấy trường tên chiến dịch');
    }

    await delay(1000);
    await screenshot(adsPage, '06_campaign_name');

    // Try to uncheck Display Network
    log('8️⃣ Tắt Display Network và Search Partners...');
    const networkSet = await adsPage.evaluate(() => {
      const results = [];
      // Find checkboxes for Display Network and Search Partners
      const checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"], material-checkbox');
      for (const cb of checkboxes) {
        const label = cb.getAttribute('aria-label') || cb.closest('label')?.textContent || 
                      cb.parentElement?.textContent || '';
        
        if (label.includes('Display') || label.includes('Hiển thị')) {
          if (cb.checked || cb.getAttribute('aria-checked') === 'true') {
            cb.click();
            results.push('Unchecked Display Network');
          } else {
            results.push('Display Network already off');
          }
        }
        if (label.includes('Search partners') || label.includes('Đối tác tìm kiếm')) {
          if (cb.checked || cb.getAttribute('aria-checked') === 'true') {
            cb.click();
            results.push('Unchecked Search Partners');
          } else {
            results.push('Search Partners already off');
          }
        }
      }
      return results.length > 0 ? results.join('; ') : null;
    });

    if (networkSet) {
      log(`✅ ${networkSet}`);
    } else {
      log('⚠️ Không tìm thấy checkbox Display/Search Partners');
    }

    await delay(1000);
    await screenshot(adsPage, '07_networks_off');

    // Output the full campaign data as JSON for manual reference
    log('');
    log('═══════════════════════════════════════════════');
    log('📊 DỮ LIỆU CHIẾN DỊCH ĐẦY ĐỦ:');
    log('═══════════════════════════════════════════════');
    log('');
    
    const fullData = {
      campaign: CAMPAIGN,
      adGroups: AD_GROUPS.map(ag => ({
        name: ag.name,
        keywordCount: ag.keywords.length,
        adsCount: ag.ads.length,
      })),
      negativeKeywordCount: NEGATIVE_KEYWORDS.length,
      sitelinkCount: SITELINKS.length,
      calloutCount: CALLOUTS.length,
      snippetCount: STRUCTURED_SNIPPETS.length,
    };
    
    console.log(JSON.stringify(fullData, null, 2));

  } catch (e) {
    log(`❌ Lỗi trong quá trình tạo chiến dịch: ${e.message}`);
    await screenshot(adsPage, 'error_state');
  }

  // Save complete data for manual import
  const exportPath = path.join(__dirname, '..', '_tmp', 'campaign_data_for_manual_import.json');
  ensureDir(path.dirname(exportPath));
  fs.writeFileSync(exportPath, JSON.stringify({
    campaign: CAMPAIGN,
    adGroups: AD_GROUPS,
    negativeKeywords: NEGATIVE_KEYWORDS,
    sitelinks: SITELINKS,
    callouts: CALLOUTS,
    structuredSnippets: STRUCTURED_SNIPPETS,
  }, null, 2), 'utf8');
  log(`📁 Dữ liệu chiến dịch đã lưu: ${exportPath}`);

  log('');
  log('═══════════════════════════════════════════════');
  log('📌 BƯỚC TIẾP THEO:');
  log('═══════════════════════════════════════════════');
  log('');
  log('Nếu script chưa tự động hoàn tất, anh có thể:');
  log('');
  log('CÁCH 1 - Dùng Google Ads Editor (khuyến nghị):');
  log('  1. Tải Google Ads Editor: https://ads.google.com/intl/vi_vn/home/tools/ads-editor/');
  log('  2. Cài đặt và kết nối tài khoản 116-514-6070');
  log('  3. Import các file CSV đã sửa tại:');
  log('     D:\\.thongtaccongquangninh\\tools\\.google\\04-google-ads\\editor_import\\');
  log('');
  log('CÁCH 2 - Tạo thủ công trên giao diện web:');
  log('  Dùng dữ liệu trong file:');
  log(`  ${exportPath}`);
  log('');

  // Don't disconnect - keep the browser open for the user
  log('✅ Script hoàn tất. Chrome vẫn mở để anh tiếp tục.');
}

main().catch(e => {
  console.error('❌ Lỗi nghiêm trọng:', e.message);
  process.exit(1);
});
