/**
 * Cài plugin nhỏ override meta description public cho post 2054.
 * Dùng khi plugin ttcqn-meta-desc-fix cũ đang override Rank Math description.
 */
import https from "node:https";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const ENV_CANDIDATES = [
  `${PROJECT}/.env`,
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
];
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PLUGIN_SLUG = "ttcqn-bai-chay-meta-override";
const PLUGIN_FILE = `${PLUGIN_SLUG}/${PLUGIN_SLUG}.php`;
const DESC =
  "Thông tắc cống Bãi Cháy Hạ Long, xử lý nhanh cho nhà dân, khách sạn, nhà hàng. Báo giá trước, không đục phá. Gọi 0963.953.533.";

function parseEnv() {
  let text = "";
  for (const p of ENV_CANDIDATES) {
    try {
      text = readFileSync(p, "utf8");
      break;
    } catch {
      // Try next path.
    }
  }
  if (!text) throw new Error("Không tìm thấy .env WordPress auth");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Thiếu WP_USERNAME/WP_APP_PASSWORD");
  return env;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildZip(entries) {
  const parts = [];
  const cds = [];
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
    cds.push(cd);
    offset += local.length + dataBuf.length;
  }
  const cdBuf = Buffer.concat(cds);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(cds.length, 8);
  end.writeUInt16LE(cds.length, 10);
  end.writeUInt32LE(cdBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...parts, cdBuf, end]);
}

function phpString(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function wpRequest(method, path, auth, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path,
        method,
        headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "codex-meta-override/1.0", ...headers },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const env = parseEnv();
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const php = `<?php
/**
 * Plugin Name: TTCQN Bãi Cháy Meta Override
 * Description: Override public meta description only for post 2054 after Bãi Cháy H1/schema patch.
 * Version: 2026.06.28.1
 */
if (!defined('ABSPATH')) exit;

add_filter('rank_math/frontend/description', function(string $desc): string {
    return ((int) get_queried_object_id() === 2054) ? '${phpString(DESC)}' : $desc;
}, 300);

add_filter('rank_math/opengraph/facebook/description', function(string $desc): string {
    return ((int) get_queried_object_id() === 2054) ? '${phpString(DESC)}' : $desc;
}, 300);

add_filter('rank_math/opengraph/twitter/description', function(string $desc): string {
    return ((int) get_queried_object_id() === 2054) ? '${phpString(DESC)}' : $desc;
}, 300);
`;
  const zip = buildZip([[PLUGIN_FILE, php]]);
  const pluginDir = join(PROJECT, "tools", "wp-plugins", PLUGIN_SLUG);
  mkdirSync(pluginDir, { recursive: true });
  const phpPath = join(pluginDir, `${PLUGIN_SLUG}.php`);
  const zipPath = join(PROJECT, "tools", "wp-plugins", `${PLUGIN_SLUG}.zip`);
  writeFileSync(phpPath, php, "utf8");
  writeFileSync(zipPath, zip);

  const filename = basename(zipPath);
  const boundary = `----TTCQN${Date.now()}`;
  const slugField = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="slug"\r\n\r\n${PLUGIN_SLUG}\r\n`);
  const fileHead = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/zip\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([slugField, fileHead, zip, tail]);

  const upload = await wpRequest(
    "POST",
    "/wp-json/wp/v2/plugins",
    auth,
    { "Content-Type": `multipart/form-data; boundary=${boundary}`, "Content-Length": body.length },
    body,
  );
  let activate = null;
  if (upload.status === 201 || upload.status === 200) {
    const plugin = upload.data?.plugin || PLUGIN_FILE;
    activate = await wpRequest(
      "PUT",
      `/wp-json/wp/v2/plugins/${encodeURIComponent(plugin)}`,
      auth,
      { "Content-Type": "application/json", "Content-Length": Buffer.byteLength('{"status":"active"}') },
      '{"status":"active"}',
    );
  } else if (upload.status === 400 && JSON.stringify(upload.data).includes("already_installed")) {
    activate = await wpRequest(
      "PUT",
      `/wp-json/wp/v2/plugins/${encodeURIComponent(PLUGIN_FILE)}`,
      auth,
      { "Content-Type": "application/json", "Content-Length": Buffer.byteLength('{"status":"active"}') },
      '{"status":"active"}',
    );
  }

  const ok = (upload.status === 201 || upload.status === 200 || upload.status === 400) && activate?.status === 200;
  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 5);
  appendFileSync(
    join(PROJECT, "docs", "SEO_PROGRESS.csv"),
    `\n${today},${time},BAI-CHAY-META-OVERRIDE-${today},seo_fix,Override public meta description for post 2054,https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/,thong-tac-cong-bai-chay,${ok ? "done" : "fail"},medium,,,,,New plugin ${PLUGIN_SLUG} sets Rank Math frontend/OG descriptions for ID 2054 only,tools/deploy_bai_chay_meta_override.mjs,,Verify public meta with cache buster,,,,,,`,
    "utf8",
  );

  console.log(JSON.stringify({ ok, descLength: [...DESC].length, phpPath, zipPath, uploadStatus: upload.status, uploadData: upload.data, activateStatus: activate?.status, activateData: activate?.data }, null, 2));
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
