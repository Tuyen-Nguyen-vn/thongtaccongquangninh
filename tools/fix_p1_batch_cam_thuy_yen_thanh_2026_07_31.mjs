import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import https from "node:https";

const ENV_PATH = "D:/.thongtaccongquangninh/.env";
const HOST = "thongtaccongquangninh.com";
const ROOT = "D:/.thongtaccongquangninh";
const DRY = process.argv.includes("--dry");

function readEnv(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return values;
}

function request(method, urlPath, auth, payload) {
  return new Promise((resolve, reject) => {
    const body = payload === undefined ? null : Buffer.from(JSON.stringify(payload), "utf8");
    const req = https.request(
      { hostname: HOST, port: 443, path: urlPath, method,
        headers: { Authorization: auth, Accept: "application/json",
          ...(body ? { "Content-Type": "application/json", "Content-Length": body.length } : {}) } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (body) req.write(body);
    req.end();
  });
}

const env = readEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

const PAGES = [
  { id: 1611, type: "posts", slug: "hut-be-phot-cam-thuy" },
  { id: 1621, type: "posts", slug: "hut-be-phot-yen-thanh" },
];

function approxWords(text) {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

async function main() {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/fix-batch4-${stamp}`;
  if (!DRY) mkdirSync(backupDir, { recursive: true });

  const results = [];
  for (const page of PAGES) {
    const newContent = readFileSync(`${ROOT}/reports/_fixed_${page.id}_preview.html`, "utf8");
    const words = approxWords(newContent);
    console.log(`[${page.id}] ${page.slug} -> approxWords=${words}`);

    if (DRY) { results.push({ id: page.id, slug: page.slug, dry: true, approxWords: words }); continue; }

    const getRes = await request("GET", `/wp-json/wp/v2/${page.type}/${page.id}?context=edit`, auth);
    if (getRes.status !== 200) { console.error(`[${page.id}] GET failed`, getRes.status); continue; }
    const old = JSON.parse(getRes.text);
    writeFileSync(`${backupDir}/${page.id}.json`, JSON.stringify({ id: page.id, title: old.title.raw, content: old.content.raw }, null, 2), "utf8");

    const putRes = await request("POST", `/wp-json/wp/v2/${page.type}/${page.id}`, auth, { content: newContent });
    console.log(`[${page.id}] ${page.slug} -> status=${putRes.status}`);
    results.push({ id: page.id, slug: page.slug, status: putRes.status, approxWords: words, resText: putRes.text.slice(0, 250) });
  }

  if (!DRY) {
    writeFileSync(`${ROOT}/reports/fix-batch4-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
    console.log("Backup dir:", backupDir);
  }
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
