const puppeteer = require('puppeteer'); // npm install puppeteer
const fs = require('fs');

// THÔNG TIN ENTITY CHUẨN (NAP)
const ENTITY_DATA = {
    companyName: "Công Ty Môi Trường Đô Thị Số 1 Quảng Ninh",
    phone: "0963.953.533",
    website: "https://thongtaccongquangninh.com/",
    address: "Quảng Ninh",
    description: "Chuyên cung cấp dịch vụ thông tắc cống, hút bể phốt, nạo vét hố ga, xử lý mùi hôi tại Quảng Ninh. Phục vụ 24/7, không đục phá, có mặt sau 15 phút.",
    email: "lienhe@thongtaccongquangninh.com"
};

// CÁC TRANG CHO PHÉP TẠO PROFILE (TIER 1 & TIER 2)
const TARGET_SITES = [
    { name: "About.me", url: "https://about.me/" },
    { name: "Pinterest", url: "https://www.pinterest.com/" },
    { name: "Medium", url: "https://medium.com/" },
    { name: "Behance", url: "https://www.behance.net/" },
    { name: "Linktree", url: "https://linktr.ee/" }
];

async function injectFloatingWidget(page) {
    try {
        await page.evaluate((data) => {
            if (document.getElementById('seo-entity-helper')) return;

            const div = document.createElement('div');
            div.id = 'seo-entity-helper';
            div.style.cssText = 'position:fixed;bottom:20px;right:20px;width:300px;background:#fff;border:2px solid #007bff;border-radius:8px;padding:15px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:Arial;font-size:13px;line-height:1.4;';
            
            const title = document.createElement('h3');
            title.innerText = '🛠️ SEO Entity Helper';
            title.style.cssText = 'margin:0 0 10px 0;color:#007bff;border-bottom:1px solid #ddd;padding-bottom:5px;';
            div.appendChild(title);

            const addField = (label, value) => {
                const row = document.createElement('div');
                row.style.marginBottom = '8px';
                
                const lbl = document.createElement('strong');
                lbl.innerText = label + ': ';
                
                const val = document.createElement('span');
                val.innerText = value.length > 30 ? value.substring(0, 30) + '...' : value;
                val.style.cssText = 'cursor:pointer;color:#28a745;text-decoration:underline;';
                val.title = 'Click để Copy';
                val.onclick = () => {
                    navigator.clipboard.writeText(value);
                    val.style.color = 'red';
                    setTimeout(() => val.style.color = '#28a745', 500);
                };

                row.appendChild(lbl);
                row.appendChild(val);
                div.appendChild(row);
            };

            addField('Công ty', data.companyName);
            addField('SĐT', data.phone);
            addField('Website', data.website);
            addField('Email', data.email);
            addField('Mô tả', data.description);

            const autoFillBtn = document.createElement('button');
            autoFillBtn.innerText = '⚡ Bấm để Auto-Fill Form';
            autoFillBtn.style.cssText = 'width:100%;background:#007bff;color:white;border:none;padding:8px;border-radius:4px;cursor:pointer;font-weight:bold;margin-top:10px;';
            autoFillBtn.onclick = () => {
                const triggerInput = (el, val) => {
                    if (el && el.value !== undefined) {
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                };
                
                // Mở rộng bộ chọn để dò tìm mạnh hơn
                document.querySelectorAll('input, textarea').forEach(el => {
                    const name = (el.name || el.id || el.placeholder).toLowerCase();
                    if (name.includes('company') || name.includes('business')) triggerInput(el, data.companyName);
                    else if (name.includes('phone') || name.includes('mobile')) triggerInput(el, data.phone);
                    else if (name.includes('url') || name.includes('website') || name.includes('link')) triggerInput(el, data.website);
                    else if (name.includes('email')) triggerInput(el, data.email);
                    else if (el.tagName === 'TEXTAREA' || name.includes('bio') || name.includes('desc')) triggerInput(el, data.description);
                });
                autoFillBtn.innerText = 'Đã điền (Kiểm tra lại)';
            };
            div.appendChild(autoFillBtn);

            const closeBtn = document.createElement('button');
            closeBtn.innerText = 'X';
            closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:none;border:none;color:red;cursor:pointer;font-weight:bold;';
            closeBtn.onclick = () => div.remove();
            div.appendChild(closeBtn);

            document.body.appendChild(div);
        }, ENTITY_DATA);
    } catch (e) {
        // Bỏ qua lỗi nếu trang đang chuyển hướng
    }
}

async function startSemiAutoLinkBuilding() {
    console.log("Khởi động Tool Semi-Auto Backlink Profile...");
    console.log("LƯU Ý: Tool sẽ tự mở trình duyệt và điền thông tin. Anh Tuyền cần TỰ VƯỢT CAPTCHA và bấm nút Xác nhận để tránh bị Google đánh dấu Spam (rất nguy hiểm cho Map đang bị mất).");
    
    const browser = await puppeteer.launch({ 
        headless: false, // Bắt buộc hiện UI để anh Tuyền vượt Captcha
        defaultViewport: null,
        args: ['--start-maximized'] 
    });

    const page = await browser.newPage();

    for (const site of TARGET_SITES) {
        console.log(`\n=> Đang mở trang: ${site.name} (${site.url})`);
        try {
            await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (e) {
            console.log("Trang web tải hơi chậm, đang tiếp tục ép chạy...");
        }
        
        console.log("Đã tải xong trang. Hãy bấm vào phần Đăng ký/Tạo tài khoản.");
        
        // Tool sẽ chờ ở mỗi trang 60 giây để anh Tuyền thao tác, 
        // trong quá trình đó sẽ liên tục thử điền form mỗi 5 giây.
        let timer = 0;
        const maxWaitTime = 60000; // 60 giây mỗi trang
        
        while (timer < maxWaitTime) {
            await injectFloatingWidget(page).catch(e => {});
            await new Promise(r => setTimeout(r, 5000));
            timer += 5000;
        }

        console.log(`Chuyển sang trang tiếp theo...`);
    }

    console.log("Đã chạy xong danh sách! Tắt trình duyệt.");
    await browser.close();
}

startSemiAutoLinkBuilding().catch(console.error);
