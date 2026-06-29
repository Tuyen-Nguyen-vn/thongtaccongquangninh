/**
 * Debug: đọc _rank_math_title từ WP REST + fetch <title> từ live page
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const PAGE_ID = 282;
function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH); const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function httpsGet(opts) {
  return new Promise((res,rej)=>{
    const r=https.request(opts, resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}});});
    r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
  });
}

// 1. REST API: get page meta (context=edit shows private meta)
console.log("=== WP REST /wp/v2/pages/282?context=edit ===");
const pr = await httpsGet({
  hostname: SERVER_IP, port: 443, servername: WP_HOST,
  path: `/wp-json/wp/v2/pages/${PAGE_ID}?context=edit`,
  method: "GET",
  headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "debug/1" },
  rejectUnauthorized: false
});
const pageData = typeof pr.d === "object" ? pr.d : {};
console.log("  title.rendered:", pageData?.title?.rendered?.slice(0,80));
console.log("  meta keys:", Object.keys(pageData?.meta ?? {}).join(", ") || "(none visible)");
const rm = pageData?.meta ?? {};
console.log("  _rank_math_title:", rm._rank_math_title ?? "(not in REST)");
console.log("  rank_math_title:", rm.rank_math_title ?? "(not in REST)");

// 2. Fetch live <title> tag
console.log("\n=== Live <title> from thongtaccongquangninh.com/chinh-sach-bao-mat/ ===");
const lr = await httpsGet({
  hostname: SERVER_IP, port: 443, servername: WP_HOST,
  path: "/chinh-sach-bao-mat/",
  method: "GET",
  headers: { Host: WP_HOST, "User-Agent": "debug/1" },
  rejectUnauthorized: false
});
const html = typeof lr.d === "string" ? lr.d : JSON.stringify(lr.d);
const tm = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
const liveTitle = tm ? tm[1].replace(/\s+/g," ").trim() : "(not found)";
console.log(`  <title>: "${liveTitle}"`);
console.log(`  length: ${[...liveTitle].length} chars`);
