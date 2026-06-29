import https from "node:https";
const D="thongtaccongquangninh.com", IP="103.57.220.210";
function get(path){return new Promise((resolve)=>{const req=https.request({hostname:IP,port:443,servername:D,path,method:"GET",headers:{Host:D,"User-Agent":"WP-Agent/1.0"},rejectUnauthorized:false},(res)=>{let d="";res.on("data",c=>d+=c);res.on("end",()=>resolve({s:res.statusCode,d}));});req.on("error",e=>resolve({s:0,d:String(e)}));req.setTimeout(30000,()=>req.destroy());req.end();});}
const urls = ["/","/thong-tac-cong-bai-chay/","/bang-gia/","/cam-nang-thong-tac-cong-tai-ha-long/"];
for(const u of urls){
  const r = await get(u+"?nocache="+Date.now());
  const robots = [...r.d.matchAll(/<meta[^>]*name=["']robots["'][^>]*>/gi)].map(m=>m[0]);
  const hasMIP = /max-image-preview\s*:\s*large/i.test(r.d);
  console.log(`\n[${r.s}] ${u}`);
  console.log("  robots meta:", robots.join(" || ")||"(none)");
  console.log("  max-image-preview:large =>", hasMIP);
}
