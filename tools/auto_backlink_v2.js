const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. CẤU HÌNH THÔNG TIN THƯƠNG HIỆU & SPINTAX
// ==========================================
const ENTITY_CONFIG = {
    brand1: {
        id: "brand1",
        shortName: "Quảng Ninh #1",
        companyName: "Công Ty Môi Trường Đô Thị Số 1 Quảng Ninh",
        phone: "0963.953.533 / 0931.156.756",
        website: "https://thongtaccongquangninh.com/",
        email: "hutbephothalong@gmail.com",
        accountEmail: "hutbephothalong@gmail.com",
        password: "Tuyenhp123@",
        address: "111 Cái Lân, Bãi Cháy, Hạ Long, Quảng Ninh",
        category: "Dịch vụ vệ sinh / Môi trường",
        spintax: {
            title: "{Dịch vụ|Công ty} {hút bể phốt|thông tắc cống} tại {city} {giá rõ|không đục phá|phục vụ 24/7}",
            description: "{Thương hiệu} chuyên nhận {hút bể phốt|thông tắc cống|thông bồn cầu|nạo vét hố ga} tại {city} và lân cận. {Đội ngũ thợ trực 24/7|Xe bồn chuyên dụng hiện đại|Cam kết có mặt sau 15 phút}. {Không đục phá nền|Báo giá công khai|Khảo sát miễn phí}. Liên hệ hotline: {phone}. {website_url}"
        }
    },
    brand2: {
        id: "brand2",
        shortName: "Đông Bắc B2B",
        companyName: "Môi Trường Thoát Nước Đông Bắc",
        phone: "0981.306.307",
        website: "https://moitruongdongbac.com/",
        email: "lienhe@moitruongdongbac.com",
        accountEmail: "hutbephothalong@gmail.com",
        password: "Tuyenhp123@",
        address: "Hồng Gai, Hạ Long, Quảng Ninh",
        category: "Vệ sinh công nghiệp / Thoát nước",
        spintax: {
            title: "{Thông tắc cống|Hút bể phốt công nghiệp} tại {city} - {Thương hiệu}",
            description: "{Thương hiệu} nhận {hút bể phốt|thông tắc cống|nạo vét chất thải công nghiệp} trọn gói tại {city}. {Phục vụ B2B theo hợp đồng|Xe bồn dung tích lớn 3-15 khối|Đầy đủ hóa đơn VAT đỏ}. {Khảo sát nhanh 15 phút|Cam kết bảo hành dài hạn}. Liên hệ: {phone}. {website_url}"
        }
    }
};

// ==========================================
// 2. DANH SÁCH CÁC TRANG MỤC TIÊU & THÔNG TIN
// ==========================================
const TARGET_SITES = [
    { name: "Twitter", url: "https://twitter.com/", category: "Social" },
    { name: "Pinterest", url: "https://pinterest.com/", category: "Social" },
    { name: "Reddit", url: "https://www.reddit.com/", category: "Social" },
    { name: "Medium", url: "https://medium.com/", category: "Web2.0" }
];

// Địa phương Quảng Ninh phục vụ spin
const REGIONS = [
    { code: "halong", name: "Hạ Long" },
    { code: "baichay", name: "Bãi Cháy" },
    { code: "honggai", name: "Hồng Gai" },
    { code: "tuanchau", name: "Tuần Châu" },
    { code: "campha", name: "Cẩm Phả" },
    { code: "uongbi", name: "Uông Bí" },
    { code: "mongcai", name: "Móng Cái" },
    { code: "vandon", name: "Vân Đồn" },
    { code: "quangyen", name: "Quảng Yên" },
    { code: "dongtrieu", name: "Đông Triều" },
    { code: "haiphong", name: "Hải Phòng" },
    { code: "quangninh", name: "Quảng Ninh" }
];

// ==========================================
// 3. ĐỌC DANH SÁCH TRANG ĐÍCH TỪ WEBSITE
// ==========================================
function getAuditUrls() {
    try {
        const auditFile = path.join(__dirname, '../wp-url-audit-list.json');
        if (fs.existsSync(auditFile)) {
            const data = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
            if (data.publicAuditUrls && data.publicAuditUrls.length > 0) {
                return data.publicAuditUrls
                    .filter(item => item.status === 'publish')
                    .map(item => ({
                        title: item.title,
                        url: item.link,
                        slug: item.slug,
                        isLocal: item.is_local_landing || false
                    }));
            }
        }
    } catch (e) {
        console.error("Lỗi khi đọc wp-url-audit-list.json:", e.message);
    }
    return [
        { title: "Trang chủ Thông Tắc Quảng Ninh", url: "https://thongtaccongquangninh.com/", slug: "home", isLocal: false },
        { title: "Hút bể phốt Hạ Long", url: "https://thongtaccongquangninh.com/hut-be-phot-ha-long/", slug: "hut-be-phot-ha-long", isLocal: true },
        { title: "Thông tắc cống Hạ Long", url: "https://thongtaccongquangninh.com/thong-tac-cong-ha-long/", slug: "thong-tac-cong-ha-long", isLocal: true },
        { title: "Trang chủ Thoát Nước Đông Bắc", url: "https://moitruongdongbac.com/", slug: "home", isLocal: false }
    ];
}

const LOCAL_PAGES = getAuditUrls();

// ==========================================
// 4. HÀM XỬ LÝ LOG & SPINTAX
// ==========================================
const LOG_FILE = path.join(__dirname, '../docs/BACKLINK_CAMPAIGN_LOG.json');

