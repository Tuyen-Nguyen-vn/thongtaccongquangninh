/**
 * Deploy ttcqn-fix-home-img-alt plugin qua WP MCP Ultimate ability.
 * Dùng plugins/upload-base64 → activate.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const PHP_FILE  = "D:\\.thongtaccongquangninh\\tools\\mu-plugins\\ttcqn-fix-home-img-alt.php";
const CSV_PATH  = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const PLUGIN_FOLDER = "ttcqn-fix-home-img-alt";
const PLUGIN_SLUG   = "ttcqn-fix-home-img-alt/ttcqn-fix-home-img-alt.php";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

let SESSION_ID = null;

function req(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "mcp-client/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
        ...(SESSION_ID ? { "Mcp-Session-Id": SESSION_ID } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        if (!SESSION_ID && res.headers?.["mcp-session-id"]) SESSION_ID = res.headers["mcp-session-id"];
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on("error", reject);
    r.setTimeout(60000, () => r.destroy(new Error("timeout")));
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}

function mcpCall(auth, method, params = {}) {
  return req("POST", "/mcp/wp-mcp-ultimate", auth, {
    jsonrpc: "2.0", id: Date.now(), method, params,
  });
}

function executeAbility(auth, abilityName, parameters = {}) {
  return mcpCall(auth, "tools/call", {
    name: "wp-mcp-ultimate-execute-ability",
    arguments: { ability_name: abilityName, parameters },
  });
}

/** Tạo ZIP buffer với folder structure: folder/file.php */
function makeZip(folder, filename, content) {
  const filePath = `${folder}/${filename}`;
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

  const fn = Buffer.from(filePath);
  const crc = crc32(fileBuf);

  // Local file header
  const lfh = Buffer.alloc(30 + fn.length);
  lfh.writeUInt32LE(0x04034b50, 0);
  lfh.writeUInt16LE(20, 4);
  lfh.writeUInt16LE(0, 6);
  lfh.writeUInt16LE(0, 8);
  lfh.writeUInt16LE(dosTime, 10);
  lfh.writeUInt16LE(dosDate, 12);
  lfh.writeUInt32LE(crc, 14);
  lfh.writeUInt32LE(fileBuf.length, 18);
  lfh.writeUInt32LE(fileBuf.length, 22);
  lfh.writeUInt16LE(fn.length, 26);
  lfh.writeUInt16LE(0, 28);
  fn.copy(lfh, 30);

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
  cdh.writeUInt32LE(0, 42);
  fn.copy(cdh, 46);

  const cdOffset = lfh.length + fileBuf.length;

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

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  const phpContent = readFileSync(PHP_FILE, "utf8");
  console.log(`PHP: ${phpContent.length} chars`);

  // 1. Init session
  console.log("\n=== 1. Init MCP session ===");
  await mcpCall(auth, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
    clientInfo: { name: "ttcqn-deploy", version: "1.0" },
  });
  console.log("Session:", SESSION_ID);

  // 2. Tạo ZIP base64
  const zipBuf = makeZip(PLUGIN_FOLDER, "ttcqn-fix-home-img-alt.php", phpContent);
  const zipB64 = zipBuf.toString("base64");
  console.log(`\nZIP: ${zipBuf.length} bytes → base64 ${zipB64.length} chars`);

  // 3. Upload plugin
  console.log("\n=== 2. Upload plugin via plugins/upload-base64 ===");
  const uploadR = await executeAbility(auth, "plugins/upload-base64", {
    content_base64: zipB64,
    filename: "ttcqn-fix-home-img-alt.zip",
    activate: true,
    overwrite: true,
  });
  console.log("Status:", uploadR.status);
  const uploadText = uploadR.data?.result?.content?.[0]?.text ?? JSON.stringify(uploadR.data).slice(0, 500);
  console.log("Result:", uploadText.slice(0, 600));

  const ok = uploadR.status === 200 && !uploadText.toLowerCase().includes("error");

  if (ok) {
    console.log("\n✓ Plugin uploaded + activated.");

    // 4. Verify plugin is active
    console.log("\n=== 3. Verify active plugins ===");
    const listR = await executeAbility(auth, "plugins/list", { status: "active" });
    const listText = listR.data?.result?.content?.[0]?.text ?? "";
    const isActive = listText.includes("ttcqn-fix-home-img-alt");
    console.log("ttcqn-fix-home-img-alt active:", isActive ? "✓ YES" : "✗ NOT FOUND");
    console.log(listText.slice(0, 800));

    // 5. Ghi log CSV
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},FIX-HOME-IMG-ALT-${TODAY},seo_fix,Deploy plugin fix homepage img alt (20 ảnh patch),https://thongtaccongquangninh.com,,done,high,,,,,plugin ttcqn-fix-home-img-alt uploaded+activated via WP MCP,tools/deploy_img_alt_plugin_via_ability.mjs,,Verify homepage alt live [VERIFY-LIVE],,,,,,`,
      "utf8"
    );
    console.log("\n✓ CSV logged.");
  } else {
    console.log("\n✗ Upload failed. Xem chi tiết trên.");

    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},FIX-HOME-IMG-ALT-${TODAY},seo_fix,Deploy plugin fix homepage img alt – FAILED,https://thongtaccongquangninh.com,,fail,high,,,,,plugins/upload-base64 returned error,tools/deploy_img_alt_plugin_via_ability.mjs,,Thử upload thủ công qua WP Admin,,,,,,`,
      "utf8"
    );
    console.log("\n✓ CSV logged (FAIL).");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
