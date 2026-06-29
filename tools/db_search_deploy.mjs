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
 * Plugin Name: TTCQN DB Search (one-shot)
 * Description: Search database for specific keyword and output to uploads.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

add_action('init', function() {
    global $wpdb;
    $keyword = '%Gọi Là Có Thợ%';
    $results = [];

    // Search posts
    $posts = $wpdb->get_results($wpdb->prepare(
        "SELECT ID, post_title, post_name, post_type FROM {$wpdb->posts} WHERE post_title LIKE %s OR post_content LIKE %s LIMIT 50",
        $keyword, $keyword
    ));
    if ($posts) {
        foreach ($posts as $p) {
            $results[] = "POST: ID={$p->ID}, title='{$p->post_title}', name='{$p->post_name}', type='{$p->post_type}'";
        }
    }

    // Search postmeta
    $postmeta = $wpdb->get_results($wpdb->prepare(
        "SELECT post_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE meta_value LIKE %s LIMIT 50",
        $keyword
    ));
    if ($postmeta) {
        foreach ($postmeta as $pm) {
            $val = substr($pm->meta_value, 0, 100);
            $results[] = "POSTMETA: post_id={$pm->post_id}, key='{$pm->meta_key}', value='{$val}...'";
        }
    }

    // Search options
    $options = $wpdb->get_results($wpdb->prepare(
        "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_value LIKE %s LIMIT 50",
        $keyword
    ));
    if ($options) {
        foreach ($options as $o) {
            $val = substr($o->option_value, 0, 100);
            $results[] = "OPTION: name='{$o->option_name}', value='{$val}...'";
        }
    }

    $logFile = WP_CONTENT_DIR . '/uploads/db-search-result.txt';
    if (!empty($results)) {
        file_put_contents($logFile, implode("\\n", $results));
    } else {
        file_put_contents($logFile, "No database matches found for keyword.");
    }
});
`;

// Zip pack helpers
function crc32(buf){let c=0xFFFFFFFF;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);}return(c^0xFFFFFFFF)>>>0;}
function buildZip(entries){const parts=[],cds=[];let off=0;for(const[name,data]of entries){const nb=Buffer.from(name,"utf8");const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");const cr=crc32(db);const lh=Buffer.alloc(30+nb.length);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);parts.push(lh,db);const cd=Buffer.alloc(46+nb.length);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);cds.push(cd);off+=lh.length+db.length;}const cdBuf=Buffer.concat(cds);const eo=Buffer.alloc(22);eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);return Buffer.concat([...parts,cdBuf,eo]);}

async function main() {
  const zip = buildZip([["ttcqn-db-search/ttcqn-db-search.php", Buffer.from(phpCode, "utf8")]]);

  // Initialize
  await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
  await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

  console.log("Uploading DB Search plugin...");
  const uploadR = await mcpPost({
    jsonrpc: "2.0", id: 2, method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: {
        ability_name: "plugins/upload-base64",
        parameters: {
          content_base64: zip.toString("base64"),
          filename: "ttcqn-db-search.zip",
          activate: true,
          overwrite: true
        }
      }
    }
  });

  console.log("Upload result:", JSON.stringify(uploadR));

  // Trigger plugin by making a GET request to homepage
  console.log("Triggering plugin via HTTP GET to homepage...");
  await new Promise((resolve) => {
    const req = https.request({
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/?cache-buster=" + Date.now(),
      headers: { Host: WP_HOST, "User-Agent": "Codex DB search trigger" }, rejectUnauthorized: false
    }, (res) => {
      res.on("data", () => {});
      res.on("end", resolve);
    });
    req.end();
  });

  // Fetch results
  console.log("Fetching search results...");
  const results = await new Promise((resolve) => {
    const req = https.request({
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-content/uploads/db-search-result.txt",
      headers: { Host: WP_HOST, "User-Agent": "Codex fetch results" }, rejectUnauthorized: false
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    });
    req.end();
  });

  console.log("\n=== DB SEARCH RESULTS ===");
  console.log(results);

  // Deactivate and delete plugin
  console.log("\nDeactivating DB Search plugin...");
  await mcpPost({
    jsonrpc: "2.0", id: 3, method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: {
        ability_name: "plugins/deactivate",
        parameters: { plugin: "ttcqn-db-search/ttcqn-db-search.php" }
      }
    }
  });
  console.log("Deleting DB Search plugin...");
  await mcpPost({
    jsonrpc: "2.0", id: 4, method: "tools/call",
    params: {
      name: "mcp-adapter-execute-ability",
      arguments: {
        ability_name: "plugins/delete",
        parameters: { plugin: "ttcqn-db-search/ttcqn-db-search.php" }
      }
    }
  });
}

main().catch(console.error);
