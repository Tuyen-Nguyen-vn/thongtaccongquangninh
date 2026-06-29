import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function fetchLive(slug){return new Promise((res,rej)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
  r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
});}

const html=await fetchLive("gioi-thieu");

// Count how many <main> and </main> occurrences
const mains=(html.match(/<main\b/gi)||[]).length;
const mainEnds=(html.match(/<\/main>/gi)||[]).length;
console.log(`<main> count=${mains}, </main> count=${mainEnds}`);

// Find all </main> positions
let pos=0,ends=[];
while((pos=html.indexOf("</main>",pos))>-1){ends.push(pos);pos++;}
console.log(`</main> positions: ${ends.join(", ")}`);

// getMainHtml lazy match
const lazyMatch=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
console.log(`Lazy match captures: ${lazyMatch?.[1]?.length||0} chars (first </main> at index ${ends[0]})`);

// Greedy match (full main content)
const greedyMatch=html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i);
console.log(`Greedy match captures: ${greedyMatch?.[1]?.length||0} chars`);

// Count words both ways
function stripCount(text){
  return text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim().split(/\s+/).filter(Boolean).length;
}
if(lazyMatch?.[1]) console.log(`Lazy word count: ${stripCount(lazyMatch[1])}`);
if(greedyMatch?.[1]) console.log(`Greedy word count: ${stripCount(greedyMatch[1])}`);

// Check: does our new content appear in the lazy match?
const lazyStr=lazyMatch?.[1]||"";
console.log(`\nNew content in lazy match:`);
console.log(`  "Phạm vi dịch vụ": ${lazyStr.includes("Phạm vi dịch vụ")}`);
console.log(`  "Cam kết chất lượng": ${lazyStr.includes("Cam kết chất lượng")}`);
console.log(`  "Thiết bị sử dụng": ${lazyStr.includes("Thiết bị sử dụng")}`);
