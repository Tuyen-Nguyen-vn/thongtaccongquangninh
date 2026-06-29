import https from "node:https";
function fetchPage(path){return new Promise((res,rej)=>{const r=https.request({hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path,method:"GET",headers:{Host:"thongtaccongquangninh.com","User-Agent":"Mozilla/5.0"},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d));});r.on("error",rej);r.setTimeout(20000,()=>r.destroy());r.end();});}
const html = await fetchPage("/?nocache=" + Date.now());
const imgs = [...html.matchAll(/<img[^>]*>/g)].map(m => m[0]);
let i = 0;
for (const tag of imgs) {
  const src = (tag.match(/src="([^"]*)"/) || [])[1] || "";
  const alt = tag.match(/alt="([^"]*)"/);
  const altv = alt ? alt[1] : "(NO ALT ATTR)";
  if (/logo|icon|avatar|gravatar|data:image|emoji|\.svg/i.test(src)) continue;
  i++;
  const ok = /(thông tắc|hút bể phốt|hố ga|cống|bồn cầu|hầm cầu|mùi hôi)/i.test(altv) && /(quảng ninh|hạ long|cẩm phả|uông bí|móng cái|bãi cháy|cao xanh|tuần châu|hồng gai|giếng đáy|đông triều|quảng yên|vân đồn)/i.test(altv);
  console.log(`${i}. [${ok ? "OK" : "WEAK"}] alt="${altv}"`);
  console.log(`   file=${src.split("/").pop()}`);
}
