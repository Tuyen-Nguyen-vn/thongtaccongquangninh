import https from "node:https";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { platform } from "node:process";

const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const WP_HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const PROJECT_ROOT =
  platform === "linux" && existsSync("/mnt/d/.thongtaccongquangninh")
    ? "/mnt/d/.thongtaccongquangninh"
    : "D:\\.thongtaccongquangninh";
const ROOT_IS_POSIX = PROJECT_ROOT.startsWith("/");
const fromRoot = (...parts) => (ROOT_IS_POSIX ? [PROJECT_ROOT, ...parts].join("/") : [PROJECT_ROOT, ...parts].join("\\"));
const TODAY = new Date().toISOString().slice(0, 10);
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = fromRoot("backups", `forbidden-cleanup-panel-${STAMP}`);
const REPORT_PATH = fromRoot("reports", `forbidden-cleanup-panel-live-${STAMP}.json`);
const CSV_PATH = fromRoot("docs", "SEO_PROGRESS.csv");

let sessionId = null;
let msgId = 1;

const targets = [
  {
    name: "home renderer template",
    localPath: fromRoot("tools", "wp-plugins", "ttcqn-home-emergency-renderer", "templates", "page-home-direct.php"),
    remotePath: "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php",
    backupName: "page-home-direct.remote.php",
    mustContain: ["Môi Trường Đô Thị Số 1 Quảng Ninh - phục vụ nhanh, sạch sẽ", "Hình ảnh thi công từ công trình"],
    mustNotContain: ["Uy tín nhanh chóng sạch sẽ", "Hình ảnh thực tế từ công trình"],
  },
  {
    name: "doorway schema GBP data",
    localPath: fromRoot("tools", "wp-plugins", "ttcqn-doorway-schema", "gbp_data.json"),
    remotePath: "/public_html/wp-content/plugins/ttcqn-doorway-schema/gbp_data.json",
    backupName: "doorway-gbp-data.remote.json",
    mustContain: ['"mode": "no_verified_reviews"', '"reviews": []'],
    mustNotContain: ['"average_rating"', "rev_mock", "Trần Minh Quân", "Nguyễn Thị Mai", "Phạm Hoàng Long"],
  },
  {
    name: "home image alt fixer plugin",
    localPath: fromRoot("tools", "mu-plugins", "ttcqn-fix-home-img-alt.php"),
    remotePath: "/public_html/wp-content/plugins/ttcqn-fix-home-img-alt/ttcqn-fix-home-img-alt.php",
    backupName: "fix-home-img-alt.remote.php",
    mustContain: ["minh họa kênh phản hồi"],
    mustNotContain: ["khách hàng Anh Trần Hùng đánh giá", "khách hàng chị Nguyễn Thu đánh giá"],
  },
];

function parseSSE(rawText) {
  const results = [];
  for (const line of rawText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const raw = line.slice(6).trim();
    if (raw === "[DONE]") continue;
    try {
      results.push(JSON.parse(raw));
    } catch {
      // Ignore keepalive or malformed chunks.
    }
  }
  return results;
}

function mcpPost(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: "2.0", id: msgId++, method, params: params ?? {} });
    const headers = {
      Authorization: `Bearer ${TOKEN}`,
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
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const contentType = res.headers["content-type"] ?? "";
          if (contentType.includes("text/event-stream")) {
            resolve({ status: res.statusCode, events: parseSSE(data), raw: data });
            return;
          }
          try {
            resolve({ status: res.statusCode, json: JSON.parse(data), raw: data });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(90000, () => req.destroy(new Error(`timeout ${method}`)));
    req.write(body);
    req.end();
  });
}

function extractToolResult(response) {
  const result = response.json?.result ?? response.events?.find((event) => event.result !== undefined)?.result;
  if (!result) return { isError: true, text: JSON.stringify(response.raw ?? response.json ?? "").slice(0, 1000) };
  if (result.isError) {
    const text = Array.isArray(result.content) ? result.content.map((item) => item.text ?? "").join("") : JSON.stringify(result);
    return { isError: true, text };
  }
  const text =
    (Array.isArray(result.content) ? result.content.map((item) => item.text ?? "").join("") : null) ??
    JSON.stringify(result);
  return { isError: false, text, result };
}

async function callTool(name, args) {
  const response = await mcpPost("tools/call", { name, arguments: args });
  const result = extractToolResult(response);
  return { ...result, status: response.status };
}

async function initMcp() {
  const init = await mcpPost("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "forbidden-cleanup-panel-write", version: "1.0" },
  });
  if (init.status !== 200) throw new Error(`1Panel MCP initialize failed HTTP ${init.status}`);
  await mcpPost("notifications/initialized", {});
}

function fetchPublic(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "Codex forbidden cleanup public verify" },
        rejectUnauthorized: false,
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text }));
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error(`timeout public ${path}`)));
    req.end();
  });
}

function checkText(text, mustContain, mustNotContain) {
  return {
    missing: mustContain.filter((item) => !text.includes(item)),
    forbidden: mustNotContain.filter((item) => text.includes(item)),
  };
}

