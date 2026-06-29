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

const TARGETS = [
  { id: 2589, desc: "Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng tăng. Hút ngay Quảng Ninh 24/7, gọi 0963.953.533, có mặt 15 phút, bảo hành." },
  { id: 26,   desc: "Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
  { id: 386,  desc: "Nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống lắp sai độ dốc. Gọi 0963.953.533 kiểm tra. Có mặt 15 phút, xử lý tại chỗ." },
  { id: 380,  desc: "Thông tắc cống chung cư Hạ Long — xử lý trục đứng, tầng hầm, cống bếp, thoát sàn bằng thiết bị chuyên dụng, báo giá rõ. Gọi 0963.953.533. Có mặt 15 phút." },
  { id: 384,  desc: "Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút." },
  { id: 35,   desc: "Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
];

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

let done = 0;
for (const t of TARGETS) {
  try {
    const r = await rmPost({ objectType: "post", objectID: t.id, meta: { rank_math_description: t.desc } });
    const ok = r.status === 200 && r.data?.slug === true;
    console.log(ok ? `✅ [${t.id}]` : `❌ [${t.id}] ${r.status}: ${JSON.stringify(r.data).slice(0,80)}`);
    if (ok) done++;
  } catch (e) {
    console.log(`❌ [${t.id}] ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 300));
}

console.log(`\n${done}/${TARGETS.length} thành công.`);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n2026-06-10,meta_rm_api_v2,fix_meta_short_rm_api,${done===TARGETS.length?"done":"partial"},"${done}/${TARGETS.length} via rankmath/v1/updateMeta (https module)",re-audit`,
  "utf8"
);
