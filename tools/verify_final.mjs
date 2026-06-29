import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
async function check(slug){
  return new Promise((res,rej)=>{
    const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
      headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
      const m=d.match(/<meta\s+name="description"\s+content="([^"]*?)"/i);
      const desc=m?.[1]||"";
      const len=[...desc].length;
      const hasFW=/hàng đầu/i.test(d.replace(/<[^>]+>/g,""));
      res({slug,len,ok:len>=150&&len<=160,hasFW,desc:desc.slice(0,60)});
    })});
    r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
  });
}

const CHECKS=["thong-tac-cong-24-7-quang-ninh","thong-tac-cong-khan-cap-quang-ninh-2026","thong-tac-chau-rua-quang-ninh"];
for(const slug of CHECKS){
  const {len,ok,hasFW,desc}=await check(slug);
  const metaStatus=ok?"✓ meta":"⚠ meta";
  const fwStatus=hasFW?"⚠ FORBIDDEN_WORD":"✓ no-fw";
  console.log(`${metaStatus}(${len}) ${fwStatus} — ${slug}`);
  if(desc) console.log(`  "${desc}..."`);
}
