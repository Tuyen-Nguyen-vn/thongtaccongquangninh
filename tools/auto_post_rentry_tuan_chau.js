const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Đường dẫn bài viết nguồn tuyệt đối cho Tuần Châu
const ARTICLE_PATH = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\53731f4b-93f7-4ee2-8da8-6de39a2eb744\\scratch\\post_tuan_chau_web2.md";
const LOG_FILE = "D:\\.thongtaccongquangninh\\docs\\BACKLINK_CAMPAIGN_LOG.json";

async function autoPostRentry() {
    console.log("====================================================");
    console.log("🚀 KHỞI ĐỘNG BỘ ĐĂNG BÀI WEB 2.0 TỰ ĐỘNG CHO TUẦN CHÂU LÊN RENTRY.CO");
    console.log("====================================================");

    // 1. Đọc nội dung bài viết
    if (!fs.existsSync(ARTICLE_PATH)) {
        console.error(`[-] File bài viết không tồn tại tại: ${ARTICLE_PATH}`);
        process.exit(1);
    }
    const content = fs.readFileSync(ARTICLE_PATH, 'utf8');
    console.log("[*] Đọc bài viết thành công. Kích thước:", content.length, "bytes.");

    // 2. Khởi động Puppeteer
    console.log("[*] Đang khởi động trình duyệt ẩn ngầm (Headless)...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        // 3. Truy cập Rentry.co
        console.log("[*] Kết nối tới Rentry.co...");
        await page.goto("https://rentry.co/", { waitUntil: 'networkidle2', timeout: 45000 });
        
        console.log("[*] Đang nhập nội dung bài viết và thiết lập...");
        
        // Chờ trang tải đầy đủ và input CSRF xuất hiện
        await page.waitForSelector('input[name="csrfmiddlewaretoken"]', { timeout: 10000 });
        
        const editCode = Math.random().toString(36).substring(2, 10);
        console.log(`[+] Đã tạo edit code bảo mật: ${editCode}`);
        console.log("[*] Đang gửi bài viết trực tiếp qua fetch API trong ngữ cảnh trình duyệt...");

        const resultUrl = await page.evaluate(async (contentVal, editCodeVal) => {
            const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
            
            const formData = new URLSearchParams();
            formData.append('csrfmiddlewaretoken', csrfToken);
            formData.append('text', contentVal);
            formData.append('edit_code', editCodeVal);
            formData.append('url', ''); // Để trống để hệ thống tự sinh slug ngẫu nhiên

            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrfToken
                },
                body: formData.toString()
            });
            return response.url;
        }, content, editCode);

        console.log(`\n====================================================`);
        console.log(`🎉 XUẤT BẢN THÀNH CÔNG BÀI VIẾT WEB 2.0 TỰ ĐỘNG!`);
        console.log(`🔗 Link backlink: ${resultUrl}`);
        console.log(`====================================================`);

        // 5. Submit link backlink này lên Google Index qua Rank Math
        console.log("[*] Đang tự động gửi link backlink này lên Google Index...");
        const indexSuccess = await submitBacklinkToGoogleIndex(resultUrl);

        // 6. Ghi log chiến dịch
        saveToCampaignLog(resultUrl, editCode, indexSuccess);

    } catch (e) {
        console.error("[-] Lỗi trong quá trình đăng bài tự động:", e.message);
    } finally {
        await browser.close();
        console.log("[*] Đã đóng trình duyệt.");
    }
}

async function submitBacklinkToGoogleIndex(backlinkUrl) {
    try {
        const { submitIndexingUrl } = await import('./lib/google_indexing_api.mjs');
        const result = await submitIndexingUrl("D:\\.thongtaccongquangninh", backlinkUrl);
        if (result.ok) {
            console.log("[+] Submit Google Index trực tiếp thành công!");
            return true;
        }
        console.log(`[-] Gửi Index thất bại (Status ${result.status || 0}):`, JSON.stringify(result.payload ?? result));
        return false;
    } catch (err) {
        console.log("[-] Lỗi khi submit direct indexing:", err.message);
        return false;
    }
}

function saveToCampaignLog(backlinkUrl, editCode, indexSuccess) {
    let logs = [];
    try {
        if (fs.existsSync(LOG_FILE)) {
            logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        }
    } catch (e) {}

    logs.unshift({
        timestamp: new Date().toISOString(),
        platform: "Rentry.co",
        backlinkUrl: backlinkUrl,
        editCode: editCode,
        targetUrl: "https://thongtaccongquangninh.com/thong-tac-cong-tuan-chau/",
        indexedSubmitted: indexSuccess,
        status: "success"
    });

    try {
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
        console.log(`[+] Đã ghi nhận lịch sử vào file log: docs/BACKLINK_CAMPAIGN_LOG.json`);
    } catch (err) {
        console.log("[-] Lỗi khi ghi file log:", err.message);
    }
}

autoPostRentry().catch(console.error);
