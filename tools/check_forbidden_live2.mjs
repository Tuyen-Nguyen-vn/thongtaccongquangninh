import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
const FORBIDDEN=['chuyên nghiệp','uy tín','hàng đầu','tận tâm','hy vọng bài viết hữu ích'];
const html=await new Promise((res,rej)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:"/thong-tac-chau-rua-quang-ninh/",method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});
const text=html.replace(/<[^>]+>/g," ").replace(/\s+/g," ");
let found=0;
for(const fw of FORBIDDEN){
  const m=[...text.matchAll(new RegExp(fw,'gi'))];
  if(m.length>0){console.log(`⚠ "${fw}" x${m.length}`);found++;}
}
if(!found) console.log("✓ Không còn từ cấm nào trên trang live");
