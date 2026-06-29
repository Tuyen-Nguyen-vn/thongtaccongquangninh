/**
 * Fix /bon-cau-rut-cham-nguyen-nhan/ (id=2043):
 * 1. WORD_LOW(1406) → thêm ~650 từ (FAQ + giải pháp theo khu vực)
 * 2. ALT×2 → fix alt 2 ảnh thiếu service+location
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const PAGE_ID = 2043;

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function req(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return req(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await req(auth,{jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"fix-bon-cau",version:"1"}}});

// Lấy content hiện tại để tìm alt ảnh
console.log("=== 0. Lấy content hiện tại ===");
const fetchR = await ability(auth, "content/get-page", { id: PAGE_ID });
const fetchTxt = fetchR.d?.result?.content?.[0]?.text ?? "{}";
const pageData = JSON.parse(fetchTxt);
const content = pageData?.data?.content ?? "";
// Tìm tất cả img tags
const imgs = [...content.matchAll(/<img [^>]*>/gi)];
console.log(`  Tổng ${imgs.length} ảnh:`);
imgs.forEach((m, i) => {
  const alt = (m[0].match(/alt="([^"]*)"/i)||[])[1] ?? "(no alt attr)";
  const src = (m[0].match(/src="([^"]*thongtac[^"]*|[^"]*be-phot[^"]*|[^"]*bon-cau[^"]*)"/i)||[])[1]
            ?? m[0].match(/src="([^"]+)"/i)?.[1]?.split('/').pop() ?? "(?)";
  console.log(`  [${i}] alt="${alt}" src=...${src.slice(-40)}`);
});

// Kiểm tra byline marker
const hasByline = content.includes('ttcqn-author-nguyen-song-hao ttcqn-author-byline');
console.log(`\n  Byline: ${hasByline ? "✓" : "✗ MISSING"}`);

// === EXTRA CONTENT ~650 từ ===
const EXTRA = `
<hr>

<h2>6. Giải Pháp Theo Từng Khu Vực Tại Quảng Ninh</h2>
<p>Tình trạng bồn cầu rút chậm không chỉ khác nhau về nguyên nhân mà còn phụ thuộc vào đặc điểm hạ tầng thoát nước từng khu. Tại <strong>Hạ Long</strong> — đặc biệt các phường Bãi Cháy, Cao Xanh, Giếng Đáy — nhiều nhà phố và chung cư cũ dùng hệ thống thoát nước xây từ những năm 1990, đường kính ống nhỏ (75mm hoặc 90mm). Khi có cặn bẩn, giấy hoặc vật rắn, ống nhanh nghẹt hơn so với nhà mới. Phương án tốt nhất là dùng lò xo hoặc máy cao áp thông từ bên trong bồn cầu ra đến hố ga gần nhất.</p>

<p>Tại <strong>Cẩm Phả</strong> và <strong>Uông Bí</strong>, các khu tập thể công nhân cũ thường dùng ống gang hoặc ống đúc nhỏ — dễ bị gỉ sét bên trong làm giảm đường kính hiệu dụng. Bồn cầu rút chậm ở đây thường do thành ống bị co lại theo thời gian, không phải do vật lạ. Trường hợp này cần kiểm tra cả đường ống từ sàn xuống đến giếng thu nước, không chỉ thông ở bồn cầu.</p>

<p>Tại <strong>Quảng Yên</strong> và các huyện ven biển như <strong>Hải Hà</strong>, <strong>Đầm Hà</strong>, nước ngầm mặn có thể gây mủn ống nhựa cũ và để lại cặn vôi trong ống thoát. Trong trường hợp này, sau khi thông tắc xong nên dùng dung dịch tẩy vôi chuyên dụng để làm sạch cặn bám, tránh tái nghẹt sau 2–3 tháng.</p>

<h2>7. Câu Hỏi Thường Gặp Về Bồn Cầu Rút Chậm</h2>

<h3>Bồn cầu rút chậm có tự khỏi không?</h3>
<p>Không nên chờ tự khỏi. Bồn cầu rút chậm thường là dấu hiệu tắc nghẽn một phần — nếu để lâu, phần cặn bẩn đó sẽ tích tụ thêm và dẫn đến tắc hoàn toàn, thậm chí trào ngược. Càng xử lý sớm, chi phí và thời gian càng thấp. Bạn có thể thử dùng thuốc thông tắc dạng lỏng trong 30 phút; nếu không cải thiện, gọi thợ ngay.</p>

<h3>Dùng thuốc thông tắc hóa học có ổn không?</h3>
<p>Thuốc thông tắc hóa học (NaOH hoặc H₂SO₄) hiệu quả với tắc do tóc, giấy và chất hữu cơ nhẹ. Tuy nhiên không dùng quá liều hoặc để trong ống quá lâu vì có thể ăn mòn ống nhựa PVC cũ. Không dùng với ống gang hoặc tắc do vật cứng (xương, đồ nhựa). Với trường hợp tắc nặng hoặc không rõ nguyên nhân, gọi thợ với máy lò xo hoặc máy cao áp an toàn hơn.</p>

<h3>Thợ thông tắc bồn cầu có cần đục sàn không?</h3>
<p>Trong hầu hết các trường hợp, <strong>không cần đục phá</strong>. Thợ của Môi Trường Đô Thị Số 1 Quảng Ninh sử dụng lò xo thông tắc đưa vào từ bồn cầu hoặc máy hút cao áp đi theo đường ống. Chỉ khi ống bị vỡ bên trong tường hoặc sàn thì mới cần đục để thay thế — trường hợp này rất hiếm và sẽ được thông báo trước khi thi công.</p>

<h3>Thông tắc xong bao lâu thì bồn cầu rút bình thường trở lại?</h3>
<p>Ngay sau khi thông tắc, bồn cầu nên rút nhanh bình thường. Nếu sau 30 phút vẫn còn chậm, thợ sẽ kiểm tra lại toàn bộ đường ống từ bồn cầu đến hố ga để đảm bảo tắc được giải quyết hoàn toàn. Thời gian thi công thông thường từ 30 phút đến 1,5 giờ tùy mức độ.</p>

<h3>Giá thông tắc bồn cầu rút chậm tại Quảng Ninh là bao nhiêu?</h3>
<p>Giá thông tắc bồn cầu tại Quảng Ninh dao động từ <strong>200.000 – 500.000 đồng</strong> tùy mức độ tắc và phương án xử lý. Trường hợp đơn giản (tắc nhẹ do giấy, tóc) từ 200.000đ. Tắc nặng cần máy cao áp hoặc lò xo dài từ 350.000 – 500.000đ. Báo giá cụ thể trước khi thi công, không phát sinh phí sau. Gọi <strong>0963.953.533</strong> để được báo giá miễn phí trong 5 phút.</p>`;

// Thêm content trước byline
const BYLINE_MARKER = '<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao ttcqn-author-byline"}';

if (!hasByline) {
  console.log("⚠ Không tìm thấy byline marker — sẽ append vào cuối content");
}

console.log("\n=== 1. Thêm nội dung FAQ + khu vực (~650 từ) ===");
const patchR = await ability(auth, "content/patch-page", {
  id: PAGE_ID,
  find: BYLINE_MARKER,
  replace: EXTRA + "\n\n" + BYLINE_MARKER,
});
const patchTxt = patchR.d?.result?.content?.[0]?.text ?? "";
console.log(patchTxt.includes("success") ? "✓ content patched" : "✗ " + patchTxt.slice(0,150));

// Verify word count
await new Promise(rr => setTimeout(rr, 1000));
const fetchR2 = await ability(auth, "content/get-page", { id: PAGE_ID });
const content2 = JSON.parse(fetchR2.d?.result?.content?.[0]?.text ?? "{}")?.data?.content ?? "";
const words2 = content2.replace(/<[^>]+>/g," ").replace(/\s+/g," ").split(/\s+/).filter(w=>w.length>1).length;
const imgs2 = [...content2.matchAll(/<img [^>]*>/gi)];
console.log(`  Words: ${words2} (target ≥2000)`);
console.log(`  Images: ${imgs2.length}`);

// Fix alt trên 2 ảnh thiếu service+location
console.log("\n=== 2. Kiểm tra và fix alt ảnh ===");
imgs2.forEach((m, i) => {
  const alt = (m[0].match(/alt="([^"]*)"/i)||[])[1] ?? "";
  const hasService = /thông tắc|bồn cầu|hút|thoát|cống/i.test(alt);
  const hasLoc = /quảng ninh|hạ long|cẩm phả|uông bí/i.test(alt);
  if (!hasService || !hasLoc) {
    console.log(`  [${i}] MISSING service/loc: alt="${alt.slice(0,60)}"`);
  }
});

// Log
const TODAY = "2026-06-08";
const TIME = new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-BON-CAU-RUTCHAM-${TODAY},seo_fix,/bon-cau-rut-cham-nguyen-nhan/ +650w FAQ+area sections,https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan/,,partial,medium,,,,,words=${words2}; target 2000; ALT still pending,tools/fix_bon_cau_rut_cham.mjs,,Fix ALT 2 ảnh và verify word count,,,,,,`,
  "utf8"
);
console.log("\n✓ logged");
