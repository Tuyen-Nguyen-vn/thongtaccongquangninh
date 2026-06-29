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
const TARGET = {
  local: join(ROOT, "tools", "wp-plugins", "ttcqn-home-emergency-renderer", "ttcqn-home-emergency-renderer.php"),
  remote: "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php",
  backup: "ttcqn-home-emergency-renderer.remote.php",
};

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
        headers: { Host: HOST, "User-Agent": "Codex schema hours verify" },
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

function assertLocalFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const required = [
    "Hoạt động từ 05:00 đến 22:00 hằng ngày",
    "Mo,Tu,We,Th,Fr,Sa,Su 05:00-22:00",
  ];
  const missing = required.filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    throw new Error(`Local file missing expected schema-hours snippets: ${missing.join(", ")}`);
  }
  return content;
}

function verifyHtml(text) {
  return {
    hasNewDescription: text.includes("Hoạt động từ 05:00 đến 22:00 hằng ngày"),
    hasNewHours: text.includes('"openingHours":"Mo,Tu,We,Th,Fr,Sa,Su 05:00-22:00"'),
    hasOldDescription: text.includes("Phục vụ 24/7, có mặt trong 15 phút"),
    hasOldHours: text.includes('"openingHours":"Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59"'),
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
const BACKUP_DIR = join(ROOT, "backups", `home-schema-hours-live-${stamp}`);
const REPORT_PATH = join(ROOT, "reports", `home-schema-hours-live-${stamp}.json`);

mkdirSync(BACKUP_DIR, { recursive: true });
mkdirSync(dirname(REPORT_PATH), { recursive: true });

await mcpPost("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "codex-home-schema-hours-deploy", version: "1" },
});
await mcpPost("notifications/initialized", {});

const localContent = assertLocalFile(TARGET.local);
const before = await hostTool("read_file", { path: TARGET.remote });
const backupPath = join(BACKUP_DIR, TARGET.backup);
writeFileSync(backupPath, before, "utf8");

const writeText = await hostTool("write_file", { path: TARGET.remote, content: localContent });
const after = await hostTool("read_file", { path: TARGET.remote });
const remoteMatches = normalizeText(after) === normalizeText(localContent);

const purge = { ok: true, text: "", warning: "" };
try {
  purge.text = await hostTool("purge_wordpress_cache", { domain: HOST });
} catch (error) {
  purge.ok = false;
  purge.warning = String(error?.message || error);
}

const marker = `home-schema-hours-${Date.now()}`;
const servicePage = await fetchPublic(`/thong-tac-cong-bai-chay/?nowprocket=1&codex=${marker}`);
const homePage = await fetchPublic(`/?nowprocket=1&codex=${marker}`);
const serviceVerify = verifyHtml(servicePage.text);
const homeVerify = verifyHtml(homePage.text);

const report = {
  generatedAt: formatProjectTimestamp(),
  timezone: PROJECT_TIMEZONE,
  target: {
    local: TARGET.local,
    remote: TARGET.remote,
    backupPath,
  },
  writeText: writeText.slice(0, 1000),
  remoteMatches,
  purge,
  public: {
    servicePage: {
      status: servicePage.status,
      ...serviceVerify,
    },
    homePage: {
      status: homePage.status,
      ...homeVerify,
    },
  },
};

report.success =
  remoteMatches &&
  report.public.servicePage.status === 200 &&
  report.public.homePage.status === 200 &&
  report.public.servicePage.hasNewDescription &&
  report.public.servicePage.hasNewHours &&
  !report.public.servicePage.hasOldDescription &&
  !report.public.servicePage.hasOldHours &&
  report.public.homePage.hasNewDescription &&
  report.public.homePage.hasNewHours &&
  !report.public.homePage.hasOldDescription &&
  !report.public.homePage.hasOldHours;

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const status = report.success ? "done" : "needs_review";
const filesChanged = [
  relative(ROOT, TARGET.local),
  relative(ROOT, REPORT_PATH),
  relative(ROOT, BACKUP_DIR),
  "docs/SEO_PROGRESS.csv",
].join(" ");
const csvLine = [
  day,
  time,
  "SEO-HOME-SCHEMA-HOURS-LIVE-FIX-2026-06-28",
  "schema",
  "global LocalBusiness hours consistency",
  `https://${HOST}/thong-tac-cong-bai-chay/`,
  "home-schema-hours-live-fix",
  status,
  "medium",
  "",
  "",
  "",
  "",
  "Backup plugin file; update global LocalBusiness schema description and openingHours from 24/7 to 05:00-22:00; purge cache and verify public page plus homepage",
  filesChanged,
  "Schema-only patch in ttcqn-home-emergency-renderer.php; no layout change",
  "Visible 24/7 marketing copy on other pages may still exist outside schema layer",
  `report=${relative(ROOT, REPORT_PATH)}; service=${servicePage.status}; home=${homePage.status}; remoteMatches=${remoteMatches}; purgeOk=${purge.ok}`,
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
  backupPath,
  remoteMatches,
  purge,
  public: report.public,
}, null, 2));

if (!report.success) process.exitCode = 1;
