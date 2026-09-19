import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");
const ID = 2043;
const TYPE = "posts";

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

// "Bon cau rut cham" la tu khoa xep hang chinh cua trang nay nen giu nhieu
// lan hon cac trang khac (10 lan dau, rai deu qua cac section). Cac lan
// sau rut gon thanh "tinh trang nay" de giam mat do tu 5.45% ma khong mat
// tin hieu tu khoa o phan mo bai, heading dau va bang gia.
const FULL_RE = /bồn cầu rút chậm/gi;
const KEEP_FIRST_N = 10;

async function main() {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/${TYPE}/${ID}?context=edit`, { headers: { Authorization: auth } });
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(FULL_RE) || []).length;

  let count = 0;
  raw = raw.replace(FULL_RE, (match) => {
    count++;
    if (count <= KEEP_FIRST_N) return match;
    return match[0] === match[0].toUpperCase() ? "Tình trạng này" : "tình trạng này";
  });

  const after = (raw.match(FULL_RE) || []).length;
  console.log(`Truoc: ${before} lan | Sau: ${after} lan (giu ${KEEP_FIRST_N} lan dau)`);

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-2043-${stamp}`;
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
