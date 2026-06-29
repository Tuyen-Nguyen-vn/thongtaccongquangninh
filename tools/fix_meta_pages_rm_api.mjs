import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

// 5 pages + 1 post — use correct objectType
const TARGETS = [
  { id: 35,   type: "page", desc: "Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
  { id: 26,   type: "page", desc: "Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
  { id: 380,  type: "page", desc: "Thông tắc cống chung cư Hạ Long — xử lý trục đứng, tầng hầm, cống bếp, thoát sàn bằng thiết bị chuyên dụng, báo giá rõ. Gọi 0963.953.533. Có mặt 15 phút." },
  { id: 384,  type: "page", desc: "Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút." },
  { id: 386,  type: "page", desc: "Nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống lắp sai độ dốc. Gọi 0963.953.533 kiểm tra. Có mặt 15 phút, xử lý tại chỗ." },
  { id: 2589, type: "post", desc: "Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng tăng. Hút ngay Quảng Ninh 24/7, gọi 0963.953.533, có mặt 15 phút, bảo hành." },
];

// Verify lengths
for (const t of TARGETS) {
  const len = [...t.desc].length;
  console.log(`[${t.id}][${t.type}] ${len} chars`);
}

function rmPost(body) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(JSON.stringify(body), "utf8");
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/rankmath/v1/updateMeta", method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth,
        "Content-Type": "application/json", "Content-Length": buf.length,
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.write(buf); req.end();
  });
}

console.log("\nUpdating via Rank Math API with correct objectType...");
let done = 0;
for (const t of TARGETS) {
  const r = await rmPost({
    objectType: t.type,
    objectID: t.id,
    meta: { rank_math_description: t.desc },
  });
  const ok = r.status === 200 && r.data?.slug === true;
  console.log(ok ? `✅ [${t.id}][${t.type}]` : `❌ [${t.id}][${t.type}] ${r.status}: ${JSON.stringify(r.data).slice(0,80)}`);
  if (ok) done++;
  await new Promise(r => setTimeout(r, 400));
}

console.log(`\n${done}/${TARGETS.length} thành công.`);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n2026-06-11,meta_rm_api_pages,fix_meta_pages_correct_objecttype,${done===TARGETS.length?"done":"partial"},"${done}/${TARGETS.length} với objectType đúng (page/post)",verify-live`,
  "utf8"
);
