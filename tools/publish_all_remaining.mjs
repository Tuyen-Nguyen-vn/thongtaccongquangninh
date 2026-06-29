import { readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { execSync } from "node:child_process";

const PROJECT_DIR = "D:\\.thongtaccongquangninh";
const DRAFTS_DIR = join(PROJECT_DIR, "content-drafts");

// List of already published slugs or files to skip if desired
const ALREADY_PUBLISHED = [
  "chi-phi-hut-be-phot-quang-ninh-rankmath-90.md"
];

function getMarkdownFiles(dir) {
  let results = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath));
    } else if (file.endsWith(".md")) {
      results.push(filePath);
    }
  }
  return results;
}

async function main() {
  console.log("====================================================");
  console.log("   BẮT ĐẦU TIẾN TRÌNH XUẤT BẢN HÀNG LOẠT (BATCH PUBLISH)");
  console.log("====================================================\n");

  if (!existsSync(DRAFTS_DIR)) {
    console.error(`Không tìm thấy thư mục nháp: ${DRAFTS_DIR}`);
    process.exit(1);
  }

  const allFiles = getMarkdownFiles(DRAFTS_DIR);
  const targetFiles = allFiles.filter(filePath => {
    const name = filePath.split(/[\\/]/).pop();
    return !ALREADY_PUBLISHED.includes(name);
  });

  console.log(`Tìm thấy tổng cộng ${allFiles.length} file nháp.`);
  console.log(`Loại trừ ${allFiles.length - targetFiles.length} file đã xuất bản.`);
  console.log(`Số lượng bài cần xuất bản: ${targetFiles.length}\n`);

  const results = [];

  for (let i = 0; i < targetFiles.length; i++) {
    const file = targetFiles[i];
    const relativePath = relative(PROJECT_DIR, file);
    console.log(`\n[${i + 1}/${targetFiles.length}] Đang xử lý: ${relativePath}...`);
    
    try {
      // Chạy lệnh pipeline với flag --force để bỏ qua cảnh báo điểm số nếu có và xuất bản trực tiếp
      const cmd = `node tools/auto_publish_pipeline.mjs "${file}" --force`;
      console.log(`Running: ${cmd}`);
      
      const stdout = execSync(cmd, { cwd: PROJECT_DIR, encoding: "utf8" });
      console.log(stdout);
      
      results.push({
        file: relativePath,
        status: "SUCCESS",
        details: "Đã xuất bản thành công và submit Google Index."
      });
    } catch (error) {
      console.error(`❌ LỖI khi xử lý ${relativePath}:`, error.message);
      if (error.stdout) console.error("STDOUT:", error.stdout);
      if (error.stderr) console.error("STDERR:", error.stderr);
      
      results.push({
        file: relativePath,
        status: "FAILED",
        details: error.message
      });
    }
  }

  console.log("\n====================================================");
  console.log("         BÁO CÁO KẾT QUẢ XUẤT BẢN BATCH");
  console.log("====================================================");
  console.log(`Tổng số bài xử lý: ${targetFiles.length}`);
  console.log(`Thành công: ${results.filter(r => r.status === "SUCCESS").length}`);
  console.log(`Thất bại: ${results.filter(r => r.status === "FAILED").length}\n`);

  console.log("Chi tiết:");
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.status}] ${r.file} - ${r.details}`);
  });
  console.log("====================================================");
}

main().catch(err => {
  console.error("Lỗi nghiêm trọng trong batch script:", err);
  process.exit(1);
});
