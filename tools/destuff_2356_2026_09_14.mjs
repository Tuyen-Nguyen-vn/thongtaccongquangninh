import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");
const ID = 2356;

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

// Trang tieu su Nguyen Song Hao: cum "Nguyen Song Hao chuyen gia ve sinh moi
// truong" duoc lap lai nguyen van 27 lan (ke ca trong heading, FAQ, list).
// Giu nguyen doan mo dau gioi thieu day du chuc danh; cac lan sau chi con
// "Nguyen Song Hao" (van la ten that, giu tin hieu E-E-A-T, bo phan chuc
// danh lap lai khong can thiet).
const FULL = "Nguyễn Song Hào chuyên gia vệ sinh môi trường";
const SHORT = "Nguyễn Song Hào";
const KEEP_FIRST_N = 1; // giu lan xuat hien dau tien (doan mo dau, da co chuc danh day du roi)

async function main() {
  let post;
  for (const type of ["posts", "pages"]) {
    const r = await fetch(`https://${HOST}/wp-json/wp/v2/${type}/${ID}?context=edit`, { headers: { Authorization: auth } });
    if (r.ok) { const j = await r.json(); if (j.content) { post = { ...j, type }; break; } }
  }
  if (!post) { console.error("Post not found"); process.exit(1); }

  let raw = post.content.raw;
  const re = new RegExp(FULL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  const before = (raw.match(re) || []).length;

  let count = 0;
  raw = raw.replace(re, (match) => {
    count++;
    return count <= KEEP_FIRST_N ? match : SHORT;
  });

  const after = (raw.match(re) || []).length;
  console.log(`Truoc: ${before} lan | Sau: ${after} lan (giu ${KEEP_FIRST_N} lan dau)`);

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-2356-${stamp}`;
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(`${backupDir}/${ID}.json`, JSON.stringify({ id: ID, title: post.title.raw, content: post.content.raw }, null, 2), "utf8");

  const res = await fetch(`https://${HOST}/wp-json/wp/v2/${post.type}/${ID}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content: raw }),
  });
  console.log("Update status:", res.status);
  console.log("Backup:", backupDir);
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
