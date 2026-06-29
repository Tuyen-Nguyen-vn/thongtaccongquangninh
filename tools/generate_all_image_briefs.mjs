import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createImageSeoBrief } from "./image_seo_gate.mjs";

const PROJECT = "D:\\.thongtaccongquangninh";
const DRAFTS_DIR = join(PROJECT, "content-drafts");

function findMdFiles(dir) {
  let results = [];
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      results = results.concat(findMdFiles(fullPath));
    } else if (item.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  console.log("Đang quét các file markdown trong content-drafts...\n");
  const mdFiles = findMdFiles(DRAFTS_DIR);
  
  let successCount = 0;
  for (const file of mdFiles) {
    try {
      const output = createImageSeoBrief(file);
      console.log(`[OK] Đã tạo Image Brief cho: ${output.article.slug}`);
      successCount++;
    } catch (e) {
      console.error(`[SKIP] Bỏ qua file ${file} (Không đủ định dạng chuẩn): ${e.message}`);
    }
  }
  
  console.log(`\n✅ Xong! Đã tạo thành công ${successCount} Image Briefs.`);
  console.log(`Bạn có thể xem các file yêu cầu ảnh tại thư mục: D:\\.thongtaccongquangninh\\image-briefs\\`);
  console.log(`Tiếp theo, hãy mở các file *-image-brief.md và gửi cho ChatGPT/Image Agent để tạo ảnh nhé!`);
}

main().catch(console.error);
