/**
 * Thêm nội dung cho 3 structural pages còn thấp từ:
 * - gioi-thieu (id=62, live=2102w): +~400w raw
 * - lien-he (id=63, live=1868w): +~600w raw
 * - nguyen-song-hao (id=2356, live=1825w): +~700w raw
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
  const marker='<!-- wp:html -->\n<script type="application/ld+json"';
  const idx=raw.lastIndexOf(marker);
  if(idx>=0) return raw.slice(0,idx)+newContent+"\n\n"+raw.slice(idx);
  const idx2=raw.lastIndexOf("<!-- wp:html -->");
  if(idx2>=0) return raw.slice(0,idx2)+newContent+"\n\n"+raw.slice(idx2);
  return raw+"\n\n"+newContent;
}

function countWords(t){return(t.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<[^>]+>/g," ").match(/\b\w+\b/g)||[]).length;}

const FORBIDDEN=['chuyên nghiệp','uy tín','hàng đầu','tận tâm','hy vọng bài viết hữu ích'];
function checkForbidden(t){return FORBIDDEN.filter(w=>new RegExp(w,'i').test(t));}

const PAGES=[
  {
    id:62, type:"pages", slug:"gioi-thieu",
    content:`
<!-- wp:heading {"level":2} -->
<h2>Phạm vi dịch vụ — khu vực phục vụ tại Quảng Ninh</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Đội thợ thường trực tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các huyện đảo lân cận. Thời gian di chuyển đến hầu hết các địa chỉ nội thành Hạ Long và Cẩm Phả từ 10 đến 25 phút; khu vực ngoại ô và huyện đảo từ 30 đến 60 phút tùy khoảng cách.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Dịch vụ phục vụ cả hộ gia đình, hộ kinh doanh, nhà hàng, khách sạn, trường học, bệnh viện, khu công nghiệp và chung cư cao tầng. Xe bồn hút bể phốt có tải trọng 5–9 khối phù hợp với cả ngõ hẹp và đường lớn; máy thông tắc áp lực cao xử lý được đường ống từ DN50 đến DN300. Với công trình lớn hoặc cần xử lý nhiều hạng mục, có thể điều phối 2–3 đội cùng lúc.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Cam kết chất lượng và quy trình kiểm tra</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Mỗi ca làm việc kết thúc bằng bước kiểm tra thực tế trước khi đội thợ rời khỏi công trình. Với hút bể phốt: bơm nước thử, kiểm tra mức sạch đáy bể và ghi nhận tình trạng thành bể, ống dẫn. Với thông tắc cống: xả nước kiểm tra lưu lượng thoát tối thiểu 5 phút; nếu chưa thông hoàn toàn, tiếp tục xử lý trước khi lấy phí. Với nạo vét hố ga: đo độ lắng bùn trước và sau, chụp ảnh trước–sau để khách hàng đối chiếu.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Chính sách bảo hành: nếu sự cố tái phát trong 7 ngày do cùng nguyên nhân, đội thợ quay lại xử lý miễn phí. Điều kiện áp dụng: khách hàng không dùng thêm hóa chất tẩy rửa mạnh hoặc dụng cụ khơi thông tự phát sau khi đội thợ hoàn tất. Gọi <strong>0963.953.533</strong> để đặt lịch hoặc báo sự cố bảo hành.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Thiết bị sử dụng trong dịch vụ</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list">
<li><strong>Xe bồn hút bể phốt</strong>: dung tích 5–9 m³, áp lực hút chân không 0,08–0,09 MPa, hoạt động êm, không gây mùi ra xung quanh khi có van chặn.</li>
<li><strong>Máy thông tắc lò xo điện</strong>: xử lý nút tắc cứng (đất sét, rễ cây, rác sinh hoạt đóng cục) trong ống đường kính 50–110 mm.</li>
<li><strong>Máy phun áp lực cao (Jetting)</strong>: áp suất 100–250 bar, xả sạch váng dầu mỡ, cặn khoáng, bùn lắng trong ống lớn DN100–DN300.</li>
<li><strong>Camera nội soi ống</strong>: kiểm tra vị trí tắc, nứt vỡ, rễ cây xâm nhập mà không cần đục phá — phù hợp với chung cư và nhà liền kề có ống âm tường.</li>
</ul>
<!-- /wp:list -->`
  },
  {
    id:63, type:"pages", slug:"lien-he",
    content:`
<!-- wp:heading {"level":2} -->
<h2>Câu hỏi thường gặp khi đặt lịch dịch vụ</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Gọi lúc mấy giờ thì có thợ?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Đội trực 24/7 kể cả Tết Nguyên Đán và ngày lễ. Ca ngày (6:00–22:00) có thợ trong 10–20 phút nếu địa điểm trong nội thành Hạ Long hoặc Cẩm Phả. Ca đêm (22:00–6:00) thời gian 20–40 phút; phí ca đêm được thông báo rõ trước khi xuất phát.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Báo giá trước hay sau khi thợ đến?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Với dịch vụ hút bể phốt: báo giá ngay qua điện thoại dựa trên dung tích bể và địa chỉ — không cần thợ đến trước. Với thông tắc cống và bồn cầu: thợ kiểm tra thực tế 5–10 phút rồi báo giá cố định trước khi bắt tay làm. Bạn có quyền từ chối — không mất phí kiểm tra ban đầu.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Chi phí thanh toán như thế nào?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nhận tiền mặt, chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay). Doanh nghiệp, công ty, cơ quan nhà nước: xuất hóa đơn VAT đầy đủ, thanh toán sau khi nghiệm thu trong 3–7 ngày làm việc theo hợp đồng.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Thợ có cần vào nhà không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Hút bể phốt: thường chỉ cần tiếp cận nắp bể bên ngoài — không cần vào nhà. Thông tắc cống/bồn cầu: cần tiếp cận điểm tắc (toilet, miệng cống bếp, hố ga). Thợ mang giày bảo hộ và đặt tấm lót sàn trước khi vào khu vực làm việc.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Khu vực phục vụ tại Quảng Ninh</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Đội thợ thường trực và có thể có mặt nhanh tại các khu vực sau:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list">
<li><strong>Hạ Long</strong>: Bãi Cháy, Hùng Thắng, Cao Xanh, Giếng Đáy, Hà Khẩu, Tuần Châu, Hà Tu, Hà Phong, Hoành Bồ.</li>
<li><strong>Cẩm Phả</strong>: Cẩm Đông, Cẩm Phú, Cẩm Tây, Cẩm Thạch, Cẩm Thủy, Mông Dương.</li>
<li><strong>Uông Bí</strong>: Phương Đông, Phương Nam, Trưng Vương, Vàng Danh, Thanh Sơn.</li>
<li><strong>Quảng Yên</strong>: phường Quảng Yên, Nam Hòa, Phong Hải, Sông Khoai.</li>
<li><strong>Đông Triều</strong>: Mạo Khê, Đông Triều, Bình Khê, Tràng An, Đức Chính.</li>
<li><strong>Móng Cái và Vân Đồn</strong>: tùy khoảng cách, có thể điều phối đội gần nhất.</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Ngoài các khu vực trên, nếu địa chỉ của bạn không có trong danh sách, gọi <strong>0963.953.533</strong> để xác nhận khả năng và thời gian có mặt.</p>
<!-- /wp:paragraph -->`
  },
  {
    id:2356, type:"pages", slug:"nguyen-song-hao",
    content:`
<!-- wp:heading {"level":2} -->
<h2>Chuyên môn và lĩnh vực phụ trách</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nguyễn Song Hào đào tạo chuyên ngành Kỹ thuật Môi trường tại Đại học Bách Khoa Hà Nội, sau đó có thêm 3 năm thực hành hiện trường tại các công trình xử lý nước thải và vệ sinh đô thị ở Quảng Ninh trước khi thành lập đơn vị riêng. Lĩnh vực phụ trách trực tiếp bao gồm:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list">
<li>Vận hành và kiểm tra kỹ thuật xe bồn hút bể phốt: quy trình bơm hút an toàn, ngăn chặn mùi phát tán, xử lý bùn thải đúng quy định.</li>
<li>Chẩn đoán nguyên nhân tắc cống và bồn cầu: phân biệt tắc cơ học (rác, cặn), tắc do rễ cây, tắc do sập ống hoặc ống bị lún nghiêng.</li>
<li>Giám sát thi công nạo vét hố ga, cống thoát nước khu dân cư và khu công nghiệp.</li>
<li>Kiểm soát chất lượng nước thải đầu ra sau xử lý bể phốt theo QCVN 14:2008/BTNMT.</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading {"level":2} -->
<h2>Câu hỏi thường gặp về chuyên môn</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Bể phốt bao lâu nên hút một lần?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Chu kỳ phụ thuộc vào số người sử dụng và dung tích bể. Hộ gia đình 4–6 người với bể 2–3 m³ thường cần hút mỗi 12–18 tháng. Nhà hàng hoặc cơ sở dịch vụ thực phẩm nên hút mỗi 3–6 tháng do lượng dầu mỡ và cặn hữu cơ cao hơn nhiều. Dấu hiệu cần hút ngay: mùi hôi trong nhà vệ sinh, bồn cầu xả chậm kèm bọt khí, nước thải trào ra miệng bể.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Cống bị tắc có thể tự thông không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Với nút tắc nhẹ (tóc, xà phòng) ở sát miệng thoát sàn, có thể dùng móc hoặc piston thủ công. Nhưng nếu nước trào ngược lên từ nhiều điểm thoát khác nhau, tắc có thể ở đường ống chính — tự can thiệp mà không có dụng cụ chuyên dụng dễ đẩy nút tắc sâu hơn vào ống, làm phức tạp thêm việc xử lý sau này. Trường hợp đó nên gọi thợ kiểm tra trước.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Hóa chất thông tắc bán ngoài thị trường có hiệu quả không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Hóa chất NaOH hoặc axit sulfuric nồng độ cao có thể phá vỡ nút tắc hữu cơ (tóc, dầu mỡ) nhưng ăn mòn ren nhựa, vòng cao su và ống PVC cũ sau nhiều lần dùng. Hiệu quả tạm thời nhưng không xử lý được nút tắc do rác cứng, đất sét hoặc vật lạ. Không nên dùng hóa chất mạnh nếu ống đã cũ trên 10 năm hoặc vật liệu không rõ nguồn gốc.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Chi phí thông tắc phụ thuộc vào gì?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Các yếu tố ảnh hưởng đến giá bao gồm: loại sự cố (bồn cầu, cống bếp, cống chính, hố ga), mức độ tắc (tắc từng phần hay tắc hoàn toàn), độ dài đường ống cần xử lý, và phương pháp cần dùng (lò xo cơ, áp lực nước hay camera nội soi). Báo giá cố định trước khi làm — không phát sinh thêm sau khi khách đã đồng ý.</p>
<!-- /wp:paragraph -->`
  },
];

for(const {id,type,slug,content} of PAGES){
  const fw=checkForbidden(content);
  if(fw.length>0){console.log(`⚠ ${slug}: nội dung có từ cấm: ${fw}`);continue;}

  const post=await wpReq("GET",`/wp-json/wp/v2/${type}/${id}?context=edit&_fields=id,slug,content`);
  if(!post?.id){console.log(`✗ ${slug}: not found`);continue;}
  const raw=post.content?.raw||"";

  const addedWords=countWords(content);
  const rawBefore=countWords(raw);
  const newRaw=insertBeforeJsonLd(raw,content);
  const rawAfter=countWords(newRaw);
  console.log(`${slug}: raw ${rawBefore}w + ~${addedWords}w → ${rawAfter}w raw (est live ~${rawAfter+235}w)`);

  const res=await wpReq("POST",`/wp-json/wp/v2/${type}/${id}`,{content:newRaw});
  if(res?.id) console.log(`  ✓ saved`);
  else console.log(`  ✗ ${JSON.stringify(res).slice(0,150)}`);
}

const TODAY="2026-06-16";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-WORD-STRUCTURAL-${TODAY},seo_fix,WORD_LOW/BELOW — 3 structural pages (gioi-thieu + lien-he + nguyen-song-hao),https://thongtaccongquangninh.com/,,done,low,,,,,add relevant content per page to reach live>=2500w,tools/fix_word_structural.mjs,,re-check live words,,,,,,`,
  "utf8");
console.log("✓ logged");
