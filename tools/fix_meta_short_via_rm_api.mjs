/**
 * Fix META_SHORT cho 6 URL còn lại via Rank Math REST API /rankmath/v1/updateMeta
 */
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const WP_BASE_URL = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

const TARGETS = [
  { id: 2589, type: "post", slug: "dau-hieu-be-phot-bi-day-2026",
    desc: "Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng tăng. Hút ngay Quảng Ninh 24/7, gọi 0963.953.533, có mặt 15 phút, bảo hành." },
  { id: 26,   type: "post", slug: "hut-be-phot-quang-ninh",
    desc: "Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
  { id: 386,  type: "post", slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
    desc: "Nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống lắp sai độ dốc. Gọi 0963.953.533 kiểm tra. Có mặt 15 phút, xử lý tại chỗ." },
  { id: 380,  type: "post", slug: "thong-tac-cong-chung-cu-ha-long",
    desc: "Thông tắc cống chung cư Hạ Long — xử lý trục đứng, tầng hầm, cống bếp, thoát sàn bằng thiết bị chuyên dụng, báo giá rõ. Gọi 0963.953.533. Có mặt 15 phút." },
  { id: 384,  type: "post", slug: "thong-tac-cong-ngo-nho-ha-long",
    desc: "Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút." },
  { id: 35,   type: "post", slug: "thong-tac-cong-quang-ninh",
    desc: "Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
];

for (const t of TARGETS) {
  const len = [...t.desc].length;
  if (len < 150 || len > 160) console.warn(`⚠ ${t.slug}: ${len} chars`);
  else console.log(`✓ ${t.slug}: ${len} chars`);
}

async function updateMeta(target) {
  const res = await fetch(`${WP_BASE_URL}/wp-json/rankmath/v1/updateMeta`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      objectType: "post",
      objectID: target.id,
      meta: { rank_math_description: target.desc },
    }),
  });
  const data = await res.json();
  return { status: res.status, ok: res.status === 200 && data?.slug === true, data };
}

console.log("\nCập nhật via Rank Math API...");
let done = 0;
for (const t of TARGETS) {
  const r = await updateMeta(t);
  if (r.ok) {
    console.log(`✅ [${t.id}] ${t.slug}`);
    done++;
  } else {
    console.log(`❌ [${t.id}] ${t.slug} — ${r.status}: ${JSON.stringify(r.data).slice(0, 100)}`);
  }
  await new Promise(r => setTimeout(r, 200));
}

console.log(`\n${done}/${TARGETS.length} cập nhật thành công.`);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n2026-06-10,meta_short_rm_api,fix_meta_short_6_urls_rm_api,${done===TARGETS.length?"done":"partial"},"${done}/${TARGETS.length} via rankmath/v1/updateMeta",re-audit`,
  "utf8"
);
