import https from "node:https";
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";

function fetchLive(slug){return new Promise((res,rej)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
  r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
});}

const html=await fetchLive("gioi-thieu");

// Check for new headings we added
const checks=[
  "Phạm vi dịch vụ",
  "Cam kết chất lượng",
  "Thiết bị sử dụng",
];
console.log("=== Content check in live HTML ===");
for(const c of checks){
  console.log(`"${c}": ${html.includes(c)?"FOUND":"NOT FOUND"}`);
}

// Where is <main> and where does our content appear relative to it?
const mainStart=html.indexOf("<main");
const mainEnd=html.lastIndexOf("</main>");
console.log(`\n<main> at index ${mainStart}, </main> at ${mainEnd}`);

// Check if "Phạm vi dịch vụ" is inside <main>
const phamViIdx=html.indexOf("Phạm vi dịch vụ");
console.log(`"Phạm vi dịch vụ" at index ${phamViIdx}`);
if(phamViIdx>0){
  console.log(`  Inside <main>: ${phamViIdx>mainStart&&phamViIdx<mainEnd}`);
}

// Show last 800 chars of main content
if(mainEnd>0){
  console.log("\nLast 800 chars before </main>:");
  console.log(html.slice(Math.max(0,mainEnd-800),mainEnd).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim());
}
