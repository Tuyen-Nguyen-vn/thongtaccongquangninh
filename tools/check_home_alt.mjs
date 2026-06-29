/**
 * Find images with EMPTY_ALT on homepage (same logic as audit)
 */
import https from "node:https";

const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";

const html = await new Promise((res,rej)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:"/",method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
  r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
});

// Extract main content area
function mainContentHtml(html){
  const patterns=[
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class=["'][^"']*\bentry-content\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];
  for(const re of patterns){
    const m=html.match(re);
    if(m?.[1]&&m[1].length>300) return m[1];
  }
  return html;
}

const main = mainContentHtml(html);
const imgRe=/<img\b([^>]*)>/gi;
let m;
const issues=[];
while((m=imgRe.exec(main))!==null){
  const attrs=m[1];
  const src=((attrs.match(/\bsrc=["']([^"']+)["']/i)||[])[1])||"";
  const alt=(attrs.match(/\balt=["']([^"']*)["']/i)||[])[1]??null;
  if(!src||/data:image/i.test(src)) continue;
  const filename=src.split("/").pop().split("?")[0];
  // Skip decorative icons
  if(alt!==null&&alt.trim()===""&&/\/assets\/(?:service-icons|stats-icons)\//i.test(src)) continue;
  // Check EMPTY_ALT
  if(alt===null){ issues.push({status:"NO_ALT_ATTR",src:filename}); }
  else if(alt.trim()===""){ issues.push({status:"EMPTY_ALT",src:filename,alt}); }
}

console.log(`Total EMPTY_ALT + NO_ALT issues on homepage: ${issues.length}`);
for(const i of issues){
  console.log(`  [${i.status}] src=...${i.src}`);
}
