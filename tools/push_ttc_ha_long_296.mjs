/**
 * Push rewrite cho page 296 (thong-tac-cong-ha-long) via IP bypass DNS.
 * Backup nội dung cũ trước, verify offline, push content+title+excerpt+RankMath.
 *
 * Usage:
 *   node tools/push_ttc_ha_long_296.mjs            # dry-run: backup + verify, KHÔNG push
 *   node tools/push_ttc_ha_long_296.mjs --publish  # push live status=publish
 */
import https from "node:https";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = join(PROJECT, ".env");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 296;
const HTML_FILE = join(PROJECT, "_tmp", "rewrite-thong-tac-cong-ha-long-296.html");
const CSV_PATH = join(PROJECT, "docs", "SEO_PROGRESS.csv");
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);

const WP_TITLE = "Dịch Vụ Thông Tắc Cống Hạ Long - Xác Định Đúng Điểm Nghẽn & Xử Lý Triệt Để";
const SEO_TITLE = "Thông Tắc Cống Hạ Long - Xác Định & Xử Lý Đúng Điểm Nghẽn | Môi Trường Đô Thị Số 1";
const DESCRIPTION =
  "Thông tắc cống Hạ Long: xác định đúng điểm tắc (bếp, hố ga, ống nhánh), xử lý không đục phá. Gọi 0963.953.533 - Thợ lành nghề, báo giá rõ ràng.";
const FOCUS_KEYWORD = "thông tắc cống Hạ Long";

const FORBIDDEN = ["uy tín", "chuyên nghiệp", "hàng đầu", "tận tâm"];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

// Trang 296 render frontend qua plugin ttcqn-doorway-safe-renderer,
// đọc HTML từ WP option (KHÔNG dùng post_content). Phải update option mới hiện ra.
const OPTION_NAMES = ["ttcqn_doorway_safe_page_296_content", "ttcqn_doorway_safe_page_296_content_v2"];

function mcpRpc(auth, sessionId, payload) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(JSON.stringify(payload), "utf8");
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/mcp/mcp-adapter-default-server", method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth, "Content-Type": "application/json",
        Accept: "application/json, text/event-stream", "User-Agent": "Codex SEO push",
        ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
        "Content-Length": buf.length,
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        // SSE: dữ liệu nằm ở dòng "data: {...}"
        let jsonText = text;
        const m = text.match(/data:\s*(\{[\s\S]*\})/);
        if (m) jsonText = m[1];
        let payloadOut;
        try { payloadOut = jsonText ? JSON.parse(jsonText) : {}; } catch { payloadOut = text; }
        if (res.statusCode >= 400) return reject(new Error(`MCP ${res.statusCode}: ${text.slice(0, 200)}`));
        resolve({ payload: payloadOut, sessionId: res.headers["mcp-session-id"] || sessionId });
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("MCP timeout")));
    req.write(buf);
    req.end();
  });
}

async function getOption(auth, sessionId, name, id) {
  const r = await mcpRpc(auth, sessionId, {
    jsonrpc: "2.0", id, method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: { ability_name: "options/get", parameters: { name } },
    },
  });
  const text = r.payload?.result?.content?.[0]?.text ?? "";
  try { const p = JSON.parse(text); return p.data?.value ?? p.data ?? p.value ?? ""; } catch { return ""; }
}

async function updateOption(auth, sessionId, name, value, id) {
  return mcpRpc(auth, sessionId, {
    jsonrpc: "2.0", id, method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: { ability_name: "options/update", parameters: { name, value } },
    },
  });
}

