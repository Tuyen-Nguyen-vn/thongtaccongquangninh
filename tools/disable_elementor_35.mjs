import https from "node:https";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = join(PROJECT, ".env");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
let SID = null;

function mcpPost(body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: `/wp-json/mcp/mcp-adapter-default-server`, method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth,
        "Content-Type": "application/json", "Content-Length": b.length,
        ...(SID ? { "Mcp-Session-Id": SID } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => {
        if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"];
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("t")));
    r.write(b); r.end();
  });
}

function httpGet(path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path,
      headers: { Host: WP_HOST, "User-Agent": "trigger" }, rejectUnauthorized: false
    }, (res) => { let d = ""; res.on("data", c => d += c); res.on("end", () => resolve(d)); });
    req.on("error", () => resolve("")); req.end();
  });
}

const phpCode = `<?php
/**
 * Plugin Name: TTCQN Disable Elementor 35 (one-shot)
 * Description: Tat Elementor cho page 35 de render bang post_content.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;
add_action('init', function() {
    $id = 35;
    $before = [
        'edit_mode' => get_post_meta($id, '_elementor_edit_mode', true),
        'data_len'  => strlen(get_post_meta($id, '_elementor_data', true)),
        'template'  => get_page_template_slug($id),
    ];
    foreach (['_elementor_edit_mode','_elementor_data','_elementor_template_type','_elementor_version','_elementor_page_settings','_elementor_conditions','_elementor_css'] as $k) {
        delete_post_meta($id, $k);
    }
    update_post_meta($id, '_wp_page_template', 'default');
    clean_post_cache($id);
    if (function_exists('wp_cache_flush')) wp_cache_flush();
    $after = [
        'edit_mode' => get_post_meta($id, '_elementor_edit_mode', true),
        'data_len'  => strlen(get_post_meta($id, '_elementor_data', true)),
        'template'  => get_page_template_slug($id),
    ];
    file_put_contents(WP_CONTENT_DIR . '/uploads/elementor35-result.txt', "BEFORE: " . json_encode($before) . "\\nAFTER: " . json_encode($after));
});
`;

function crc32(buf){let c=0xFFFFFFFF;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);}return(c^0xFFFFFFFF)>>>0;}
function buildZip(entries){const parts=[],cds=[];let off=0;for(const[name,data]of entries){const nb=Buffer.from(name,"utf8");const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");const cr=crc32(db);const lh=Buffer.alloc(30+nb.length);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);parts.push(lh,db);const cd=Buffer.alloc(46+nb.length);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);cds.push(cd);off+=lh.length+db.length;}const cdBuf=Buffer.concat(cds);const eo=Buffer.alloc(22);eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);return Buffer.concat([...parts,cdBuf,eo]);}

async function main() {
  const zip = buildZip([["ttcqn-disable-elementor-35/ttcqn-disable-elementor-35.php", Buffer.from(phpCode, "utf8")]]);
  await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
  await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

  console.log("Uploading plugin...");
  const up = await mcpPost({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: "plugins/upload-base64", parameters: { content_base64: zip.toString("base64"), filename: "ttcqn-disable-elementor-35.zip", activate: true, overwrite: true } } } });
  console.log("Upload:", JSON.stringify(up).slice(0, 300));

  console.log("Triggering via homepage GET...");
  await httpGet("/?cb=" + Date.now());
  await new Promise(r => setTimeout(r, 1500));

  const result = await httpGet("/wp-content/uploads/elementor35-result.txt");
  console.log("\n=== RESULT ===\n" + result);

  console.log("\nDeactivating + deleting plugin...");
  await mcpPost({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: "plugins/deactivate", parameters: { plugin: "ttcqn-disable-elementor-35/ttcqn-disable-elementor-35.php" } } } });
  await mcpPost({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: "plugins/delete", parameters: { plugin: "ttcqn-disable-elementor-35/ttcqn-disable-elementor-35.php" } } } });
  console.log("Done.");
}

main().catch(console.error);
