import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

function replaceLastN(html,phrase,n,alt){
  const re=new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+'),'gi');
  const positions=[];let m;
  while((m=re.exec(html))!==null){
    const before=html.slice(0,m.index);
    if((before.match(/</g)||[]).length===(before.match(/>/g)||[]).length)
      positions.push({start:m.index,end:m.index+m[0].length});
  }
  if(!positions.length)return{html,replaced:0};
  const toReplace=positions.slice(-n);let result=html;
  for(const pos of toReplace.reverse())result=result.slice(0,pos.start)+alt+result.slice(pos.end);
  return{html:result,replaced:toReplace.length};
}
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wc(t){return t.split(/\s+/).filter(Boolean).length;}
function cnt(text,kw){return(text.match(new RegExp(kw.replace(/\s+/g,"\\s+"),"gi"))||[]).length;}

const r=await wpReq("GET","/wp-json/wp/v2/pages/2356?context=edit&_fields=id,slug,content");
if(r?.id){
  const kw="Nguyễn Song Hào";
  const text0=stripHtml(r.content.raw);
  const c0=cnt(text0,kw);const w0=wc(text0);
  console.log(`before: cnt=${c0}/${w0} density=${(3*c0/w0*100).toFixed(2)}%`);
  const {html:raw2,replaced}=replaceLastN(r.content.raw,kw,3,"anh");
  const text2=stripHtml(raw2);
  const c=cnt(text2,kw);const w=wc(text2);
  const d=(3*c/w*100).toFixed(2);
  const res=await wpReq("POST","/wp-json/wp/v2/pages/2356",{content:raw2});
  if(res?.id) console.log(`✓ replaced=${replaced} cnt=${c}/${w} density=${d}%`);
  else console.log("✗",JSON.stringify(res).slice(0,100));
}
