import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");
const ID = 2439;
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

// Giu 6 lan dau (mo bai + vai heading dau), rut gon cac lan sau thanh
// "hut be phot ngoai gio" (bo hau to "Quang Ninh" da ro tu ngu canh trang).
// Bo qua occurrence trong JSON-LD schema (khong the hien voi nguoi doc).
const FULL_RE = /hút bể phốt ngoài giờ Quảng Ninh/gi;
const KEEP_FIRST_N = 6;

async function main() {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/${TYPE}/${ID}?context=edit`, { headers: { Authorization: auth } });
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(FULL_RE) || []).length;

  let count = 0;
  raw = raw.replace(FULL_RE, (match, offset, full) => {
    count++;
    // Bo qua neu nam trong doan JSON-LD (giua { va } cua mot script schema)
    const context = full.slice(Math.max(0, offset - 60), offset);
    if (context.includes('"name":') || context.includes('"description":') || context.includes('#service')) {
      return match;
    }
    if (count <= KEEP_FIRST_N) return match;
    return match[0] === match[0].toUpperCase() ? "Hút bể phốt ngoài giờ" : "hút bể phốt ngoài giờ";
  });

  const after = (raw.match(FULL_RE) || []).length;
  console.log(`Truoc: ${before} lan | Sau: ${after} lan (giu ${KEEP_FIRST_N} lan dau, bo qua schema)`);

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-2439-${stamp}`;
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
