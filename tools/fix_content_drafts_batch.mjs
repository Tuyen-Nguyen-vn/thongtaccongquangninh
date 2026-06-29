/**
 * fix_content_drafts_batch.mjs — Quét và sửa lỗi hàng loạt trong content-drafts
 *
 * Fixes:
 * 1. Địa danh lặp trong danh sách (ví dụ: "Đông Triều, Mạo Khê, Đông Triều" → "Đông Triều, Mạo Khê")
 * 2. Spam text "– xem thêm khi cần so sánh dịch vụ, giá hoặc khu vực gần nhất." (nếu có)
 * 3. Anchor text không dấu (nếu có trong file)
 *
 * Dùng:
 *   node tools/fix_content_drafts_batch.mjs           # dry-run, chỉ hiện thay đổi
 *   node tools/fix_content_drafts_batch.mjs --apply    # ghi file thật
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const DRAFTS_DIR = join(PROJECT, "content-drafts");
const APPLY = process.argv.includes("--apply");

const SPAM_PATTERN =
  /\s*[–-]\s*xem thêm khi cần so sánh dịch vụ,?\s*giá hoặc khu vực gần nhất\.?/g;

const UNACCENTED_TO_ACCENTED = {
  "thong tac bon cau": "thông tắc bồn cầu",
  "thong tac cong": "thông tắc cống",
  "hut be phot": "hút bể phốt",
  "nao vet ho ga": "nạo vét hố ga",
  "xu ly mui hoi": "xử lý mùi hôi",
  "thong tac chau rua": "thông tắc chậu rửa",
  "thong tac toilet": "thông tắc toilet",
  "Ha Long": "Hạ Long",
  "Cam Pha": "Cẩm Phả",
  "Uong Bi": "Uông Bí",
  "Mong Cai": "Móng Cái",
  "Quang Yen": "Quảng Yên",
  "Dong Trieu": "Đông Triều",
  "Van Don": "Vân Đồn",
  "Bai Chay": "Bãi Cháy",
  "Hoanh Bo": "Hoành Bồ",
  "Quang Ninh": "Quảng Ninh",
};

function getAllMdFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...getAllMdFiles(full));
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function deduplicateLocations(line) {
  if (!line.includes(",")) return line;

  // Known Vietnamese location names to look for
  const LOCATIONS = [
    "Hạ Long",
    "Cẩm Phả",
    "Uông Bí",
    "Móng Cái",
    "Quảng Yên",
    "Đông Triều",
    "Vân Đồn",
    "Bãi Cháy",
    "Hoành Bồ",
    "Hòn Gai",
    "Cao Xanh",
    "Cao Thắng",
    "Hà Khẩu",
    "Giếng Đáy",
    "Hà Tu",
    "Hà Phong",
    "Tuần Châu",
    "Mạo Khê",
    "Đức Chính",
    "Hồng Phong",
    "Tràng An",
    "Bình Khê",
    "An Sinh",
    "Yên Thọ",
    "Hưng Đạo",
    "Kim Sơn",
    "Hoàng Quế",
    "Nguyễn Huệ",
    "Cẩm Trung",
    "Cẩm Thành",
    "Cẩm Thủy",
    "Cẩm Bình",
    "Cẩm Đông",
    "Cẩm Sơn",
    "Quang Hanh",
    "Cửa Ông",
    "Mông Dương",
    "Trần Phú",
    "Hải Yên",
    "Hải Hòa",
    "Ninh Dương",
    "Bình Ngọc",
    "Vạn Ninh",
    "Hải Xuân",
    "Hải Tiến",
    "Quảng Nghĩa",
    "Hải Đông",
    "Bắc Sơn",
    "Trới",
    "Lê Lợi",
    "Thống Nhất",
    "Sơn Dương",
    "Dân Chủ",
    "Quảng La",
    "Bằng Cả",
    "Hùng Thắng",
    "Cái Dăm",
    "Xuân Sơn",
    "Bình Dương",
  ];

  // Pattern 1: "tại X, X, Y, Z" — split at "tại " and dedup the list after it
  const taiMatch = line.match(/^(.*tại\s+)(.+)$/);
  if (taiMatch) {
    const prefix = taiMatch[1];
    const listPart = taiMatch[2];
    // Split by comma and "và"
    const andSplit = listPart.split(/\s+và\s+/);
    const mainList = andSplit[0];
    const andSuffix =
      andSplit.length > 1 ? " và " + andSplit.slice(1).join(" và ") : "";

    const items = mainList
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set();
    const deduped = [];
    for (const item of items) {
      if (!seen.has(item)) {
        seen.add(item);
        deduped.push(item);
      }
    }
    if (deduped.length < items.length) {
      return prefix + deduped.join(", ") + andSuffix;
    }
  }

  // Pattern 2: "Khu vực phục vụ: X, Y, X, Z" — split at colon and dedup
  const colonMatch = line.match(
    /^(.*(?:Khu vực|phục vụ|phủ sóng)[^:]*:\s*)(.+)$/i,
  );
  if (colonMatch) {
    const prefix = colonMatch[1];
    const listPart = colonMatch[2];
    const andSplit = listPart.split(/\s+và\s+/);
    const mainList = andSplit[0];
    const andSuffix =
      andSplit.length > 1 ? " và " + andSplit.slice(1).join(" và ") : "";

    const items = mainList
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set();
    const deduped = [];
    for (const item of items) {
      if (!seen.has(item)) {
        seen.add(item);
        deduped.push(item);
      }
    }
    if (deduped.length < items.length) {
      return prefix + deduped.join(", ") + andSuffix;
    }
  }

  return line;
}

function fixContent(content, filePath) {
  const changes = [];
  let fixed = content;

  // Fix 1: Remove spam text
  if (SPAM_PATTERN.test(fixed)) {
    const before = fixed;
    fixed = fixed.replace(SPAM_PATTERN, "");
    if (fixed !== before) changes.push("Removed spam suffix text");
  }

  // Fix 2: Deduplicate location names
  const lines = fixed.split("\n");
  let locationChanges = 0;
  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    const deduped = deduplicateLocations(original);
    if (deduped !== original) {
      lines[i] = deduped;
      locationChanges++;
    }
  }
  if (locationChanges > 0) {
    fixed = lines.join("\n");
    changes.push(`Deduplicated ${locationChanges} location line(s)`);
  }

  // Fix 3: Fix unaccented anchor text patterns in square brackets
  // Only fix inside [anchor](url) patterns to avoid false positives
  for (const [unaccented, accented] of Object.entries(UNACCENTED_TO_ACCENTED)) {
    const re = new RegExp(`\\[([^\\]]*)\\b${unaccented}\\b([^\\]]*)\\]`, "gi");
    if (re.test(fixed)) {
      fixed = fixed.replace(re, (match, before, after) => {
        return `[${before}${accented}${after}]`;
      });
      changes.push(`Fixed unaccented: "${unaccented}" → "${accented}"`);
    }
  }

  return { fixed, changes };
}

// Main
const files = getAllMdFiles(DRAFTS_DIR);
let totalChanges = 0;
const report = [];

for (const filePath of files) {
  const content = readFileSync(filePath, "utf8");
  const { fixed, changes } = fixContent(content, filePath);

  if (changes.length > 0) {
    const rel = relative(PROJECT, filePath);
    report.push({ file: rel, changes });
    totalChanges += changes.length;

    if (APPLY) {
      writeFileSync(filePath, fixed, "utf8");
      console.log(`[FIXED] ${rel}: ${changes.join("; ")}`);
    } else {
      console.log(`[WOULD FIX] ${rel}: ${changes.join("; ")}`);
    }
  }
}

console.log(`\n${"═".repeat(60)}`);
console.log(`Scanned: ${files.length} files`);
console.log(`Files with issues: ${report.length}`);
console.log(`Total changes: ${totalChanges}`);
if (!APPLY) {
  console.log(`\nDry-run mode. Add --apply to write changes.`);
}