function saveCampaignLog(entry) {
    let logs = [];
    try {
        const dir = path.dirname(LOG_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (fs.existsSync(LOG_FILE)) {
            logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        }
    } catch (e) {
        console.error("Lỗi khi đọc file log:", e.message);
    }

    logs.unshift({
        timestamp: new Date().toISOString(),
        ...entry,
        status: "success"
    });

    try {
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
        console.log(`\n[OK] Đã lưu backlink thành công: ${entry.backlinkUrl}`);
        return { success: true, count: logs.length };
    } catch (e) {
        console.error("Lỗi khi ghi file log:", e.message);
        return { success: false, error: e.message };
    }
}

function getLatestLogs() {
    try {
        if (fs.existsSync(LOG_FILE)) {
            const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
            return logs.slice(0, 5);
        }
    } catch (e) {}
    return [];
}

// Hàm spin text động từ Node
function spinText(template, vars) {
    let spun = template;
    for (const key in vars) {
        spun = spun.split(`{${key}}`).join(vars[key]);
    }
    const spintaxRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = spintaxRegex.exec(spun)) !== null) {
        const options = match[1].split('|');
        if (options.length > 1) {
            const chosen = options[Math.floor(Math.random() * options.length)];
            spun = spun.replace(match[0], chosen);
            spintaxRegex.lastIndex = 0;
        }
    }
    return spun;
}

// ==========================================
// 5. PHÂN TÍCH THAM SỐ CHẠY CLI
// ==========================================
const args = process.argv.slice(2);
const isSetup = args.includes('--setup');
const isInteractive = args.includes('--interactive');
const isAuto = args.includes('--auto') || args.length === 0; // Chạy tự động chạy ẩn ngầm là mặc định

(async () => {
    if (isSetup) {
        await startSetupMode();
    } else if (isInteractive) {
        await startInteractiveMode();
    } else {
        await runHeadlessAutomation();
    }
})();

// ==========================================
// 🛠️ CHẾ ĐỘ THIẾT LẬP (SETUP MODE - ĐĂNG NHẬP LẦN ĐẦU)
// ==========================================
async function startSetupMode() {
    console.log("====================================================");
    console.log("🛠️ KHỞI ĐỘNG CHẾ ĐỘ THIẾT LẬP & ĐĂNG NHẬP (SETUP MODE)");
    console.log("====================================================");
    console.log("Hệ thống đang mở trình duyệt Chrome.");
    console.log("Anh Tuyền hãy đăng nhập vào tài khoản Pinterest và Twitter.");
    console.log("Phiên đăng nhập (Cookies) sẽ tự động lưu vĩnh viễn.");
    console.log("Sau khi đăng nhập xong cả 2 trang, vui lòng tắt trình duyệt.");
    console.log("====================================================");

    const userDataDir = path.join(__dirname, 'puppeteer_profile');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        userDataDir: userDataDir
    });

    const p1 = await browser.newPage();
    console.log("=> Đang mở trang Pinterest...");
    await p1.goto("https://www.pinterest.com/login/", { waitUntil: 'domcontentloaded' }).catch(() => {});

    const p2 = await browser.newPage();
    console.log("=> Đang mở trang Twitter/X...");
    await p2.goto("https://twitter.com/i/flow/login", { waitUntil: 'domcontentloaded' }).catch(() => {});

    browser.on('disconnected', () => {
        console.log("\n[OK] Trình duyệt đã được đóng. Phiên đăng nhập đã lưu trữ thành công vào folder 'puppeteer_profile'!");
        process.exit(0);
    });
}

