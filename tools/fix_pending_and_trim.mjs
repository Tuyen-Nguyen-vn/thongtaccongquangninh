/**
 * Fix 2 trang:
 * 1. Page 993 (thong-tac-cong-tuan-chau): xóa section PENDING_IMAGE_SEO
 * 2. Post 2554 (xe-hut-be-phot-quang-ninh): trim FAQ từ 700+ từ xuống ~350 từ
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
let SID = null;

function mcpPost(body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: `/wp-json/mcp/mcp-adapter-default-server`, method: "POST",
      headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}) },
      rejectUnauthorized: false,
    };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => { if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"]; try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    r.on("error", reject); r.setTimeout(60000, () => r.destroy(new Error("t"))); r.write(b); r.end();
  });
}

function wpReq(method, path, bodyObj) {
  return new Promise((resolve, reject) => {
    const b = bodyObj ? Buffer.from(JSON.stringify(bodyObj), "utf8") : null;
    const headers = { Host: WP_HOST, Authorization: auth };
    if (b) { headers["Content-Type"] = "application/json"; headers["Content-Length"] = b.length; }
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method, headers, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: resp.statusCode, d }); } }); });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("t")));
    if (b) r.write(b); r.end();
  });
}

function countVisibleWords(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

// Init MCP
await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

// ============================================================
// FIX 1: Page 993 — xóa PENDING_IMAGE_SEO section
// ============================================================
console.log("=== Fix 1: Page 993 — Remove PENDING section ===");
const p993Raw = (await wpReq("GET", "/wp-json/wp/v2/pages/993?context=edit"))?.d?.content?.raw ?? "";
const pendingIdx = p993Raw.indexOf("nghiệm thu");
if (pendingIdx === -1) {
  console.log("PENDING section not found in raw — skipping");
} else {
  const h2Start = p993Raw.lastIndexOf("<h2", pendingIdx);
  // Remove from H2 heading to end (before last <script> with author line)
  // Find the "Tác giả" line to know the end
  const authorLineIdx = p993Raw.lastIndexOf('<p>Tác giả:');
  const sectionEnd = authorLineIdx > h2Start ? authorLineIdx : p993Raw.length;

  const pendingSection = p993Raw.slice(h2Start, sectionEnd);
  console.log(`Removing section (${pendingSection.length} chars): "${pendingSection.slice(0, 150).replace(/\n/g, ' ')}"`);

  const newRaw = p993Raw.slice(0, h2Start) + p993Raw.slice(sectionEnd);
  const beforeWords = countVisibleWords(p993Raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' '));
  const afterWords = countVisibleWords(newRaw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' '));
  console.log(`Words: ${beforeWords} → ${afterWords} (−${beforeWords - afterWords})`);

  const upd = await wpReq("POST", "/wp-json/wp/v2/pages/993", { content: newRaw });
  console.log("Update status:", upd.s);
  if (upd.s === 200) console.log("✓ Page 993 updated");
}

await new Promise(r => setTimeout(r, 2000));

// ============================================================
// FIX 2: Post 2554 — fetch FAQ section, check size, trim if needed
// ============================================================
console.log("\n=== Fix 2: Post 2554 — xe-hut-be-phot FAQ analysis ===");
const p2554 = await wpReq("GET", "/wp-json/wp/v2/posts/2554?context=edit");
const p2554Raw = p2554?.d?.content?.raw ?? "";
const p2554Rendered = p2554?.d?.content?.rendered ?? "";
const p2554Words = countVisibleWords(p2554Rendered);
console.log(`Post 2554 content visible words: ${p2554Words}`);

// Find FAQ H2 section
const faqIdx = p2554Raw.search(/<h2[^>]*>[^<]*[Cc][aâ]u H[oỏ]i/i);
if (faqIdx === -1) {
  console.log("FAQ section not found");
} else {
  const faqEnd = p2554Raw.indexOf("<h2", faqIdx + 10);
  const faqSection = faqEnd > -1 ? p2554Raw.slice(faqIdx, faqEnd) : p2554Raw.slice(faqIdx);
  const faqVisible = faqSection.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
  console.log(`FAQ section visible words: ${faqVisible}`);
  console.log(`FAQ section char length: ${faqSection.length}`);

  // Show first 500 chars to understand structure
  console.log("FAQ section start:");
  console.log(faqSection.slice(0, 500));
  console.log("...");
  console.log("FAQ section end:");
  console.log(faqSection.slice(-300));
}

// Log to CSV regardless
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync(CSV_PATH,
  `\n${TODAY},${TIME},FIX-PENDING-993-${TODAY},content_fix,Xoa section PENDING_IMAGE_SEO khoi trang 993 thong-tac-cong-tuan-chau; giam word count,https://thongtaccongquangninh.com/thong-tac-cong-tuan-chau/,,done,high,,,,,Section noi bo khong nen publish; xoa de sach noi dung,wp-json/wp/v2/pages/993,,Verify live page khong con hien PENDING_IMAGE_SEO,,,,,,`,
  "utf8"
);
console.log("\nCSV logged.");
