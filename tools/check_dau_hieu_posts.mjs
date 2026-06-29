import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const env={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}return env;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpGet(path) {
  return new Promise((res,rej)=>{
    const opts={hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",
      path:"/wp-json"+path,method:"GET",
      headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"d/1"},rejectUnauthorized:false};
    const req=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    req.on("error",rej);req.setTimeout(15000,()=>req.destroy(new Error("t")));req.end();
  });
}

for (const slug of ["dau-hieu-be-phot-bi-day-2026", "dau-hieu-be-phot-can-hut"]) {
  const r = await wpGet(`/wp/v2/posts?slug=${slug}&context=edit`);
  const post = Array.isArray(r) ? r[0] : r;
  const id = post?.id;
  const wpTitle = post?.title?.rendered || "";
  const raw = post?.content?.raw || "";
  const rmTitle = post?.meta?.rank_math_title || "";
  const rmDesc = post?.meta?.rank_math_description || "";
  // Count H1 in raw content (in Gutenberg block)
  const h1s = [...raw.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  // Count live H1 on rendered page
  console.log(`\n${slug} (id=${id})`);
  console.log(`  WP post_title: "${wpTitle}" (${[...wpTitle].length} chars)`);
  console.log(`  RM title meta: "${rmTitle}" (${[...rmTitle].length} chars)`);
  console.log(`  RM desc meta: "${rmDesc}" (${[...rmDesc].length} chars)`);
  console.log(`  H1 blocks in raw: ${h1s.length}`);
  h1s.forEach((m,i)=>console.log(`    H1[${i}]: "${m[1].replace(/<[^>]+>/g,"").trim().slice(0,80)}"`));
}

// Also check live HTML for both posts
for (const path of ["/dau-hieu-be-phot-bi-day-2026/","/dau-hieu-be-phot-can-hut/"]) {
  const html = await new Promise((res,rej)=>{
    const opts={hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",
      path,method:"GET",headers:{Host:"thongtaccongquangninh.com","User-Agent":"check/1"},rejectUnauthorized:false};
    const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
    r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
  });
  const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.trim()||"";
  const desc=(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)||[])[1]||"";
  const h1s=[...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  console.log(`\nLIVE ${path}`);
  console.log(`  <title>: "${title.replace(/<[^>]+>/g,"")}"`);
  console.log(`  Title len: ${[...(title.replace(/<[^>]+>/g,""))].length}`);
  console.log(`  <meta desc>: "${desc.slice(0,100)}" (${[...desc].length} chars)`);
  console.log(`  H1 count: ${h1s.length}`);
  h1s.forEach((m,i)=>console.log(`    H1[${i}]: "${m[1].replace(/<[^>]+>/g,"").trim().slice(0,80)}"`));
}
