import https from "node:https";
const MCP_HOST="onehost-wphn022606.000nethost.com",MCP_PORT=2023,MCP_PATH="/api/mcp";
const TOKEN="sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
let sessionId=null,msgId=1;
function parseSSE(t){const r=[];for(const l of t.split("\n")){if(l.startsWith("data: ")){const x=l.slice(6).trim();if(x==="[DONE]")continue;try{r.push(JSON.parse(x));}catch{}}}return r;}
function mcpPost(method,params){return new Promise((resolve,reject)=>{const body=JSON.stringify({jsonrpc:"2.0",id:msgId++,method,params:params??{}});const headers={Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":Buffer.byteLength(body)};if(sessionId)headers["Mcp-Session-Id"]=sessionId;const req=https.request({hostname:MCP_HOST,port:MCP_PORT,path:MCP_PATH,method:"POST",headers,rejectUnauthorized:false},(res)=>{if(res.headers["mcp-session-id"])sessionId=res.headers["mcp-session-id"];let d="";res.on("data",c=>d+=c);res.on("end",()=>{const ct=res.headers["content-type"]??"";if(ct.includes("text/event-stream"))resolve({status:res.statusCode,events:parseSSE(d),raw:d});else{try{resolve({status:res.statusCode,json:JSON.parse(d)});}catch{resolve({status:res.statusCode,raw:d});}}});});req.on("error",reject);req.setTimeout(90000,()=>req.destroy(new Error("timeout")));req.write(body);req.end();});}
function getResult(r){return r.json?.result??r.events?.find(e=>e.result!==undefined)?.result;}
function extractText(r){const res=getResult(r);if(!res)return "(none)";if(res?.isError)return "ERR: "+JSON.stringify(res.content??res);return (Array.isArray(res?.content)?res.content.map(c=>c.text??"").join(""):null)??JSON.stringify(res);}
await mcpPost("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"mbbs",version:"1"}});
await mcpPost("notifications/initialized",{});
async function call(n,a){return extractText(await mcpPost("tools/call",{name:n,arguments:a}));}

const OLD_FULL = "Môi Trường Đô Thị Số 1 Quảng Ninh";
const OLD_SHORT = "Môi Trường Đô Thị Số 1";
const OLD_H2_SPLIT = "Môi Trường Đô Thị<span>Số 1 Quảng Ninh</span>";
const OLD_GBP = "Môi Trường Đô Thị Số 1 Quảng Ninh (Thành Phố Hạ Long)";
const NEW_BRAND = "Thông Tắc Cống Quảng Ninh";
const NEW_H2_SPLIT = "Thông Tắc Cống<span>Quảng Ninh</span>";

let totalMiss = 0;

// Generic brand replace: h2-split → full → short
function brandReplace(code, label) {
  let c = code;
  const before = (c.match(new RegExp(OLD_FULL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length
    + (c.match(new RegExp(OLD_SHORT.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length;
  // step 1: h2 split variant
  c = c.replaceAll(OLD_H2_SPLIT, NEW_H2_SPLIT);
  // step 2: full "...Quảng Ninh"
  c = c.replaceAll(OLD_FULL, NEW_BRAND);
  // step 3: short (remaining "Số 1" without city)
  c = c.replaceAll(OLD_SHORT, NEW_BRAND);
  const after = (c.match(new RegExp(OLD_FULL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length
    + (c.match(new RegExp(OLD_SHORT.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length;
  console.log(`  [${label}] brand hits: ${before} → ${after}`);
  if(after>0){console.error(`  WARN: ${after} hits remain in ${label}`);totalMiss+=after;}
  return c;
}

// ── 1. gbp_data.json ──────────────────────────────────────────────────────────
const P_GBP = "/public_html/wp-content/plugins/ttcqn-doorway-schema/gbp_data.json";
let gbp = await call("read_file",{path:P_GBP});
// Handle "(Thành Phố Hạ Long)" variant first
gbp = gbp.replaceAll(OLD_GBP, NEW_BRAND);
gbp = brandReplace(gbp, "gbp_data.json");
const w1 = await call("write_file",{path:P_GBP,content:gbp});
console.log("write gbp_data.json:", w1.slice(0,80));

// ── 2. home-emergency-renderer.php (L2157 name check + full pass) ─────────────
const P_HER = "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php";
let her = await call("read_file",{path:P_HER});
her = brandReplace(her, "home-emergency-renderer.php");
const w2 = await call("write_file",{path:P_HER,content:her});
console.log("write home-emergency-renderer.php:", w2.slice(0,80));

// ── 3. shared-footer.php ──────────────────────────────────────────────────────
const P_FOOTER = "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/shared-footer.php";
let footer = await call("read_file",{path:P_FOOTER});
footer = brandReplace(footer, "shared-footer.php");
const w3 = await call("write_file",{path:P_FOOTER,content:footer});
console.log("write shared-footer.php:", w3.slice(0,80));

// ── 4. scroll-guide-assistant.php ─────────────────────────────────────────────
const P_SGA = "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/includes/scroll-guide-assistant.php";
let sga = await call("read_file",{path:P_SGA});
sga = brandReplace(sga, "scroll-guide-assistant.php");
const w4 = await call("write_file",{path:P_SGA,content:sga});
console.log("write scroll-guide-assistant.php:", w4.slice(0,80));

// ── 5. page-home-direct.php ───────────────────────────────────────────────────
const P_PHD = "/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php";
let phd = await call("read_file",{path:P_PHD});
phd = brandReplace(phd, "page-home-direct.php");
const w5 = await call("write_file",{path:P_PHD,content:phd});
console.log("write page-home-direct.php:", w5.slice(0,80));

// ── 6. ttcqn-seo-contact-block.php ───────────────────────────────────────────
const P_CONTACT = "/public_html/wp-content/plugins/ttcqn-seo-contact-block/ttcqn-seo-contact-block.php";
let contact = await call("read_file",{path:P_CONTACT});
contact = brandReplace(contact, "seo-contact-block.php");
const w6 = await call("write_file",{path:P_CONTACT,content:contact});
console.log("write seo-contact-block.php:", w6.slice(0,80));

// ── 7. ttcqn-qn-service-landing.php ──────────────────────────────────────────
const P_QS = "/public_html/wp-content/plugins/ttcqn-qn-service-landing/ttcqn-qn-service-landing.php";
let qs = await call("read_file",{path:P_QS});
qs = brandReplace(qs, "qn-service-landing.php");
const w7 = await call("write_file",{path:P_QS,content:qs});
console.log("write qn-service-landing.php:", w7.slice(0,80));

// ── 8. ttcqn-meta-desc-fix.php — page 62 meta description ────────────────────
const P_MD = "/public_html/wp-content/plugins/ttcqn-meta-desc-fix/ttcqn-meta-desc-fix.php";
let md = await call("read_file",{path:P_MD});
// Find and replace the 62 => desc entry
const OLD_62_DESC_PREFIX = "62 => 'Môi Trường Đô Thị Số 1";
if(!md.includes(OLD_62_DESC_PREFIX)){
  console.error("MISS: meta-desc-fix 62 entry not found");totalMiss++;
} else {
  // Replace the whole entry: find 62 => '...', (up to next line)
  md = md.replace(/62 => 'Môi Trường[^']*'/,
    "62 => 'Dịch vụ thông tắc cống, hút bể phốt, nạo vét hố ga tại Quảng Ninh 24/7 – Thông Tắc Cống Quảng Ninh. Có mặt 15 phút, báo giá công khai, không đục phá. Gọi 0963.953.533.'");
  console.log("  [meta-desc-fix.php] replaced 62 => desc");
}
// also replace any remaining brand
md = brandReplace(md, "meta-desc-fix.php");
const w8 = await call("write_file",{path:P_MD,content:md});
console.log("write meta-desc-fix.php:", w8.slice(0,80));

// ── 9. ttcqn-meta-dieu-khoan-fix.php ─────────────────────────────────────────
const P_DK = "/public_html/wp-content/plugins/ttcqn-meta-dieu-khoan-fix/ttcqn-meta-dieu-khoan-fix.php";
let dk = await call("read_file",{path:P_DK});
dk = brandReplace(dk, "meta-dieu-khoan-fix.php");
const w9 = await call("write_file",{path:P_DK,content:dk});
console.log("write meta-dieu-khoan-fix.php:", w9.slice(0,80));

// ── 10. assets/index.html ────────────────────────────────────────────────────
const P_IDX = "/public_html/wp-content/plugins/ttcqn-qn-service-landing/assets/index.html";
let idx = await call("read_file",{path:P_IDX});
idx = brandReplace(idx, "assets/index.html");
const w10 = await call("write_file",{path:P_IDX,content:idx});
console.log("write assets/index.html:", w10.slice(0,80));

// ── Summary ──────────────────────────────────────────────────────────────────
console.log("\n══ DONE ══");
console.log("Total unresolved hits:", totalMiss);
if(totalMiss===0) console.log("✓ All brand occurrences replaced in target files");
else console.error("✗ Some hits remain — check WARN above");
