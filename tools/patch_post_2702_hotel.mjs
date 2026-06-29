/**
 * Cập nhật post 2702 /hut-be-phot-khach-san-quang-ninh-2026/:
 * Đồng bộ live với draft: chèn (1) bảng lịch hút định kỳ theo quy mô,
 * (2) FAQ thứ 5 "dấu hiệu sắp đầy bể". Đặt trước author byline.
 * Bypass DNS qua IP trực tiếp + SNI host (DNS blocked trong env này).
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const POST_ID = 2702;

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
function wpRest(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}) },
      rejectUnauthorized: false };
    const req = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    req.on("error", reject); req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

console.log("=== 1. Lấy nội dung hiện tại ===");
const getR = await wpRest("GET", `/wp/v2/posts/${POST_ID}?context=edit`, auth);
if (getR.s !== 200) { console.log("  GET fail:", getR.s, JSON.stringify(getR.d).slice(0,200)); process.exit(1); }
const rawContent = getR.d?.content?.raw ?? "";
console.log(`  Content: ${rawContent.length} chars`);

const hasSchedule = rawContent.includes("Lịch Hút Bể Phốt Định Kỳ");
const hasFaq5 = rawContent.includes("sắp đầy bể phốt để gọi");
console.log(`  Đã có bảng lịch định kỳ: ${hasSchedule} | Đã có FAQ5: ${hasFaq5}`);

const SCHEDULE_BLOCKS = `
<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Lịch Hút Bể Phốt Định Kỳ Theo Quy Mô Khách Sạn</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Cách tránh sự cố tốt nhất không phải gọi thợ lúc đã có mùi, mà là hút định kỳ trước khi bể đầy. Tần suất phụ thuộc vào số phòng, công suất khách thực tế và mùa du lịch — không phải vào dung tích bể như nhiều chủ khách sạn vẫn nghĩ.</p>
<!-- /wp:paragraph -->

<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Quy mô khách sạn</th><th>Công suất khách trung bình</th><th>Tần suất hút khuyến nghị</th></tr></thead><tbody><tr><td>Nhà nghỉ, mini hotel dưới 10 phòng</td><td>Dưới 20 khách/đêm</td><td>6 tháng/lần</td></tr><tr><td>Khách sạn 10–20 phòng</td><td>30–60 khách/đêm</td><td>4 tháng/lần</td></tr><tr><td>Khách sạn 20–40 phòng</td><td>60–120 khách/đêm</td><td>3 tháng/lần</td></tr><tr><td>Khách sạn trên 40 phòng, resort</td><td>Trên 120 khách/đêm</td><td>2–3 tháng/lần, kiểm tra hàng tháng</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:paragraph -->
<p>Riêng với khách sạn ven biển Hạ Long, Bãi Cháy, Vân Đồn phục vụ mùa cao điểm hè (tháng 5 đến tháng 8), nên cộng thêm 2 mốc cố định: <strong>hút trước mùa vào tháng 4</strong> và <strong>sau mùa vào tháng 9</strong> — bất kể lịch định kỳ đã tới hạn hay chưa. Đây là cách đơn giản nhất để không bị sự cố đúng lúc kín phòng.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Nếu chưa rõ khách sạn của mình nên hút bao lâu một lần, gọi <strong>0963.953.533</strong> để được tư vấn lịch định kỳ miễn phí theo công suất thực tế.</p>
<!-- /wp:paragraph -->
`;

const FAQ5_BLOCKS = `
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Làm sao biết khách sạn sắp đầy bể phốt để gọi hút trước khi có sự cố?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Chú ý 4 dấu hiệu sớm: mùi hôi nhẹ trong nhà vệ sinh hoặc hành lang, bồn cầu xả chậm hơn bình thường, có tiếng "ọc" khi xả nước, và nhiều phòng cùng thoát nước chậm. Khi thấy bất kỳ dấu hiệu nào, hoặc bể đã quá 6 tháng chưa hút, nên gọi kiểm tra trước khi sự cố xảy ra trước mặt khách.</p>
<!-- /wp:paragraph -->
`;

// Neo chèn
const AUTHOR_BYLINE = '<!-- wp:paragraph {"className":"ttcqn-author';
const hasByline = rawContent.includes(AUTHOR_BYLINE);
console.log(`  Có author byline neo: ${hasByline}`);

let newContent = rawContent;
// Chèn FAQ5 ngay sau FAQ4 (câu "Làm sao biết giá hút bể phốt khách sạn của mình")
const FAQ4_ANCHOR = "không cần thợ đến tận nơi mới biết giá";
if (!hasFaq5) {
  const idx = newContent.indexOf(FAQ4_ANCHOR);
  if (idx !== -1) {
    // tìm hết block paragraph chứa anchor: cắt tại </p> + comment đóng kế tiếp
    const closeP = newContent.indexOf("<!-- /wp:paragraph -->", idx);
    const insertAt = closeP !== -1 ? closeP + "<!-- /wp:paragraph -->".length : idx;
    newContent = newContent.slice(0, insertAt) + "\n" + FAQ5_BLOCKS + newContent.slice(insertAt);
    console.log("  ✓ Chèn FAQ5 sau FAQ4");
  } else {
    console.log("  ⚠ Không tìm thấy neo FAQ4, bỏ FAQ5");
  }
}

// Chèn bảng lịch định kỳ trước author byline (hoặc cuối bài nếu không có byline)
if (!hasSchedule) {
  if (hasByline) {
    newContent = newContent.replace(AUTHOR_BYLINE, SCHEDULE_BLOCKS + "\n" + AUTHOR_BYLINE);
    console.log("  ✓ Chèn bảng lịch định kỳ trước byline");
  } else {
    newContent = newContent + "\n" + SCHEDULE_BLOCKS;
    console.log("  ✓ Append bảng lịch định kỳ cuối bài");
  }
}

console.log(`  New content: ${newContent.length} chars (delta +${newContent.length - rawContent.length})`);

if (newContent === rawContent) { console.log("  Không có thay đổi, dừng."); process.exit(0); }

console.log("\n=== 2. PUT cập nhật post ===");
const upd = await wpRest("POST", `/wp/v2/posts/${POST_ID}`, auth, { content: newContent });
console.log(`  Status: ${upd.s}`);
if (upd.s === 200) {
  const r = upd.d?.content?.raw ?? "";
  console.log(`  Có bảng lịch định kỳ: ${r.includes("Lịch Hút Bể Phốt Định Kỳ")}`);
  console.log(`  Có FAQ5: ${r.includes("sắp đầy bể phốt để gọi")}`);
} else {
  console.log("  Error:", JSON.stringify(upd.d).slice(0,300)); process.exit(1);
}

console.log("\n=== 3. Verify live ===");
await new Promise(rr => setTimeout(rr, 2000));
await new Promise((res) => {
  const opts={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/hut-be-phot-khach-san-quang-ninh-2026/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    console.log(`  HTTP ${resp.statusCode}`);
    console.log(`  Có bảng lịch định kỳ: ${d.includes("Lịch Hút Bể Phốt Định Kỳ")}`);
    console.log(`  Có FAQ5: ${d.includes("sắp đầy bể phốt để gọi")}`);
    const h1 = (d.match(/<h1[^>]*>/gi)||[]).length;
    console.log(`  Số H1: ${h1}`);
    res();
  })});
  r.on("error",e=>{console.log("  live err:",e.message);res();});r.setTimeout(15000,()=>{r.destroy();res();});r.end();
});

const TODAY="2026-06-23"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",`\n${TODAY},${TIME},DEPLOY-HBP-KHACHSAN-2702-${TODAY},seo_fix,hút bể phốt khách sạn Quảng Ninh,https://thongtaccongquangninh.com/hut-be-phot-khach-san-quang-ninh-2026/,hut-be-phot-khach-san-quang-ninh-2026,done,easy,,,,,"Đồng bộ live post 2702 với draft: chèn bảng lịch hút định kỳ theo quy mô + FAQ5 dấu hiệu sắp đầy bể qua WP REST IP-bypass",tools/patch_post_2702_hotel.mjs,,Verify Rich Results + GSC sau 24h,Bypass DNS qua IP 103.57.220.210,,,,,,`,"utf8");
console.log("\n✓ logged SEO_PROGRESS.csv");
