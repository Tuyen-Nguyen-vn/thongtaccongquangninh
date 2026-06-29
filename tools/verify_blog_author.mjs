import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
async function fetchMeta(path){
  return new Promise((res,rej)=>{
    const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",
      headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
      const m=d.match(/<meta\s+name="description"\s+content="([^"]*?)"/i);
      res(m?.[1]||"");
    })});
    r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
  });
}
for(const [label,path] of [["blog","/blog/"],["nguyen-song-hao","/nguyen-song-hao/"]]) {
  const desc=await fetchMeta(path);
  const len=[...desc].length;
  console.log(`${len>=150&&len<=160?"✓":"⚠ SHORT"} ${label}: len=${len}`);
  if(desc) console.log(`  "${desc}"`);
}
