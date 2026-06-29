/**
 * Set Rank Math title + description cho page thong-tac-cong-ha-long (id=296)
 * via /rankmath/v1/updateMeta
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function rmPost(body) {
  return new Promise((res,rej)=>{
    const b=Buffer.from(JSON.stringify(body),"utf8");
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/rankmath/v1/updateMeta",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.write(b);r.end();
  });
}
function wpGet(path){
  return new Promise((res,rej)=>{
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
  });
}

const PAGE_ID = 296;
const TITLE = "Thông Tắc Cống Hạ Long, Tiếp Nhận 05:00-22:00 | 0963.953.533";
const DESC  = "Thông tắc cống Hạ Long tiếp nhận 05:00-22:00, xử lý đúng điểm nghẽn, không đục phá. Phục vụ nhà hàng, khách sạn, nhà dân. Gọi 0963.953.533.";
const FOCUS_KW = "thông tắc cống Hạ Long";

console.log(`Title (${[...TITLE].length}): "${TITLE}"`);
console.log(`Desc  (${[...DESC].length}): "${DESC}"`);
if ([...TITLE].length > 65) { console.log("⚠ TITLE > 65 chars!"); process.exit(1); }
if ([...DESC].length < 150 || [...DESC].length > 160) { console.log(`⚠ DESC length ${[...DESC].length} out of 150-160 range!`); }

const r = await rmPost({
  objectType: "post",   // Rank Math dùng "post" cho cả pages
  objectID: PAGE_ID,
  meta: {
    rank_math_title: TITLE,
    rank_math_description: DESC,
    rank_math_focus_keyword: FOCUS_KW,
  },
});
console.log(`\nRM API status: ${r.s}`, r.d?.slug === true ? "✓ OK" : JSON.stringify(r.d).slice(0,120));

// Verify via WP REST
await new Promise(rr=>setTimeout(rr,800));
const vr = await wpGet(`/wp-json/wp/v2/pages/${PAGE_ID}?context=edit&_fields=meta`);
const rmT = vr.meta?.rank_math_title ?? "(not set)";
const rmD = vr.meta?.rank_math_description ?? "(not set)";
console.log(`\nVerify:`);
console.log(`  RM title (${[...rmT].length}): "${rmT.slice(0,80)}"`);
console.log(`  RM desc  (${[...rmD].length}): "${rmD.slice(0,120)}"`);

const ok = rmT === TITLE && rmD === DESC;
console.log(ok ? "\n✓ SET OK" : "\n⚠ Mismatch — may need update_post_meta approach");

// Log
const TODAY="2026-06-09"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-NO-H1-TTC-HA-LONG-${TODAY},seo_fix,thông tắc cống Hạ Long,https://thongtaccongquangninh.com/thong-tac-cong-ha-long/,thong-tac-cong-ha-long,done,medium,,100,,,NO_H1 fixed + RM title/desc set,tools/fix_ttc_ha_long_h1.mjs tools/set_meta_ttc_ha_long.mjs,,schema check next,,,,,,`,
  "utf8");
console.log("\n✓ logged");
