/**
 * Deploy the current ttcqn-meta-desc-fix plugin source without regenerating it.
 *
 * Usage:
 *   node tools/deploy_meta_desc_fix_plugin_current.mjs --build-only
 *   node tools/deploy_meta_desc_fix_plugin_current.mjs --write
 */
import https from "node:https";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const BUILD_ONLY = process.argv.includes("--build-only");
const WRITE = process.argv.includes("--write");
const HOST = "thongtaccongquangninh.com";
const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const MCP_TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const PLUGIN_SLUG = "ttcqn-meta-desc-fix";
const PLUGIN_FILE = path.join(PROJECT, "tools/wp-plugins", PLUGIN_SLUG, `${PLUGIN_SLUG}.php`);
const PLUGIN_REMOTE = `/public_html/wp-content/plugins/${PLUGIN_SLUG}/${PLUGIN_SLUG}.php`;
const ZIP_PATH = path.join(PROJECT, "tools/wp-plugins", `${PLUGIN_SLUG}.zip`);
const CSV_PATH = path.join(PROJECT, "docs/SEO_PROGRESS.csv");
let sessionId = null;
let messageId = 1;

function timeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return parts;
}

function stamp(date = new Date()) {
  const parts = timeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}+07-00`;
}

function normalizeText(text) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
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

function mcpPost(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: "2.0", id: messageId++, method, params: params ?? {} });
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
            resolve({ status: res.statusCode, json: JSON.parse(text), raw: text });
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

function resultOf(response) {
  return response.json?.result ?? response.events?.find((event) => event.result !== undefined)?.result;
}

function hostText(response) {
  const result = resultOf(response);
  if (!result) return JSON.stringify(response).slice(0, 2000);
  if (result.isError) {
    throw new Error(Array.isArray(result.content) ? result.content.map((item) => item.text || "").join("") : JSON.stringify(result));
  }
  if (Array.isArray(result.content)) return result.content.map((item) => item.text || "").join("");
  return JSON.stringify(result);
}

async function hostTool(tool, args) {
  const response = await mcpPost("tools/call", { name: tool, arguments: args });
  if (response.status !== 200) {
    throw new Error(`${tool} failed HTTP ${response.status}: ${JSON.stringify(response).slice(0, 1000)}`);
  }
  return hostText(response);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i += 1) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildZip(entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const dataBuf = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const crc = crc32(dataBuf);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dataBuf.length, 18);
    local.writeUInt32LE(dataBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    parts.push(local, dataBuf);

    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(dataBuf.length, 20);
    cd.writeUInt32LE(dataBuf.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nameBuf.copy(cd, 46);
    central.push(cd);
    offset += local.length + dataBuf.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(central.length, 8);
  end.writeUInt16LE(central.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...parts, centralBuf, end]);
}

function parsePayload(text) {
  try {
    return JSON.parse(text);
  } catch {}
  const dataLine = String(text).split(/\r?\n/).find((line) => line.startsWith("data:"));
  if (dataLine) {
    try {
      return JSON.parse(dataLine.slice(5).trim());
    } catch {}
  }
  return { raw: text };
}

function mcpRequest(auth, body, sessionId = null) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "Codex TTCQN meta desc deploy",
    ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
  };
  return fetch(`https://${WP_HOST}/wp-json/mcp/wp-mcp-ultimate`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }).then(async (response) => {
    const raw = await response.text();
    return {
      status: response.status,
      headers: { "mcp-session-id": response.headers.get("mcp-session-id") },
      data: parsePayload(raw),
      raw,
    };
  });
}

async function main() {
  const php = readFileSync(PLUGIN_FILE, "utf8");
  const zip = buildZip([[`${PLUGIN_SLUG}/${PLUGIN_SLUG}.php`, php]]);
  mkdirSync(path.dirname(ZIP_PATH), { recursive: true });
  writeFileSync(ZIP_PATH, zip);

  const result = { zipPath: ZIP_PATH, zipBytes: zip.length, mode: BUILD_ONLY ? "build-only" : WRITE ? "write" : "dry-run" };
  if (BUILD_ONLY || !WRITE) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const now = new Date();
  const runStamp = stamp(now);
  const backupDir = path.join(PROJECT, "backups", `fix-meta-numeric-punct-${runStamp}`);
  const reportPath = path.join(PROJECT, "reports", `fix-meta-numeric-punct-${runStamp}.json`);
  mkdirSync(backupDir, { recursive: true });
  mkdirSync(path.dirname(reportPath), { recursive: true });

  await mcpPost("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "codex-meta-desc-numeric-punct-deploy", version: "1.0" },
  });
  await mcpPost("notifications/initialized", {});

  const remoteBefore = await hostTool("read_file", { path: PLUGIN_REMOTE });
  const backupPath = path.join(backupDir, `${PLUGIN_SLUG}.remote.php`);
  writeFileSync(backupPath, remoteBefore, "utf8");

  const writeText = await hostTool("write_file", { path: PLUGIN_REMOTE, content: php });
  const remoteAfter = await hostTool("read_file", { path: PLUGIN_REMOTE });
  const remoteMatches = normalizeText(remoteAfter) === normalizeText(php);
  if (!remoteMatches) throw new Error("Remote plugin does not match local plugin after write_file");

  const purge = { ok: true, text: "" };
  try {
    purge.text = await hostTool("purge_wordpress_cache", { domain: HOST });
  } catch (error) {
    purge.ok = false;
    purge.warning = String(error?.message || error);
  }

  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: now.toISOString(),
        plugin: { local: PLUGIN_FILE, remote: PLUGIN_REMOTE, backupPath, writeText, remoteMatches },
        zip: { path: ZIP_PATH, bytes: zip.length },
        purge,
        success: true,
      },
      null,
      2,
    ),
    "utf8",
  );

  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 5);
  appendFileSync(
    CSV_PATH,
    `\n${today},${time},FIX-META-NUMERIC-PUNCT-${today},seo_fix,ttcqn-meta-desc-fix,https://thongtaccongquangninh.com/gia-thong-tac-cong-quang-ninh/,post-2787,done,low,,,,,prevent spaces inside phone/time punctuation in meta description,tools/wp-plugins/${PLUGIN_SLUG}/${PLUGIN_SLUG}.php;tools/${path.basename(import.meta.url)},,Verify public meta description and GSC followup,plugin=${PLUGIN_SLUG},NOT_REQUIRED,,,,,`,
    "utf8",
  );
  console.log(JSON.stringify({ ...result, deployed: true, reportPath, backupPath, remoteMatches, purge }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
