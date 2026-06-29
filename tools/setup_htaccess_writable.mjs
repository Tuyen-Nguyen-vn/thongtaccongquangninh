import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = join(PROJECT, ".env");
const SLUG = "ttcqn-htaccess-setup";
const PLUGIN_DIR = join(PROJECT, "tools", "wp-plugins", SLUG);
const PLUGIN_FILE = join(PLUGIN_DIR, `${SLUG}.php`);
const ZIP_FILE = join(PROJECT, "tools", "wp-plugins", `${SLUG}.zip`);

function readEnv() {
  const env = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
  }
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(filename, content) {
  const nameBuf = Buffer.from(filename, "utf8");
  const contentBuf = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  const crc = crc32(contentBuf);

  const localHeader = Buffer.alloc(30 + nameBuf.length);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(0, 8);
  localHeader.writeUInt16LE(0, 10);
  localHeader.writeUInt16LE(0, 12);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(contentBuf.length, 18);
  localHeader.writeUInt32LE(contentBuf.length, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28);
  nameBuf.copy(localHeader, 30);

  const central = Buffer.alloc(46 + nameBuf.length);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(0, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(contentBuf.length, 20);
  central.writeUInt32LE(contentBuf.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38);
  central.writeUInt32LE(0, 42);
  nameBuf.copy(central, 46);

  const centralStart = localHeader.length + contentBuf.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(central.length, 12);
  eocd.writeUInt32LE(centralStart, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localHeader, contentBuf, central, eocd]);
}

function pluginSource() {
  return `<?php
/**
 * Plugin Name: TTCQN HTAccess Setup
 * Description: One-shot backup and chmod 0644 for .htaccess so Rank Math can save settings.
 * Version: 2026.06.17.1
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

function ttcqn_htaccess_setup_run(): void {
    $path = ABSPATH . '.htaccess';
    $result = [
        'ran_at' => current_time('mysql'),
        'path' => $path,
        'exists' => file_exists($path),
        'before_perm' => file_exists($path) ? substr(sprintf('%o', fileperms($path)), -4) : null,
        'before_writable' => file_exists($path) ? is_writable($path) : null,
        'backup' => null,
        'backup_ok' => false,
        'chmod_attempted' => false,
        'chmod_ok' => false,
        'after_perm' => null,
        'after_writable' => null,
        'has_ttcqn_www_redirect' => false,
        'has_wordpress_block' => false,
        'errors' => [],
    ];

    if (!$result['exists']) {
        $created = @file_put_contents($path, '', LOCK_EX);
        $result['created_empty'] = $created !== false;
        $result['exists'] = file_exists($path);
    }

    if ($result['exists']) {
        $content = @file_get_contents($path);
        if ($content === false) {
            $result['errors'][] = 'file_get_contents_failed';
        } else {
            $result['has_ttcqn_www_redirect'] = strpos($content, 'TTCQN-WWW-Redirect') !== false;
            $result['has_wordpress_block'] = strpos($content, '# BEGIN WordPress') !== false;
            $backup = ABSPATH . '.htaccess.ttcqn-setup.bak-' . gmdate('YmdHis');
            $result['backup'] = basename($backup);
            $result['backup_ok'] = @copy($path, $backup);
            if (!$result['backup_ok']) {
                $result['errors'][] = 'backup_copy_failed';
            }
        }

        clearstatcache(true, $path);
        $result['chmod_attempted'] = true;
        $result['chmod_ok'] = @chmod($path, 0644);
        clearstatcache(true, $path);
        $result['after_perm'] = substr(sprintf('%o', fileperms($path)), -4);
        $result['after_writable'] = is_writable($path);
    }

    update_option('ttcqn_htaccess_setup_result', wp_json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), false);
}

register_activation_hook(__FILE__, 'ttcqn_htaccess_setup_run');

add_action('admin_init', function (): void {
    if (get_option('ttcqn_htaccess_setup_deactivated')) {
        return;
    }
    update_option('ttcqn_htaccess_setup_deactivated', 1, false);
    if (function_exists('deactivate_plugins')) {
        deactivate_plugins(plugin_basename(__FILE__));
    }
}, 100);
`;
}

const env = readEnv();
const base = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const endpoint = `${base}/wp-json/mcp/wp-mcp-ultimate`;
const wpHost = new URL(base).hostname;
const serverIp = "103.57.220.210";

mkdirSync(PLUGIN_DIR, { recursive: true });
writeFileSync(PLUGIN_FILE, pluginSource(), "utf8");
const zip = buildZip(`${SLUG}/${SLUG}.php`, readFileSync(PLUGIN_FILE));
writeFileSync(ZIP_FILE, zip);

let sessionId = null;
async function rpc(method, params, id) {
  const body = Buffer.from(JSON.stringify({ jsonrpc: "2.0", id, method, params }), "utf8");
  const response = await new Promise((resolve, reject) => {
    const headers = {
      Host: wpHost,
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Content-Length": body.length,
    };
    if (sessionId) headers["Mcp-Session-Id"] = sessionId;

    const request = https.request({
      hostname: serverIp,
      port: 443,
      servername: wpHost,
      path: "/wp-json/mcp/wp-mcp-ultimate",
      method: "POST",
      headers,
      rejectUnauthorized: false,
    }, (res) => {
      let text = "";
      res.on("data", (chunk) => { text += chunk; });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: { get: (name) => res.headers[name.toLowerCase()] ?? null },
          text: async () => text,
        });
      });
    });
    request.on("error", reject);
    request.setTimeout(60000, () => request.destroy(new Error("timeout")));
    request.write(body);
    request.end();
  });
  if (!sessionId) sessionId = response.headers.get("mcp-session-id");
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text };
  }
  return { status: response.status, payload };
}

async function ability(name, parameters, id) {
  return rpc("tools/call", {
    name: "wp-mcp-ultimate-execute-ability",
    arguments: { ability_name: name, parameters },
  }, id);
}

function contentText(response) {
  return response.payload?.result?.content?.map((item) => item.text ?? "").join("\n") ?? JSON.stringify(response.payload);
}

console.log(`Local plugin: ${PLUGIN_FILE}`);
console.log(`Local zip: ${ZIP_FILE}`);

const init = await rpc("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "ttcqn-htaccess-setup", version: "1.0" },
}, 1);
console.log("initialize:", init.status, "session:", sessionId);
if (init.status !== 200 || !sessionId) {
  console.error(JSON.stringify(init.payload, null, 2));
  process.exit(1);
}

const upload = await ability("plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: `${SLUG}.zip`,
  activate: true,
  overwrite: true,
}, 2);
console.log("upload:", upload.status, contentText(upload).slice(0, 1000));
if (upload.status !== 200 || upload.payload?.error) {
  process.exit(1);
}

const option = await ability("options/get", { name: "ttcqn_htaccess_setup_result" }, 3);
console.log("setup_result:", contentText(option));

const plugins = await ability("plugins/list", { status: "active" }, 4);
const activeText = contentText(plugins);
console.log("active_contains_setup_plugin:", activeText.toLowerCase().includes(SLUG));
