import { readFileSync } from "node:fs";

const BASE = "https://thongtaccongquangninh.com";
const AUTH = `Basic ${Buffer.from("cuben01:NXHb SFQD MxYN jI4q YhyZ JkWS").toString("base64")}`;
const ENDPOINT = `${BASE}/wp-json/mcp/wp-mcp-ultimate`;
const SLUG = "ttcqn-gsc-verify";

function crc32(buf) {
  if (!crc32.t) {
    crc32.t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      crc32.t[i] = c;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crc32.t[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(filename, content) {
  const fn = Buffer.from(filename, "utf8");
  const cb = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  const crc = crc32(cb);
  const lh = Buffer.alloc(30 + fn.length);
  lh.writeUInt32LE(0x04034b50,0); lh.writeUInt16LE(20,4); lh.writeUInt16LE(0,6);
  lh.writeUInt16LE(0,8); lh.writeUInt16LE(0,10); lh.writeUInt16LE(0,12);
  lh.writeUInt32LE(crc,14); lh.writeUInt32LE(cb.length,18); lh.writeUInt32LE(cb.length,22);
  lh.writeUInt16LE(fn.length,26); lh.writeUInt16LE(0,28); fn.copy(lh,30);
  const cd = Buffer.alloc(46 + fn.length);
  cd.writeUInt32LE(0x02014b50,0); cd.writeUInt16LE(20,4); cd.writeUInt16LE(20,6);
  cd.writeUInt16LE(0,8); cd.writeUInt16LE(0,10); cd.writeUInt16LE(0,12); cd.writeUInt16LE(0,14);
  cd.writeUInt32LE(crc,16); cd.writeUInt32LE(cb.length,20); cd.writeUInt32LE(cb.length,24);
  cd.writeUInt16LE(fn.length,28); cd.writeUInt16LE(0,30); cd.writeUInt16LE(0,32);
  cd.writeUInt16LE(0,34); cd.writeUInt16LE(0,36); cd.writeUInt32LE(0,38); cd.writeUInt32LE(0,42);
  fn.copy(cd,46);
  const cs = lh.length + cb.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50,0); eocd.writeUInt16LE(0,4); eocd.writeUInt16LE(0,6);
  eocd.writeUInt16LE(1,8); eocd.writeUInt16LE(1,10); eocd.writeUInt32LE(cd.length,12);
  eocd.writeUInt32LE(cs,16); eocd.writeUInt16LE(0,20);
  return Buffer.concat([lh, cb, cd, eocd]);
}

const phpContent = readFileSync(`D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}\\${SLUG}.php`);
const zipBuf = buildZip(`${SLUG}/${SLUG}.php`, phpContent);
const zipBase64 = zipBuf.toString("base64");
console.log(`ZIP: ${zipBuf.length} bytes`);

async function rpc(method, params, sid, id) {
  const h = { Authorization: AUTH, "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
  if (sid) h["Mcp-Session-Id"] = sid;
  const r = await fetch(ENDPOINT, { method: "POST", headers: h, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  return { sid: r.headers.get("mcp-session-id"), j: await r.json() };
}

const { sid } = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "gsc-verify", version: "1" } }, null, 1);
console.log("SID:", sid);

const upload = await rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: "plugins/upload-base64", parameters: { content_base64: zipBase64, filename: `${SLUG}.zip`, activate: true, overwrite: true } } }, sid, 2);
const uploadText = upload.j?.result?.content?.[0]?.text || JSON.stringify(upload.j);
console.log("Upload:", uploadText.slice(0, 300));

// Verify meta tag live on homepage
const homepage = await fetch(BASE + "/");
const html = await homepage.text();
const hasTag = html.includes("etA-ExGP7O3x-PtWhNNEv5Gu7N4uxMhRQBteclII_34");
console.log("Meta tag live on homepage:", hasTag);
if (hasTag) console.log("✅ Google verification meta tag active");
else console.log("❌ Meta tag not found in homepage HTML");
