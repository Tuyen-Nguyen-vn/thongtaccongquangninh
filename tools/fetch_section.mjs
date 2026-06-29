/**
 * Fetch content của 1 page/post, extract section cụ thể.
 * Usage: node fetch_section.mjs <type:post|page> <id> [section_keyword]
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
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
      headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}) },
      rejectUnauthorized: false,
    };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => { if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"]; try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("t"))); r.write(b); r.end();
  });
}

const [,, TYPE, ID, KEYWORD] = process.argv;
const id = parseInt(ID);
const abilityName = TYPE === "post" ? "content/get-post" : "content/get-page";

await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

const r = await mcpPost({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: abilityName, parameters: { id } } } });
const text = r?.result?.content?.[0]?.text ?? "{}";
const data = JSON.parse(text);
const html = data?.content ?? data?.data?.content ?? "";

if (KEYWORD) {
  // Find section starting with h2 containing keyword
  const re = new RegExp(`<h2[^>]*>[^<]*${KEYWORD}[^<]*</h2>([\\s\\S]*?)(?=<h2|$)`, 'i');
  const m = html.match(re);
  if (m) {
    const sectionHtml = m[0];
    const plainText = sectionHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = plainText.split(' ').filter(Boolean).length;
    console.log(`Section "${KEYWORD}" (${words} words):`);
    console.log(plainText.slice(0, 1000));
    console.log("\n--- HTML raw (first 500) ---");
    console.log(sectionHtml.slice(0, 500));
  } else {
    console.log("Section not found. H2s in page:");
    const h2s = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)].map(m => m[1]);
    h2s.forEach(h => console.log(" -", h));
  }
} else {
  // Print all H2 sections with word counts
  const parts = html.split(/<h2[^>]*>/i);
  for (let i = 1; i < parts.length; i++) {
    const end = parts[i].indexOf("</h2>");
    const heading = parts[i].slice(0, end).replace(/<[^>]+>/g, "").trim();
    const content = parts[i].slice(end + 5);
    const nextH2 = content.indexOf("<h2");
    const body = nextH2 > -1 ? content.slice(0, nextH2) : content;
    const words = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(w => w.length > 0).length;
    console.log(`[${words}w] ${heading}`);
  }
}
