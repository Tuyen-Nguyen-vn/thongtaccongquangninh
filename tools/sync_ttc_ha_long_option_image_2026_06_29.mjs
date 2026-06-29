import https from "node:https";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE_URL = "https://thongtaccongquangninh.com";
const PAGE_ID = 296;
const PAGE_SLUG = "thong-tac-cong-ha-long";
const PAGE_PATH = `/${PAGE_SLUG}/`;
const TARGET_IMAGE = "thong-tac-cong-ha-long-kiem-tra-ho-ga.webp";
const TARGET_ALT = "Thợ kiểm tra hố ga khi thông tắc cống Hạ Long không đục phá";
const OPTION_NAMES = [
  "ttcqn_doorway_safe_page_296_content",
  "ttcqn_doorway_safe_page_296_content_v2",
];

const APPLY = process.argv.includes("--apply");
const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
const today = new Date().toISOString().slice(0, 10);
const time = new Date().toTimeString().slice(0, 5);
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-ttc-ha-long-option-image-sync-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `ttc-ha-long-option-image-sync-${ts}.json`);
const CSV_PATH = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function sha(value) {
  return crypto.createHash("sha256").update(String(value ?? "")).digest("hex").slice(0, 16);
}

function wpRequest(method, route, auth, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json${route}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "Content-Type": "application/json",
          "User-Agent": "Codex TTC Ha Long option image sync",
          ...(payload ? { "Content-Length": payload.length } : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data = text;
          try {
            data = text ? JSON.parse(text) : {};
          } catch {}
          if (res.statusCode >= 400) {
            const message = typeof data === "object" ? data.message ?? text : data;
            reject(new Error(`WP ${res.statusCode} ${route}: ${message}`));
            return;
          }
          resolve(data);
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error(`timeout ${route}`)));
    if (payload) req.write(payload);
    req.end();
  });
}

function mcpRpc(auth, sessionId, payload) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify(payload), "utf8");
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: "/wp-json/mcp/mcp-adapter-default-server",
        method: "POST",
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "User-Agent": "Codex TTC Ha Long option image sync",
          ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
          "Content-Length": body.length,
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const dataLine = raw.match(/data:\s*(\{[\s\S]*\})/);
          const jsonText = dataLine ? dataLine[1] : raw;
          let data = jsonText;
          try {
            data = jsonText ? JSON.parse(jsonText) : {};
          } catch {}
          if (res.statusCode >= 400) {
            reject(new Error(`MCP ${res.statusCode}: ${raw.slice(0, 300)}`));
            return;
          }
          resolve({ data, sessionId: res.headers["mcp-session-id"] || sessionId });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("MCP timeout")));
    req.write(body);
    req.end();
  });
}

async function initMcp(auth) {
  const response = await mcpRpc(auth, null, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "codex-ttc-ha-long-option-image-sync", version: "1.0.0" },
    },
  });
  if (!response.sessionId) throw new Error("Không lấy được Mcp-Session-Id");
  return response.sessionId;
}

async function optionGet(auth, sessionId, name, id) {
  const response = await mcpRpc(auth, sessionId, {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: { ability_name: "options/get", parameters: { name } },
    },
  });
  const text = response.data?.result?.content?.[0]?.text ?? "";
  try {
    const parsed = JSON.parse(text);
    return parsed.data?.value ?? parsed.data ?? parsed.value ?? "";
  } catch {
    return "";
  }
}

async function optionUpdate(auth, sessionId, name, value, id) {
  return mcpRpc(auth, sessionId, {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: { ability_name: "options/update", parameters: { name, value } },
    },
  });
}

function liveGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: pathname,
        method: "GET",
        headers: {
          Host: WP_HOST,
          "User-Agent": "Codex TTC Ha Long public verify",
          "Cache-Control": "no-cache",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve({ status: res.statusCode, html: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("live verify timeout")));
    req.end();
  });
}

