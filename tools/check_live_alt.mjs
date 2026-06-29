/**
 * Fetch live HTML and check actual alt text on affected pages
 */
import https from "node:https";

const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";

function fetchPage(slug){
  return new Promise((res,rej)=>{
    const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
      headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("timeout")));r.end();
  });
}

// SERVICE & LOCATION patterns (same as seo_audit_extend.mjs)
const SERVICE_HINTS = {
  hut_be_phot: /h[uú]t\s*b[eể]\s*ph[ốo]t/i,
  hut_ham_cau: /h[uú]t\s*h[aầ]m\s*c[aầ]u/i,
  thong_tac_cong: /th[oô]ng\s*t[aắ]c\s*c[oố]ng/i,
  thong_tac_bon_cau: /th[oô]ng\s*t[aắ]c\s*b[oồ]n\s*c[aầ]u/i,
  nao_vet_ho_ga: /n[aạ]o\s*v[eé]t\s*h[oố]\s*ga/i,
  xu_ly_mui_hoi: /x[uử]\s*l[ýy]\s*m[uù]i\s*h[oô]i/i,
};
const LOCATION_HINTS = [
  /qu[aả]ng\s*ninh/i, /h[aạ]\s*long/i, /c[aẩ]m\s*ph[aả]/i,
  /u[oô]ng\s*b[ií]/i, /m[oó]ng\s*c[aá]i/i, /[dđ][oô]ng\s*tri[eề]u/i,
  /qu[aả]ng\s*y[eê]n/i, /v[aâ]n\s*[dđ][oồ]n/i, /b[aã]i\s*ch[aá]y/i,
  /h[oo]\s*[xs]a/i, /t[ií]\s*ti[eê]n\s*y[eê]n/i,
];

function checkAlt(alt){
  if(alt===null) return "NO_ATTR";
  if(alt.trim()==="") return "EMPTY";
  const hasService = Object.values(SERVICE_HINTS).some(re=>re.test(alt));
  const hasLocation = LOCATION_HINTS.some(re=>re.test(alt));
  if(!hasService && !hasLocation) return "NO_SERVICE_OR_LOCATION";
  return "OK";
}

const SLUGS = ["hoa-chat-tu-thong-cong","hut-be-phot-binh-lieu","hut-be-phot-co-to","hut-be-phot-dam-ha"];

for(const slug of SLUGS){
  const html = await fetchPage(slug);
  // Extract only images within <main> or article content area
  const mainM = html.match(/<(?:main|article)[^>]*>([\s\S]*?)<\/(?:main|article)>/i);
  const body = mainM?.[1] || html;
  const imgRe=/<img[^>]+>/gi;
  const imgs=[...body.matchAll(imgRe)];
  const srcHost = new RegExp(WPH,"i");
  console.log(`\n${slug}: ${imgs.length} total imgs in main/article`);
  for(const m of imgs){
    const src = (m[0].match(/src="([^"]*)"/i)||[])[1]||"";
    if(!srcHost.test(src) && src) continue; // skip external
    const altM = m[0].match(/alt="([^"]*)"/i);
    const alt = altM ? altM[1] : null;
    const status = checkAlt(alt);
    if(status !== "OK"){
      const fn = src.split("/").pop().split("?")[0].slice(0,50);
      console.log(`  [${status}] alt="${alt}" src=...${fn}`);
    }
  }
}
