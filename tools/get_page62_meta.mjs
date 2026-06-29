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

const r = await new Promise((res, rej) => {
  const opts = {
    hostname: SERVER_IP, port: 443, servername: WP_HOST,
    path: "/wp-json/wp/v2/pages/62?context=edit",
    method: "GET", headers: { Host: WP_HOST, Authorization: auth },
    rejectUnauthorized: false,
  };
  const req = https.request(opts, resp => {
    let d = ""; resp.on("data", c => d += c);
    resp.on("end", () => res(JSON.parse(d)));
  });
  req.on("error", rej); req.setTimeout(15000, () => req.destroy(new Error("t"))); req.end();
});

console.log("Title:", r.title?.rendered);
const meta = r.meta ?? {};
console.log("rank_math_description:", meta.rank_math_description);
console.log("rank_math_title:", meta.rank_math_title);
console.log("Rank Math keys:", Object.keys(meta).filter(k => k.startsWith("rank")));

// Also check what's generating the live meta
// Get source of live description
const live = await new Promise((res, rej) => {
  const opts = {
    hostname: SERVER_IP, port: 443, servername: WP_HOST,
    path: "/gioi-thieu/", method: "GET",
    headers: { Host: WP_HOST, "User-Agent": "metacheck/1", "Accept-Encoding": "identity" },
    rejectUnauthorized: false,
  };
  const req = https.request(opts, resp => {
    let d = ""; resp.on("data", c => d += c);
    resp.on("end", () => res(d));
  });
  req.on("error", rej); req.setTimeout(15000, () => req.destroy(new Error("t"))); req.end();
});

const metaM = live.match(/<meta name="description" content="([^"]+)"/);
const liveDesc = metaM?.[1] ?? "(not found)";
console.log(`\nLive meta (${liveDesc.length}): "${liveDesc}"`);
