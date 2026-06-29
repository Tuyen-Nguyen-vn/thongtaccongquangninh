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

const phpCode = `<?php
/**
 * Plugin Name: TTCQN Read MU-Plugin (one-shot)
 * Description: Read the contents of the target MU-Plugin.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

add_action('init', function() {
    $target = WPMU_PLUGIN_DIR . '/fix-11-thong-tac-cong-ha-long-page.php';
    $logFile = WP_CONTENT_DIR . '/uploads/mu-plugin-content.txt';
    if (file_exists($target)) {
        $content = file_get_contents($target);
        file_put_contents($logFile, $content);
    } else {
        file_put_contents($logFile, "File not found: " . $target);
    }
});
`;

// Zip pack helpers
function crc32(buf){let c=0xFFFFFFFF;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);}return(c^0xFFFFFFFF)>>>0;}
function buildZip(entries){const parts=[],cds=[];let off=0;for(const[name,data]of entries){const nb=Buffer.from(name,"utf8");const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");const cr=crc32(db);const lh=Buffer.alloc(30+nb.length);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);parts.push(lh,db);const cd=Buffer.alloc(46+nb.length);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);cds.push(cd);off+=lh.length+db.length;}const cdBuf=Buffer.concat(cds);const eo=Buffer.alloc(22);eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);return Buffer.concat([...parts,cdBuf,eo]);}

async function main() {
  const zip = buildZip([["ttcqn-read-mu/ttcqn-read-mu.php", Buffer.from(phpCode, "utf8")]]);

  // Initialize
  await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
  await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

  console.log("Uploading MU-Plugin Reader...");
  const uploadR = await mcpPost({
    jsonrpc: "2.0", id: 2, method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: {
        ability_name: "plugins/upload-base64",
        parameters: {
          content_base64: zip.toString("base64"),
          filename: "ttcqn-read-mu.zip",
          activate: true,
          overwrite: true
        }
      }
    }
  });

  console.log("Upload result:", JSON.stringify(uploadR));

  // Trigger plugin by making a GET request to homepage
  console.log("Triggering MU-Plugin Reader...");
  await new Promise((resolve) => {
    const req = https.request({
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/?cache-buster=" + Date.now(),
      headers: { Host: WP_HOST, "User-Agent": "Codex MU Reader trigger" }, rejectUnauthorized: false
    }, (res) => {
      res.on("data", () => {});
      res.on("end", resolve);
    });
    req.end();
  });

  // Fetch results
  console.log("Fetching MU-Plugin content...");
  const results = await new Promise((resolve) => {
    const req = https.request({
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-content/uploads/mu-plugin-content.txt",
      headers: { Host: WP_HOST, "User-Agent": "Codex fetch content" }, rejectUnauthorized: false
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    });
    req.end();
  });

  console.log("\n=== MU-PLUGIN CONTENT ===");
  console.log(results);

  // Deactivate and delete plugin
  console.log("\nDeactivating MU-Plugin Reader...");
  await mcpPost({
    jsonrpc: "2.0", id: 3, method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: {
        ability_name: "plugins/deactivate",
        parameters: { plugin: "ttcqn-read-mu/ttcqn-read-mu.php" }
      }
    }
  });
  console.log("Deleting MU-Plugin Reader...");
  await mcpPost({
    jsonrpc: "2.0", id: 4, method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: {
        ability_name: "plugins/delete",
        parameters: { plugin: "ttcqn-read-mu/ttcqn-read-mu.php" }
      }
    }
  });
}

main().catch(console.error);
