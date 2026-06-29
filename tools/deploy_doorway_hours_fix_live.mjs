import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import { dirname, join } from "node:path";

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

const TARGET = {
  local: join(ROOT, "tools", "wp-plugins", "ttcqn-doorway-schema", "ttcqn-doorway-schema.php"),
  remote: "/public_html/wp-content/plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php",
  backup: "ttcqn-doorway-schema.remote.php",
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

function verifyLocalFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const required = [
    "Version: 2026.06.28.1",
    "05:00-22:00 hằng ngày",
    "'opens'  => '05:00'",
    "'closes' => '22:00'",
  ];
  const missing = required.filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    throw new Error(`Local doorway plugin missing expected snippets: ${missing.join(", ")}`);
  }
  return content;
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
        headers: { Host: HOST, "User-Agent": "Codex doorway-hours-fix" },
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

function extractDoorwayScript(html) {
  const match = html.match(/<script type="application\/ld\+json" data-ttcqn-doorway-schema="1">([\s\S]*?)<\/script>/i);
  return match ? match[1] : "";
}

function verifyDoorwayHtml(html) {
  const doorway = extractDoorwayScript(html);
  return {
    hasDoorwayScript: doorway.length > 0,
    hasNewHours: doorway.includes('"opens":"05:00"') && doorway.includes('"closes":"22:00"'),
    hasOldHours: doorway.includes('"opens":"00:00"') || doorway.includes('"closes":"23:59"'),
    hasOld247: /24\/7/i.test(doorway),
    hasVerifiedHoursText: html.includes("05:00-22:00"),
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
const backupDir = join(ROOT, "backups", `doorway-hours-live-${stamp}`);
const reportPath = join(ROOT, "reports", `doorway-hours-live-${stamp}.json`);
mkdirSync(backupDir, { recursive: true });
mkdirSync(dirname(reportPath), { recursive: true });

async function main() {
  const report = {
    generatedAt: formatProjectTimestamp(now),
    timezone: PROJECT_TIMEZONE,
    target: {
      local: TARGET.local,
      remote: TARGET.remote,
      backupPath: join(backupDir, TARGET.backup),
    },
    write: null,
    public: {},
    success: false,
  };

  const localText = verifyLocalFile(TARGET.local);
  await mcpPost("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "codex-doorway-hours-live", version: "1.0" },
  });
  await mcpPost("notifications/initialized", {});

  const remoteBefore = await hostTool("read_file", { path: TARGET.remote });
  writeFileSync(report.target.backupPath, remoteBefore, "utf8");

  const writeText = await hostTool("write_file", { path: TARGET.remote, content: localText });
  const remoteAfter = await hostTool("read_file", { path: TARGET.remote });
  report.write = {
    backupCreated: true,
    remoteMatches: normalizeText(remoteAfter) === normalizeText(localText),
    writeText,
  };

  const qnPage = await fetchPublic(`/thong-tac-cong-quang-ninh/?nowprocket=1&codex=${Date.now()}`);
  const baiChayPage = await fetchPublic(`/thong-tac-cong-bai-chay/?nowprocket=1&codex=${Date.now()}`);

  report.public.qnPage = {
    status: qnPage.status,
    ...verifyDoorwayHtml(qnPage.text),
  };
  report.public.baiChayPage = {
    status: baiChayPage.status,
    ...verifyDoorwayHtml(baiChayPage.text),
  };

  report.success = Boolean(
    report.write?.remoteMatches &&
    report.public.qnPage.status === 200 &&
    report.public.qnPage.hasDoorwayScript &&
    report.public.qnPage.hasNewHours &&
    !report.public.qnPage.hasOldHours &&
    !report.public.qnPage.hasOld247 &&
    report.public.baiChayPage.status === 200
  );

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ reportPath, backupDir, success: report.success }, null, 2));
  if (!report.success) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const failure = {
    generatedAt: formatProjectTimestamp(now),
    error: error instanceof Error ? error.message : String(error),
  };
  writeFileSync(reportPath, JSON.stringify(failure, null, 2), "utf8");
  console.error(error);
  process.exitCode = 1;
});
