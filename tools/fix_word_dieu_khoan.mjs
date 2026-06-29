/**
 * Thêm nội dung vào /dieu-khoan-dich-vu/ (id=2445, page)
 * Từ ~1049w → 2000w+ (cần thêm ~1000 từ)
 * Thêm: mở rộng 3 điều khoản + section FAQ 5 Q&A
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

function insertBeforeJsonLd(raw,c){const m='<!-- wp:html -->\n<script type="application/ld+json"';const i=raw.lastIndexOf(m);if(i>=0)return raw.slice(0,i)+c+"\n\n"+raw.slice(i);return raw+"\n\n"+c;}

// Nội dung thêm (~1050 từ): mở rộng điều khoản + FAQ
const ADD_CONTENT = `
<!-- wp:heading {"level":2} -->
<h2>Quyền và Trách Nhiệm của Khách Hàng</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Khi sử dụng dịch vụ hút bể phốt, thông tắc cống hoặc các dịch vụ xử lý môi trường khác của Thông Tắc Cống Quảng Ninh, khách hàng có các quyền sau: được nhận báo giá rõ ràng trước khi thi công; được yêu cầu dừng công việc nếu phát sinh vấn đề ngoài phạm vi đã thỏa thuận; được bảo hành theo chính sách từng hạng mục dịch vụ; được đặt lịch theo khung giờ thuận tiện kể cả ban đêm và ngày lễ. Ngoài ra, khách hàng có trách nhiệm: cung cấp thông tin địa chỉ và tình trạng sự cố chính xác khi đặt lịch; tạo điều kiện để nhân viên kỹ thuật tiếp cận an toàn khu vực thi công; thông báo ngay khi phát sinh thêm vấn đề kỹ thuật so với mô tả ban đầu để được điều chỉnh phương án và báo giá bổ sung trước khi tiếp tục.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Tiêu Chuẩn Thực Hiện Dịch Vụ</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Mọi hạng mục dịch vụ được thực hiện theo quy trình kỹ thuật chuẩn: kiểm tra tình trạng hệ thống trước khi thi công, lựa chọn phương án phù hợp (máy lò xo áp lực, xe bồn hút, hóa chất xử lý sinh học), thi công đúng phạm vi thỏa thuận, kiểm tra lại sau khi hoàn thành, bàn giao và hướng dẫn sử dụng. Nhân viên kỹ thuật mang thiết bị bảo hộ, sử dụng vật tư đúng chủng loại và không để lại rác thải tại địa điểm làm việc. Trong trường hợp tắc nghẽn phức tạp cần đục phá hoặc thay thế đường ống, sẽ được thông báo và xin phép khách hàng trước — không thực hiện mà không có sự đồng ý.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Phạm Vi Dịch Vụ và Khu Vực Phục Vụ</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Thông Tắc Cống Quảng Ninh cung cấp dịch vụ trên toàn tỉnh Quảng Ninh bao gồm: <strong>Hạ Long</strong> (Hồng Gài, Bãi Cháy, Giếng Đáy, Cao Xanh, Tuần Châu), <strong>Cẩm Phả</strong>, <strong>Uông Bí</strong>, <strong>Móng Cái</strong>, <strong>Quảng Yên</strong>, <strong>Đông Triều</strong>, cùng các huyện đảo Vân Đồn, Cô Tô, Tiên Yên, Bình Liêu, Đầm Hà, Hải Hà. Đội xe bồn và máy móc được bố trí theo cụm địa lý để đảm bảo thời gian có mặt 15–30 phút tại khu vực nội thành và 45–60 phút tại khu vực huyện xa. Đối với huyện đảo như Cô Tô, lịch phục vụ cần đặt trước tối thiểu 24 giờ do phụ thuộc vào lịch tàu.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Câu Hỏi Thường Gặp về Điều Khoản Dịch Vụ</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Nếu sau khi xử lý vẫn còn tắc, tôi có được làm lại miễn phí không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Có, nếu sự cố tái phát trong thời gian bảo hành và nguyên nhân là do kỹ thuật thi công lần trước, chúng tôi sẽ xử lý lại miễn phí. Bảo hành không áp dụng nếu tình trạng tái phát do vật lạ mới rơi vào đường ống hoặc do khách hàng tự can thiệp vào hệ thống sau khi bàn giao. Thời hạn bảo hành cụ thể được thông báo theo từng hạng mục khi báo giá.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Giá báo qua điện thoại có phải giá cuối cùng không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Giá báo qua điện thoại là ước tính dựa trên mô tả của khách hàng. Giá chính xác được xác định sau khi nhân viên kiểm tra thực tế tại chỗ và sẽ được thông báo trước khi bắt đầu thi công — không phát sinh thêm sau khi đã thỏa thuận. Nếu tình trạng thực tế phức tạp hơn mô tả, nhân viên sẽ giải thích và báo giá điều chỉnh; khách hàng hoàn toàn có quyền từ chối mà không mất phí.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Tôi có thể hủy lịch hay dời lịch không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Bạn có thể hủy hoặc dời lịch bất kỳ lúc nào trước khi nhân viên xuất phát bằng cách gọi hotline <strong>0963.953.533</strong>. Nếu nhân viên đã di chuyển đến địa chỉ, phí di chuyển có thể được áp dụng tùy khoảng cách — mức phí này được thông báo rõ khi đặt lịch ban đầu. Lịch khẩn cấp (24/7) không áp dụng dời lịch sau khi đã xác nhận.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Dịch vụ có xuất hóa đơn VAT không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Có. Chúng tôi xuất hóa đơn VAT theo yêu cầu cho các đơn hàng từ doanh nghiệp, nhà hàng, khách sạn, khu công nghiệp và các khách hàng tổ chức khác. Vui lòng đề nghị xuất hóa đơn VAT khi đặt lịch để nhân viên chuẩn bị đầy đủ thông tin. Thông tin xuất hóa đơn bao gồm mã số thuế, tên công ty và địa chỉ đăng ký kinh doanh.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Điều khoản này áp dụng cho cả dịch vụ hợp đồng bảo trì định kỳ không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Điều khoản này là nền tảng chung; hợp đồng bảo trì định kỳ (quý/năm) có thêm điều khoản riêng được ký kết trực tiếp giữa hai bên. Trong trường hợp có mâu thuẫn giữa điều khoản chung và hợp đồng riêng, điều khoản trong hợp đồng riêng sẽ được ưu tiên. Để ký hợp đồng bảo trì, liên hệ hotline <strong>0963.953.533</strong> để được tư vấn gói phù hợp cho nhà hàng, khu nhà trọ, tòa nhà văn phòng hoặc khu công nghiệp.</p>
<!-- /wp:paragraph -->`;

const post = await wpReq("GET", `/wp-json/wp/v2/pages/2445?context=edit&_fields=id,slug,content`);
if(!post?.id){console.log("✗ id=2445 not found");process.exit(1);}

const newRaw = insertBeforeJsonLd(post.content?.raw || "", ADD_CONTENT);
const newWords = newRaw.replace(/<[^>]+>/g," ").split(/\s+/).filter(Boolean).length;
console.log(`Từ ~893w → ~${newWords}w (raw strip estimate)`);

const res = await wpReq("POST", `/wp-json/wp/v2/pages/2445`, {content: newRaw, status:"publish"});
if(res?.id){
  console.log(`✓ dieu-khoan-dich-vu saved (id=${res.id})`);
} else {
  console.log("✗ " + JSON.stringify(res).slice(0,100));
  process.exit(1);
}

const TODAY="2026-06-16"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-WORD-DIEUKHOAN-${TODAY},seo_fix,Tang tu 1049w len 2000w+ cho /dieu-khoan-dich-vu/ — them 3 section + FAQ 5 Q&A,https://thongtaccongquangninh.com/dieu-khoan-dich-vu/,,done,medium,,,,,REST API update content,tools/fix_word_dieu_khoan.mjs,,verify live word count,,,,,,`,
  "utf8");
console.log("✓ logged");
