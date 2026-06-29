import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const PAGE_ID = 62;

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

function ability(name, params) {
  return mcpPost({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: name, parameters: params } } });
}

// Init
await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

// Lấy Rank Math meta
const rmR = await ability("rank-math/get-post-seo-meta", { post_id: PAGE_ID });
const rmText = rmR?.result?.content?.[0]?.text ?? JSON.stringify(rmR);
console.log("RM meta raw:", rmText.slice(0, 600));

let rmData = {};
try { rmData = JSON.parse(rmText); } catch {}

const currentDesc = rmData?.meta_description ?? rmData?.description ?? "";
console.log(`\nMeta desc (${currentDesc.length} chars): "${currentDesc}"`);

if (currentDesc.length <= 160) {
  console.log("✓ Đã <= 160 chars, không cần fix");
  process.exit(0);
}

// Trim xuống <= 158 chars, kết thúc ở từ hoàn chỉnh
let newDesc = currentDesc.slice(0, 158);
const lastSpace = newDesc.lastIndexOf(" ");
if (lastSpace > 120) newDesc = newDesc.slice(0, lastSpace);
// Thêm dấu chấm nếu chưa có
if (!newDesc.endsWith(".") && !newDesc.endsWith("!")) newDesc = newDesc.trimEnd() + ".";

console.log(`New desc (${newDesc.length} chars): "${newDesc}"`);

// Update Rank Math meta qua WP REST API
function wpPost(path, bodyObj) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(bodyObj), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path,
      method: "POST",
      headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": b.length },
      rejectUnauthorized: false,
    };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => { try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: resp.statusCode, d }); } });
    });
    r.on("error", reject); r.setTimeout(20000, () => r.destroy(new Error("t")));
    r.write(b); r.end();
  });
}

// Update Rank Math description via WP REST API meta field
const updateR = await wpPost(`/wp-json/wp/v2/pages/${PAGE_ID}`, {
  meta: { rank_math_description: newDesc }
});
console.log("\nUpdate status:", updateR.s);
const updatedMeta = updateR.d?.meta?.rank_math_description ?? "(not in response)";
console.log("Updated rank_math_description:", updatedMeta?.slice?.(0, 200) ?? updatedMeta);

// Verify live
await new Promise(r => setTimeout(r, 2000));
await new Promise((res, rej) => {
  const opts = {
    hostname: SERVER_IP, port: 443, servername: WP_HOST,
    path: "/gioi-thieu/", method: "GET",
    headers: { Host: WP_HOST, "User-Agent": "metacheck/1" },
    rejectUnauthorized: false,
  };
  const r = https.request(opts, resp => {
    let d = ""; resp.on("data", c => d += c);
    resp.on("end", () => {
      const metaMatch = d.match(/<meta name="description" content="([^"]+)"/);
      const liveDesc = metaMatch?.[1] ?? "(not found)";
      console.log(`\nLive meta desc (${liveDesc.length} chars): "${liveDesc}"`);
      res();
    });
  });
  r.on("error", rej); r.setTimeout(15000, () => r.destroy(new Error("t"))); r.end();
});

// CSV log
const success = updateR.s === 200;
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync(CSV_PATH,
  `\n${TODAY},${TIME},FIX-META-LONG-GIOI-THIEU-${TODAY},on_page_seo,Cat meta description /gioi-thieu/ tu ${currentDesc.length} xuong ${newDesc.length} ky tu; rank_math_description update,https://thongtaccongquangninh.com/gioi-thieu/,,${success ? "done" : "fail"},medium,,,,,META_LONG(167) → fix xuong ${newDesc.length} chars,wp-json/wp/v2/pages/62,,Verify live meta desc; re-audit neu can,,,,,,`,
  "utf8"
);
console.log(`\n${success ? "✓" : "✗"} Done. CSV logged.`);
