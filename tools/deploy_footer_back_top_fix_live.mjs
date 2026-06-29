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
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second,
    millisecond,
  };
}

function formatProjectTimestamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${parts.millisecond}+07:00`;
}

function formatProjectStamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}-${parts.millisecond}+07-00`;
}

const NOW = new Date();
const STAMP = formatProjectStamp(NOW);
const NOW_PARTS = getTimeParts(NOW);
const DAY = `${NOW_PARTS.year}-${NOW_PARTS.month}-${NOW_PARTS.day}`;
const TIME = `${NOW_PARTS.hour}:${NOW_PARTS.minute}`;
const BACKUP_DIR = join(ROOT, "backups", `footer-back-top-live-${STAMP}`);
const REPORT_PATH = join(ROOT, "reports", `footer-back-top-live-${STAMP}.json`);

console.log("[footer-deploy] Debug path: for normal workflow prefer `npm run release:footer-backtop-live`");

const DEPLOY_TARGETS = [
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
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-home-emergency-renderer", "templates", "shared-footer-interactions-inline.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/shared-footer-interactions-inline.php",
    backup: "shared-footer-interactions-inline.remote.php",
  },
];

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

function mcpPost(method, params) {
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

function fetchPublic(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: HOST,
        path,
        method: "GET",
        headers: { Host: HOST, "User-Agent": "Codex footer back-top verify" },
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
  const required = (
    filePath.endsWith("ttcqn-home-emergency-renderer.php") ||
    filePath.endsWith("page-home-direct.php")
  )
    ? [
        "shared-footer-interactions-inline.php",
      ]
    : [
        "var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;",
        "document.documentElement.scrollTop = 0;",
        "window.setTimeout(function() {",
      ];
  const missing = required.filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    throw new Error(`Local file missing expected back-top fix snippets in ${filePath}`);
  }
  return content;
}

function normalizeText(text) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
}

function fileMatches(target, remoteContent, localContent) {
  const strict = normalizeText(remoteContent) === normalizeText(localContent);
  if (strict) {
    return { strict: true, logical: true, mode: "strict" };
  }

  if (
    target.remote.endsWith("/ttcqn-home-emergency-renderer.php") ||
    target.remote.endsWith("/templates/page-home-direct.php")
  ) {
    const required = [
      "shared-footer-interactions-inline.php",
      "/* === MOBILE NAV === */",
    ];
    const logical = required.every((snippet) => remoteContent.includes(snippet));
    return { strict: false, logical, mode: logical ? "logical" : "mismatch" };
  }

  return { strict: false, logical: false, mode: "mismatch" };
}

function classifyPurge(purge) {
  if (purge.ok) {
    return {
      status: "ok",
      knownWarning: false,
      summary: "cache purge completed",
    };
  }

  if (/litespeed-purge' is not a registered wp command/i.test(purge.warning)) {
    return {
      status: "known_warning",
      knownWarning: true,
      summary: "host does not expose wp litespeed-purge; rely on public verify result",
    };
  }

  return {
    status: "warning",
    knownWarning: false,
    summary: "cache purge failed with an unexpected warning; inspect purge.warning",
  };
}

mkdirSync(BACKUP_DIR, { recursive: true });
mkdirSync(dirname(REPORT_PATH), { recursive: true });

await mcpPost("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "codex-footer-back-top-deploy", version: "1" },
});
await mcpPost("notifications/initialized", {});

const writes = [];
for (const target of DEPLOY_TARGETS) {
  const localContent = assertLocalFile(target.local);
  let before = "";
  let existedBefore = true;
  try {
    before = await hostTool("read_file", { path: target.remote });
  } catch (error) {
    if (!String(error?.message || error).includes("Not found")) {
      throw error;
    }
    existedBefore = false;
  }
  const backupPath = join(BACKUP_DIR, target.backup);
  if (existedBefore) {
    writeFileSync(backupPath, before, "utf8");
  }

  const writeText = await hostTool("write_file", { path: target.remote, content: localContent });
  const after = await hostTool("read_file", { path: target.remote });

  const match = fileMatches(target, after, localContent);

  writes.push({
    local: target.local,
    remote: target.remote,
    backupPath,
    existedBefore,
    writeText: writeText.slice(0, 1000),
    remoteMatches: match.logical,
    strictMatch: match.strict,
    matchMode: match.mode,
  });
}

const purge = {
  ok: true,
  text: "",
  warning: "",
};
try {
  purge.text = await hostTool("purge_wordpress_cache", { domain: HOST });
} catch (error) {
  purge.ok = false;
  purge.warning = String(error?.message || error);
}
purge.classification = classifyPurge(purge);
const marker = `footer-back-top-${Date.now()}`;
const servicePage = await fetchPublic(`/hut-be-phot-quang-ninh/?nowprocket=1&codex=${marker}`);
const homePage = await fetchPublic(`/?nowprocket=1&codex=${marker}`);

const report = {
  generatedAt: formatProjectTimestamp(),
  timezone: PROJECT_TIMEZONE,
  writes,
  purge,
  public: {
    servicePage: {
      status: servicePage.status,
      hasFooterButton: servicePage.text.includes("footer-back-top"),
      hasCriticalError: /critical error|fatal error/i.test(servicePage.text),
    },
    homePage: {
      status: homePage.status,
      hasFooterButton: homePage.text.includes("footer-back-top"),
      hasCriticalError: /critical error|fatal error/i.test(homePage.text),
    },
  },
};

report.success =
  writes.every((item) => item.remoteMatches) &&
  report.public.servicePage.status === 200 &&
  report.public.servicePage.hasFooterButton &&
  !report.public.servicePage.hasCriticalError &&
  report.public.homePage.status === 200 &&
  report.public.homePage.hasFooterButton &&
  !report.public.homePage.hasCriticalError;

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const status = report.success ? "done" : "needs_review";
const TASK_ID = `FOOTER-BACKTOP-LIVE-FIX-${DAY}`;
const filesChanged = [
  ...DEPLOY_TARGETS.map((item) => relative(ROOT, item.local)),
  relative(ROOT, REPORT_PATH),
  relative(ROOT, BACKUP_DIR),
  "docs/SEO_PROGRESS.csv",
].join(" ");
const csvLine = [
  DAY,
  TIME,
  TASK_ID,
  "ui_fix",
  "footer back top live fix",
  `https://${HOST}/hut-be-phot-quang-ninh/`,
  "footer-back-top-live-fix",
  status,
  "medium",
  "",
  "",
  "",
  "",
  "Backup live renderer footer files; write stronger footer back-top handler and shared interaction partial; attempt cache purge; verify public pages respond normally",
  filesChanged,
  "No full plugin zip overwrite; only three renderer/footer files written via hosting MCP",
  "Run public footer verification after deploy to confirm mobile back-to-top reaches top",
  `report=${relative(ROOT, REPORT_PATH)}; service=${servicePage.status}; home=${homePage.status}; remoteMatches=${writes.every((item) => item.remoteMatches)}; strictMatches=${writes.filter((item) => item.strictMatch).length}/${writes.length}; purgeOk=${purge.ok}; purgeStatus=${purge.classification.status}`,
  report.success ? "PASS" : "NEEDS_REVIEW",
  "Codex",
  DAY,
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
  purge: {
    ok: purge.ok,
    status: purge.classification.status,
    knownWarning: purge.classification.knownWarning,
    summary: purge.classification.summary,
    warning: purge.warning,
  },
  public: report.public,
}, null, 2));

if (!report.success) process.exitCode = 1;