function inspectHtml(html) {
  const value = String(html ?? "");
  const text = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const targetCount = (value.match(new RegExp(TARGET_IMAGE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
  return {
    length: value.length,
    hash: sha(value),
    imageCount: (value.match(/<img\b/gi) ?? []).length,
    h1Count: (value.match(/<h1\b/gi) ?? []).length,
    hasTargetImage: targetCount > 0,
    targetImageCount: targetCount,
    hasTargetAlt: value.includes(TARGET_ALT),
    hasTargetCaption: /Kiểm tra hố ga|đường thoát nước/i.test(text) && value.includes(TARGET_IMAGE),
    hasAuthorByline: value.includes("author/nguyensonghao") || value.includes("Nguyễn Song Hào"),
    hasHotline: /0963\.953\.533/.test(text) && /0931\.156\.756/.test(text),
    forbiddenHits: ["uy tín", "chuyên nghiệp", "hàng đầu"].filter((word) => new RegExp(word, "i").test(text)),
  };
}

function assertSourceReady(sourceInspect) {
  const errors = [];
  if (!sourceInspect.hasTargetImage) errors.push(`post_content không có ảnh ${TARGET_IMAGE}`);
  if (sourceInspect.targetImageCount !== 1) errors.push(`post_content có ${sourceInspect.targetImageCount} ảnh target, cần đúng 1`);
  if (!sourceInspect.hasTargetAlt) errors.push("post_content thiếu alt ảnh target");
  if (!sourceInspect.hasTargetCaption) errors.push("post_content thiếu caption liên quan ảnh target");
  if (!sourceInspect.hasAuthorByline) errors.push("post_content thiếu author byline");
  if (sourceInspect.h1Count > 0) errors.push(`post_content có ${sourceInspect.h1Count} H1, renderer theme sẽ tự render H1`);
  if (sourceInspect.forbiddenHits.length) errors.push(`post_content còn từ cấm: ${sourceInspect.forbiddenHits.join(", ")}`);
  return errors;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Thiếu WP_USERNAME/WP_APP_PASSWORD trong .env");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const page = await wpRequest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth);
  const pageContent = page.content?.raw ?? page.content?.rendered ?? "";
  const sessionId = await initMcp(auth);

  const optionValues = [];
  for (const [index, name] of OPTION_NAMES.entries()) {
    optionValues.push({ name, value: await optionGet(auth, sessionId, name, 10 + index) });
  }

  const before = {
    page: inspectHtml(pageContent),
    options: optionValues.map((item) => ({ name: item.name, inspect: inspectHtml(item.value) })),
  };
  const sourceErrors = assertSourceReady(before.page);
  const needsSync = optionValues.filter((item) => !inspectHtml(item.value).hasTargetImage).map((item) => item.name);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    url: `${BASE_URL}${PAGE_PATH}`,
    targetImage: TARGET_IMAGE,
    sourceErrors,
    needsSync,
    before,
    backupDir: APPLY ? BACKUP_DIR : null,
    reportPath: REPORT_PATH,
  };

  if (sourceErrors.length) {
    report.status = "blocked_source_not_ready";
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 2;
    return;
  }

  if (APPLY) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `page-${PAGE_ID}-${PAGE_SLUG}.json`), JSON.stringify(page, null, 2), "utf8");
    for (const item of optionValues) {
      writeFileSync(path.join(BACKUP_DIR, `option-${item.name}.json`), JSON.stringify({ name: item.name, value: item.value }, null, 2), "utf8");
    }
    report.updates = [];
    for (const [index, item] of optionValues.entries()) {
      const update = await optionUpdate(auth, sessionId, item.name, pageContent, 30 + index);
      const ok = !update.data?.error;
      report.updates.push({ name: item.name, status: ok ? "ok" : "error", error: update.data?.error ?? null });
    }
    const live = await liveGet(`${PAGE_PATH}?nowprocket=1&codex=ttc-ha-long-image-sync-${Date.now()}`);
    report.live = {
      status: live.status,
      inspect: inspectHtml(live.html),
      canonicalOk: live.html.includes(`${BASE_URL}${PAGE_PATH}`),
    };
    const pass =
      live.status === 200 &&
      report.live.inspect.h1Count === 1 &&
      report.live.inspect.hasTargetImage &&
      report.live.inspect.hasTargetAlt &&
      report.live.inspect.hasTargetCaption &&
      report.live.inspect.hasAuthorByline &&
      report.live.inspect.hasHotline &&
      report.live.inspect.forbiddenHits.length === 0;
    report.status = pass ? "pass" : "needs_review";
    appendFileSync(
      CSV_PATH,
      `\n${today},${time},SYNC-TTC-HA-LONG-OPTION-IMAGE-${today},seo_image,thong tac cong ha long,${BASE_URL}${PAGE_PATH},${PAGE_SLUG},${pass ? "done" : "needs_review"},low,,,,,Dong bo post_content co anh thu 3 sang 2 option renderer cua page 296 sau khi public chua hien anh,tools/sync_ttc_ha_long_option_image_2026_06_29.mjs,,Chay audit_ttc_area_pages + audit_unique_wp_images.py sau sync,Live verify status ${live.status}; targetImage=${report.live.inspect.hasTargetImage}; alt=${report.live.inspect.hasTargetAlt}; caption=${report.live.inspect.hasTargetCaption}; h1=${report.live.inspect.h1Count},${pass ? "PASS" : "CHECK"},Codex,${today},${REPORT_PATH},${BACKUP_DIR},,,`,
      "utf8",
    );
  } else {
    report.status = needsSync.length ? "dry_run_needs_apply" : "dry_run_already_synced";
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== "pass" && report.status !== "dry_run_needs_apply" && report.status !== "dry_run_already_synced") {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
