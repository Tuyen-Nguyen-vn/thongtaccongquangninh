import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const env={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}return env;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpGet(path){
  return new Promise((res,rej)=>{
    const opts={hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",
      path:"/wp-json"+path,method:"GET",
      headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"d/1"},rejectUnauthorized:false};
    const req=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    req.on("error",rej);req.setTimeout(15000,()=>req.destroy(new Error("t")));req.end();
  });
}

// Check homepage content - try different slugs and page IDs
for (const path of ["/wp/v2/pages?per_page=5&status=publish&context=edit"]) {
  const r = await wpGet(path);
  const pages = Array.isArray(r) ? r : [r];
  for (const pg of pages) {
    const raw = pg?.content?.raw || "";
    const hasYT = raw.includes("ytimg") || raw.includes("EDJGYWmHqB4") || raw.includes("ttcqn-yt-facade");
    if (hasYT || pg?.slug === "trang-chu" || pg?.id === 1) {
      console.log(`\nPage id=${pg?.id} slug="${pg?.slug}"`);
      console.log(`  ytimg in content: ${raw.includes("ytimg")}`);
      if (raw.includes("ytimg")) {
        const idx = raw.indexOf("ytimg");
        console.log(`  Context: ${raw.slice(Math.max(0,idx-120),idx+200).replace(/\n/g," ")}`);
      }
    }
  }
}

// Also check the Home Emergency Renderer plugin for ytimg
// Check via WP JSON if we can see plugin list
const plugins = await wpGet("/wp/v2/plugins?context=edit&per_page=50");
if (Array.isArray(plugins)) {
  const homePlugin = plugins.find(p => p.plugin?.includes("home") || p.name?.includes("Home"));
  if (homePlugin) console.log("\nHome plugin:", homePlugin.plugin, homePlugin.status);
}
