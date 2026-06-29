import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpGet(path) {
  return new Promise((res,rej)=>{
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
  });
}

const POSTS = [
  {id:2687, slug:"hut-be-phot-nha-hang-quang-ninh-2026"},
  {id:2708, slug:"hut-be-phot-khu-nha-tro-quang-ninh-2026"},
  {id:2559, slug:"hut-ham-cau-quang-ninh-2026"},
  {id:2702, slug:"hut-be-phot-khach-san-quang-ninh-2026"},
  {id:2476, slug:"nao-vet-ho-ga-quang-ninh"},
];

for (const p of POSTS) {
  const r = await wpGet(`/wp-json/wp/v2/posts/${p.id}?context=edit&_fields=content`);
  const raw = r.content?.raw ?? "";
  const h2s = [...raw.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g,''));
  const hasNguyenNhan = h2s.some(h => /nguyên\s*nhân/i.test(h));
  console.log(`\n${p.slug} (id=${p.id})`);
  console.log(`  H2 has "nguyên nhân": ${hasNguyenNhan ? "✓ YES" : "✗ NO"}`);
  console.log(`  All H2s:`);
  h2s.forEach((h, i) => console.log(`    [${i}] "${h}"`));
}