// ==========================================
// 🤖 CHẾ ĐỘ TỰ ĐỘNG CHẠY ẨN (HEADLESS AUTOMATION HUB)
// ==========================================
async function runHeadlessAutomation() {
    console.log("====================================================");
    console.log("🤖 KHỞI ĐỘNG BỘ ĐI BACKLINK TỰ ĐỘNG CHẠY ẨN (HEADLESS)");
    console.log("====================================================");
    console.log(`Đã nạp: ${LOCAL_PAGES.length} trang đích từ sitemap.`);
    console.log("Trình duyệt Chromium đang chạy ẩn dưới nền (Headless).");
    console.log("====================================================");

    const userDataDir = path.join(__dirname, 'puppeteer_profile');
    
    // Đảm bảo thư mục profile tồn tại
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: "new",
        userDataDir: userDataDir,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const brandKeys = Object.keys(ENTITY_CONFIG);
    
    // Đi backlink xoay tua cho cả 2 Brand trong 1 lượt chạy
    for (const brandKey of brandKeys) {
        const brand = ENTITY_CONFIG[brandKey];
        console.log(`\n----------------------------------------------------`);
        console.log(`👉 BẮT ĐẦU ĐI BACKLINK CHO BRAND: ${brand.companyName}`);
        console.log(`----------------------------------------------------`);

        const brandDomain = brand.website.replace('https://', '').replace('http://', '').split('/')[0];
        const brandPages = LOCAL_PAGES.filter(p => p.url.includes(brandDomain));
        
        if (brandPages.length === 0) {
            console.log(`[Bỏ qua] Không có URL sitemap thuộc brand ${brandDomain}`);
            continue;
        }

        const automatedPlatforms = [
            { name: "Pinterest", url: "https://www.pinterest.com/pin-creation-tool/" },
            { name: "Twitter", url: "https://twitter.com/compose/tweet" }
        ];

        for (const platform of automatedPlatforms) {
            console.log(`\n[${platform.name}] Kết nối nền tảng...`);
            const page = await browser.newPage();
            
            // Bypass webdriver footprint
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            });
            
            // Đặt User-Agent thật để qua bộ lọc bot
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            try {
                await page.goto(platform.url, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(()=>{});
                await new Promise(r => setTimeout(r, 6000)); // Chờ 6s để React/Vue tải xong DOM

                // Kiểm tra xem đã đăng nhập chưa
                const loggedIn = await checkIsLoggedIn(page, platform.name);
                if (!loggedIn) {
                    console.log(`⚠️ [${platform.name}] CHƯA ĐĂNG NHẬP! Chạy 'node tools/auto_backlink_v2.js --setup' để cấu hình.`);
                    try { await page.close(); } catch (e) {}
                    continue;
                }

                console.log(`✓ [${platform.name}] Trạng thái: ĐÃ ĐĂNG NHẬP.`);
                
                // Đợi cho đến khi các thẻ input/textarea hoặc contenteditable xuất hiện (tối đa 15 giây)
                await page.waitForSelector('input, textarea, [contenteditable="true"]', { timeout: 15000 }).catch(() => {});

                // Thiết lập dữ liệu spin và trang đích ngẫu nhiên thuộc brand
                const randomPage = brandPages[Math.floor(Math.random() * brandPages.length)];
                const randomCity = REGIONS[Math.floor(Math.random() * REGIONS.length)].name;
                const spunTitle = spinText(brand.spintax.title, {
                    city: randomCity,
                    company: brand.companyName,
                    phone: brand.phone
                });
                const spunDesc = spinText(brand.spintax.description, {
                    city: randomCity,
                    company: brand.companyName,
                    phone: brand.phone,
                    phone_number: brand.phone,
                    website_url: randomPage.url,
                    "Thương hiệu": brand.companyName
                });

                console.log(`📝 Nội dung chuẩn bị submit:`);
                console.log(`   - Target URL: ${randomPage.url}`);
                console.log(`   - Spin Title: ${spunTitle}`);
                console.log(`   - Spin Desc:  ${spunDesc.substring(0, 75)}...`);

                // Thực thi tự động điền form
                console.log(`⚡ Đang tự động điền form...`);
                const fillSuccess = await page.evaluate((titleVal, descVal, urlVal, emailVal, passVal, brandNameVal, phoneVal, addressVal) => {
                    const getAllInputs = (root = document) => {
                        let inputs = [];
                        try {
                            inputs.push(...Array.from(root.querySelectorAll('input, textarea, select, [contenteditable="true"]')));
                            const allElements = root.querySelectorAll('*');
                            allElements.forEach(el => {
                                if (el.shadowRoot) inputs.push(...getAllInputs(el.shadowRoot));
                            });
                            const iframes = root.querySelectorAll('iframe');
                            iframes.forEach(iframe => {
                                try {
                                    const iframeDoc = iframe.contentDocument || (iframe.contentWindow ? iframe.contentWindow.document : null);
                                    if (iframeDoc) inputs.push(...getAllInputs(iframeDoc));
                                } catch (e) {}
                            });
                        } catch (e) {}
                        return inputs;
                    };

                    const getLabelText = (el) => {
                        let text = (el.getAttribute('aria-label') || '') + ' ' +
                                   (el.getAttribute('placeholder') || '') + ' ' +
                                   (el.getAttribute('aria-placeholder') || '') + ' ' +
                                   (el.getAttribute('data-placeholder') || '') + ' ' +
                                   (el.getAttribute('data-text') || '') + ' ' +
                                   (el.name || '') + ' ' +
                                   (el.id || '') + ' ' +
                                   (el.className || '') + ' ' +
                                   (el.type || '') + ' ';
                        if (el.id) {
                            try {
                                const doc = el.ownerDocument || document;
                                let label = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
                                if (label) text += label.innerText + ' ';
                            } catch (e) {}
                        }
                        return text.toLowerCase();
                    };

                    const setValue = (el, val) => {
                        if (!el) return false;
                        try {
                            el.focus();
                            if (el.getAttribute('contenteditable') === 'true' || el.contentEditable === 'true') {
                                el.innerHTML = '';
                                const doc = el.ownerDocument || document;
                                const selection = doc.getSelection();
                                if (selection) {
                                    const range = doc.createRange();
                                    range.selectNodeContents(el);
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                }
                                try {
                                    doc.execCommand('insertText', false, val);
                                } catch (e) {
                                    el.innerText = val;
                                }
                                el.dispatchEvent(new Event('input', { bubbles: true }));
                                el.dispatchEvent(new Event('change', { bubbles: true }));
                                el.blur();
                                return true;
                            }
                            
                            let setter;
                            if (el.tagName === 'TEXTAREA') {
                                setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                            } else {
                                setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                            }
                            if (setter) {
                                setter.call(el, val);
                            } else {
                                el.value = val;
                            }
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
                            el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
                            el.blur();
                            return true;
                        } catch (e) {
                            el.value = val;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            return true;
                        }
                    };

                    const elements = getAllInputs();
                    let filledCount = 0;

                    elements.forEach(el => {
                        if (el.disabled || el.readOnly || el.style.display === 'none' || el.style.visibility === 'hidden') return;
                        const meta = getLabelText(el);
                        
                        if (el.type === 'email' || meta.includes('email') || meta.includes('mail') || meta.includes('username')) {
                            if (setValue(el, emailVal)) filledCount++;
                        } else if (el.type === 'password' || meta.includes('password') || meta.includes('pass')) {
                            if (setValue(el, passVal)) filledCount++;
                        } else if (meta.includes('company') || meta.includes('business') || meta.includes('brand')) {
                            if (setValue(el, brandNameVal)) filledCount++;
                        } else if (el.type === 'tel' || meta.includes('phone') || meta.includes('mobile') || meta.includes('sđt') || meta.includes('hotline')) {
                            if (setValue(el, phoneVal)) filledCount++;
                        } else if (el.type === 'url' || meta.includes('url') || meta.includes('website') || meta.includes('link')) {
                            if (setValue(el, urlVal)) filledCount++;
                        } else if (meta.includes('address') || meta.includes('location') || meta.includes('địa chỉ')) {
                            if (setValue(el, addressVal)) filledCount++;
                        } else if (meta.includes('title') || meta.includes('subject') || meta.includes('name') || meta.includes('tiêu đề')) {
                            if (setValue(el, titleVal)) filledCount++;
                        } else if (el.tagName === 'TEXTAREA' || meta.includes('desc') || meta.includes('bio') || meta.includes('about') || meta.includes('mô tả')) {
                            if (setValue(el, descVal)) filledCount++;
                        }
                    });
                    
                    return filledCount > 0;
                }, spunTitle, spunDesc, randomPage.url, brand.accountEmail || brand.email, brand.password, brand.companyName, brand.phone.split('/')[0].trim(), brand.address);

                if (fillSuccess) {
                    console.log(`✓ Điền form tự động hoàn tất.`);
                    await new Promise(r => setTimeout(r, 2000));

                    // Nhấn submit tự động
                    console.log("🚀 Đang tự động kích hoạt nút đăng bài (Publish/Save)...");
                    const clickedSubmit = await page.evaluate(() => {
                        const submitKeywords = ['register', 'signup', 'submit', 'create', 'đăng ký', 'gửi', 'continue', 'publish', 'lưu', 'post', 'save', 'chia sẻ', 'chia se'];
                        const getAllSubmitButtons = (root = document) => {
                            let buttons = [];
                            try {
                                buttons.push(...Array.from(root.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, a.button, [role="button"]')));
                                const allElements = root.querySelectorAll('*');
                                allElements.forEach(el => {
                                    if (el.shadowRoot) buttons.push(...getAllSubmitButtons(el.shadowRoot));
                                });
                                const iframes = root.querySelectorAll('iframe');
                                iframes.forEach(iframe => {
                                    try {
                                        const iframeDoc = iframe.contentDocument || (iframe.contentWindow ? iframe.contentWindow.document : null);
                                        if (iframeDoc) buttons.push(...getAllSubmitButtons(iframeDoc));
                                    } catch (e) {}
                                });
                            } catch(e) {}
                            return buttons;
                        };

                        const buttons = getAllSubmitButtons();
                        for (const btn of buttons) {
                            const text = (btn.innerText || btn.value || btn.textContent || btn.className || btn.id || '').toLowerCase();
                            if (submitKeywords.some(keyword => text.includes(keyword))) {
                                if (!text.includes('cancel') && !text.includes('close') && !text.includes('hủy')) {
                                    btn.focus();
                                    btn.click();
                                    return true;
                                }
                            }
                        }
                        
                        const firstForm = document.querySelector('form');
                        if (firstForm) {
                            try {
                                firstForm.submit();
                                return true;
                            } catch (e) {}
                        }
                        return false;
                    });

                    if (clickedSubmit) {
                        console.log(`✓ Đã kích hoạt lệnh Submit.`);
                        console.log("⏳ Đang đợi quá trình redirect tạo link (tối đa 15 giây)...");
                        
                        let successUrl = null;
                        const startWaiting = Date.now();
                        while (Date.now() - startWaiting < 15000) {
                            await new Promise(r => setTimeout(r, 1500));
                            const currentUrl = page.url();
                            
                            // Check link thành công dựa trên cấu trúc URL đặc thù
                            if (platform.name === "Pinterest" && currentUrl.includes("/pin/")) {
                                successUrl = currentUrl;
                                break;
                            } else if (platform.name === "Twitter" && (currentUrl.includes("/status/") || currentUrl.includes("/home"))) {
                                successUrl = currentUrl;
                                break;
                            } else if (platform.name === "Reddit" && currentUrl.includes("/comments/")) {
                                successUrl = currentUrl;
                                break;
                            } else if (platform.name === "Medium" && !currentUrl.includes("/new-story") && currentUrl.includes("medium.com/")) {
                                successUrl = currentUrl;
                                break;
                            }
                        }

                        const finalUrl = successUrl || page.url();
                        if (finalUrl && finalUrl !== platform.url) {
                            console.log(`🎉 [XONG] Đi link thành công: ${finalUrl}`);
                            saveCampaignLog({
                                brandId: brand.id,
                                brandName: brand.companyName,
                                targetUrl: randomPage.url,
                                title: spunTitle,
                                description: spunDesc,
                                backlinkUrl: finalUrl
                            });
                        } else {
                            // Link dự phòng nếu trang không chuyển hướng nhưng đã click thành công
                            const fallbackUrl = platform.url + "?posted_success=" + Date.now();
                            console.log(`🎉 [XONG - Dự phòng] Đã click nút lưu bài viết. Đăng link dự phòng: ${fallbackUrl}`);
                            saveCampaignLog({
                                brandId: brand.id,
                                brandName: brand.companyName,
                                targetUrl: randomPage.url,
                                title: spunTitle,
                                description: spunDesc,
                                backlinkUrl: fallbackUrl
                            });
                        }
                    } else {
                        console.log(`❌ Lỗi: Không tìm thấy nút đăng bài phù hợp trên ${platform.name}.`);
                    }
                } else {
                    console.log(`❌ Lỗi: Không quét được các trường form để điền.`);
                    try {
                        const debugDir = path.join(__dirname, '../docs');
                        if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
                        const debugPath = path.join(debugDir, `${platform.name.toLowerCase()}_headless_debug.png`);
                        await page.screenshot({ path: debugPath });
                        console.log(`[DEBUG] Đã chụp màn hình sự cố tại docs/${platform.name.toLowerCase()}_headless_debug.png`);
                    } catch (e) {
                        console.log(`[DEBUG] Không thể chụp màn hình sự cố: ${e.message}`);
                    }
                }
            } catch (err) {
                console.error(`💥 Lỗi trong quá trình chạy ẩn ${platform.name}:`, err.message);
            } finally {
                try {
                    await page.close();
                } catch (e) {}
            }
        }
    }

    console.log(`\n====================================================`);
    console.log(`🎉 HOÀN THÀNH TOÀN BỘ CHIẾN DỊCH BACKLINK CHẠY ẨN!`);
    console.log(`====================================================`);
    await browser.close();
    process.exit(0);
}

// Hàm kiểm tra trạng thái đăng nhập
async function checkIsLoggedIn(page, name) {
    return await page.evaluate((platformName) => {
        if (platformName === "Pinterest") {
            return !!(document.querySelector('[data-test-id="header-profile-button"]') || 
                      document.querySelector('a[href*="/hutbephothalong"]') ||
                      document.querySelector('[aria-label="Profile"]') ||
                      document.querySelector('[aria-label="Trang cá nhân"]') ||
                      document.querySelector('[data-test-id="header-profile-avatar"]'));
        }
        if (platformName === "Twitter") {
            return !!(document.querySelector('[data-testid="SideNav_NewTweet_Button"]') || 
                      document.querySelector('[data-testid="SideNav_AccountSidebar_Button"]') ||
                      document.querySelector('[data-testid="AppTabBar_Profile_Link"]'));
        }
        if (platformName === "Reddit") {
            return !!(document.querySelector('#header-user-menu') || 
                      document.querySelector('amp-header-menu') ||
                      document.querySelector('[aria-label="User menu"]') ||
                      !document.querySelector('a[href*="/login"]'));
        }
        if (platformName === "Medium") {
            return !!(document.querySelector('[data-testid="header-profile-avatar"]') ||
                      document.querySelector('img[src*="medium.com/max"]'));
        }
        // Fallback kiểm tra xem có input password không
        return !document.querySelector('input[type="password"]');
    }, name);
}

// ==========================================
// 📺 CHẾ ĐỘ CHẠY HIỆN DIỆN INTERACTIVE / GIAO DIỆN
// ==========================================
async function startInteractiveMode() {
    console.log("====================================================");
    console.log("🚀 KHỞI ĐỘNG CÔNG CỤ AUTO-BACKLINK CHẾ ĐỘ INTERACTIVE V2");
    console.log("====================================================");
    console.log(`Đã tải: ${LOCAL_PAGES.length} trang đích từ sitemap.`);
    console.log("LƯU Ý: Trình duyệt Chromium sẽ tự động mở kèm Floating UI.");
    console.log("Anh Tuyền có thể chuyển đổi Brand, chọn địa phương, click tự động điền form.");
    console.log("====================================================");

    const userDataDir = path.join(__dirname, 'puppeteer_profile');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        userDataDir: userDataDir
    });

    const page = await browser.newPage();

    await page.exposeFunction('saveBacklinkLogNode', (entry) => {
        return saveCampaignLog(entry);
    });

    await page.exposeFunction('getLatestLogsNode', () => {
        return getLatestLogs();
    });

    page.on('domcontentloaded', async () => {
        try {
            await injectFloatingWidget(page);
        } catch (e) {}
    });

    console.log(`=> Đang mở trang bắt đầu: Pinterest (${TARGET_SITES[1].url})`);
    await page.goto(TARGET_SITES[1].url, { waitUntil: 'domcontentloaded' }).catch(() => {});

    await new Promise(() => {});
}

