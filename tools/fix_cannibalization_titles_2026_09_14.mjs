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

// Chi doi title cua 3 bai "cam nang / huong dan chung" dang vo tinh an thit
// tu khoa "tai <thanh pho>" voi cac trang dich vu thuong mai dang co
// traffic/xep hang that (khong dong den title cac trang dich vu).
const FIXES = [
  {
    id: 2332,
    slug: "cam-nang-thong-tac-cong-tai-ha-long",
    oldTitle: "Cẩm Nang Thông Tắc Cống Tại Hạ Long – Xử Lý Nhanh Đúng Cách",
    newTitle: "Cẩm Nang Xử Lý Cống Tắc Hạ Long: Nguyên Nhân Và Cách Nhận Biết Sớm",
    reason: "An thit voi thong-tac-cong-ha-long va hut-be-phot-ha-long (cum 'tai Ha Long')",
  },
  {
    id: 4147,
    slug: "be-phot-day-phai-lam-sao-2026",
    oldTitle: "Bể Phốt Đầy Phải Làm Sao? Xử Lý Đúng Cách Tại Quảng Ninh 2026",
    newTitle: "Bể Phốt Đầy Phải Làm Sao? Dấu Hiệu Và Cách Xử Lý Đúng 2026",
    reason: "An thit 3 cum: hut-be-phot/thong-tac-cong/hut-ham-cau 'tai Quang Ninh'",
  },
  {
    id: 2046,
    slug: "mui-hoi-cong-nguyen-nhan-xu-ly",
    oldTitle: "Mùi Hôi Cống Nguyên Nhân Và Cách Xử Lý Triệt Để Tại Quảng Ninh",
    newTitle: "Mùi Hôi Cống: Nguyên Nhân Và Cách Xử Lý Triệt Để",
    reason: "An thit voi hut-ham-cau-quang-ninh (cum 'tai Quang Ninh')",
  },
];

async function main() {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/fix-cannibalization-titles-${stamp}`;
  if (!DRY) mkdirSync(backupDir, { recursive: true });
  const results = [];

  for (const fix of FIXES) {
    const r = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${fix.id}?context=edit`, { headers: { Authorization: auth } });
    const post = await r.json();
    if (post.title.raw !== fix.oldTitle) {
      console.log(`[${fix.id}] ${fix.slug} -> TITLE HIEN TAI KHONG KHOP du kien, bo qua. Hien tai: "${post.title.raw}"`);
      results.push({ slug: fix.slug, skipped: true, currentTitle: post.title.raw });
      continue;
    }
    console.log(`[${fix.id}] ${fix.slug}`);
    console.log(`  Cu:  "${fix.oldTitle}"`);
    console.log(`  Moi: "${fix.newTitle}"`);
    console.log(`  Ly do: ${fix.reason}`);
    if (DRY) { results.push({ slug: fix.slug, dry: true }); continue; }

    writeFileSync(`${backupDir}/${fix.id}.json`, JSON.stringify({ id: fix.id, oldTitle: post.title.raw }, null, 2), "utf8");
    const res = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${fix.id}`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ title: fix.newTitle }),
    });
    console.log(`  -> status=${res.status}`);
    results.push({ slug: fix.slug, id: fix.id, status: res.status });
  }

  if (!DRY) {
    writeFileSync(`${ROOT}/reports/fix-cannibalization-titles-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
    console.log("Backup dir:", backupDir);
  }
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
