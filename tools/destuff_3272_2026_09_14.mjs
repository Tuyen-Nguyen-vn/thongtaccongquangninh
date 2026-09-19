import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");
const ID = 3272;
const TYPE = "pages";

function readEnv(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return values;
}
const env = readEnv(`${ROOT}/.env`);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

// 34 lan lap "thong tac bon cau Bai Chay" (22 than bai, 12 seo-supplement).
// Giu 12 lan dau (phan lon o than bai, van tu nhien), rut gon cac lan sau
// thanh "thong tac bon cau" (bo hau to dia danh da ro tu ngu canh).
const FULL_RE = /thông tắc bồn cầu Bãi Cháy/gi;
const KEEP_FIRST_N = 12;

async function main() {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/${TYPE}/${ID}?context=edit`, { headers: { Authorization: auth } });
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(FULL_RE) || []).length;

  let count = 0;
  raw = raw.replace(FULL_RE, (match) => {
    count++;
    if (count <= KEEP_FIRST_N) return match;
    return match[0] === match[0].toUpperCase() ? "Thông tắc bồn cầu" : "thông tắc bồn cầu";
  });

  const after = (raw.match(FULL_RE) || []).length;
  console.log(`Truoc: ${before} lan | Sau: ${after} lan (giu ${KEEP_FIRST_N} lan dau)`);

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-3272-${stamp}`;
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(`${backupDir}/${ID}.json`, JSON.stringify({ id: ID, title: post.title.raw, content: post.content.raw }, null, 2), "utf8");

  const res = await fetch(`https://${HOST}/wp-json/wp/v2/${TYPE}/${ID}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content: raw }),
  });
  console.log("Update status:", res.status);
  console.log("Backup:", backupDir);
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
