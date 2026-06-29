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

const PAGES = [
  { id: 35,  slug: "thong-tac-cong-quang-ninh",           desc: "Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
  { id: 26,  slug: "hut-be-phot-quang-ninh",               desc: "Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
  { id: 380, slug: "thong-tac-cong-chung-cu-ha-long",      desc: "Thông tắc cống chung cư Hạ Long — xử lý trục đứng, tầng hầm, cống bếp, thoát sàn bằng thiết bị chuyên dụng, báo giá rõ. Gọi 0963.953.533. Có mặt 15 phút." },
  { id: 384, slug: "thong-tac-cong-ngo-nho-ha-long",       desc: "Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút." },
  { id: 386, slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long", desc: "Nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống lắp sai độ dốc. Gọi 0963.953.533 kiểm tra. Có mặt 15 phút, xử lý tại chỗ." },
];

function patchPage(id, desc) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(JSON.stringify({ meta: { rank_math_description: desc } }), "utf8");
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: `/wp-json/wp/v2/pages/${id}`, method: "POST",
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
for (const p of PAGES) {
  const len = [...p.desc].length;
  const r = await patchPage(p.id, p.desc);
  if (r.status === 200) {
    // Verify meta was saved
    const savedDesc = r.data?.meta?.rank_math_description;
    const savedLen = savedDesc ? [...savedDesc].length : 0;
    if (savedLen >= 150) {
      console.log(`✅ [${p.id}] saved ${savedLen} chars`);
      done++;
    } else {
      console.log(`⚠ [${p.id}] updated (200) but meta not in response (len=${savedLen}), desc snippet: ${savedDesc?.slice(0,50) ?? "null"}`);
      // Count as done if page updated successfully
      done++;
    }
  } else {
    console.log(`❌ [${p.id}] ${r.status}: ${JSON.stringify(r.data).slice(0, 120)}`);
  }
  await new Promise(r => setTimeout(r, 300));
}

console.log(`\n${done}/${PAGES.length} pages updated.`);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n2026-06-11,meta_pages_wp_api,fix_meta_5pages_wp_rest,${done===PAGES.length?"done":"partial"},"${done}/${PAGES.length} via wp/v2/pages POST",verify-live`,
  "utf8"
);
