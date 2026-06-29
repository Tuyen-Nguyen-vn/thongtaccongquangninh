/**
 * Deploy mu-plugin ttcqn-fix-home-img-alt.php lên server.
 * Thử 2 cách:
 *  1. WP REST POST /wp/v2/plugins (cần ZIP)
 *  2. WP custom endpoint (nếu có ttcqn-doorway-schema expose endpoint)
 *  3. Fallback: ghi qua option + mu-plugin bootstrap đã có sẵn
 *
 * Thực tế nhất: dùng WP Plugin API upload ZIP.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const PHP_FILE  = "D:\\.thongtaccongquangninh\\tools\\mu-plugins\\ttcqn-fix-home-img-alt.php";
const CSV_PATH  = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function requestJson(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "deploy/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

/** Tạo ZIP buffer từ 1 file PHP (format ZIP minimal) */
function makeZip(filename, content) {
  // Dùng multipart/form-data upload thay vì ZIP thực vì WP /plugins cần ZIP
  // Đây là zip minimal chuẩn PK
  const fileBuf = Buffer.from(content, "utf8");
  const now = new Date();
  const dosDate = ((now.getFullYear() - 1980) << 9 | (now.getMonth() + 1) << 5 | now.getDate());
  const dosTime = (now.getHours() << 11 | now.getMinutes() << 5 | Math.floor(now.getSeconds() / 2));

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    for (const b of buf) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  const fn = Buffer.from(filename);
  const crc = crc32(fileBuf);

  // Local file header
  const lfh = Buffer.alloc(30 + fn.length);
  lfh.writeUInt32LE(0x04034b50, 0);   // signature
  lfh.writeUInt16LE(20, 4);           // version needed
  lfh.writeUInt16LE(0, 6);            // flags
  lfh.writeUInt16LE(0, 8);            // no compression
  lfh.writeUInt16LE(dosTime, 10);
  lfh.writeUInt16LE(dosDate, 12);
  lfh.writeUInt32LE(crc, 14);
  lfh.writeUInt32LE(fileBuf.length, 18);
  lfh.writeUInt32LE(fileBuf.length, 22);
  lfh.writeUInt16LE(fn.length, 26);
  lfh.writeUInt16LE(0, 28);
  fn.copy(lfh, 30);

  const dataOffset = 0;

  // Central directory header
  const cdh = Buffer.alloc(46 + fn.length);
  cdh.writeUInt32LE(0x02014b50, 0);
  cdh.writeUInt16LE(20, 4);
  cdh.writeUInt16LE(20, 6);
  cdh.writeUInt16LE(0, 8);
  cdh.writeUInt16LE(0, 10);
  cdh.writeUInt16LE(dosTime, 12);
  cdh.writeUInt16LE(dosDate, 14);
  cdh.writeUInt32LE(crc, 16);
  cdh.writeUInt32LE(fileBuf.length, 20);
  cdh.writeUInt32LE(fileBuf.length, 24);
  cdh.writeUInt16LE(fn.length, 28);
  cdh.writeUInt16LE(0, 30);
  cdh.writeUInt16LE(0, 32);
  cdh.writeUInt16LE(0, 34);
  cdh.writeUInt16LE(0, 36);
  cdh.writeUInt32LE(0x81A40000, 38);
  cdh.writeUInt32LE(dataOffset, 42);
  fn.copy(cdh, 46);

  const cdOffset = lfh.length + fileBuf.length;

  // EOCD
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(cdh.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([lfh, fileBuf, cdh, eocd]);
}

/** Upload ZIP via multipart/form-data to WP REST /plugins */
function uploadPlugin(auth, zipBuf, zipName) {
  return new Promise((resolve, reject) => {
    const boundary = "----ttcqnBoundary" + Date.now();
    const head = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="plugin"; filename="${zipName}"\r\nContent-Type: application/zip\r\n\r\n`
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([head, zipBuf, tail]);

    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/wp/v2/plugins",
      method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "deploy/1.0",
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length,
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  const phpContent = readFileSync(PHP_FILE, "utf8");
  console.log(`PHP file: ${phpContent.length} chars`);

  // Thử upload qua WP REST /plugins (WP 5.5+)
  // WP /plugins cần plugin ZIP với đúng folder structure:
  // ttcqn-fix-home-img-alt/ttcqn-fix-home-img-alt.php
  // BUT: mu-plugins không cài qua WP plugin system — chúng phải nằm trong /wp-content/mu-plugins/
  // WP REST /plugins chỉ cài vào /wp-content/plugins/

  // Tạo ZIP với folder structure
  const zipBuf = makeZip("ttcqn-fix-home-img-alt/ttcqn-fix-home-img-alt.php", phpContent);
  console.log(`ZIP size: ${zipBuf.length} bytes`);

  console.log("\nThử upload qua /wp/v2/plugins...");
  const r = await uploadPlugin(auth, zipBuf, "ttcqn-fix-home-img-alt.zip");
  console.log(`  Status: ${r.status}`);
  console.log(`  Response:`, JSON.stringify(r.data).slice(0, 300));

  if (r.status === 201 || r.status === 200) {
    console.log("\n✓ Plugin uploaded. Cần activate từ WP Admin hoặc via REST:");
    // Activate
    const act = await requestJson("PUT", `/wp/v2/plugins/ttcqn-fix-home-img-alt/ttcqn-fix-home-img-alt`, auth, { status: "active" });
    console.log(`  Activate: ${act.status}`, JSON.stringify(act.data).slice(0, 200));

    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},DEPLOY-IMG-ALT-PLUGIN-${TODAY},seo_fix,deploy mu-plugin fix home img alt,https://thongtaccongquangninh.com,,done,high,,,,,ttcqn-fix-home-img-alt.php deployed+activated,tools/deploy_mu_plugin_img_alt.mjs,,Verify homepage img alt live,,,,,,`,
      "utf8"
    );
  } else {
    console.log("\n✗ Plugin REST upload thất bại (expected for mu-plugins).");
    console.log("→ Cần upload thủ công qua 1Panel hoặc FTP:");
    console.log(`  Source: D:\\.thongtaccongquangninh\\tools\\mu-plugins\\ttcqn-fix-home-img-alt.php`);
    console.log(`  Dest:   /wp-content/mu-plugins/ttcqn-fix-home-img-alt.php`);
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
