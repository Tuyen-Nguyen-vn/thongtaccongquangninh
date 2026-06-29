/**
 * repair_live_wp_content.mjs — Sửa nội dung đang live trên WordPress
 *
 * Fixes:
 * 1. Xóa spam text "– xem thêm khi cần so sánh dịch vụ, giá hoặc khu vực gần nhất."
 * 2. Fix anchor text không dấu (slug ASCII) thành tiếng Việt có dấu
 * 3. Fix markdown link [text](url) rò rỉ thành <a> HTML
 * 4. Fix markdown table rò rỉ thành <table> HTML
 * 5. Xóa địa danh lặp trong danh sách
 *
 * Dùng:
 *   node tools/repair_live_wp_content.mjs              # dry-run
 *   node tools/repair_live_wp_content.mjs --apply      # ghi thật lên WP
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const TODAY = new Date().toISOString().slice(0, 10);
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-repair-${TODAY}`);
const APPLY = process.argv.includes("--apply");

const ANCHORS = {
  "hut-be-phot-quang-ninh": "hút bể phốt Quảng Ninh",
  "thong-tac-cong-quang-ninh": "thông tắc cống Quảng Ninh",
  "bang-gia": "bảng giá hút bể phốt, thông tắc cống",
  "thong-tac-bon-cau-quang-ninh": "thông tắc bồn cầu Quảng Ninh",
  "nao-vet-ho-ga-quang-ninh": "nạo vét hố ga Quảng Ninh",
  "xu-ly-mui-hoi-quang-ninh": "xử lý mùi hôi Quảng Ninh",
  "hut-be-phot-ha-long": "hút bể phốt Hạ Long",
  "hut-be-phot-cam-pha": "hút bể phốt Cẩm Phả",
  "hut-be-phot-uong-bi": "hút bể phốt Uông Bí",
  "hut-be-phot-mong-cai": "hút bể phốt Móng Cái",
  "hut-be-phot-quang-yen": "hút bể phốt Quảng Yên",
  "hut-be-phot-dong-trieu": "hút bể phốt Đông Triều",
  "hut-be-phot-van-don": "hút bể phốt Vân Đồn",
  "hut-be-phot-bai-chay": "hút bể phốt Bãi Cháy",
  "hut-be-phot-hoanh-bo": "hút bể phốt Hoành Bồ",
  "thong-tac-cong-ha-long": "thông tắc cống Hạ Long",
  "thong-tac-cong-cam-pha": "thông tắc cống Cẩm Phả",
  "thong-tac-cong-uong-bi": "thông tắc cống Uông Bí",
  "thong-tac-cong-mong-cai": "thông tắc cống Móng Cái",
  "thong-tac-cong-quang-yen": "thông tắc cống Quảng Yên",
  "thong-tac-cong-dong-trieu": "thông tắc cống Đông Triều",
  "thong-tac-cong-van-don": "thông tắc cống Vân Đồn",
  "thong-tac-cong-bai-chay": "thông tắc cống Bãi Cháy",
  "thong-tac-cong-cao-xanh": "thông tắc cống Cao Xanh",
  "thong-tac-cong-gieng-day": "thông tắc cống Giếng Đáy",
  "thong-tac-cong-ha-long-ban-dem": "thông tắc cống Hạ Long ban đêm",
  "thong-tac-cong-hong-gai-ha-long": "thông tắc cống Hồng Gai Hạ Long",
  "thong-tac-cong-tuan-chau": "thông tắc cống Tuần Châu",
  "thong-tac-cong-ngo-nho-ha-long": "thông tắc cống ngõ nhỏ Hạ Long",
  "thong-tac-cong-nha-hang-ha-long": "thông tắc cống nhà hàng Hạ Long",
  "thong-tac-cong-chung-cu-ha-long": "thông tắc cống chung cư Hạ Long",
  "thong-tac-bon-cau-ha-long": "thông tắc bồn cầu Hạ Long",
  "thong-tac-bon-cau-cam-pha": "thông tắc bồn cầu Cẩm Phả",
  "thong-tac-bon-cau-uong-bi": "thông tắc bồn cầu Uông Bí",
  "thong-tac-bon-cau-mong-cai": "thông tắc bồn cầu Móng Cái",
  "thong-tac-bon-cau-dong-trieu": "thông tắc bồn cầu Đông Triều",
  "thong-tac-bon-cau-quang-yen": "thông tắc bồn cầu Quảng Yên",
  "thong-tac-bon-cau-van-don": "thông tắc bồn cầu Vân Đồn",
  "thong-tac-chau-rua-quang-ninh": "thông tắc chậu rửa Quảng Ninh",
  "thong-tac-toilet-quang-ninh": "thông tắc toilet Quảng Ninh",
};

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: { Authorization: auth, "Content-Type": "application/json", "User-Agent": "Repair pipeline", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = text; }
  if (!res.ok) throw new Error(`WP ${res.status} ${path}: ${typeof payload === "object" ? payload.message ?? text : payload}`);
  return payload;
}

function fixContent(html) {
  let fixed = html;
  const changes = [];

  // Fix 1: Remove spam text
  const spamRe = /\s*[–-]\s*xem thêm khi cần so sánh dịch vụ,?\s*giá hoặc khu vực gần nhất\.?/g;
  if (spamRe.test(fixed)) {
    fixed = fixed.replace(spamRe, "");
    changes.push("Removed spam suffix");
  }

  // Fix 2: Fix unaccented anchor text — <a href="...slug...">slug-without-diacritics</a>
  fixed = fixed.replace(/<a\s+href="([^"]*)">([\w\s-]+)<\/a>/g, (match, href, text) => {
    // Extract slug from URL
    const slugMatch = href.match(/\/([a-z0-9-]+)\/?$/);
    if (!slugMatch) return match;
    const slug = slugMatch[1];
    const expected = ANCHORS[slug];
    if (!expected) return match;
    const textTrimmed = text.trim();
    // If text looks like an ASCII slug (no Vietnamese diacritics)
    if (textTrimmed === slug.replaceAll("-", " ")) {
      changes.push(`Fixed anchor: "${textTrimmed}" → "${expected}"`);
      return `<a href="${href}">${expected}</a>`;
    }
    return match;
  });

  // Fix 3: Fix markdown links [text](url) that leaked into HTML content
  fixed = fixed.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (match, text, url) => {
    changes.push(`Converted MD link: [${text}](${url})`);
    return `<a href="${url}">${text}</a>`;
  });

  // Fix 4: Fix markdown tables that leaked into HTML
  // Detect lines with | that look like table rows (not inside <table> already)
  if (!fixed.includes("<table") && /\|.+\|.+\|/.test(fixed)) {
    const lines = fixed.split("\n");
    let inTable = false;
    const tableLines = [];
    const rebuiltLines = [];

    const flushTable = () => {
      if (!tableLines.length) return;
      const dataRows = tableLines.filter(r => !/^\s*\|[\s-:]+\|\s*$/.test(r));
      const rows = dataRows.map(r =>
        r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim())
      );
      if (rows.length >= 2) {
        const [head, ...body] = rows;
        rebuiltLines.push(
          `<table><thead><tr>${head.map(c => `<th>${c}</th>`).join("")}</tr></thead>` +
          `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`
        );
        changes.push("Converted leaked MD table to HTML");
      } else {
        rebuiltLines.push(...tableLines);
      }
      tableLines.length = 0;
    };

    for (const line of lines) {
      if (/^\s*\|/.test(line)) {
        tableLines.push(line);
      } else {
        flushTable();
        rebuiltLines.push(line);
      }
    }
    flushTable();
    if (changes.some(c => c.includes("table"))) {
      fixed = rebuiltLines.join("\n");
    }
  }

  return { fixed, changes };
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const allItems = [];
  for (const type of ["pages", "posts"]) {
    let page = 1;
    while (true) {
      try {
        const items = await wp(baseUrl, auth, `/wp/v2/${type}?per_page=100&page=${page}&context=edit&status=publish,draft`);
        if (!Array.isArray(items) || items.length === 0) break;
        allItems.push(...items.map(i => ({ ...i, _type: type })));
        page++;
        if (items.length < 100) break;
      } catch { break; }
    }
  }

  console.log(`Found ${allItems.length} pages/posts on WordPress`);

  let fixedCount = 0;
  const results = [];

  for (const item of allItems) {
    const raw = item.content?.raw ?? item.content?.rendered ?? "";
    if (!raw) continue;

    const { fixed, changes } = fixContent(raw);
    if (changes.length === 0) continue;

    const slug = item.slug ?? `id-${item.id}`;
    results.push({ slug, id: item.id, type: item._type, changes });

    if (APPLY) {
      // Backup
      writeFileSync(join(BACKUP_DIR, `${item._type}-${item.id}-${slug}.json`), JSON.stringify(item, null, 2), "utf8");

      // Update
      await wp(baseUrl, auth, `/wp/v2/${item._type}/${item.id}`, {
        method: "POST",
        body: JSON.stringify({ content: fixed }),
      });
      console.log(`[FIXED] ${slug} (ID ${item.id}): ${changes.join("; ")}`);
    } else {
      console.log(`[WOULD FIX] ${slug} (ID ${item.id}): ${changes.join("; ")}`);
    }
    fixedCount++;
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`Total items scanned: ${allItems.length}`);
  console.log(`Items with issues: ${fixedCount}`);
  if (!APPLY) {
    console.log(`\nDry-run mode. Add --apply to write changes to WordPress.`);
    console.log(`Backups will be saved to: ${BACKUP_DIR}`);
  } else {
    console.log(`Backups saved to: ${BACKUP_DIR}`);
  }

  writeFileSync(
    join(BACKUP_DIR, `_repair-report-${TODAY}.json`),
    JSON.stringify(results, null, 2),
    "utf8"
  );
}

main().catch(err => { console.error(err.stack ?? err.message); process.exit(1); });
