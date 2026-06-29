/**
 * Fix ALT_NO_SERVICE_OR_LOCATION on ~10 images
 * Finds attachment by filename, PATCHes alt_text
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpReq(method, path, body){
  return new Promise((res,rej)=>{
    const b = body ? Buffer.from(JSON.stringify(body),"utf8") : null;
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,
      headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},
      rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));
    if(b)r.write(b);r.end();
  });
}

// filename → new alt text (must contain service hint or approved location)
const FIXES = {
  // binh-lieu case study
  "hut-be-phot-binh-lieu-quang-ninh-case-study.webp":
    "Hút bể phốt bùn cứng vùng cao Bình Liêu Quảng Ninh – xử lý bể xây cũ bị ngập",
  // co-to case study
  "hut-be-phot-co-to-quang-ninh-case-study.webp":
    "Hút bể phốt đảo Cô Tô Quảng Ninh – bùn thải vận chuyển an toàn ra đất liền",
  // dam-ha case study
  "hut-be-phot-dam-ha-quang-ninh-case-study.webp":
    "Hút bể phốt nhà hàng và trang trại tại Đầm Hà Quảng Ninh",
  // hai-ha case study
  "hut-be-phot-hai-ha-quang-ninh-case-study.webp":
    "Hút bể phốt cơ sở chế biến hải sản tại Hải Hà Quảng Ninh",
  // mui-hoi images
  "mui-hoi-cong-nguyen-nhan-xu-ly-anh-dau-bai-1.webp":
    "Mùi hôi cống tại Quảng Ninh – xi phông khô, hố ga đầy hoặc bể phốt cần thông tắc",
  "mui-hoi-cong-nguyen-nhan-xu-ly-xu-ly-mui-1.webp":
    "Kiểm tra nguồn mùi hôi cống tại Quảng Ninh – xử lý đúng điểm hiệu quả lâu dài",
  "mui-hoi-cong-nguyen-nhan-xu-ly-4-may-lo-xo-thong-cong-3.webp":
    "Thợ thông tắc cống Quảng Ninh dùng máy lò xo xử lý tắc khi hóa chất không hiệu quả",
  // hoa-chat images
  "hoa-chat-thong-cong-an-toan-quang-ninh-01.webp":
    "Hóa chất thông tắc cống dùng đúng liều – phù hợp tắc nhẹ, an toàn ống nhựa",
  "thong-tac-cong-chuyen-nghiep-quang-ninh-02.webp":
    "Thông tắc cống Quảng Ninh bằng thiết bị cơ học khi hóa chất không giải quyết được",
  "hoa-chat-tu-thong-cong-3-may-lo-xo-thong-cong-3.webp":
    "Thợ thông tắc cống Quảng Ninh dùng máy lò xo xử lý tắc nặng không cần hóa chất",
  // nguyen-song-hao
  "bang-khen-bo-tai-nguyen-moi-truong-cong-ty-dong-bac-2023-ha-long.jpg":
    "Bằng khen Bộ Tài nguyên và Môi trường tặng Công ty Môi Trường Đông Bắc Hạ Long năm 2023",
};

let ok=0, fail=0;
for(const [filename, newAlt] of Object.entries(FIXES)){
  // search media by filename
  const list = await wpReq("GET", `/wp-json/wp/v2/media?search=${encodeURIComponent(filename.replace(/\.[^.]+$/, ""))}&per_page=5`);
  if(!Array.isArray(list)||!list[0]){
    console.log(`⚠ NOT FOUND: ${filename}`);
    fail++;
    continue;
  }
  const att = list.find(a=>a.slug&&filename.startsWith(a.slug.replace(/-\d+$/,''))) || list[0];
  const res = await wpReq("POST", `/wp-json/wp/v2/media/${att.id}`, {alt_text: newAlt});
  if(res.id){
    console.log(`✓ id=${att.id} ${filename.slice(0,40)} → "${newAlt.slice(0,50)}..."`);
    ok++;
  } else {
    console.log(`✗ id=${att.id} ${filename.slice(0,40)}: ${JSON.stringify(res).slice(0,100)}`);
    fail++;
  }
}
console.log(`\n✓ ${ok} updated, ${fail} failed`);

const TODAY="2026-06-10"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-ALT-NO-SVC-LOC-${TODAY},seo_fix,ALT_NO_SERVICE_OR_LOCATION — 11 images,https://thongtaccongquangninh.com/,,done,medium,,,,,update alt text via WP media REST API,tools/fix_image_alt.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
