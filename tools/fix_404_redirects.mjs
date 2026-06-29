/**
 * fix_404_redirects.mjs
 * ─────────────────────
 * 1. Fix link nội bộ /thong-tac-cong-nha-hang-quang-ninh/ trong trang thong-tac-bon-cau-nha-hang-quang-ninh-2026
 * 2. Tạo redirect rules qua WP Options (tương thích với plugin Redirection hoặc custom handler)
 * 3. Xuất file .htaccess snippet để dùng thủ công nếu cần
 *
 * Chạy: node tools/fix_404_redirects.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const PROJECT   = "D:\\.thongtaccongquangninh";
const REPORT_DIR = join(PROJECT, "reports");
const STAMP     = new Date().toISOString().slice(0, 10);
const LOG_PATH  = join(PROJECT, `WORDPRESS_FIX_404_REDIRECTS_${STAMP}.json`);
const HTACCESS_PATH = join(PROJECT, "reports", `htaccess-redirects-snippet-${STAMP}.txt`);

// ── Redirect map: từ slug cũ → URL đích đúng ─────────────────────────────────
const REDIRECTS = [
  // URL bị link nội bộ → cần redirect + fix link
  { from: "/thong-tac-cong-nha-hang-quang-ninh/", to: "/thong-tac-cong-nha-hang-ha-long/", priority: "HIGH" },
  // URL cũ Google biết
  { from: "/hut-ham-cau/",           to: "/hut-be-phot-quang-ninh/",       priority: "HIGH" },
  { from: "/bao-gia/",               to: "/bang-gia/",                       priority: "HIGH" },
  { from: "/lien-he-2/",             to: "/lien-he/",                        priority: "HIGH" },
  { from: "/contact/",               to: "/lien-he/",                        priority: "HIGH" },
  { from: "/ve-chung-toi/",          to: "/gioi-thieu/",                     priority: "MEDIUM" },
  { from: "/about/",                 to: "/gioi-thieu/",                     priority: "MEDIUM" },
  { from: "/tin-tuc/",               to: "/blog/",                           priority: "MEDIUM" },
  { from: "/news/",                  to: "/blog/",                           priority: "MEDIUM" },
  { from: "/blog-2/",                to: "/blog/",                           priority: "MEDIUM" },
  { from: "/dich-vu/",              to: "/",                                 priority: "MEDIUM" },
  { from: "/dich-vu-hut-be-phot/",  to: "/hut-be-phot-quang-ninh/",         priority: "MEDIUM" },
  { from: "/dich-vu-thong-tac-cong/", to: "/thong-tac-cong-quang-ninh/",    priority: "MEDIUM" },
  { from: "/category/dich-vu/",     to: "/blog/",                           priority: "LOW" },
  { from: "/tag/thong-tac/",        to: "/blog/",                           priority: "LOW" },
  { from: "/tag/hut-be-phot/",      to: "/blog/",                           priority: "LOW" },
];

const BASE = "https://thongtaccongquangninh.com";

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wpCall(baseUrl, auth, ability, params = {}) {
  const res = await fetch(`${baseUrl}/wp-json/wp-mcp-ultimate/v1/execute`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ ability, params }),
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`WP ${res.status} ${ability}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

async function wpDirect(baseUrl, auth, path, method = "GET", body = null) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    method,
    headers: { Authorization: auth, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`WP ${res.status} ${path}`);
  return data;
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log("🔗 WordPress:", baseUrl);
  const log = { timestamp: new Date().toISOString(), steps: [] };

  // ── BƯỚC 1: Fix link nội bộ 404 ────────────────────────────────────────────
  console.log("\n🔧 BƯỚC 1: Fix link nội bộ trong trang thong-tac-bon-cau-nha-hang-quang-ninh-2026");
  try {
    // Tìm page theo slug
    const pages = await wpDirect(baseUrl, auth,
      "/wp/v2/pages?slug=thong-tac-bon-cau-nha-hang-quang-ninh-2026&context=edit");
    if (!pages.length) throw new Error("Không tìm thấy trang thong-tac-bon-cau-nha-hang-quang-ninh-2026");

    const page = pages[0];
    const oldContent = page.content?.raw || "";
    const badUrl = `${BASE}/thong-tac-cong-nha-hang-quang-ninh/`;
    const goodUrl = `${BASE}/thong-tac-cong-nha-hang-ha-long/`;
    const badSlug = "/thong-tac-cong-nha-hang-quang-ninh/";
    const goodSlug = "/thong-tac-cong-nha-hang-ha-long/";

    const occurrences = (oldContent.match(/thong-tac-cong-nha-hang-quang-ninh/g) || []).length;
    console.log(`  → Page ID: ${page.id} | Link lỗi xuất hiện: ${occurrences} lần`);

    if (occurrences > 0) {
      const newContent = oldContent
        .replaceAll(badUrl, goodUrl)
        .replaceAll(badSlug, goodSlug);

      await wpDirect(baseUrl, auth, `/wp/v2/pages/${page.id}`, "POST", {
        content: newContent,
      });
      console.log(`  ✅ Đã thay thế ${occurrences} link lỗi → ${goodUrl}`);
      log.steps.push({ action: "fix_internal_link", pageId: page.id, from: badUrl, to: goodUrl, replacements: occurrences, status: "OK" });
    } else {
      console.log("  ℹ️  Không tìm thấy link lỗi trong content — có thể đã được fix trước");
      log.steps.push({ action: "fix_internal_link", status: "SKIPPED_NOT_FOUND" });
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    log.steps.push({ action: "fix_internal_link", status: "ERROR", error: err.message });
  }

  // ── BƯỚC 2: Tạo redirect 301 qua WP Options ────────────────────────────────
  console.log("\n🔀 BƯỚC 2: Lưu redirect rules vào WordPress options");
  try {
    // Lấy redirect table hiện tại nếu có
    let existing = [];
    try {
      const opt = await wpDirect(baseUrl, auth, "/wp/v2/settings");
      // Thử đọc option ttcqn_redirects
    } catch {}

    // Lưu vào wp_options để plugin custom hoặc functions.php đọc
    const redirectData = REDIRECTS.map(r => ({
      from: r.from,
      to: `${BASE}${r.to}`,
      code: 301,
      priority: r.priority,
    }));

    await wpDirect(baseUrl, auth, "/wp/v2/settings", "POST", {
      // Dùng option key riêng qua REST settings nếu expose
    }).catch(() => null); // Ignore nếu không support

    // Thay thế: lưu vào option qua WP MCP
    try {
      await wpCall(baseUrl, auth, "options/update", {
        name: "ttcqn_custom_redirects",
        value: JSON.stringify(redirectData),
      });
      console.log(`  ✅ Lưu ${redirectData.length} redirect rules vào option "ttcqn_custom_redirects"`);
      log.steps.push({ action: "save_redirects_option", count: redirectData.length, status: "OK" });
    } catch (err) {
      console.log(`  ⚠️  Options API: ${err.message}`);
      log.steps.push({ action: "save_redirects_option", status: "FALLBACK", error: err.message });
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
  }

  // ── BƯỚC 3: Xuất .htaccess snippet (luôn làm, không phụ thuộc WP) ──────────
  console.log("\n📝 BƯỚC 3: Xuất .htaccess redirect snippet");
  const htaccessLines = [
    "# ═══════════════════════════════════════════════════════════════",
    "# Redirect 301 — Sinh tự động bởi fix_404_redirects.mjs",
    `# Ngày: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`,
    "# Dán vào đầu block <IfModule mod_rewrite.c> trong .htaccess",
    "# ═══════════════════════════════════════════════════════════════",
    "",
    "# [HIGH] URL bị link nội bộ và Google biết",
  ];

  let currentPriority = "HIGH";
  for (const r of REDIRECTS) {
    if (r.priority !== currentPriority) {
      currentPriority = r.priority;
      htaccessLines.push(`\n# [${r.priority}] Redirect slug cũ`);
    }
    const fromClean = r.from.replace(/^\/|\/$/g, "");
    htaccessLines.push(`Redirect 301 ${r.from} ${BASE}${r.to}`);
  }

  htaccessLines.push("\n# [EXTRA] HTTP → HTTPS (nếu chưa có)");
  htaccessLines.push("# RewriteCond %{HTTPS} off");
  htaccessLines.push("# RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]");

  writeFileSync(HTACCESS_PATH, htaccessLines.join("\n"), "utf8");
  console.log(`  ✅ Đã xuất: ${HTACCESS_PATH}`);
  log.steps.push({ action: "export_htaccess", file: HTACCESS_PATH, rules: REDIRECTS.length, status: "OK" });

  // ── BƯỚC 4: Upload plugin mini để handle redirects ─────────────────────────
  console.log("\n🔌 BƯỚC 4: Tạo plugin WordPress xử lý redirect từ option");
  const pluginCode = `<?php
/**
 * Plugin Name: TTCQN Custom Redirects
 * Description: Xử lý redirect 301 từ option ttcqn_custom_redirects
 * Version: 1.0
 */