function summarizePublicHtml(status, text) {
  const forbiddenRegex =
    /uy tín|chuyên nghiệp|hàng đầu|tận tâm|hy vọng bài viết hữu ích|rev_mock|aggregateRating|Trần Minh Quân|Nguyễn Thị Mai|Phạm Hoàng Long|Vũ Văn Nam|Phan Anh Tuấn|Nguyễn Hoàng Hải|khách hàng Anh Trần Hùng đánh giá|khách hàng chị Nguyễn Thu đánh giá/iu;
  return {
    status,
    hasNewLogoAlt: text.includes("Môi Trường Đô Thị Số 1 Quảng Ninh - phục vụ nhanh, sạch sẽ"),
    hasOldLogoAlt: text.includes("Uy tín nhanh chóng sạch sẽ"),
    hasForbiddenPattern: forbiddenRegex.test(text),
    hasAggregateRating: /aggregateRating/u.test(text),
    hasRevMock: text.includes("rev_mock"),
    hasMockReviewName: /Trần Minh Quân|Nguyễn Thị Mai|Phạm Hoàng Long|Vũ Văn Nam|Phan Anh Tuấn|Nguyễn Hoàng Hải/u.test(text),
  };
}

mkdirSync(BACKUP_DIR, { recursive: true });
mkdirSync(dirname(REPORT_PATH), { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  backupDir: BACKUP_DIR,
  targets: [],
  cachePurge: null,
  publicVerification: {},
  success: false,
};

await initMcp();

for (const target of targets) {
  const local = readFileSync(target.localPath, "utf8");
  const localCheck = checkText(local, target.mustContain, target.mustNotContain);
  if (localCheck.missing.length || localCheck.forbidden.length) {
    throw new Error(`${target.name} local sanity failed: ${JSON.stringify(localCheck)}`);
  }

  const before = await callTool("read_file", { path: target.remotePath });
  const backupPath = join(BACKUP_DIR, target.backupName);
  writeFileSync(backupPath, before.text, "utf8");
  if (before.isError || before.text.startsWith("TOOL_ERROR")) {
    throw new Error(`${target.name} remote backup failed: ${before.text.slice(0, 300)}`);
  }

  const write = await callTool("write_file", { path: target.remotePath, content: local });
  const after = await callTool("read_file", { path: target.remotePath });
  const remoteCheck = checkText(after.text, target.mustContain, target.mustNotContain);
  const ok = !write.isError && !after.isError && remoteCheck.missing.length === 0 && remoteCheck.forbidden.length === 0;
  report.targets.push({
    name: target.name,
    localPath: target.localPath,
    remotePath: target.remotePath,
    backupPath,
    backupChars: before.text.length,
    writeStatus: write.status,
    writeOk: !write.isError,
    remoteVerify: { ok, ...remoteCheck },
  });
  console.log(`${ok ? "OK" : "FAIL"} ${target.name}`);
}

report.cachePurge = await callTool("purge_wordpress_cache", { domain: WP_HOST });
console.log(report.cachePurge.isError ? "cache purge WARN" : "cache purge OK");

const cache = `?nowprocket=1&codex=forbidden-cleanup-panel-${Date.now()}`;
const home = await fetchPublic(`/${cache}`);
const area = await fetchPublic(`/thong-tac-cong-cao-xanh/${cache}`);
report.publicVerification.home = summarizePublicHtml(home.status, home.text);
report.publicVerification.area = {
  ...summarizePublicHtml(area.status, area.text),
  hasServiceSchema: /"@type"\s*:\s*"Service"/u.test(area.text) || /"@type":\s*"Service"/u.test(area.text),
};

report.success =
  report.targets.every((target) => target.remoteVerify.ok) &&
  report.publicVerification.home.status === 200 &&
  report.publicVerification.home.hasNewLogoAlt &&
  !report.publicVerification.home.hasOldLogoAlt &&
  !report.publicVerification.home.hasForbiddenPattern &&
  report.publicVerification.area.status === 200 &&
  !report.publicVerification.area.hasForbiddenPattern &&
  !report.publicVerification.area.hasAggregateRating &&
  !report.publicVerification.area.hasRevMock;

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
appendFileSync(
  CSV_PATH,
  `\n${TODAY},${new Date().toTimeString().slice(0, 5)},FORBIDDEN-CLEANUP-PANEL-${TODAY},seo_fix,deploy xoa noi dung cam qua 1Panel file write,https://${WP_HOST}/,,${report.success ? "done" : "needs_review"},high,,,,,backup ${BACKUP_DIR}; write 3 files; verify home+area,tools/deploy_forbidden_cleanup_panel_write.mjs,,report ${REPORT_PATH},,,,,,`,
  "utf8",
);

console.log(JSON.stringify({
  success: report.success,
  backupDir: BACKUP_DIR,
  reportPath: REPORT_PATH,
  targets: report.targets.map((target) => ({
    name: target.name,
    ok: target.remoteVerify.ok,
    missing: target.remoteVerify.missing,
    forbidden: target.remoteVerify.forbidden,
  })),
  publicVerification: report.publicVerification,
}, null, 2));

if (!report.success) process.exitCode = 1;