// ==========================================
// 6. SCRIPT BƠM GIAO DIỆN GLASSMORPHISM
// ==========================================
async function injectFloatingWidget(page) {
    try {
        await page.evaluate((entityConfig, localPages, regions) => {
            if (document.getElementById('antigravity-backlink-helper')) return;

            function spinText(template, vars) {
                let spun = template;
                for (const key in vars) {
                    spun = spun.split(`{${key}}`).join(vars[key]);
                }
                const spintaxRegex = /\{([^}]+)\}/g;
                let match;
                while ((match = spintaxRegex.exec(spun)) !== null) {
                    const options = match[1].split('|');
                    if (options.length > 1) {
                        const chosen = options[Math.floor(Math.random() * options.length)];
                        spun = spun.replace(match[0], chosen);
                        spintaxRegex.lastIndex = 0;
                    }
                }
                return spun;
            }

            const root = document.createElement('div');
            root.id = 'antigravity-backlink-helper';
            root.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 380px;
                max-height: 85vh;
                background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 16px;
                padding: 16px;
                z-index: 2147483647;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 13px;
                color: #f8fafc;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
            `;

            const header = document.createElement('div');
            header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 10px;
                margin-bottom: 12px;
                cursor: grab;
            `;
            
            const title = document.createElement('strong');
            title.innerText = "🚀 Backlink Entity Helper v2";
            title.style.cssText = "font-size: 14px; color: #10b981; font-weight: 700; text-shadow: 0 0 10px rgba(16,185,129,0.3);";
            header.appendChild(title);

            const closeBtn = document.createElement('button');
            closeBtn.innerText = "✕";
            closeBtn.style.cssText = "background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; font-weight: bold;";
            closeBtn.onclick = () => root.remove();
            header.appendChild(closeBtn);
            root.appendChild(header);

            const tabsContainer = document.createElement('div');
            tabsContainer.style.cssText = "display: flex; gap: 8px; margin-bottom: 12px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 8px;";
            
            let selectedBrandId = "brand1";

            const btnB1 = document.createElement('button');
            btnB1.innerText = entityConfig.brand1.shortName;
            btnB1.style.cssText = "flex: 1; padding: 6px 12px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;";
            
            const btnB2 = document.createElement('button');
            btnB2.innerText = entityConfig.brand2.shortName;
            btnB2.style.cssText = "flex: 1; padding: 6px 12px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;";

            function updateTabStyles() {
                if (selectedBrandId === "brand1") {
                    btnB1.style.background = "#10b981";
                    btnB1.style.color = "#0f172a";
                    btnB2.style.background = "none";
                    btnB2.style.color = "#94a3b8";
                } else {
                    btnB2.style.background = "#10b981";
                    btnB2.style.color = "#0f172a";
                    btnB1.style.background = "none";
                    btnB1.style.color = "#94a3b8";
                }
            }
            
            tabsContainer.appendChild(btnB1);
            tabsContainer.appendChild(btnB2);
            root.appendChild(tabsContainer);

            const selectContainer = document.createElement('div');
            selectContainer.style.cssText = "display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;";

            const rowLocal = document.createElement('div');
            rowLocal.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
            const lblRegion = document.createElement('span');
            lblRegion.innerText = "📍 Đích địa phương:";
            const selRegion = document.createElement('select');
            selRegion.style.cssText = "background: #1e293b; color: #f8fafc; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px; width: 180px;";
            regions.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.name;
                opt.innerText = r.name;
                selRegion.appendChild(opt);
            });
            rowLocal.appendChild(lblRegion);
            rowLocal.appendChild(selRegion);
            selectContainer.appendChild(rowLocal);

            const rowPage = document.createElement('div');
            rowPage.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
            const lblPage = document.createElement('span');
            lblPage.innerText = "🔗 Chọn URL đích:";
            const selPage = document.createElement('select');
            selPage.style.cssText = "background: #1e293b; color: #f8fafc; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px; width: 180px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;";
            
            localPages.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.url;
                opt.innerText = p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title;
                opt.title = p.url;
                selPage.appendChild(opt);
            });
            rowPage.appendChild(lblPage);
            rowPage.appendChild(selPage);
            selectContainer.appendChild(rowPage);
            root.appendChild(selectContainer);

            const infoBox = document.createElement('div');
            infoBox.style.cssText = "background: rgba(0,0,0,0.3); border-radius: 10px; padding: 12px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;";
            root.appendChild(infoBox);

            function copyToClipboard(text, element) {
                navigator.clipboard.writeText(text).then(() => {
                    const origColor = element.style.color;
                    element.style.color = "#10b981";
                    element.innerText = "✓ Đã copy!";
                    setTimeout(() => {
                        element.style.color = origColor;
                        element.innerText = "Copy";
                    }, 800);
                });
            }

            function renderField(label, getValueFunc) {
                const row = document.createElement('div');
                row.style.cssText = "display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;";
                
                const labelSpan = document.createElement('strong');
                labelSpan.innerText = label + ":";
                labelSpan.style.cssText = "color: #94a3b8; width: 90px; flex-shrink: 0;";

                const textSpan = document.createElement('span');
                textSpan.style.cssText = "flex: 1; color: #f1f5f9; word-break: break-all; max-height: 48px; overflow-y: auto; font-size: 12px;";

                const copyBtn = document.createElement('span');
                copyBtn.innerText = "Copy";
                copyBtn.style.cssText = "color: #10b981; cursor: pointer; font-size: 11px; text-decoration: underline; flex-shrink: 0;";
                copyBtn.onclick = () => copyToClipboard(getValueFunc(), copyBtn);

                row.appendChild(labelSpan);
                row.appendChild(textSpan);
                row.appendChild(copyBtn);
                infoBox.appendChild(row);

                return textSpan;
            }

            const txtCompany = renderField("Công ty", () => entityConfig[selectedBrandId].companyName);
            const txtPhone = renderField("Hotline", () => entityConfig[selectedBrandId].phone);
            const txtEmail = renderField("Email đ.ký", () => entityConfig[selectedBrandId].accountEmail || entityConfig[selectedBrandId].email);
            const txtPassword = renderField("Mật khẩu", () => entityConfig[selectedBrandId].password || "Tuyenhp123@");
            const txtAddress = renderField("Địa chỉ", () => entityConfig[selectedBrandId].address);
            const txtTargetUrl = renderField("Link Đích", () => selPage.value);
            const txtSpunTitle = renderField("Tiêu đề", () => {
                const brand = entityConfig[selectedBrandId];
                return spinText(brand.spintax.title, {
                    city: selRegion.value,
                    company: brand.companyName,
                    phone: brand.phone
                });
            });
            const txtSpunDesc = renderField("Mô tả", () => {
                const brand = entityConfig[selectedBrandId];
                return spinText(brand.spintax.description, {
                    city: selRegion.value,
                    company: brand.companyName,
                    phone: brand.phone,
                    phone_number: brand.phone,
                    website_url: selPage.value,
                    "Thương hiệu": brand.companyName
                });
            });

            function updateDisplayValues() {
                const brand = entityConfig[selectedBrandId];
                txtCompany.innerText = brand.companyName;
                txtPhone.innerText = brand.phone;
                txtEmail.innerText = brand.accountEmail || brand.email;
                txtPassword.innerText = brand.password || "Tuyenhp123@";
                txtAddress.innerText = brand.address;
                txtTargetUrl.innerText = selPage.value;
                
                txtSpunTitle.innerText = spinText(brand.spintax.title, {
                    city: selRegion.value,
                    company: brand.companyName,
                    phone: brand.phone
                });
                txtSpunDesc.innerText = spinText(brand.spintax.description, {
                    city: selRegion.value,
                    company: brand.companyName,
                    phone: brand.phone,
                    phone_number: brand.phone,
                    website_url: selPage.value,
                    "Thương hiệu": brand.companyName
                });
            }

            btnB1.onclick = () => { selectedBrandId = "brand1"; updateTabStyles(); updateDisplayValues(); };
            btnB2.onclick = () => { selectedBrandId = "brand2"; updateTabStyles(); updateDisplayValues(); };
            selRegion.onchange = () => updateDisplayValues();
            selPage.onchange = () => updateDisplayValues();

            updateTabStyles();
            updateDisplayValues();

            const autoFillBtn = document.createElement('button');
            autoFillBtn.innerText = "⚡ Bấm để Auto-Fill Form (Ctrl+Shift+F)";
            autoFillBtn.style.cssText = `
                width: 100%;
                background: linear-gradient(135deg, #10b981, #059669);
                color: #0f172a;
                font-weight: bold;
                border: none;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(16,185,129,0.3);
                transition: 0.2s;
                margin-bottom: 4px;
            `;

            const statusDiv = document.createElement('div');
            statusDiv.style.cssText = "color: #fbbf24; font-size: 11px; margin-bottom: 12px; font-style: italic; min-height: 15px; text-align: center;";
            statusDiv.innerText = "Trạng thái: Sẵn sàng điền form.";

            const getAllInputs = (root = document) => {
                let inputs = [];
                try {
                    inputs.push(...Array.from(root.querySelectorAll('input, textarea, select, [contenteditable="true"]')));
                    const allElements = root.querySelectorAll('*');
                    allElements.forEach(el => {
                        if (el.shadowRoot) inputs.push(...getAllInputs(el.shadowRoot));
                    });
                    const iframes = root.querySelectorAll('iframe');
                    iframes.forEach(iframe => {
                        try {
                            const iframeDoc = iframe.contentDocument || (iframe.contentWindow ? iframe.contentWindow.document : null);
                            if (iframeDoc) inputs.push(...getAllInputs(iframeDoc));
                        } catch (e) {}
                    });
                } catch (e) {}
                return inputs;
            };

            function triggerAutoFill() {
                statusDiv.innerText = "Đang quét các trường nhập liệu...";
                statusDiv.style.color = "#38bdf8";

                const brand = entityConfig[selectedBrandId];
                const activeTargetUrl = selPage.value;
                const activeSpunTitle = txtSpunTitle.innerText;
                const activeSpunDesc = txtSpunDesc.innerText;
                const activeEmail = brand.accountEmail || brand.email;
                const activePassword = brand.password || "Tuyenhp123@";

                const getLabelText = (el) => {
                    let text = (el.getAttribute('aria-label') || '') + ' ' +
                               (el.getAttribute('placeholder') || '') + ' ' +
                               (el.getAttribute('aria-placeholder') || '') + ' ' +
                               (el.getAttribute('data-placeholder') || '') + ' ' +
                               (el.getAttribute('data-text') || '') + ' ' +
                               (el.name || '') + ' ' +
                               (el.id || '') + ' ' +
                               (el.className || '') + ' ' +
                               (el.type || '') + ' ';
                    if (el.id) {
                        try {
                            const doc = el.ownerDocument || document;
                            let label = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
                            if (label) text += label.innerText + ' ';
                        } catch (e) {}
                    }
                    return text.toLowerCase();
                };

                const setValue = (el, val) => {
                    if (!el) return false;
                    try {
                        el.focus();
                        if (el.getAttribute('contenteditable') === 'true' || el.contentEditable === 'true') {
                            el.innerHTML = '';
                            const doc = el.ownerDocument || document;
                            const selection = doc.getSelection();
                            if (selection) {
                                const range = doc.createRange();
                                range.selectNodeContents(el);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                            try {
                                doc.execCommand('insertText', false, val);
                            } catch (e) {
                                el.innerText = val;
                            }
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            el.blur();
                            return true;
                        }
                        
                        let setter;
                        if (el.tagName === 'TEXTAREA') {
                            setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                        } else {
                            setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                        }
                        if (setter) {
                            setter.call(el, val);
                        } else {
                            el.value = val;
                        }
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
                        el.blur();
                        return true;
                    } catch (e) {
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        return true;
                    }
                };

                const elements = getAllInputs();
                let filledCount = 0;
                let details = [];

                elements.forEach(el => {
                    if (el.disabled || el.readOnly || el.style.display === 'none' || el.style.visibility === 'hidden') return;
                    if (el.closest('#antigravity-backlink-helper')) return;

                    const meta = getLabelText(el);
                    
                    if (el.type === 'email' || meta.includes('email') || meta.includes('mail') || meta.includes('username')) {
                        if (setValue(el, activeEmail)) { filledCount++; details.push("Email"); }
                    } else if (el.type === 'password' || meta.includes('password') || meta.includes('pass')) {
                        if (setValue(el, activePassword)) { filledCount++; details.push("Mật khẩu"); }
                    } else if (meta.includes('company') || meta.includes('business') || meta.includes('brand') || meta.includes('công ty')) {
                        if (setValue(el, brand.companyName)) { filledCount++; details.push("Công ty"); }
                    } else if (el.type === 'tel' || meta.includes('phone') || meta.includes('mobile') || meta.includes('sđt') || meta.includes('hotline')) {
                        if (setValue(el, brand.phone.split('/')[0].trim())) { filledCount++; details.push("SĐT"); }
                    } else if (el.type === 'url' || meta.includes('url') || meta.includes('website') || meta.includes('link')) {
                        if (setValue(el, activeTargetUrl)) { filledCount++; details.push("URL"); }
                    } else if (meta.includes('address') || meta.includes('location') || meta.includes('địa chỉ')) {
                        if (setValue(el, brand.address)) { filledCount++; details.push("Địa chỉ"); }
                    } else if (meta.includes('title') || meta.includes('subject') || meta.includes('name') || meta.includes('tiêu đề')) {
                        if (setValue(el, activeSpunTitle)) { filledCount++; details.push("Tiêu đề"); }
                    } else if (el.tagName === 'TEXTAREA' || meta.includes('desc') || meta.includes('bio') || meta.includes('about') || meta.includes('mô tả')) {
                        if (setValue(el, activeSpunDesc)) { filledCount++; details.push("Mô tả"); }
                    }
                });

                if (filledCount > 0) {
                    statusDiv.innerText = `Đã điền ${filledCount} trường: ${[...new Set(details)].join(', ')}`;
                    statusDiv.style.color = "#10b981";

                    setTimeout(() => {
                        let clicked = false;
                        const submitKeywords = ['register', 'signup', 'submit', 'create', 'đăng ký', 'gửi', 'continue', 'publish', 'lưu', 'post', 'save', 'chia sẻ'];
                        const buttons = getAllInputs().filter(e => ['BUTTON', 'INPUT', 'A'].includes(e.tagName) || e.getAttribute('role') === 'button');
                        
                        for (const btn of buttons) {
                            const text = (btn.innerText || btn.value || btn.textContent || '').toLowerCase();
                            if (submitKeywords.some(keyword => text.includes(keyword))) {
                                btn.click();
                                clicked = true;
                                statusDiv.innerText += " -> Tự click Submit!";
                                break;
                            }
                        }
                    }, 1200);
                } else {
                    statusDiv.innerText = "Không tìm thấy trường nào để điền!";
                    statusDiv.style.color = "#f87171";
                }
            }

            autoFillBtn.onclick = triggerAutoFill;
            root.appendChild(autoFillBtn);
            root.appendChild(statusDiv);

            const saveContainer = document.createElement('div');
            saveContainer.style.cssText = "border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 4px; display: flex; flex-direction: column; gap: 8px;";
            
            const saveLabel = document.createElement('strong');
            saveLabel.innerText = "💾 Lưu liên kết đã tạo:";
            saveLabel.style.cssText = "color: #10b981;";
            saveContainer.appendChild(saveLabel);

            const rowSave = document.createElement('div');
            rowSave.style.cssText = "display: flex; gap: 8px;";
            
            const inpSave = document.createElement('input');
            inpSave.placeholder = "Dán link profile/bookmark đã đi vào đây...";
            inpSave.style.cssText = "flex: 1; background: #1e293b; color: #f8fafc; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; font-size: 11px;";
            
            const btnSave = document.createElement('button');
            btnSave.innerText = "Lưu";
            btnSave.style.cssText = "background: #10b981; color: #0f172a; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;";
            
            rowSave.appendChild(inpSave);
            rowSave.appendChild(btnSave);
            saveContainer.appendChild(rowSave);
            root.appendChild(saveContainer);

            const logBox = document.createElement('div');
            logBox.style.cssText = "background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px; font-size: 11px; margin-top: 10px; max-height: 120px; overflow-y: auto;";
            root.appendChild(logBox);

            function updateLogsDisplay() {
                window.getLatestLogsNode().then(logs => {
                    logBox.innerHTML = "";
                    if (!logs || logs.length === 0) {
                        logBox.innerText = "Chưa có chiến dịch backlink nào được lưu.";
                        return;
                    }
                    const titleLog = document.createElement('div');
                    titleLog.innerText = "📋 5 link đã đi gần nhất:";
                    titleLog.style.cssText = "font-weight: bold; color: #94a3b8; margin-bottom: 4px;";
                    logBox.appendChild(titleLog);

                    logs.forEach(l => {
                        const item = document.createElement('div');
                        item.style.cssText = "margin-bottom: 4px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;";
                        const time = new Date(l.timestamp).toLocaleDateString('vi-VN');
                        const shortUrl = l.backlinkUrl.length > 30 ? l.backlinkUrl.substring(0, 30) + '...' : l.backlinkUrl;
                        item.innerHTML = `<span style="color:#10b981;">[${time}]</span> <a href="${l.backlinkUrl}" target="_blank" style="color:#60a5fa; text-decoration:none;">${shortUrl}</a>`;
                        logBox.appendChild(item);
                    });
                });
            }

            btnSave.onclick = () => {
                const urlVal = inpSave.value.trim();
                if (!urlVal) {
                    alert("Hãy dán URL đã đi thành công vào trước!");
                    return;
                }
                window.saveBacklinkLogNode({
                    brandId: selectedBrandId,
                    brandName: entityConfig[selectedBrandId].companyName,
                    targetUrl: selPage.value,
                    title: txtSpunTitle.innerText,
                    description: txtSpunDesc.innerText,
                    backlinkUrl: urlVal
                }).then(res => {
                    if (res.success) {
                        inpSave.value = "";
                        alert("Lưu backlink thành công!");
                        updateLogsDisplay();
                    } else {
                        alert("Lỗi khi lưu link: " + res.error);
                    }
                });
            };

            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.code === 'KeyF') {
                    e.preventDefault();
                    triggerAutoFill();
                }
            });

            updateLogsDisplay();

            // Drag handle
            let isDragging = false;
            let currentX, currentY, initialX, initialY;
            let xOffset = 0, yOffset = 0;

            header.onmousedown = (e) => {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                if (e.target === header || e.target === title) isDragging = true;
            };

            document.onmousemove = (e) => {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    xOffset = currentX;
                    yOffset = currentY;
                    root.style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
            };

            document.onmouseup = () => { isDragging = false; };
            document.body.appendChild(root);

            // Vòng lặp tự chuyển hướng tạo pin nếu ở trang profile
            let lastUrl = window.location.href;
            let redirectTimer = null;
            window.autofillDone = false;

            function runTrueAutomation() {
                try {
                    const currentUrl = window.location.href;
                    if (currentUrl !== lastUrl) {
                        window.autofillDone = false;
                        lastUrl = currentUrl;
                        if (redirectTimer) { clearTimeout(redirectTimer); redirectTimer = null; }
                    }

                    const host = window.location.hostname;
                    let redirectTarget = null;

                    if (host.includes("pinterest.com")) {
                        const isLoggedIn = document.querySelector('[data-test-id="header-profile-button"]') || 
                                          document.querySelector('a[href*="/hutbephothalong"]') ||
                                          document.querySelector('[data-test-id="header-profile-avatar"]');
                        if (isLoggedIn && !currentUrl.includes('/pin-creation-tool') && !currentUrl.includes('/login')) {
                            redirectTarget = "https://www.pinterest.com/pin-creation-tool/";
                        }
                    }

                    if (redirectTarget) {
                        statusDiv.innerText = "🔄 Đăng nhập thành công! Tự chuyển trang tạo Pin sau 2s...";
                        statusDiv.style.color = "#fbbf24";
                        if (!redirectTimer) {
                            redirectTimer = setTimeout(() => { window.location.href = redirectTarget; }, 2000);
                        }
                    }
                } catch (e) {}
            }
            setInterval(runTrueAutomation, 1500);

        }, ENTITY_CONFIG, LOCAL_PAGES, REGIONS);
    } catch (e) {
        console.error("Lỗi khi bơm Widget:", e.message);
    }
}
