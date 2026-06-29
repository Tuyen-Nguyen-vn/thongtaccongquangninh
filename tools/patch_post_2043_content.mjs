/**
 * Fix post 2043 /bon-cau-rut-cham-nguyen-nhan/:
 * 1. Thêm ~600 từ vào WP post content qua WP REST API (PUT posts/2043)
 * 2. Fix alt 2 ảnh thiếu location qua content/patch-page
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const POST_ID = 2043;

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function mcpReq(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return mcpReq(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}
function wpRest(method, path, auth2, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: { Host: WP_HOST, Authorization: auth2, "User-Agent": "fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}) },
      rejectUnauthorized: false };
    const req2 = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    req2.on("error", reject); req2.setTimeout(30000, () => req2.destroy(new Error("t")));
    if (bodyBuf) req2.write(bodyBuf);
    req2.end();
  });
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth,{jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"fix-bon-cau-2",version:"1"}}});

// 1. Get current raw content via WP REST
console.log("=== 1. Get current post content ===");
const getR = await wpRest("GET", `/wp/v2/posts/${POST_ID}?context=edit`, auth);
const rawContent = getR.d?.content?.raw ?? "";
console.log(`  Content: ${rawContent.length} chars`);

// Find anchor for insertion — after the last </p> before JSON-LD schema block
const AUTHOR_BYLINE = '<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao ttcqn-author-byline"}';
const hasAuthorByline = rawContent.includes(AUTHOR_BYLINE);
console.log(`  Has byline: ${hasAuthorByline}`);

// Extra content as proper Gutenberg blocks
const EXTRA_BLOCKS = `
<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">6. Giải Pháp Theo Từng Khu Vực Tại Quảng Ninh</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Tình trạng bồn cầu rút chậm không chỉ khác nhau về nguyên nhân mà còn phụ thuộc vào đặc điểm hạ tầng từng khu. Tại <strong>Hạ Long</strong> — các phường Bãi Cháy, Cao Xanh, Giếng Đáy — nhiều nhà phố và chung cư cũ dùng hệ thống thoát nước từ những năm 1990, ống nhỏ 75–90mm. Khi có cặn, giấy hoặc vật rắn, ống nghẹt nhanh hơn nhà mới. Phương án tốt là dùng lò xo hoặc máy cao áp thông từ bồn cầu ra đến hố ga gần nhất.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Tại <strong>Cẩm Phả</strong> và <strong>Uông Bí</strong>, các khu tập thể công nhân cũ thường dùng ống gang hoặc ống đúc nhỏ — dễ bị gỉ sét bên trong làm giảm đường kính. Bồn cầu rút chậm ở đây thường do thành ống bị co lại, không phải vật lạ. Trường hợp này cần kiểm tra cả đường ống từ sàn xuống giếng thu nước, không chỉ thông ở bồn cầu. Gọi <strong>0963.953.533</strong> để thợ kiểm tra toàn diện.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Tại <strong>Quảng Yên</strong> và các huyện ven biển như <strong>Hải Hà</strong>, <strong>Đầm Hà</strong>, nước ngầm mặn có thể làm mủn ống nhựa cũ và để lại cặn vôi trong ống thoát. Sau khi thông tắc xong nên dùng dung dịch tẩy vôi chuyên dụng để làm sạch cặn bám, tránh tái nghẹt sau 2–3 tháng.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">7. Câu Hỏi Thường Gặp Về Bồn Cầu Rút Chậm</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Bồn cầu rút chậm có tự khỏi không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Không nên chờ tự khỏi. Bồn cầu rút chậm thường là dấu hiệu tắc nghẽn một phần — nếu để lâu, cặn bẩn tích tụ thêm và dẫn đến tắc hoàn toàn, thậm chí trào ngược. Bạn có thể thử dùng thuốc thông tắc dạng lỏng trong 30 phút; nếu không cải thiện, gọi thợ ngay. Gọi <strong>0963.953.533</strong> — có mặt trong 15 phút tại Quảng Ninh.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Dùng thuốc thông tắc hóa học có ổn không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Thuốc thông tắc hóa học hiệu quả với tắc do tóc, giấy và chất hữu cơ nhẹ. Tuy nhiên không dùng quá liều vì có thể ăn mòn ống nhựa PVC cũ. Không dùng với ống gang hoặc tắc do vật cứng. Với tắc nặng hoặc không rõ nguyên nhân, gọi thợ với máy lò xo hoặc máy cao áp an toàn hơn.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Thợ thông tắc bồn cầu có cần đục sàn không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Trong hầu hết các trường hợp <strong>không cần đục phá</strong>. Thợ của Môi Trường Đô Thị Số 1 Quảng Ninh sử dụng lò xo thông tắc từ bồn cầu hoặc máy hút cao áp theo đường ống. Chỉ khi ống vỡ bên trong tường hoặc sàn thì mới cần đục để thay thế — sẽ thông báo trước khi thi công.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Giá thông tắc bồn cầu rút chậm tại Quảng Ninh là bao nhiêu?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Giá thông tắc bồn cầu tại Quảng Ninh từ <strong>200.000 – 500.000 đồng</strong> tùy mức độ tắc và phương án xử lý. Tắc nhẹ do giấy, tóc từ 200.000đ. Tắc nặng cần máy cao áp hoặc lò xo dài từ 350.000 – 500.000đ. Báo giá cụ thể trước khi thi công, không phát sinh phí sau. Gọi <strong>0963.953.533</strong> để được báo giá miễn phí trong 5 phút.</p>
<!-- /wp:paragraph -->

`;

// Insert before author byline
let newContent;
if (hasAuthorByline) {
  newContent = rawContent.replace(AUTHOR_BYLINE, EXTRA_BLOCKS + "\n" + AUTHOR_BYLINE);
} else {
  // Append at end
  newContent = rawContent + "\n" + EXTRA_BLOCKS;
}

console.log(`  New content: ${newContent.length} chars`);

// 2. Update via WP REST API
console.log("\n=== 2. Update post via WP REST ===");
const updateR = await wpRest("POST", `/wp/v2/posts/${POST_ID}`, auth, {
  content: newContent,
});
console.log(`  Status: ${updateR.s}`);
if (updateR.s === 200) {
  const updatedRaw = updateR.d?.content?.raw ?? "";
  const updatedTxt = updatedRaw.replace(/<[^>]+>/g," ").replace(/<!--[\s\S]*?-->/g," ").replace(/\s+/g," ").trim();
  const updatedWC = updatedTxt.split(/\s+/).filter(w=>w.length>1).length;
  console.log(`  Updated word count (raw): ${updatedWC}`);
  console.log(`  Has section 6: ${updatedRaw.includes("Giải Pháp Theo Từng Khu")}`);
} else {
  console.log("  Error:", JSON.stringify(updateR.d).slice(0,200));
}

// 3. Fix alt text for 2 images
console.log("\n=== 3. Fix alt text ===");

const ALT_FIXES = [
  {
    find: 'alt="Bồn cầu rút nước chậm cần kiểm tra đường thoát, xi phông và bể phốt trước khi xử lý"',
    replace: 'alt="Bồn cầu rút nước chậm cần kiểm tra đường thoát, xi phông và bể phốt trước khi xử lý tại Quảng Ninh"',
  },
  {
    find: 'alt="Thợ dùng thiết bị phù hợp để kiểm tra nguyên nhân bồn cầu rút chậm"',
    replace: 'alt="Thợ thông tắc bồn cầu rút chậm dùng thiết bị phù hợp kiểm tra nguyên nhân tại Quảng Ninh"',
  },
];

for (const { find, replace } of ALT_FIXES) {
  const r = await ability(auth, "content/patch-page", { id: POST_ID, find, replace });
  const t = r.d?.result?.content?.[0]?.text ?? "";
  const reps = JSON.parse(t || "{}").data?.replacements ?? "?";
  console.log(t.includes("success") ? `  ✓ alt fixed (reps=${reps})` : `  ✗ ${t.slice(0,80)}`);
}

// 4. Verify live
await new Promise(rr => setTimeout(rr, 2000));
console.log("\n=== 4. Live verify ===");
await new Promise((res, rej) => {
  const opts={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/bon-cau-rut-cham-nguyen-nhan/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    const art=d.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const main2 = art ? art[1] : '';
    const wc=main2.replace(/<[^>]+>/g," ").replace(/\s+/g," ").split(/\s+/).filter(w=>w.length>1).length;
    const imgs=[...d.matchAll(/<img[^>]+src="[^"]*bon-cau[^"]*"[^>]*/gi)];
    console.log(`  Article words: ${wc} (target ≥2000)`);
    console.log(`  Has section 6: ${d.includes("Giải Pháp Theo Từng Khu")}`);
    imgs.forEach((m,i)=>{
      const alt=(m[0].match(/alt="([^"]*)"/i)||[])[1]||"(no alt)";
      const hasLoc=/quảng ninh|hạ long/i.test(alt);
      console.log(`  Img ${i}: ${hasLoc?"✓":"⚠"} alt="${alt.slice(0,60)}"`);
    });
    res();
  })});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});

// Log
const TODAY="2026-06-08"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",`\n${TODAY},${TIME},FIX-BON-CAU-FINAL-${TODAY},seo_fix,/bon-cau-rut-cham-nguyen-nhan/ +600w FAQ+khu vực + fix alt 2 ảnh,https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan/,,done,medium,,,,,Gutenberg blocks inserted via WP REST POST; alt 2 imgs QN added,tools/patch_post_2043_content.mjs,,Audit verify sau 1h,,,,,,`,"utf8");
console.log("\n✓ logged");
