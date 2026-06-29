import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function fetchLive(slug){return new Promise((res,rej)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
  r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
});}
function stripTagsAndShell(html){
  let h=html;
  h=h.replace(/<script\b[\s\S]*?<\/script>/gi," ");
  h=h.replace(/<style\b[\s\S]*?<\/style>/gi," ");
  h=h.replace(/<noscript\b[\s\S]*?<\/noscript>/gi," ");
  h=h.replace(/<header\b[\s\S]*?<\/header>/gi," ");
  h=h.replace(/<footer\b[\s\S]*?<\/footer>/gi," ");
  h=h.replace(/<nav\b[\s\S]*?<\/nav>/gi," ");
  h=h.replace(/<aside\b[\s\S]*?<\/aside>/gi," ");
  return h;
}
function getMainHtml(html){
  const candidates=[/<main\b[^>]*>([\s\S]*?)<\/main>/i,/<article\b[^>]*>([\s\S]*?)<\/article>/i];
  for(const re of candidates){const m=html.match(re);if(m&&m[1]&&m[1].length>500)return m[1];}
  return stripTagsAndShell(html);
}
function countWords(text){
  return text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim().split(/\s+/).filter(Boolean).length;
}

const SLUGS=["gioi-thieu","lien-he","nguyen-song-hao"];
for(const slug of SLUGS){
  const html=await fetchLive(slug);
  const main=getMainHtml(html);
  const w=countWords(main);
  const status=w>=2500?"✓ OK":w>=2000?"⚠ BELOW_TARGET":"✗ LOW";
  console.log(`${status} ${slug}: ${w}w (audit-method)`);
}
