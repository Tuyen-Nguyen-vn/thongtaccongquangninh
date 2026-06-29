/**
 * Set rank_math_title + rank_math_description cho page 296
 * via WP REST /wp/v2/pages/{id} với meta payload
 * (Fallback khi rankmath/v1/updateMeta không persist)
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpReq(method, path, body) {
  return new Promise((res,rej)=>{
    const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});
    r.on("error",rej);r.setTimeout(25000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();
  });
}

const PAGE_ID = 296;
const TITLE = "Thông Tắc Cống Hạ Long 24/7 – Đến Nhanh 15 Phút | 0963.953.533";
const DESC  = "Thông tắc cống Hạ Long 24/7 – xe bồn cao áp đến nhanh 15 phút, xử lý đúng điểm nghẽn, không đục phá. Phục vụ nhà hàng, khách sạn, nhà dân. Gọi 0963.953.533.";

// Method 1: WP REST meta via pages endpoint
const r1 = await wpReq("POST", `/wp-json/wp/v2/pages/${PAGE_ID}`, {
  meta: {
    rank_math_title: TITLE,
    rank_math_description: DESC,
    rank_math_focus_keyword: "thông tắc cống Hạ Long",
  }
});
console.log(`Method 1 (WP REST meta): ${r1.s}`);
if (r1.s === 200) {
  const m = r1.d?.meta;
  console.log(`  rank_math_title: "${(m?.rank_math_title||'').slice(0,60)}"`);
  console.log(`  rank_math_description: "${(m?.rank_math_description||'').slice(0,80)}"`);
}

// Method 2: WP REST title (post_title)
// Rank Math đôi khi dùng WP title khi rank_math_title không set
// WP title hiện tại đã ok (60 chars), không cần update

// Verify via GET
await new Promise(rr=>setTimeout(rr,500));
const vr = await wpReq("GET", `/wp-json/wp/v2/pages/${PAGE_ID}?context=edit&_fields=meta,title`);
const rmT = vr.d?.meta?.rank_math_title ?? "(not set)";
const rmD = vr.d?.meta?.rank_math_description ?? "(not set)";
console.log(`\nVerify GET:`);
console.log(`  WP title: "${vr.d?.title?.raw?.slice(0,70)}"`);
console.log(`  RM title (${[...rmT].length}): "${rmT.slice(0,60)}"`);
console.log(`  RM desc  (${[...rmD].length}): "${rmD.slice(0,80)}"`);

if (rmT === TITLE) {
  console.log("\n✓ rank_math_title set OK");
} else {
  console.log("\n⚠ rank_math_title still not persisting — need plugin approach");
}
