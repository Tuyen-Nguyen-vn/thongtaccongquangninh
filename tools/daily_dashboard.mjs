/**
 * daily_dashboard.mjs — Báo cáo sáng tự động
 * Dùng: node tools/daily_dashboard.mjs
 *
 * Output: DASHBOARD_[DATE].md trong thư mục dự án
 * Nội dung:
 *   - Thống kê tiến độ từ docs/SEO_PROGRESS.csv
 *   - Số trang live trên WordPress
 *   - Uptime website
 *   - Top 5 task chưa làm
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SITE = "https://thongtaccongquangninh.com";
const TODAY = new Date().toISOString().slice(0, 10);
const NOW = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" });

// ── Helpers ────────────────────────────────────────────────────────────────

function parseEnv(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* fallback nếu không đọc được .env */ }
  return env;
}

function parseCsvLine(line) {
  const values = [];
  let value = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { value += '"'; i++; }
      else if (ch === '"') { quoted = false; }
      else { value += ch; }
    } else if (ch === '"') { quoted = true; }
    else if (ch === ',') { values.push(value); value = ""; }
    else { value += ch; }
  }
  values.push(value);
  return values;
}

function csvRows(path) {
  let text;
  try { text = readFileSync(path, "utf8").replace(/^﻿/, ""); }
  catch { return []; }
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift() ?? "");
  return lines
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseCsvLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    });
}

async function wp(baseUrl, auth, path) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    headers: { Authorization: auth, "User-Agent": "Codex Dashboard" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`WP ${res.status} ${path}`);
  return res.json();
}

async function checkUptime(url) {
  try {
    const start = Date.now();
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "Codex Uptime Check" },
      signal: AbortSignal.timeout(10000),
    });
    const ms = Date.now() - start;
    return { ok: res.ok || res.status < 400, status: res.status, ms };
  } catch (err) {
    return { ok: false, status: 0, ms: 0, error: err.message };
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL ?? SITE;
  const auth = env.WP_USERNAME
    ? `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`
    : "";

  // 1. Đọc SEO_PROGRESS.csv
  const rows = csvRows(join(PROJECT, "docs", "SEO_PROGRESS.csv"));
  const DONE_STATUSES = new Set(["completed", "pass", "done", "PASS"]);
  const IN_PROGRESS_STATUSES = new Set([
    "review_required", "submitted_wait_verify", "partial_submitted",
    "local_ready", "REVIEW_REQUIRED", "NOT_REQUIRED",
  ]);
  const done = rows.filter((r) => DONE_STATUSES.has(r.status) || r.review_status === "PASS");
  const inProgress = rows.filter((r) => IN_PROGRESS_STATUSES.has(r.status) && !DONE_STATUSES.has(r.status));
  const pending = rows.filter((r) => !DONE_STATUSES.has(r.status) && !IN_PROGRESS_STATUSES.has(r.status));

  // Task chưa xong, có keyword
  const nextTasks = [...inProgress, ...pending]
    .filter((r) => r.keyword || r.next_action)
    .slice(0, 5);

  // 2. Check uptime
  const uptime = await checkUptime(SITE);

  // 3. Đếm trang WP live
  let liveCount = 0, draftCount = 0, wpError = "";
  if (auth) {
    try {
      // WP REST trả max 100/request, dùng per_page=100
      const pages = await wp(baseUrl, auth, "/wp/v2/pages?per_page=100&status=publish");
      const drafts = await wp(baseUrl, auth, "/wp/v2/pages?per_page=100&status=draft");
      liveCount = pages.length;
      draftCount = drafts.length;
    } catch (err) {
      wpError = err.message;
    }
  }

  // 4. Tạo báo cáo markdown
  const uptimeLine = uptime.ok
    ? `✅ Online (HTTP ${uptime.status}, ${uptime.ms}ms)`
    : `❌ OFFLINE — ${uptime.error ?? `HTTP ${uptime.status}`}`;

  const nextTaskLines = nextTasks.length
    ? nextTasks
        .map((r, i) => {
          const label = r.keyword || r.task_id;
          const action = r.next_action ? ` → ${r.next_action.slice(0, 80)}` : "";
          const status = r.status ? ` [${r.status}]` : "";
          return `${i + 1}. **${label}**${status}${action}`;
        })
        .join("\n")
    : "_Không có task đang chờ_";

  const wpLine = wpError
    ? `⚠️ Lỗi kết nối WP: ${wpError}`
    : `✅ ${liveCount} trang live | ${draftCount} draft`;

  const report = `# 📊 Dashboard SEO — ${TODAY}

> Tạo tự động lúc ${NOW}

## 🌐 Website

- **Uptime:** ${uptimeLine}
- **WordPress:** ${wpLine}
- **URL:** ${SITE}

## 📈 Tiến độ tổng

| Trạng thái | Số task |
|---|---|
| ✅ Hoàn thành | **${done.length}** |
| 🟡 Đang làm / chờ | **${inProgress.length}** |
| ⬜ Chưa làm | **${pending.length}** |
| **Tổng** | **${rows.length}** |

**Hoàn thành:** ${rows.length > 0 ? Math.round((done.length / rows.length) * 100) : 0}%

## ▶️ Việc tiếp theo (ưu tiên)

${nextTaskLines}

## 📝 Ghi chú
- Để xem task ưu tiên từ Notion: mở Claude Code và gõ \`tiến độ\`
- Backup trang trước khi sửa: \`node tools/backup_wp_before_change.mjs\`
- Submit Google Index: \`node tools/submit_google_index.mjs\`

---
_Dashboard tạo bởi \`tools/daily_dashboard.mjs\` — [Xem hướng dẫn](tools/daily_dashboard.mjs)_
`;

  const outPath = join(PROJECT, `DASHBOARD_${TODAY}.md`);
  writeFileSync(outPath, report, "utf8");
  console.log(`[DASHBOARD] Đã tạo: ${outPath}`);
  console.log(`[DASHBOARD] Website: ${uptimeLine}`);
  console.log(`[DASHBOARD] WP: ${wpLine}`);
  console.log(`[DASHBOARD] Tiến độ: ${done.length}/${rows.length} task hoàn thành`);
}

main().catch((err) => {
  console.error(err.stack ?? err.message);
  process.exit(1);
});
