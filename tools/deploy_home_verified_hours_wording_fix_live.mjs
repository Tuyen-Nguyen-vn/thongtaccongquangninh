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

const TARGETS = [
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-home-emergency-renderer", "ttcqn-home-emergency-renderer.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php",
    backup: "ttcqn-home-emergency-renderer.remote.php",
    required: [
      "khu phố cổ Bãi Cháy vào giờ cao điểm để hạn chế ảnh hưởng hoạt động kinh doanh",
    ],
    forbidden: [
      "khu phố cổ Bãi Cháy ban đêm để không ảnh hưởng hoạt động kinh doanh",
    ],
  },
  {
    local: join(ROOT, "tools", "wp-plugins", "ttcqn-home-emergency-renderer", "templates", "page-home-direct.php"),
    remote: "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php",
    backup: "page-home-direct.remote.php",
    required: [
      "Có hỗ trợ sát giờ đóng hoặc ngoài khung tiếp nhận không?",
      "Nếu phát sinh sự cố sát giờ đóng hoặc ngoài khung giờ này, khách nên gọi hotline để được xác nhận khả năng điều phối thực tế.",
      "Nếu sự cố phát sinh sát giờ đóng hoặc ngoài khung giờ này, khách nên gọi hotline để được xác nhận khả năng điều phối thực tế.",
    ],
    forbidden: [
      "Có phục vụ ngoài giờ hành chính và ban đêm không?",
    ],
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

function assertLocalFile(target) {
  const content = readFileSync(target.local, "utf8");
  const missing = target.required.filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    throw new Error(`Local file missing required snippets for ${target.local}: ${missing.join(" | ")}`);
  }
  const presentForbidden = target.forbidden.filter((snippet) => content.includes(snippet));
  if (presentForbidden.length) {
    throw new Error(`Local file still contains forbidden snippets for ${target.local}: ${presentForbidden.join(" | ")}`);
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
        headers: { Host: HOST, "User-Agent": "Codex home wording verify" },
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

function verifyHomeHtml(text) {
  return {
    hasNewFaqQuestion: text.includes("Có hỗ trợ sát giờ đóng hoặc ngoài khung tiếp nhận không?"),
    hasOldFaqQuestion: text.includes("Có phục vụ ngoài giờ hành chính và ban đêm không?"),
  };
}

function verifyBaiChayHtml(text) {
  return {
    hasOldFaqQuestion: text.includes("Có phục vụ ngoài giờ hành chính và ban đêm không?"),
    hasOldBaiChayWording: text.includes("khu phố cổ Bãi Cháy ban đêm để không ảnh hưởng hoạt động kinh doanh"),
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
const backupDir = join(ROOT, "backups", `home-verified-hours-wording-live-${stamp}`);
const reportPath = join(ROOT, "reports", `home-verified-hours-wording-live-${stamp}.json`);
mkdirSync(backupDir, { recursive: true });
mkdirSync(dirname(reportPath), { recursive: true });

async function main() {
  const report = {
    generatedAt: formatProjectTimestamp(now),
    timezone: PROJECT_TIMEZONE,
    targets: [],
    purge: { ok: true, text: "", warning: "" },
    public: {},
    success: false,
  };

  await mcpPost("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "codex-home-verified-hours-wording-deploy", version: "1" },
  });
  await mcpPost("notifications/initialized", {});

  for (const target of TARGETS) {
    const localContent = assertLocalFile(target);
    const before = await hostTool("read_file", { path: target.remote });
    const backupPath = join(backupDir, target.backup);
    writeFileSync(backupPath, before, "utf8");

    const writeText = await hostTool("write_file", { path: target.remote, content: localContent });
    const after = await hostTool("read_file", { path: target.remote });
    const remoteMatches = normalizeText(after) === normalizeText(localContent);

    report.targets.push({
      local: target.local,
      remote: target.remote,
      backupPath,
      writeText: writeText.slice(0, 1000),
      remoteMatches,
      requiredOk: target.required.every((snippet) => after.includes(snippet)),
      forbiddenGone: target.forbidden.every((snippet) => !after.includes(snippet)),
    });
  }

  try {
    report.purge.text = await hostTool("purge_all_wordpress_cache", {});
  } catch (error) {
    report.purge.ok = false;
    report.purge.warning = String(error?.message || error);
  }

  const marker = `home-wording-${Date.now()}`;
  const home = await fetchPublic(`/?nowprocket=1&codex=${marker}`);
  const baiChay = await fetchPublic(`/thong-tac-cong-bai-chay/?nowprocket=1&codex=${marker}`);
  report.public = {
    home: {
      status: home.status,
      ...verifyHomeHtml(home.text),
    },
    baiChay: {
      status: baiChay.status,
      ...verifyBaiChayHtml(baiChay.text),
    },
  };

  report.success =
    report.targets.every((target) => target.requiredOk && target.forbiddenGone) &&
    report.public.home.status === 200 &&
    report.public.baiChay.status === 200 &&
    report.public.home.hasNewFaqQuestion &&
    !report.public.home.hasOldFaqQuestion &&
    !report.public.baiChay.hasOldFaqQuestion &&
    !report.public.baiChay.hasOldBaiChayWording;

  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    success: report.success,
    reportPath,
    backupDir,
    purgeOk: report.purge.ok,
    homeStatus: report.public.home.status,
    baiChayStatus: report.public.baiChay.status,
  }, null, 2));

  if (!report.success) {
    process.exitCode = 1;
  }
}

await main();
