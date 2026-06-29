import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

function wpGet(path) {
  return new Promise((res, rej) => {
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { try { res(JSON.parse(d)); } catch { res(d); } }); });
    r.on("error", rej); r.setTimeout(20000, () => r.destroy(new Error("t"))); r.end();
  });
}

const SLUGS = [
  "hut-be-phot-cong-ty-quang-ninh-2026",
  "hut-be-phot-khach-san-quang-ninh-2026",
  "hut-be-phot-khu-nha-tro-quang-ninh-2026",
  "hut-be-phot-nha-hang-quang-ninh-2026",
  "hut-ham-cau-quang-ninh-2026",
];

for (const slug of SLUGS) {
  const posts = await wpGet(`/wp-json/wp/v2/posts?slug=${slug}&context=edit&_fields=id,slug,title,meta`);
  if (!posts[0]) { console.log(`${slug}: NOT FOUND`); continue; }
  const p = posts[0];
  const rmTitle = p.meta?.rank_math_title ?? "(not set)";
  const wpTitle = p.title?.raw ?? "(no raw title)";
  console.log(`\nid=${p.id} slug=${slug}`);
  console.log(`  WP title (${[...wpTitle].length}): "${wpTitle}"`);
  console.log(`  RM title (${[...rmTitle].length}): "${rmTitle}"`);
}
