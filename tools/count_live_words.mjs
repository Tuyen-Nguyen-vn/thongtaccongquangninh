/**
 * Count words on live page using same method as audit tool
 */
import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";

async function fetchLive(slug){
  return new Promise((res,rej)=>{
    const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
      headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
  });
}

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

function countWords(t){
  const noScript=t.replace(/<script[\s\S]*?<\/script>/gi," ");
  return (noScript.replace(/<[^>]+>/g," ").match(/\b\w+\b/g)||[]).length;
}

// Also show H2 headings on live page
function extractH2s(html){
  return [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m=>m[1].replace(/<[^>]+>/g,"").trim());
}

const html=await fetchLive("hoa-chat-tu-thong-cong");
const main=mainContentHtml(html);
const words=countWords(main);
const h2s=extractH2s(main);
console.log("Live main content words:",words);
console.log("H2 headings on live page:");
for(const h of h2s) console.log(" -",h);
