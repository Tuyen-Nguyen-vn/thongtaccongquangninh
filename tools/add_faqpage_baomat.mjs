/**
 * Thêm FAQPage JSON-LD cho /chinh-sach-bao-mat/ (id=282).
 * Dùng 5 Q&A từ Section 11 đã có trong content.
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const PAGE_ID = 282;

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function req(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return req(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

const FAQ_JSON_LD = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Thông tin tôi cung cấp khi gọi hotline có bị lưu không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Khi bạn gọi hotline 0963.953.533 hoặc 0931.156.756, nhân viên kỹ thuật sẽ ghi nhận tên, địa chỉ và mô tả sự cố để điều phối thợ. Thông tin này được lưu trong hệ thống nội bộ và chỉ dùng cho mục đích phục vụ ca dịch vụ của bạn. Sau khi hoàn thành và hết thời hạn bảo hành, thông tin được xóa hoặc ẩn danh. Chúng tôi không ghi âm cuộc gọi mà không thông báo trước và không chia sẻ thông tin này ra ngoài tổ chức."
      }
    },
    {
      "@type": "Question",
      "name": "Tôi có thể yêu cầu xóa thông tin cá nhân không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Có. Bạn có quyền yêu cầu xóa toàn bộ thông tin cá nhân sau khi dịch vụ đã hoàn tất và hết thời hạn bảo hành. Để thực hiện, liên hệ trực tiếp qua hotline 0963.953.533 hoặc nhắn Zalo và nêu rõ yêu cầu. Chúng tôi cam kết xử lý trong vòng 5 ngày làm việc kể từ khi nhận được yêu cầu hợp lệ."
      }
    },
    {
      "@type": "Question",
      "name": "Website có dùng Google Analytics không và dữ liệu đó đi đâu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Có. Website sử dụng Google Analytics để đo lường lượt truy cập, thời gian xem trang và nguồn traffic. Dữ liệu này ở dạng tổng hợp, không bao gồm tên, số điện thoại hay địa chỉ cá nhân. Bạn có thể tắt Google Analytics bằng cách cài đặt trình duyệt hoặc dùng tiện ích mở rộng Google Analytics Opt-out."
      }
    },
    {
      "@type": "Question",
      "name": "Nếu tôi nhắn Zalo để đặt lịch, thông tin có an toàn không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Khi bạn nhắn Zalo, cuộc trò chuyện được mã hóa theo tiêu chuẩn của nền tảng Zalo. Về phía Môi Trường Đô Thị Số 1 Quảng Ninh, chỉ nhân viên kỹ thuật phụ trách ca dịch vụ mới có quyền xem nội dung. Chúng tôi không chụp màn hình hay sao lưu nội dung Zalo ra ngoài thiết bị làm việc nội bộ."
      }
    },
    {
      "@type": "Question",
      "name": "Chính sách này áp dụng cho cư dân ngoài Quảng Ninh không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Có. Chính sách bảo mật này áp dụng cho tất cả khách hàng liên hệ với Môi Trường Đô Thị Số 1 Quảng Ninh, bao gồm cư dân tại Hải Phòng và các tỉnh lân cận. Thông tin cá nhân của bạn đều được bảo vệ theo cùng một tiêu chuẩn, không phân biệt địa bàn."
      }
    }
  ]
}
</script>`;

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await req(auth, {jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"faqpage-baomat",version:"1"}}});

// Inject trước byline author
const BYLINE = '<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao ttcqn-author-byline"}';

console.log("Injecting FAQPage JSON-LD...");
const r = await ability(auth, "content/patch-page", {
  id: PAGE_ID,
  find: BYLINE,
  replace: FAQ_JSON_LD + "\n\n" + BYLINE,
});
const t = r.d?.result?.content?.[0]?.text ?? "";
console.log(t.includes("success") ? "✓ FAQPage injected" : "✗ " + t.slice(0,150));

// Verify schema on live page
await new Promise(rr => setTimeout(rr, 1500));
await new Promise((res, rej) => {
  const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/chinh-sach-bao-mat/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const r2=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    const hasFAQ = d.includes('"@type": "FAQPage"') || d.includes('"@type":"FAQPage"');
    const title = (d.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||"";
    console.log(`\nLive check:`);
    console.log(`  FAQPage schema: ${hasFAQ?"✓ present":"✗ missing"}`);
    console.log(`  <title>: "${title.trim()}" (${[...title.trim()].length} chars)`);
    res();
  })});
  r2.on("error",rej);r2.setTimeout(15000,()=>r2.destroy(new Error("t")));r2.end();
});
