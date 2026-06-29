/**
 * Fix WORD_BELOW_TARGET: thêm content chất lượng cho 5 service pages
 * Mỗi trang cần +100–200 từ để đạt >= 2500 từ
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

function insertBeforeJsonLd(raw, newContent){
  const marker='<!-- wp:html -->\n<script type="application/ld+json" data-ttcqn-author-nguyen-song-hao="1">';
  const idx=raw.lastIndexOf(marker);
  if(idx>=0) return raw.slice(0,idx)+newContent+"\n\n"+raw.slice(idx);
  // Fallback: insert before last wp:html block
  const idx2=raw.lastIndexOf("<!-- wp:html -->");
  if(idx2>=0) return raw.slice(0,idx2)+newContent+"\n\n"+raw.slice(idx2);
  return raw+"\n\n"+newContent;
}

function countWords(t){return(t.replace(/<[^>]+>/g," ").match(/\b\w+\b/g)||[]).length;}

const FORBIDDEN=['chuyên nghiệp','uy tín','hàng đầu','tận tâm','hy vọng bài viết hữu ích'];
function checkForbidden(t){return FORBIDDEN.filter(w=>new RegExp(w,'i').test(t));}

// === CONTENT ADDITIONS ===
const PAGES = [
  {
    id: 1368, type: "posts", slug: "nao-vet-ho-ga", auditWords: 2402,
    content: `\n<!-- wp:heading {"level":2} -->
<h2>Mẹo phòng tránh hố ga bị bùn cát nghẹt</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Hố ga bị bùn cát và rác thải bít kín là tình trạng phổ biến tại Quảng Ninh, đặc biệt sau mùa mưa lũ. Để hạn chế tần suất nạo vét và kéo dài tuổi thọ hệ thống thoát nước, gia đình và doanh nghiệp có thể thực hiện một số biện pháp đơn giản sau.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list">
<li>Đặt lưới chắn rác tại miệng hố ga để ngăn lá cây, túi nylon và rác sinh hoạt rơi vào.</li>
<li>Tránh đổ dầu mỡ thức ăn xuống cống bếp — dầu mỡ đông đặc khi nguội, tích tụ trong đường ống dẫn đến hố ga.</li>
<li>Sau mỗi trận mưa lớn, kiểm tra miệng hố ga xem có bùn cát bít kín không; thông lại ngay nếu thấy nước đọng lâu không rút.</li>
<li>Định kỳ 6–12 tháng một lần, gọi đội nạo vét để hút bùn và kiểm tra đáy hố ga, tránh để lâu gây tắc toàn bộ hệ thống.</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Nạo vét hố ga định kỳ không chỉ giúp hệ thống thoát nước hoạt động thông suốt mà còn giảm nguy cơ ngập úng cục bộ trong mùa mưa — vấn đề đặc biệt nghiêm trọng tại các khu phố thấp ven biển Hạ Long, Cẩm Phả và Quảng Yên. Gọi <strong>0963.953.533</strong> để đặt lịch nạo vét định kỳ, báo giá minh bạch trước khi làm.</p>
<!-- /wp:paragraph -->\n`
  },
  {
    id: 2054, type: "posts", slug: "thong-tac-cong-bai-chay", auditWords: 2384,
    content: `\n<!-- wp:heading {"level":2} -->
<h2>Đặc thù tắc cống tại khu du lịch Bãi Cháy</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Bãi Cháy là khu du lịch trọng điểm của Hạ Long, với mật độ khách sạn, nhà hàng và dịch vụ lưu trú cao. Điều này khiến hệ thống thoát nước chịu tải lớn hơn khu dân cư thông thường, đặc biệt trong mùa cao điểm du lịch từ tháng 4 đến tháng 8.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Nguyên nhân phổ biến nhất khiến cống tắc tại Bãi Cháy bao gồm: dầu mỡ thực phẩm từ bếp nhà hàng, bùn cát từ bờ biển và cảng tàu, rác thải của du khách và bùn lắng do nước triều tích tụ lâu ngày trong ống. Nếu không xử lý kịp thời, nước thải trào ngược vào bếp hoặc toilet sẽ ảnh hưởng trực tiếp đến hoạt động kinh doanh và hình ảnh cơ sở.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Đội thông tắc cống Bãi Cháy của chúng tôi trực 24/7, sử dụng máy lò xo kết hợp áp lực nước cao để xử lý nhanh mà không đục phá sàn hay tường. Cam kết có mặt trong 15 phút, báo giá rõ trước khi làm. Gọi ngay <strong>0963.953.533</strong>.</p>
<!-- /wp:paragraph -->\n`
  },
  {
    id: 1481, type: "pages", slug: "thong-tac-bon-cau-dong-trieu", auditWords: 2447,
    content: `\n<!-- wp:heading {"level":2} -->
<h2>Lưu ý khi thông tắc bồn cầu tại Đông Triều</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Đông Triều là thị xã có nhiều khu dân cư mới phát triển nhanh, với đặc thù ống thoát nước PVC đường kính nhỏ, dễ bị tắc do giấy vệ sinh dày, khăn ướt và bùn khoáng từ nguồn nước giếng. Những hộ dân ở khu vực nông thôn các phường Đức Chính, Bình Khê, Tràng An thường gặp tình trạng bồn cầu rút chậm do bể phốt đầy song song với ống tắc cục bộ — cần phân biệt đúng để xử lý đúng cách.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Thợ thông tắc bồn cầu Đông Triều sẽ kiểm tra toàn bộ từ miệng bồn đến bể phốt trước khi kết luận nguyên nhân, tránh xử lý sai gây hỏng ống. Thời gian có mặt 20–40 phút tùy khu vực. Gọi <strong>0963.953.533</strong> để được hỗ trợ.</p>
<!-- /wp:paragraph -->\n`
  },
  {
    id: 1485, type: "pages", slug: "thong-tac-bon-cau-quang-yen", auditWords: 2486,
    content: `\n<!-- wp:heading {"level":2} -->
<h2>Đặc điểm cống thoát nước tại Quảng Yên cần biết</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Quảng Yên có địa hình thấp, nhiều khu dân cư ven sông Bạch Đằng dễ bị ngập úng theo thủy triều. Khi bồn cầu tắc kết hợp với triều dâng, áp lực ngược chiều có thể đẩy nước thải trào vào nhà vệ sinh — tình trạng thường xảy ra tại các tuyến phố thấp thuộc phường Quảng Yên, Nam Hòa và Phong Hải. Đội thợ của chúng tôi quen xử lý đặc thù này; gọi <strong>0963.953.533</strong> để được tư vấn và khắc phục ngay trong ngày.</p>
<!-- /wp:paragraph -->\n`
  },
  {
    id: 2694, type: "posts", slug: "hut-be-phot-cong-ty-quang-ninh-2026", auditWords: 2486,
    content: `\n<!-- wp:heading {"level":2} -->
<h2>Ký hợp đồng hút bể phốt định kỳ cho doanh nghiệp</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Doanh nghiệp đăng ký hợp đồng hút bể phốt định kỳ sẽ được ưu tiên lịch, giảm 10–15% so với giá lẻ và nhận hóa đơn VAT đầy đủ cho bộ phận kế toán. Chu kỳ phù hợp cho văn phòng 50–200 người là 6 tháng/lần; nhà máy có bếp ăn công nghiệp là 3 tháng/lần. Chúng tôi gửi nhắc lịch trước 1 tuần, không cần doanh nghiệp tự theo dõi.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Liên hệ <strong>0963.953.533</strong> để nhận báo giá hợp đồng năm và tư vấn chu kỳ phù hợp với quy mô hoạt động của đơn vị.</p>
<!-- /wp:paragraph -->\n`
  },
];

for(const {id,type,slug,auditWords,content} of PAGES){
  const post=await wpReq("GET",`/wp-json/wp/v2/${type}/${id}?context=edit&_fields=id,slug,content`);
  if(!post?.id){console.log(`✗ ${slug}: not found`);continue;}
  const raw=post.content?.raw||"";

  const fw=checkForbidden(content);
  if(fw.length>0){console.log(`⚠ ${slug}: content has forbidden: ${fw}`);continue;}

  const addedWords=countWords(content);
  const newRaw=insertBeforeJsonLd(raw,content);
  const totalWords=countWords(newRaw.replace(/<[^>]+>/g," "));

  console.log(`${slug}: audit=${auditWords}w + ~${addedWords}w → est.total~${auditWords+Math.round(addedWords*0.85)}w`);

  const res=await wpReq("POST",`/wp-json/wp/v2/${type}/${id}`,{content:newRaw});
  if(res?.id) console.log(`  ✓ saved`);
  else console.log(`  ✗ ${JSON.stringify(res).slice(0,120)}`);
}

const TODAY="2026-06-16";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-WORD-BELOW-${TODAY},seo_fix,WORD_BELOW_TARGET — 5 service pages (nao-vet + bai-chay + dong-trieu + quang-yen + cong-ty),https://thongtaccongquangninh.com/,,done,medium,,,,,add 75–200w relevant content per page,tools/fix_word_below.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
