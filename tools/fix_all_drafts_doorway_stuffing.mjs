import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const draftsDir = "D:\\.thongtaccongquangninh\\content-drafts";

const doorwayPattern1 = /tại Quảng Ninh, Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn, Hoành Bồ, Bãi Cháy, Hòn Gai và các khu vực lân cận tại Quảng Ninh và khu vực lân cận/gi;
const doorwayPattern2 = /Quảng Ninh, Uông Bí, Hạ Long, Cẩm Phả, Đông Triều, Móng Cái, Vân Đồn và các khu vực lân cận tại Quảng Ninh/gi;

function fixFile(filePath) {
  let content = readFileSync(filePath, "utf8");
  let original = content;

  // 1. Loại bỏ các chuỗi liệt kê Doorway
  content = content.replace(doorwayPattern1, "phục vụ tận nơi cho người dân trên toàn tỉnh");
  content = content.replace(doorwayPattern2, "Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên và toàn tỉnh Quảng Ninh");

  // 2. Giảm nhồi nhét Keyword
  const match = content.match(/Focus Keyword:\s*(.+)/i);
  if (match) {
    const keyword = match[1].trim();
    
    // Tìm và thay thế một số pattern phổ biến (có làm mượt ngữ cảnh)
    const p1 = new RegExp(`đội \\*\\*${keyword}\\*\\*`, "gi");
    content = content.replace(p1, "đội thợ lành nghề");
    
    const p2 = new RegExp(`dịch vụ \\*\\*${keyword}\\*\\*`, "gi");
    content = content.replace(p2, "dịch vụ của chúng tôi");

    const p3 = new RegExp(`đặt lịch \\*\\*${keyword}\\*\\*`, "gi");
    content = content.replace(p3, "đặt lịch khảo sát");

    const p4 = new RegExp(`Quy trình \\*\\*${keyword}\\*\\*`, "gi");
    content = content.replace(p4, "Quy trình làm việc");

    const p5 = new RegExp(`Cam kết đầu tiên của \\*\\*${keyword}\\*\\*`, "gi");
    content = content.replace(p5, "Cam kết đầu tiên của công ty");

    const p6 = new RegExp(`Mục tiêu của \\*\\*${keyword}\\*\\*`, "gi");
    content = content.replace(p6, "Mục tiêu của chúng tôi");
  }

  if (content !== original) {
    writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

function processDirectory(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      if (fixFile(fullPath)) {
        console.log(`[FIXED] ${entry.name}`);
        count++;
      }
    }
  }
  return count;
}

console.log("Bắt đầu quét và sửa lỗi Doorway/Stuffing trong content-drafts...");
const totalFixed = processDirectory(draftsDir);
console.log(`\nHoàn tất! Đã sửa thành công ${totalFixed} file.`);