function httpsRequest(method, wpPath, auth, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(typeof body === "string" ? body : JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + wpPath, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "Content-Type": "application/json",
        "User-Agent": "Codex SEO push", ...extraHeaders,
        ...(bodyBuf ? { "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let payload;
        try { payload = text ? JSON.parse(text) : {}; } catch { payload = text; }
        if (res.statusCode >= 400) {
          const msg = typeof payload === "object" ? (payload.message ?? text) : payload;
          return reject(new Error(`WP ${res.statusCode} ${wpPath}: ${msg}`));
        }
        resolve(payload);
      });
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout " + wpPath)));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function verify(html) {
  const errors = [];
  const warns = [];
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = text.split(" ").length;

  if (/<h1[\s>]/i.test(html)) errors.push("Body chứa <h1> (theme đã render title thành H1 → sẽ thành 2 H1)");
  for (const w of FORBIDDEN) {
    if (new RegExp(w, "i").test(text)) errors.push(`Từ cấm: "${w}"`);
  }
  if (!/0963\.953\.533/.test(text) || !/0931\.156\.756/.test(text)) errors.push("Thiếu hotline");
  if (!/author\/nguyensonghao/.test(html)) errors.push("Thiếu dòng tác giả Nguyễn Song Hào");

  const requiredH2 = ["Dấu hiệu", "Nguyên nhân", "Cam kết 3 Không", "Bảng giá", "Quy trình", "NAP", "Câu hỏi thường gặp"];
  for (const h of requiredH2) {
    if (!new RegExp(`<h2[^>]*>[^<]*${h}`, "i").test(html)) warns.push(`Thiếu/khác H2 chuẩn: "${h}"`);
  }

  const internalLinks = (html.match(/href="https:\/\/thongtaccongquangninh\.com\/[^"]+"/g) || [])
    .filter((l) => !l.includes("/author/")).length;
  if (internalLinks < 3) errors.push(`Internal link < 3 (có ${internalLinks})`);

  const externalLinks = (html.match(/href="https?:\/\/(?!thongtaccongquangninh\.com)[^"]+"/g) || []).length;
  if (externalLinks < 1) warns.push("Không có external link");

  const kwCount = (text.match(/thông tắc cống/gi) || []).length;
  const density = ((kwCount / wordCount) * 100).toFixed(2);

  const fh = (FOCUS_KEYWORD.length);
  if (SEO_TITLE.length < 50 || SEO_TITLE.length > 85) warns.push(`Title ${SEO_TITLE.length} ký tự (chuẩn 50-85)`);
  if (DESCRIPTION.length < 140 || DESCRIPTION.length > 165) warns.push(`Description ${DESCRIPTION.length} ký tự (chuẩn 140-165)`);

  return { errors, warns, wordCount, internalLinks, externalLinks, kwCount, density };
}

async function main() {
  const doPublish = process.argv.includes("--publish");
  const html = readFileSync(HTML_FILE, "utf8");

  console.log("═══ VERIFY OFFLINE ═══");
  const v = verify(html);
  console.log(`Số từ: ${v.wordCount} | Internal link: ${v.internalLinks} | External link: ${v.externalLinks}`);
  console.log(`Từ khóa "thông tắc cống": ${v.kwCount} lần | mật độ ~${v.density}%`);
  console.log(`WP Title: "${WP_TITLE}" | SEO Title: "${SEO_TITLE}" (${SEO_TITLE.length} ký tự) | Description: ${DESCRIPTION.length} ký tự`);
  if (v.warns.length) { console.log("\nCẢNH BÁO:"); v.warns.forEach((w) => console.log("  ⚠ " + w)); }
  if (v.errors.length) {
    console.log("\nLỖI (chặn push):"); v.errors.forEach((e) => console.log("  ✗ " + e));
    process.exit(1);
  }
  console.log("\nVerify offline: PASS (không lỗi chặn)");

  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log("\n═══ KẾT NỐI WP ═══");
  const me = await httpsRequest("GET", "/wp/v2/users/me", auth, null);
  console.log(`Auth OK: ${me.name} — ${WP_HOST} via IP ${SERVER_IP}`);

  console.log("\n═══ BACKUP NỘI DUNG CŨ ═══");
  const before = await httpsRequest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth, null);
  const backupPath = join(PROJECT, "seo-revisions", `wp-before-rewrite-ttc-ha-long-${TODAY}-pages-296.json`);
  writeFileSync(backupPath, JSON.stringify(before, null, 2), "utf8");
  console.log(`Backup post_content → ${backupPath}`);

  // Mở MCP session để backup + sau đó update option renderer.
  const initRes = await mcpRpc(auth, null, {
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "codex-ttc-296", version: "1.0.0" } },
  });
  const sessionId = initRes.sessionId;
  if (!sessionId) throw new Error("Không lấy được Mcp-Session-Id");
  console.log("MCP session OK");
  let gid = 10;
  for (const name of OPTION_NAMES) {
    const val = await getOption(auth, sessionId, name, gid++);
    const p = join(PROJECT, "seo-revisions", `wp-before-rewrite-ttc-ha-long-${TODAY}-option-${name}.json`);
    writeFileSync(p, JSON.stringify({ name, value: val }, null, 2), "utf8");
    console.log(`Backup option ${name} (${String(val).length} chars)`);
  }

  if (!doPublish) {
    console.log("\n[DRY-RUN] Không push. Chạy lại với --publish để đẩy live.");
    return;
  }

  console.log("\n═══ PUSH LIVE ═══");
  await httpsRequest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, {
    title: WP_TITLE, content: html, excerpt: DESCRIPTION, status: "publish",
  });
  console.log("Content + title + excerpt OK");

  // Frontend render qua option, không qua post_content → phải update option.
  console.log("\n═══ UPDATE RENDERER OPTION ═══");
  let oid = 30;
  for (const name of OPTION_NAMES) {
    const r = await updateOption(auth, sessionId, name, html, oid++);
    const ok = !r.payload?.error;
    console.log(`  option ${name}: ${ok ? "OK" : "FAIL " + JSON.stringify(r.payload?.error).slice(0, 80)}`);
  }

  try {
    await httpsRequest("POST", "/rankmath/v1/updateMeta", auth, {
      objectType: "post", objectID: PAGE_ID,
      meta: { rank_math_title: SEO_TITLE, rank_math_description: DESCRIPTION, rank_math_focus_keyword: FOCUS_KEYWORD },
    });
    console.log("Rank Math meta OK");
  } catch (e) { console.log("Rank Math skip: " + e.message.slice(0, 80)); }

  console.log("\n═══ VERIFY LIVE (frontend render) ═══");
  const front = await new Promise((resolve, reject) => {
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: `/thong-tac-cong-ha-long/?nowprocket=1&z=${Date.now()}`,
      headers: { Host: WP_HOST, "User-Agent": "Codex verify", "Cache-Control": "no-cache" },
      rejectUnauthorized: false,
    };
    https.get(o, (r) => { let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => resolve(d)); }).on("error", reject);
  });
  const h1 = (front.match(/<h1[\s>]/gi) || []).length;
  const checks = {
    "Bảng 4 cột (Dấu hiệu nhận biết)": front.includes("Dấu hiệu nhận biết"),
    "H2 mới (Khi nào tự xử lý)": front.includes("Khi nào tự xử lý được"),
    "External wiki link": front.includes("vi.wikipedia.org"),
    "Author byline": front.includes("nguyensonghao"),
    Hotline: /0963\.953\.533/.test(front),
    "Schema FAQPage": front.includes("FAQPage"),
  };
  console.log(`HTTP frontend OK | <h1>: ${h1} (cần đúng 1)`);
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? "OK" : "THIẾU"}  ${k}`);
  const allOk = h1 === 1 && Object.values(checks).every(Boolean);
  console.log(allOk ? "\nVERIFY LIVE: PASS — frontend đã hiện bản rewrite" : "\nVERIFY LIVE: CHƯA ĐỦ — kiểm cache/option");

  const csvRow =
    `\n${TODAY},${TIME},REWRITE-TTC-HA-LONG-296-${TODAY},rewrite_content,thong tac cong ha long,` +
    `https://thongtaccongquangninh.com/thong-tac-cong-ha-long/,` +
    `thong-tac-cong-ha-long,${doPublish ? "published" : "draft"},medium,,,,,` +
    `Rewrite bo doan lap template + sua cau logic + bang nguyen nhan 4 cot + 6 FAQ + external link,` +
    `tools/push_ttc_ha_long_296.mjs,,` +
    `Cham Rank Math sau publish + verify live frontend,Title bo tu cam uy tin; 1 H1 do theme render title,,,,,,`;
  appendFileSync(CSV_PATH, csvRow, "utf8");
  console.log("\nLogged to docs/SEO_PROGRESS.csv");
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
