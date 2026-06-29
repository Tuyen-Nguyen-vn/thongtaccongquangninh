import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}
function insertBeforeJsonLd(raw,c){const m='<!-- wp:html -->\n<script type="application/ld+json"';const i=raw.lastIndexOf(m);if(i>=0)return raw.slice(0,i)+c+"\n\n"+raw.slice(i);const i2=raw.lastIndexOf("<!-- wp:html -->");if(i2>=0)return raw.slice(0,i2)+c+"\n\n"+raw.slice(i2);return raw+"\n\n"+c;}

// lien-he (id=63): cần +150w
const LIEN_HE_ADD=`
<!-- wp:heading {"level":2} -->
<h2>Lưu ý trước khi thợ đến</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Để ca làm việc diễn ra nhanh và sạch hơn, bạn có thể chuẩn bị trước: dọn vật dụng trong phòng tắm hoặc bếp nơi thợ cần tiếp cận; đảm bảo xe hoặc vật cản không chặn lối vào nắp bể phốt; chuẩn bị xô hoặc ống để thợ đặt đầu bơm mà không để nước bắn ra sàn. Nếu tắc xảy ra trong đêm và bạn cần giải quyết gấp, cứ gọi ngay số <strong>0963.953.533</strong> — đội trực đêm sẽ hướng dẫn bạn biện pháp giảm thiểu tạm thời trong khi chờ thợ đến.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Với các công trình lớn (khu công nghiệp, chung cư, bệnh viện), liên hệ trước ít nhất 24 giờ để điều phối đội và xe phù hợp. Hợp đồng bảo trì định kỳ có thể ký theo quý hoặc năm, kèm ưu tiên lịch và xuất hóa đơn VAT.</p>
<!-- /wp:paragraph -->`;

// nguyen-song-hao (id=2356): cần +35w
const NSH_ADD=`
<!-- wp:paragraph -->
<p>Liên hệ Nguyễn Song Hào để tư vấn kỹ thuật hoặc đặt lịch xử lý sự cố tại Quảng Ninh: <strong>0963.953.533</strong> (Zalo, gọi thoại) — nhận tư vấn từ 6:00 đến 22:00 hàng ngày.</p>
<!-- /wp:paragraph -->`;

for(const {id,type,slug,add} of [
  {id:63,type:"pages",slug:"lien-he",add:LIEN_HE_ADD},
  {id:2356,type:"pages",slug:"nguyen-song-hao",add:NSH_ADD},
]){
  const post=await wpReq("GET",`/wp-json/wp/v2/${type}/${id}?context=edit&_fields=id,slug,content`);
  if(!post?.id){console.log(`✗ ${slug}`);continue;}
  const newRaw=insertBeforeJsonLd(post.content?.raw||"",add);
  const res=await wpReq("POST",`/wp-json/wp/v2/${type}/${id}`,{content:newRaw,status:"publish"});
  if(res?.id) console.log(`✓ ${slug} saved`);
  else console.log(`✗ ${slug} ${JSON.stringify(res).slice(0,100)}`);
}
