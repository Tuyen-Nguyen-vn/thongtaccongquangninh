/**
 * Phân tích cấu trúc các trang WORD_TOO_LONG để xác định phần có thể trim.
 * Fetch content qua MCP adapter, đếm từng section.
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
  return mcpPost({ jsonrpc: "2.0", id: Date.now(), method: "tools/call",
    params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: name, parameters: params } } });
}

function countWords(html) {
  return (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(w => w.length > 0).length;
}

function extractH2Sections(html) {
  const sections = [];
  const parts = html.split(/<h2[^>]*>/i);
  for (let i = 1; i < parts.length; i++) {
    const end = parts[i].indexOf("</h2>");
    const heading = parts[i].slice(0, end).replace(/<[^>]+>/g, "").trim();
    const content = parts[i].slice(end + 5);
    const nextH2 = content.indexOf("<h2");
    const body = nextH2 > -1 ? content.slice(0, nextH2) : content;
    sections.push({ heading, words: countWords(body) });
  }
  return sections;
}

// Init MCP
await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

const PAGES = [
  { id: 2554, slug: "xe-hut-be-phot-quang-ninh", type: "post", words: 3845 },
  { id: 384,  slug: "thong-tac-cong-ngo-nho-ha-long", type: "page", words: 3555 },
  { id: 2417, slug: "thong-tac-bon-cau-khach-san-quang-ninh", type: "post", words: 3553 },
  { id: 2449, slug: "gia-hut-be-phot-quang-ninh", type: "post", words: 3539 },
  { id: 2052, slug: "hut-be-phot-tien-yen", type: "post", words: 3534 },
  { id: 436,  slug: "hut-be-phot-bai-chay", type: "page", words: 3525 },
  { id: 2049, slug: "hut-be-phot-co-to", type: "post", words: 3518 },
  { id: 993,  slug: "thong-tac-cong-tuan-chau", type: "page", words: 3504 },
];

for (const pg of PAGES) {
  const ability_name = pg.type === "post" ? "content/get-post" : "content/get-page";
  const r = await ability(ability_name, { id: pg.id });
  const text = r?.result?.content?.[0]?.text ?? "";
  let data = {};
  try { data = JSON.parse(text); } catch { console.log("Parse err:", text.slice(0, 100)); }

  const html = data?.content ?? data?.post?.content ?? data?.page?.content ?? data?.data?.content ?? "";
  const actualWords = countWords(html);
  const sections = extractH2Sections(html);
  const totalSectionWords = sections.reduce((a, s) => a + s.words, 0);

  console.log(`\n=== ${pg.slug} (ID ${pg.id}) ===`);
  console.log(`Reported: ${pg.words} | Actual HTML: ${actualWords} | Need to cut: ${Math.max(0, actualWords - 3400)}`);
  console.log("H2 Sections:");
  sections.slice(-6).forEach(s => console.log(`  [${s.words}w] ${s.heading.slice(0, 60)}`));
  console.log(`Last 3 sections total: ${sections.slice(-3).reduce((a,s)=>a+s.words,0)} words`);
}
