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

function get(path) {
  return new Promise((res, rej) => {
    const r = https.request(
      { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method: "GET",
        headers: { Host: WP_HOST, Authorization: auth },
        rejectUnauthorized: false },
      resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { try { res(JSON.parse(d)); } catch { res(d); } }); }
    );
    r.on("error", rej); r.setTimeout(30000, () => r.destroy()); r.end();
  });
}

// Get all abilities page by page
let page = 1;
let allAbilities = [];
while (true) {
  const data = await get(`/wp-json/wp-abilities/v1/abilities?per_page=100&page=${page}`);
  if (!Array.isArray(data) || data.length === 0) break;
  allAbilities = allAbilities.concat(data);
  if (data.length < 100) break;
  page++;
}

console.log(`Total abilities: ${allAbilities.length}`);
console.log("\n=== All ability names ===");
allAbilities.forEach(a => console.log(a.name, "-", a.label || ""));

console.log("\n=== Plugin/file-related ===");
const filtered = allAbilities.filter(a => /plugin|file|upload|write|install|zip|fs|filesystem/i.test(a.name + " " + (a.label||"")));
filtered.forEach(a => {
  console.log(`\n[${a.name}] ${a.label}`);
  console.log("  desc:", a.description?.slice(0,100));
  if (a.input_schema?.properties) {
    console.log("  params:", Object.keys(a.input_schema.properties).join(", "));
  }
});
