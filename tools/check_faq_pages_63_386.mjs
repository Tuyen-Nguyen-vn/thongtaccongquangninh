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

function wpGet(path) {
  return new Promise((res, rej) => {
    const o = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => { try { res(JSON.parse(d)); } catch { res(d); } });
    });
    r.on("error", rej); r.setTimeout(20000, () => r.destroy(new Error("timeout"))); r.end();
  });
}

for (const id of [63, 282, 386]) {
  const r = await wpGet(`/wp-json/wp/v2/pages/${id}?context=edit&_fields=id,slug,title,content`);
  const raw = r.content?.raw || "";
  const hasFAQ = raw.includes('"@type": "FAQPage"') || raw.includes('"@type":"FAQPage"');
  console.log(`\n=== Page ${id}: ${r.title?.raw} ===`);
  console.log(`FAQPage JSON-LD: ${hasFAQ ? "✓ EXISTS (skip)" : "✗ MISSING (need fix)"}`);

  if (!hasFAQ) {
    const idx = raw.toLowerCase().indexOf("câu hỏi");
    if (idx >= 0) {
      const section = raw.slice(idx, idx + 2000).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      console.log("FAQ section (first 600 chars):", section.slice(0, 600));
    } else {
      console.log("No FAQ section found. Last 200 chars:", raw.slice(-200).replace(/<[^>]+>/g, " ").slice(0, 200));
    }
  }
}
