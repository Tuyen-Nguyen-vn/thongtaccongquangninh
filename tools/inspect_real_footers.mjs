import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROJECT = 'D:\\.thongtaccongquangninh';

const urls = {
  homepage: 'https://thongtaccongquangninh.com/',
  shared_standard: 'https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh-2/',
  ha_long: 'https://thongtaccongquangninh.com/thong-tac-cong-ha-long/',
  gieng_day: 'https://thongtaccongquangninh.com/thong-tac-cong-gieng-day-2/',
};

// Hàm chuẩn hóa HTML để so sánh công bằng
function normalizeFooterHtml(html) {
  // 1. Chỉ lấy phần từ <footer class="home-footer" ...> đến </footer> cuối cùng
  const match = html.match(/<footer\b[^>]*class=["\'][^"\']*\bhome-footer\b[^"\']*["\'][^>]*>([\s\S]*?)<\/footer>/i);
  if (!match) return null;

  let footerContent = match[0];

  // 2. Loại bỏ thuộc tính loading="lazy" hoặc loading='lazy' (vì WordPress tự chèn động tùy theo ngữ cảnh LCP)
  footerContent = footerContent.replace(/\sloading=["\'](lazy|eager)["\']/gi, '');

  // 3. Loại bỏ thuộc tính decoding="async" hoặc decoding='async'
  footerContent = footerContent.replace(/\sdecoding=["\'](async|sync|auto)["\']/gi, '');

  // 4. Loại bỏ class lazyloaded/lazyloading hoặc các thuộc tính data-lazy của các plugin tối ưu hóa
  footerContent = footerContent.replace(/\sclass=["\']([^"\']*\b)(lazyloaded|lazyloading|lazyload)\b([^"\']*["\'])/gi, ' class="$1$3"');
  footerContent = footerContent.replace(/\sdata-lazy-[^=]+=["\'][^"\']*["\']/gi, '');
  footerContent = footerContent.replace(/\sdata-src=["\'][^"\']*["\']/gi, '');

  // 5. Chuẩn hóa khoảng trắng và dòng mới
  footerContent = footerContent.replace(/\s+/g, ' ').trim();

  return footerContent;
}

async function inspect() {
  const scratchDir = path.join(PROJECT, 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  console.log("=== THỰC THI KIỂM TRA FOOTER THẬT CHÂN TRANG ===");

  for (const [name, url] of Object.entries(urls)) {
    console.log(`\nFetching ${name}: ${url} ...`);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'TTCQN-Inspector/1.0' } });
      const html = await res.text();

      // Trích xuất thô footer
      const rawMatch = html.match(/<footer\b[^>]*class=["\'][^"\']*\bhome-footer\b[^"\']*["\'][^>]*>([\s\S]*?)<\/footer>/i);
      
      if (rawMatch) {
        const rawFooter = rawMatch[0];
        const rawHash = crypto.createHash('md5').update(rawFooter).digest('hex').slice(0, 12);
        console.log(`[THÔ]  Length: ${rawFooter.length}, Hash: ${rawHash}`);
        
        // Chuẩn hóa
        const normFooter = normalizeFooterHtml(html);
        const normHash = crypto.createHash('md5').update(normFooter).digest('hex').slice(0, 12);
        console.log(`[CHUẨN] Length: ${normFooter.length}, Hash: ${normHash}`);

        // Lưu bản thô và bản chuẩn để kiểm tra
        fs.writeFileSync(path.join(scratchDir, `real_footer_raw_${name}_${rawHash}.html`), rawFooter, 'utf8');
        fs.writeFileSync(path.join(scratchDir, `real_footer_norm_${name}_${normHash}.html`), normFooter, 'utf8');
      } else {
        console.log(`[!] KHÔNG tìm thấy footer chính <footer class="home-footer"> !`);
      }
    } catch (e) {
      console.error(`[!] Lỗi: ${e.message}`);
    }
  }
}

inspect();
