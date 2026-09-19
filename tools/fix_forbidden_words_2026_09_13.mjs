import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");

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

async function wpGet(id) {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${id}?context=edit`, { headers: { Authorization: auth } });
  if (!r.ok) throw new Error(`GET ${id} -> ${r.status}`);
  return r.json();
}
async function wpUpdate(id, content) {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${id}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return { status: r.status, text: await r.text() };
}

const FIXES = [
  {
    id: 4681,
    slug: "checklist-truoc-khi-goi-tho-thong-tac-cong",
    find: "Đơn vị uy tín thường khảo sát miễn phí.",
    replace: "Đơn vị làm ăn lâu dài thường khảo sát miễn phí, không thu phí xem xét trước.",
  },
  {
    id: 4692,
    slug: "mui-hoi-nha-ve-sinh-chung-cu-cam-pha",
    find: "Quy Trình Kiểm Tra Và Xử Lý Mùi Hôi Chuyên Nghiệp",
    replace: "Quy Trình Kiểm Tra Và Xử Lý Mùi Hôi Từng Bước",
  },
];

async function main() {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/fix-forbidden-words-${stamp}`;
  if (!DRY) mkdirSync(backupDir, { recursive: true });

  const results = [];
  for (const fix of FIXES) {
    const post = await wpGet(fix.id);
    const raw = post.content.raw;
    if (!raw.includes(fix.find)) {
      console.log(`[${fix.id}] ${fix.slug} -> KHONG TIM THAY chuoi can thay, bo qua`);
      results.push({ id: fix.id, slug: fix.slug, skipped: true, reason: "find string not found" });
      continue;
    }
    const newContent = raw.split(fix.find).join(fix.replace);
    console.log(`[${fix.id}] ${fix.slug} -> se thay "${fix.find}" -> "${fix.replace}"`);
    if (DRY) { results.push({ id: fix.id, slug: fix.slug, dry: true }); continue; }

    writeFileSync(`${backupDir}/${fix.id}.json`, JSON.stringify({ id: fix.id, title: post.title.raw, content: raw }, null, 2), "utf8");
    const res = await wpUpdate(fix.id, newContent);
    console.log(`[${fix.id}] ${fix.slug} -> status=${res.status}`);
    results.push({ id: fix.id, slug: fix.slug, status: res.status });
  }

  if (!DRY) {
    writeFileSync(`${ROOT}/reports/fix-forbidden-words-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
    console.log("Backup dir:", backupDir);
  }
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
