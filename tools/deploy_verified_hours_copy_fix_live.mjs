import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import { dirname, join, relative } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const MCP_TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const PROJECT_TIMEZONE = "Asia/Bangkok";
const CSV_PATH = join(ROOT, "docs", "SEO_PROGRESS.csv");

const TARGETS = [
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-home-emergency-renderer", "ttcqn-home-emergency-renderer.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php",
    backup: "ttcqn-home-emergency-renderer.remote.php",
  },
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-home-emergency-renderer", "templates", "page-home-direct.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php",
    backup: "page-home-direct.remote.php",
  },
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-home-emergency-renderer", "templates", "shared-footer.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/shared-footer.php",
    backup: "shared-footer.remote.php",
  },
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-seo-contact-block", "ttcqn-seo-contact-block.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-seo-contact-block/ttcqn-seo-contact-block.php",
    backup: "ttcqn-seo-contact-block.remote.php",
  },
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-title-meta-short-2026-06-12", "ttcqn-title-meta-short-2026-06-12.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-title-meta-short-2026-06-12/ttcqn-title-meta-short-2026-06-12.php",
    backup: "ttcqn-title-meta-short-2026-06-12.remote.php",
  },
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-qn-service-landing", "ttcqn-qn-service-landing.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-qn-service-landing/ttcqn-qn-service-landing.php",
    backup: "ttcqn-qn-service-landing.remote.php",
  },
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-qn-service-landing", "assets", "index.html"),
    remote: "/public_html/wp-content/plugins/ttcqn-qn-service-landing/assets/index.html",
    backup: "ttcqn-qn-service-landing-assets-index.remote.html",
  },
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-qn-service-landing", "assets", "assets", "index-Bx369fcL.js"),
    remote: "/public_html/wp-content/plugins/ttcqn-qn-service-landing/assets/assets/index-Bx369fcL.js",
    backup: "ttcqn-qn-service-landing-assets-index-Bx369fcL.remote.js",
  },
];

let sessionId = null;
let messageId = 1;

function getTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const millisecond = String(date.getMilliseconds()).padStart(3, "0");
  return { ...map, millisecond };
}

function formatProjectTimestamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${parts.millisecond}+07:00`;
}

function formatProjectStamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}-${parts.millisecond}+07-00`;
}

function parseSse(text) {
  const events = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      events.push(JSON.parse(payload));
    } catch {}
  }
  return events;
}

function normalizeText(text) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
}

function fetchPublic(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: HOST,
        path,
        method: "GET",
        headers: { Host: HOST, "User-Agent": "Codex verified-hours-copy-fix" },
        rejectUnauthorized: false,
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text }));
      },
    );
    req.on("error", (error) => resolve({ status: 0, error: error.message, text: "" }));
    req.setTimeout(45000, () => {
      req.destroy();
      resolve({ status: 0, error: "timeout", text: "" });
    });
    req.end();
  });
}

function verifyLocalFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const required = {
    "ttcqn-home-emergency-renderer.php": [
      "Hoạt động 05:00-22:00 hằng ngày",
      "TIẾP NHẬN 05:00-22:00",
    ],
    "page-home-direct.php": [
      "Tiếp nhận 05:00-22:00 tại Quảng Ninh",
      "Tư vấn & báo giá miễn phí 05:00-22:00",
    ],
    "shared-footer.php": [
      "Gọi chúng tôi 05:00-22:00",
      "Tiếp nhận 05:00-22:00 - Có mặt nhanh chóng",
    ],
    "ttcqn-seo-contact-block.php": [
      "05:00-22:00 hằng ngày",
    ],
    "ttcqn-title-meta-short-2026-06-12.php": [
      "Hoạt động 05:00-22:00 hằng ngày",
      "Thông Tắc Cống Quảng Ninh - Hút Bể Phốt",
    ],
    "ttcqn-qn-service-landing.php": [
      "tiếp nhận 05:00-22:00 hằng ngày",
      "Mo-Su 05:00-22:00",
    ],
    "index.html": [
      "tiếp nhận 05:00-22:00 hằng ngày",
    ],
    "index-Bx369fcL.js": [
      "Tiếp nhận 05:00-22:00",
      "openingHours:\"Mo-Su 05:00-22:00\"",
    ],
  };
  const basename = filePath.split(/[/\\]/).pop();
  const missing = (required[basename] || []).filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    throw new Error(`Local file missing expected snippets in ${basename}: ${missing.join(", ")}`);
  }
  return content;
}

