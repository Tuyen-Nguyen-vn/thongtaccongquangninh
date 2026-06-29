import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function fetchMeta(slug){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{const m=d.match(/<meta\s+name="description"\s+content="([^"]*?)"/i)||d.match(/<meta\s+content="([^"]*?)"\s+name="description"/i);res(m?.[1]||"")})});r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();});}
for(const slug of ["gia-thong-tac-cong-quang-ninh-2026","hut-be-phot-khu-cong-nghiep-quang-ninh-2026"]){
  const desc=await fetchMeta(slug);
  const len=[...desc].length;
  console.log(`${len>=150&&len<=160?"✓":"⚠ SHORT"} ${slug}: len=${len}`);
  if(desc) console.log(`  "${desc}"`);
}
