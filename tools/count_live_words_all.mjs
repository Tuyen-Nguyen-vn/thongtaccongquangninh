import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
async function getLiveWords(slug){
  return new Promise((res,rej)=>{
    const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
      headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
      // Same mainContentHtml logic as audit
      const pats=[/<main\b[^>]*>([\s\S]*?)<\/main>/i,/<article\b[^>]*>([\s\S]*?)<\/article>/i];
      let main=d;
      for(const re of pats){const m=d.match(re);if(m?.[1]&&m[1].length>300){main=m[1];break;}}
      const w=(main.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<[^>]+>/g," ").match(/\b\w+\b/g)||[]).length;
      res(w);
    })});
    r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
  });
}

const SLUGS=[
  "blog","chinh-sach-bao-mat","dieu-khoan-dich-vu","gioi-thieu","lien-he","nguyen-song-hao",
  "hoa-chat-tu-thong-cong",
];

for(const slug of SLUGS){
  const w=await getLiveWords(slug);
  const status=w>=2500?"✓ OK":w>=2000?"⚠ BELOW_TARGET":"✗ LOW";
  console.log(`${status} ${slug}: ${w}w`);
}
