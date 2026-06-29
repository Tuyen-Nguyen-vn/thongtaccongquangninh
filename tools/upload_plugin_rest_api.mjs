/**
 * Upload plugin ZIP qua WP REST API /wp/v2/plugins (WP 5.5+).
 * Dùng multipart/form-data, không cần MCP.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

const PLUGIN_SLUG = process.argv[2] || "ttcqn-seo-cleanup-redirects";
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${PLUGIN_SLUG}.zip`;

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

function httpsRequest(method, urlPath, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: urlPath, method,
      headers: { Host: WP_HOST, Authorization: auth, ...headers },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, resp => {
      let d = "";
      resp.on("data", c => d += c);
      resp.on("end", () => {
        try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); }
        catch { resolve({ s: resp.statusCode, d }); }
      });
    });
    r.on("error", reject); r.setTimeout(60000, () => r.destroy(new Error("timeout")));
    if (body) r.write(body);
    r.end();
  });
}

// Build multipart/form-data
const zipContent = readFileSync(ZIP_PATH);
const filename = path.basename(ZIP_PATH);
const boundary = "----WPUploadBoundary" + Date.now();

const slugField = Buffer.from(
  `--${boundary}\r\nContent-Disposition: form-data; name="slug"\r\n\r\n${PLUGIN_SLUG}\r\n`
);
const part1 = Buffer.from(
  `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/zip\r\n\r\n`
);
const part2 = Buffer.from(`\r\n--${boundary}--\r\n`);
const body = Buffer.concat([slugField, part1, zipContent, part2]);

console.log(`Uploading ${filename} (${(zipContent.length / 1024).toFixed(1)} KB)...`);

// Step 1: Upload via /wp/v2/plugins
const uploadR = await httpsRequest("POST", "/wp-json/wp/v2/plugins", {
  "Content-Type": `multipart/form-data; boundary=${boundary}`,
  "Content-Length": body.length,
}, body);

console.log("Upload status:", uploadR.s);
console.log("Upload response:", JSON.stringify(uploadR.d).slice(0, 400));

let success = false;

if (uploadR.s === 201 || uploadR.s === 200) {
  const pluginFile = uploadR.d?.plugin ?? `${PLUGIN_SLUG}/${PLUGIN_SLUG}.php`;
  console.log("Plugin file:", pluginFile);

  // Step 2: Activate
  const activateR = await httpsRequest("PUT", `/wp-json/wp/v2/plugins/${encodeURIComponent(pluginFile)}`, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength('{"status":"active"}'),
  }, '{"status":"active"}');

  console.log("Activate status:", activateR.s);
  console.log("Activate response:", JSON.stringify(activateR.d).slice(0, 300));
  success = activateR.s === 200 && activateR.d?.status === "active";
} else if (uploadR.s === 400 && JSON.stringify(uploadR.d).includes("already_installed")) {
  // Plugin already installed — just activate existing
  console.log("Plugin already installed, activating...");
  const activateR = await httpsRequest("PUT",
    `/wp-json/wp/v2/plugins/${encodeURIComponent(PLUGIN_SLUG + "/" + PLUGIN_SLUG + ".php")}`, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength('{"status":"active"}'),
  }, '{"status":"active"}');
  console.log("Activate status:", activateR.s, JSON.stringify(activateR.d).slice(0, 200));
  success = activateR.s === 200;
} else {
  console.error("Upload failed. Response:", JSON.stringify(uploadR.d).slice(0, 400));
}

// Verify live redirect
await new Promise(r => setTimeout(r, 2000));
await new Promise((res, rej) => {
  const opts = {
    hostname: SERVER_IP, port: 443, servername: WP_HOST,
    path: "/category/nao-vet-ho-ga/", method: "GET",
    headers: { Host: WP_HOST, "User-Agent": "redirectcheck/1" },
    rejectUnauthorized: false,
  };
  const r = https.request(opts, resp => {
    console.log(`\nLive check /category/nao-vet-ho-ga/: HTTP ${resp.statusCode} → ${resp.headers.location || "(no redirect)"}`);
    res();
  });
  r.on("error", rej); r.setTimeout(10000, () => r.destroy(new Error("t"))); r.end();
});

// CSV log
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync(CSV_PATH,
  `\n${TODAY},${TIME},FIX-BROKEN-LINK-NAO-VET-HO-GA-${TODAY},technical_seo,Them redirect 301 /category/nao-vet-ho-ga/ → /nao-vet-ho-ga-quang-ninh/ trong plugin ttcqn-seo-cleanup-redirects v2026.06.22.1,https://thongtaccongquangninh.com/category/nao-vet-ho-ga/,,${success ? "done" : "fail"},high,,,,,Redirect 301 fix broken link anh huong 35+ trang; plugin v2026.06.22.1,tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php,,Chay lai audit seo_full de verify broken link = 0; monitor GSC Coverage,,,,,,`,
  "utf8"
);
console.log(`\n${success ? "✓" : "✗"} Upload ${success ? "thành công" : "thất bại"}. CSV logged.`);