defined('ABSPATH') || exit;

add_action('template_redirect', function () {
  $redirects = json_decode(get_option('ttcqn_custom_redirects', '[]'), true);
  if (!is_array($redirects)) return;
  $req = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') . '/';
  foreach ($redirects as $rule) {
    $from = rtrim($rule['from'], '/') . '/';
    if ($req === $from) {
      wp_redirect($rule['to'], $rule['code'] ?? 301);
      exit;
    }
  }
}, 1);
`;

  const pluginDir  = join(PROJECT, "_tmp", "ttcqn-custom-redirects");
  mkdirSync(pluginDir, { recursive: true });
  const pluginFile = join(pluginDir, "ttcqn-custom-redirects.php");
  writeFileSync(pluginFile, pluginCode, "utf8");

  // Zip plugin
  const zipPath = join(PROJECT, "_tmp", "ttcqn-custom-redirects.zip");
  try {
    const { execSync } = await import("node:child_process");
    execSync(`powershell Compress-Archive -Path "${pluginDir}\\*" -DestinationPath "${zipPath}" -Force`);
    console.log(`  → ZIP: ${zipPath}`);

    // Upload qua WP MCP
    const zipB64 = readFileSync(zipPath).toString("base64");
    const upload = await wpCall(baseUrl, auth, "plugins/upload-base64", {
      zip_base64: zipB64,
      activate: true,
      overwrite: true,
    });
    console.log(`  ✅ Plugin uploaded & activated: ${JSON.stringify(upload).slice(0, 100)}`);
    log.steps.push({ action: "upload_redirect_plugin", status: "OK" });
  } catch (err) {
    console.log(`  ⚠️  Plugin upload: ${err.message.slice(0, 120)}`);
    log.steps.push({ action: "upload_redirect_plugin", status: "SKIPPED", error: err.message.slice(0, 120) });
    console.log("  → Dùng .htaccess snippet thay thế (đã xuất ở bước 3)");
  }

  // ── Ghi log ────────────────────────────────────────────────────────────────
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf8");
  console.log(`\n📄 Log: ${LOG_PATH}`);
  console.log("\n🏁 Xong! Tóm tắt:");
  console.log(`  • Fix link nội bộ: ${log.steps.find(s=>s.action==="fix_internal_link")?.status}`);
  console.log(`  • Redirect rules:  ${REDIRECTS.length} rules`);
  console.log(`  • .htaccess:       ${HTACCESS_PATH}`);
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