function verifyHtml(text) {
  return {
    hasNewHours: text.includes("05:00-22:00"),
    hasOldVisible247: /(?:TIẾP NHẬN 24\/7|Gọi chúng tôi 24\/7|Phục vụ 24\/7|Hotline 24\/7|hỗ trợ 24\/7|phục vụ 24\/7)/i.test(text),
    hasOldSchemaHours: text.includes("00:00-23:59"),
    hasNewContactBlockHours: text.includes("Thời gian làm việc:</strong> 05:00-22:00 hằng ngày"),
  };
}

async function mcpPost(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: messageId++,
      method,
      params: params ?? {},
    });
    const headers = {
      Authorization: `Bearer ${MCP_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Content-Length": Buffer.byteLength(body),
    };
    if (sessionId) headers["Mcp-Session-Id"] = sessionId;

    const req = https.request(
      {
        hostname: MCP_HOST,
        port: MCP_PORT,
        path: MCP_PATH,
        method: "POST",
        headers,
        rejectUnauthorized: false,
      },
      (res) => {
        if (res.headers["mcp-session-id"]) sessionId = res.headers["mcp-session-id"];
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => {
          const contentType = res.headers["content-type"] || "";
          if (contentType.includes("text/event-stream")) {
            resolve({ status: res.statusCode, events: parseSse(text), raw: text });
            return;
          }
          try {
            resolve({ status: res.statusCode, json: JSON.parse(text) });
          } catch {
            resolve({ status: res.statusCode, raw: text });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

function getResult(response) {
  return response.json?.result ?? response.events?.find((event) => event.result !== undefined)?.result;
}

function hostText(response) {
  const result = getResult(response);
  if (!result) return JSON.stringify(response).slice(0, 2000);
  if (result.isError) {
    throw new Error(Array.isArray(result.content) ? result.content.map((item) => item.text || "").join("") : JSON.stringify(result));
  }
  if (Array.isArray(result.content)) {
    return result.content.map((item) => item.text || "").join("");
  }
  return JSON.stringify(result);
}

async function hostTool(tool, args) {
  const response = await mcpPost("tools/call", { name: tool, arguments: args });
  if (response.status !== 200) {
    throw new Error(`${tool} failed HTTP ${response.status}: ${JSON.stringify(response).slice(0, 1000)}`);
  }
  return hostText(response);
}

const now = new Date();
const stamp = formatProjectStamp(now);
const parts = getTimeParts(now);
const day = `${parts.year}-${parts.month}-${parts.day}`;
const time = `${parts.hour}:${parts.minute}`;
const BACKUP_DIR = join(ROOT, "backups", `verified-hours-copy-live-${stamp}`);
const REPORT_PATH = join(ROOT, "reports", `verified-hours-copy-live-${stamp}.json`);

mkdirSync(BACKUP_DIR, { recursive: true });
mkdirSync(dirname(REPORT_PATH), { recursive: true });

await mcpPost("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "codex-verified-hours-copy-deploy", version: "1" },
});
await mcpPost("notifications/initialized", {});

const writes = [];
for (const target of TARGETS) {
  const localContent = verifyLocalFile(target.local);
  const backupPath = join(BACKUP_DIR, target.backup);
  let before = "";
  let existedBefore = true;
  try {
    before = await hostTool("read_file", { path: target.remote });
    writeFileSync(backupPath, before, "utf8");
  } catch (error) {
    if (!String(error?.message || error).includes("Not found")) {
      throw error;
    }
    existedBefore = false;
  }

  const writeText = await hostTool("write_file", { path: target.remote, content: localContent });
  const after = await hostTool("read_file", { path: target.remote });
  const remoteMatches = normalizeText(after) === normalizeText(localContent);

  writes.push({
    local: target.local,
    remote: target.remote,
    backupPath,
    existedBefore,
    remoteMatches,
    writeText: writeText.slice(0, 1000),
  });
}

const purge = { ok: true, text: "", warning: "" };
try {
  purge.text = await hostTool("purge_wordpress_cache", { domain: HOST });
} catch (error) {
  purge.ok = false;
  purge.warning = String(error?.message || error);
}

const marker = `verified-hours-copy-${Date.now()}`;
const homePage = await fetchPublic(`/?nowprocket=1&codex=${marker}`);
const baiChayPage = await fetchPublic(`/thong-tac-cong-bai-chay/?nowprocket=1&codex=${marker}`);
const qnLandingPage = await fetchPublic(`/hut-be-phot-thong-tac-cong-quang-ninh/?nowprocket=1&codex=${marker}`);

const report = {
  generatedAt: formatProjectTimestamp(),
  timezone: PROJECT_TIMEZONE,
  writes,
  purge,
  public: {
    homePage: { status: homePage.status, ...verifyHtml(homePage.text) },
    baiChayPage: { status: baiChayPage.status, ...verifyHtml(baiChayPage.text) },
    qnLandingPage: { status: qnLandingPage.status, ...verifyHtml(qnLandingPage.text) },
  },
};

report.success =
  writes.every((item) => item.remoteMatches) &&
  report.public.homePage.status === 200 &&
  report.public.baiChayPage.status === 200 &&
  report.public.qnLandingPage.status === 200 &&
  report.public.homePage.hasNewHours &&
  !report.public.homePage.hasOldVisible247 &&
  !report.public.homePage.hasOldSchemaHours &&
  report.public.baiChayPage.hasNewHours &&
  report.public.baiChayPage.hasNewContactBlockHours &&
  !report.public.baiChayPage.hasOldVisible247 &&
  !report.public.baiChayPage.hasOldSchemaHours &&
  report.public.qnLandingPage.hasNewHours &&
  !report.public.qnLandingPage.hasOldVisible247 &&
  !report.public.qnLandingPage.hasOldSchemaHours;

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const status = report.success ? "done" : "needs_review";
const filesChanged = [
  ...TARGETS.map((item) => relative(ROOT, item.local)),
  relative(ROOT, REPORT_PATH),
  relative(ROOT, BACKUP_DIR),
  "docs/SEO_PROGRESS.csv",
].join(" ");
const csvLine = [
  day,
  time,
  "SEO-VERIFIED-HOURS-COPY-LIVE-FIX-2026-06-28",
  "seo",
  "replace 24/7 copy with verified hours",
  `https://${HOST}/`,
  "verified-hours-copy-live-fix",
  status,
  "medium",
  "",
  "",
  "",
  "",
  "Backup shared plugin files; replace visible 24/7 claims and old schema hours with verified 05:00-22:00 copy on homepage, shared footer, contact block, selected meta overrides, and Quang Ninh landing assets; verify 3 public URLs",
  filesChanged,
  "Scoped to shared/public plugin surfaces only; did not rewrite every standalone article in database",
  "Some old post titles stored in WordPress may still contain 24/7 outside these shared plugin surfaces",
  `report=${relative(ROOT, REPORT_PATH)}; home=${homePage.status}; bai-chay=${baiChayPage.status}; qn-landing=${qnLandingPage.status}; remoteMatches=${writes.every((item) => item.remoteMatches)}; purgeOk=${purge.ok}`,
  report.success ? "PASS" : "NEEDS_REVIEW",
  "Codex",
  day,
  relative(ROOT, REPORT_PATH),
  relative(ROOT, REPORT_PATH),
  "",
  "",
].map((value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}).join(",");
writeFileSync(CSV_PATH, `${readFileSync(CSV_PATH, "utf8").replace(/\s*$/, "")}\n${csvLine}\n`, "utf8");

console.log(JSON.stringify({
  success: report.success,
  reportPath: REPORT_PATH,
  writes: writes.map((item) => ({
    remote: item.remote,
    backupPath: item.backupPath,
    remoteMatches: item.remoteMatches,
  })),
  purge,
  public: report.public,
}, null, 2));

if (!report.success) process.exitCode = 1;
