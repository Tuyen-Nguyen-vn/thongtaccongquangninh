/**
 * Enable max-image-preview:large site-wide
 * Tạo + upload plugin TTCQN Max Image Preview lên WordPress via IP bypass
 * Quick-win CTR Discover (P1 backlog 2026-06-05)
 *
 * Usage: node tools/enable_max_image_preview.mjs
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = join(PROJECT, "docs", "SEO_PROGRESS.csv");
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);

const PLUGIN_SLUG = "ttcqn-max-image-preview";
const PLUGIN_PHP = `<?php
/*
Plugin Name: TTCQN Max Image Preview
Plugin URI: https://thongtaccongquangninh.com
Description: Them max-image-preview:large site-wide de tang CTR tren Google Discover (P1 backlog ${TODAY}).
Version: ${TODAY.replace(/-/g, ".")}.1
Author: Nguyen Song Hao
*/

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Add max-image-preview:large to all public pages.
 * Lets Google display large images in Discover & search snippets.
 * Runs at priority 20 (after Rank Math priority ~10).
 */
add_filter( 'wp_robots', 'ttcqn_max_image_preview_filter', 20 );
function ttcqn_max_image_preview_filter( $robots ) {
    if ( is_admin() ) return $robots;
    $robots['max-image-preview'] = 'large';
    return $robots;
}
`;

/* ── helpers ── */

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

// CRC-32 lookup table
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Build a minimal ZIP with one file */
function buildZip(innerPath, content) {
  const fileData = Buffer.from(content, "utf8");
  const compressed = zlib.deflateRawSync(fileData, { level: 6 });
  const crc = crc32(fileData);
  const nameBuf = Buffer.from(innerPath, "utf8");

  const now = new Date();
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);

  // Local file header (30 + name)
  const lh = Buffer.alloc(30 + nameBuf.length);
  lh.writeUInt32LE(0x04034b50, 0); // signature
  lh.writeUInt16LE(20, 4);         // version needed
  lh.writeUInt16LE(0, 6);          // flags
  lh.writeUInt16LE(8, 8);          // DEFLATE
  lh.writeUInt16LE(dosTime, 10);
  lh.writeUInt16LE(dosDate, 12);
  lh.writeUInt32LE(crc, 14);
  lh.writeUInt32LE(compressed.length, 18);
  lh.writeUInt32LE(fileData.length, 22);
  lh.writeUInt16LE(nameBuf.length, 26);
  lh.writeUInt16LE(0, 28);         // extra length
  nameBuf.copy(lh, 30);

  const cdOffset = lh.length + compressed.length;

  // Central directory header (46 + name)
  const cd = Buffer.alloc(46 + nameBuf.length);
  cd.writeUInt32LE(0x02014b50, 0);
  cd.writeUInt16LE(20, 4);
  cd.writeUInt16LE(20, 6);
  cd.writeUInt16LE(0, 8);
  cd.writeUInt16LE(8, 10);
  cd.writeUInt16LE(dosTime, 12);
  cd.writeUInt16LE(dosDate, 14);
  cd.writeUInt32LE(crc, 16);
  cd.writeUInt32LE(compressed.length, 20);
  cd.writeUInt32LE(fileData.length, 24);
  cd.writeUInt16LE(nameBuf.length, 28);
  cd.writeUInt16LE(0, 30); // extra
  cd.writeUInt16LE(0, 32); // comment
  cd.writeUInt16LE(0, 34); // disk start
  cd.writeUInt16LE(0, 36); // internal attr
  cd.writeUInt32LE(0, 38); // external attr
  cd.writeUInt32LE(0, 42); // local header offset
  nameBuf.copy(cd, 46);

  // End-of-central-directory (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([lh, compressed, cd, eocd]);
}

function httpsRaw(method, path, auth, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path,
      method,
      headers: { Host: WP_HOST, Authorization: auth, ...extraHeaders },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
        resolve({ status: res.statusCode, data, text });
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout " + path)));
    if (body) req.write(body);
    req.end();
  });
}

/* ── main ── */

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

  // Verify auth
  const me = await httpsRaw("GET", "/wp-json/wp/v2/users/me", auth, null);
  if (me.status >= 400) throw new Error("Auth failed: " + me.status);
  console.log(`Auth OK: ${me.data.name} — ${WP_HOST} via ${SERVER_IP}`);

  // Check if plugin already exists/active
  console.log("\nChecking existing plugins...");
  const listResp = await httpsRaw("GET", "/wp-json/wp/v2/plugins?per_page=100", auth, null);
  if (listResp.status === 200 && Array.isArray(listResp.data)) {
    const existing = listResp.data.find((p) => p.plugin && p.plugin.startsWith(PLUGIN_SLUG + "/"));
    if (existing) {
      console.log(`Plugin already installed: ${existing.plugin} status=${existing.status}`);
      if (existing.status === "active") {
        console.log("Already active — nothing to do.");
        return;
      }
      // Activate existing
      console.log("Activating existing plugin...");
      const act = await httpsRaw(
        "PUT",
        `/wp-json/wp/v2/plugins/${encodeURIComponent(existing.plugin)}`,
        auth,
        Buffer.from(JSON.stringify({ status: "active" }), "utf8"),
        { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(JSON.stringify({ status: "active" })) }
      );
      console.log(`Activate: ${act.status} — ${act.data?.status ?? act.text?.slice(0, 80)}`);
      return;
    }
  }

  // Build ZIP
  const innerPath = `${PLUGIN_SLUG}/${PLUGIN_SLUG}.php`;
  const zipBuf = buildZip(innerPath, PLUGIN_PHP);
  console.log(`\nZIP: ${zipBuf.length} bytes`);

  // Multipart form upload (WP REST requires: slug + pluginzip)
  const boundary = "----FormBoundary" + crypto.randomBytes(8).toString("hex");
  const slugPart = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="slug"\r\n\r\n${PLUGIN_SLUG}\r\n`
  );
  const partHeader = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="pluginzip"; filename="${PLUGIN_SLUG}.zip"\r\nContent-Type: application/zip\r\n\r\n`
  );
  const partFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
  const formBody = Buffer.concat([slugPart, partHeader, zipBuf, partFooter]);

  console.log("Uploading plugin...");
  const upload = await httpsRaw("POST", "/wp-json/wp/v2/plugins", auth, formBody, {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Content-Length": formBody.length,
  });

  console.log(`Upload status: ${upload.status}`);
  if (upload.status >= 400) {
    console.error("Upload failed:", JSON.stringify(upload.data, null, 2));
    process.exit(1);
  }

  const pluginFile = upload.data?.plugin;
  const pluginStatus = upload.data?.status;
  console.log(`Uploaded: plugin=${pluginFile} status=${pluginStatus}`);

  // Activate if not already active
  if (pluginFile && pluginStatus !== "active") {
    console.log("Activating...");
    const act = await httpsRaw(
      "PUT",
      `/wp-json/wp/v2/plugins/${encodeURIComponent(pluginFile)}`,
      auth,
      Buffer.from(JSON.stringify({ status: "active" }), "utf8"),
      { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(JSON.stringify({ status: "active" })) }
    );
    console.log(`Activate: ${act.status} — name=${act.data?.name} status=${act.data?.status}`);
    if (act.status >= 400) {
      console.error("Activate failed:", JSON.stringify(act.data, null, 2));
      process.exit(1);
    }
  }

  console.log("\n✓ TTCQN Max Image Preview plugin ACTIVE");
  console.log("  max-image-preview:large sẽ xuất hiện trong <meta name=robots> trên toàn site.");

  // Log to CSV
  const csvRow =
    `\n${TODAY},${TIME},MAX-IMAGE-PREVIEW-LARGE-${TODAY},seo_fix,max-image-preview:large site-wide,` +
    `https://${WP_HOST}/,ttcqn-max-image-preview plugin,active,easy,,,,,` +
    `Upload + activate plugin TTCQN Max Image Preview via WP REST API IP bypass,` +
    `tools/enable_max_image_preview.mjs,,` +
    `Verify robots meta tren /thong-tac-cong-quang-ninh/ va / co max-image-preview:large,,,,,,`;
  appendFileSync(CSV_PATH, csvRow, "utf8");
  console.log("Logged to docs/SEO_PROGRESS.csv");
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
