/**
 * Fetch live HTML for specific URLs and check meta description
 */
import https from "node:https";

const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";

function fetchPage(slug){
  return new Promise((res,rej)=>{
    const path = slug === "/" ? "/" : `/${slug}/`;
    const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",
      headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
    r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("timeout")));r.end();
  });
}

const CHECKS = [
  "dau-hieu-be-phot-bi-day-2026",
  "hut-be-phot-quang-ninh",
  "thong-tac-cong-quang-ninh",
  "thong-tac-cong-chung-cu-ha-long",
  "thong-tac-cong-ngo-nho-ha-long",
  "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
];

for(const slug of CHECKS){
  try{
    const html = await fetchPage(slug);
    const m = html.match(/<meta\s+name="description"\s+content="([^"]*?)"/i)
           || html.match(/<meta\s+content="([^"]*?)"\s+name="description"/i);
    const desc = m?.[1] || "";
    const len = [...desc].length;
    const status = len >= 150 && len <= 160 ? "✓" : (len < 150 ? "⚠ SHORT" : "⚠ LONG");
    console.log(`${status} ${slug}: len=${len}`);
    if(desc) console.log(`  "${desc}"`);
  }catch(e){
    console.log(`✗ ${slug}: ${e.message}`);
  }
}
