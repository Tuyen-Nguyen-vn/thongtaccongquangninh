/**
 * Upload ttcqn-www-redirect plugin via WP MCP
 * Tạo ZIP inline từ PHP file + upload + activate
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createGzip } from "node:zlib";

// ── Credentials ──────────────────────────────────────────────
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
function readEnv() {
  const env = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}
const env = readEnv();
const BASE = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const ENDPOINT = `${BASE}/wp-json/mcp/wp-mcp-ultimate`;
const SLUG = "ttcqn-www-redirect";

// ── Build ZIP in memory (pure Node.js, no deps) ─────────────
// Minimal ZIP: one file entry with DEFLATE or STORE
function buildZip(filename, content) {
  // Use STORE (no compression) for simplicity — valid ZIP
  const fileNameBuf = Buffer.from(filename, "utf8");
  const contentBuf = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");

  // Local file header
  const localHeader = Buffer.alloc(30 + fileNameBuf.length);
  localHeader.writeUInt32LE(0x04034b50, 0);  // signature
  localHeader.writeUInt16LE(20, 4);           // version needed
  localHeader.writeUInt16LE(0, 6);            // flags
  localHeader.writeUInt16LE(0, 8);            // STORE
  localHeader.writeUInt16LE(0, 10);           // mod time
  localHeader.writeUInt16LE(0, 12);           // mod date
  // CRC32
  const crc = crc32(contentBuf);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(contentBuf.length, 18); // compressed size
  localHeader.writeUInt32LE(contentBuf.length, 22); // uncompressed size
  localHeader.writeUInt16LE(fileNameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28);           // extra field length
  fileNameBuf.copy(localHeader, 30);

  const localOffset = 0;

  // Central directory
  const central = Buffer.alloc(46 + fileNameBuf.length);
  central.writeUInt32LE(0x02014b50, 0);  // signature
  central.writeUInt16LE(20, 4);          // version made by
  central.writeUInt16LE(20, 6);          // version needed
  central.writeUInt16LE(0, 8);           // flags
  central.writeUInt16LE(0, 10);          // STORE
  central.writeUInt16LE(0, 12);          // mod time
  central.writeUInt16LE(0, 14);          // mod date
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(contentBuf.length, 20);
  central.writeUInt32LE(contentBuf.length, 24);
  central.writeUInt16LE(fileNameBuf.length, 28);
  central.writeUInt16LE(0, 30);          // extra length
  central.writeUInt16LE(0, 32);          // comment length
  central.writeUInt16LE(0, 34);          // disk start
  central.writeUInt16LE(0, 36);          // int attrs
  central.writeUInt32LE(0, 38);          // ext attrs
  central.writeUInt32LE(localOffset, 42);
  fileNameBuf.copy(central, 46);

  const centralStart = localHeader.length + contentBuf.length;
  const centralSize = central.length;

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);              // disk
  eocd.writeUInt16LE(0, 6);             // disk start
  eocd.writeUInt16LE(1, 8);             // entries on disk
  eocd.writeUInt16LE(1, 10);            // total entries
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralStart, 16);
  eocd.writeUInt16LE(0, 20);            // comment length

  return Buffer.concat([localHeader, contentBuf, central, eocd]);
}

// CRC32 lookup table
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ── PHP plugin content ───────────────────────────────────────
const PHP_FILE = "D:\\.thongtaccongquangninh\\tools\\wp-plugins\\ttcqn-www-redirect\\ttcqn-www-redirect.php";
if (!existsSync(PHP_FILE)) throw new Error(`Missing: ${PHP_FILE}`);
const phpContent = readFileSync(PHP_FILE);

// Build ZIP with correct folder structure
const zipBuf = buildZip(`${SLUG}/${SLUG}.php`, phpContent);
const zipBase64 = zipBuf.toString("base64");
console.log(`ZIP size: ${zipBuf.length} bytes, base64: ${zipBase64.length} chars`);

// Save ZIP for inspection
writeFileSync(`D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`, zipBuf);
console.log("ZIP saved.");

// ── WP MCP ──────────────────────────────────────────────────
async function rpc(method, params, sessionId, id = 1) {
  const headers = {
    Authorization: AUTH,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await res.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
  return { status: res.status, sid: res.headers.get("mcp-session-id"), payload };
}

// 1. Initialize fresh session
const init = await rpc("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "www-redirect-upload", version: "1.0" },
}, null, 1);
console.log("Init status:", init.status, "SID:", init.sid);
if (init.status !== 200 || !init.sid) {
  console.error("Initialize failed:", JSON.stringify(init.payload));
  process.exit(1);
}
const SID = init.sid;

// 2. Upload + activate
const upload = await rpc("tools/call", {
  name: "wp-mcp-ultimate-execute-ability",
  arguments: {
    ability_name: "plugins/upload-base64",
    parameters: {
      content_base64: zipBase64,
      filename: `${SLUG}.zip`,
      activate: true,
      overwrite: true,
    },
  },
}, SID, 2);
const uploadText = upload.payload?.result?.content?.[0]?.text || JSON.stringify(upload.payload);
console.log("Upload status:", upload.status);
console.log("Upload result:", uploadText.slice(0, 600));

// 3. Verify active
const plugins = await rpc("tools/call", {
  name: "wp-mcp-ultimate-execute-ability",
  arguments: {
    ability_name: "plugins/list",
    parameters: { status: "active" },
  },
}, SID, 3);
const activeList = plugins.payload?.result?.content?.[0]?.text || "";
const isActive = activeList.toLowerCase().includes(SLUG);
console.log("Plugin active:", isActive);

// 4. Check activation option (confirms hook ran + .htaccess was written)
const opt = await rpc("tools/call", {
  name: "wp-mcp-ultimate-execute-ability",
  arguments: {
    ability_name: "options/get",
    parameters: { name: "ttcqn_www_redirect_done" },
  },
}, SID, 4);
const optVal = opt.payload?.result?.content?.[0]?.text || JSON.stringify(opt.payload);
console.log("Activation option (ttcqn_www_redirect_done):", optVal);

console.log("\n=== SUMMARY ===");
console.log("uploadSuccess:", upload.status === 200 && !upload.payload?.error);
console.log("activeConfirmed:", isActive);
console.log("htaccessWritten:", optVal.includes("2026"));
