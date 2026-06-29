import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
const html=await new Promise((res,rej)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:"/thong-tac-chau-rua-quang-ninh/",method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});
const text=html.replace(/<[^>]+>/g," ").replace(/\s+/g," ");
const matches=[...text.matchAll(/hàng đầu/gi)];
console.log(`Live page "hàng đầu": ${matches.length} lần`);
for(const m of matches) console.log(`  "...${text.slice(Math.max(0,m.index-40),m.index+50)}..."`);
