import https from "node:https";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { env as shellEnv, platform } from "node:process";

const PROJECT_ROOT =
  platform === "linux" && existsSync("/mnt/d/.thongtaccongquangninh")
    ? "/mnt/d/.thongtaccongquangninh"
    : "D:\\.thongtaccongquangninh";
const ROOT_IS_POSIX = PROJECT_ROOT.startsWith("/");
const fromRoot = (...parts) => (ROOT_IS_POSIX ? [PROJECT_ROOT, ...parts].join("/") : [PROJECT_ROOT, ...parts].join("\\"));
const ENV_PATHS = [
  fromRoot(".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
];
const ENV_PATH = ENV_PATHS.find((p) => existsSync(p)) || ENV_PATHS[0];
const WP_HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const TODAY = new Date().toISOString().slice(0, 10);
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = fromRoot("backups", `forbidden-cleanup-live-${STAMP}`);
const REPORT_PATH = fromRoot("reports", `forbidden-cleanup-live-${STAMP}.json`);
const CSV_PATH = fromRoot("docs", "SEO_PROGRESS.csv");

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const fileEnv = parseEnv(ENV_PATH);
const username = fileEnv.WP_USERNAME || shellEnv.WP_USERNAME;
const appPassword = fileEnv.WP_APP_PASSWORD || shellEnv.WP_APP_PASSWORD;
if (!username || !appPassword) throw new Error(`Missing WP credentials from ${ENV_PATH}`);
const AUTH = `Basic ${Buffer.from(`${username}:${appPassword}`).toString("base64")}`;
let sessionId = null;

function requestJson(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: AUTH,
          "User-Agent": "Codex forbidden cleanup deploy",
          ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
          ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => {
          if (!sessionId && res.headers["mcp-session-id"]) sessionId = res.headers["mcp-session-id"];
          try {
            resolve({ status: res.statusCode, data: text ? JSON.parse(text) : {} });
          } catch {
            resolve({ status: res.statusCode, data: text });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(90000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

async function initMcp() {
  const init = await requestJson("POST", "/wp-json/mcp/wp-mcp-ultimate", {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      clientInfo: { name: "codex-forbidden-cleanup", version: "1.0" },
    },
  });
  if (init.status !== 200) throw new Error(`MCP initialize failed HTTP ${init.status}: ${JSON.stringify(init.data).slice(0, 500)}`);
  return init;
}

async function ability(abilityName, parameters = {}) {
  return requestJson("POST", "/wp-json/mcp/wp-mcp-ultimate", {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: {
      name: "wp-mcp-ultimate-execute-ability",
      arguments: { ability_name: abilityName, parameters },
    },
  });
}

function abilityText(response) {
  return response.data?.result?.content?.[0]?.text ?? JSON.stringify(response.data).slice(0, 1200);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const dataBuf = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const crc = crc32(dataBuf);
    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dataBuf.length, 18);
    local.writeUInt32LE(dataBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    parts.push(local, dataBuf);

    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(dataBuf.length, 20);
    cd.writeUInt32LE(dataBuf.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nameBuf.copy(cd, 46);
    central.push(cd);
    offset += local.length + dataBuf.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(central.length, 8);
  end.writeUInt16LE(central.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...parts, centralBuf, end]);
}

function collectFiles(dir, slug) {
  const out = [];
  function walk(current) {
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (stat.isFile()) {
        const rel = relative(dir, full).replace(/\\/g, "/");
        out.push([`${slug}/${rel}`, readFileSync(full)]);
      }
    }
  }
  walk(dir);
  return out;
}

async function backupRemote(remotePath, localName) {
  const res = await ability("files/read-file", { path: remotePath });
  const text = abilityText(res);
  const ok = res.status === 200 && !text.toLowerCase().includes("error") && !text.includes('"code":');
  const target = join(BACKUP_DIR, localName);
  writeFileSync(target, text, "utf8");
  return { remotePath, target, status: res.status, ok, preview: text.slice(0, 160) };
}

async function uploadPlugin(slug, entries) {
  const zip = buildZip(entries);
  const res = await ability("plugins/upload-base64", {
    content_base64: zip.toString("base64"),
    filename: `${slug}.zip`,
    activate: true,
    overwrite: true,
  });
  const text = abilityText(res);
  const lower = text.toLowerCase();
  const ok = res.status === 200 && !lower.includes("error") && !lower.includes("fatal") && !lower.includes("failed");
  return { slug, status: res.status, ok, zipBytes: zip.length, result: text.slice(0, 1000) };
}

function fetchPublic(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "Codex public verify" },
        rejectUnauthorized: false,
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

mkdirSync(BACKUP_DIR, { recursive: true });
mkdirSync(fromRoot("reports"), { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  envPath: ENV_PATH,
  backupDir: BACKUP_DIR,
  backups: [],
  uploads: [],
  verification: {},
};

await initMcp();
const backupTargets = [
  ["/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php", "page-home-direct.remote.php"],
  ["/public_html/wp-content/plugins/ttcqn-doorway-schema/gbp_data.json", "doorway-gbp-data.remote.json"],
  ["/public_html/wp-content/plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php", "doorway-schema.remote.php"],
  ["/public_html/wp-content/plugins/ttcqn-fix-home-img-alt/ttcqn-fix-home-img-alt.php", "fix-home-img-alt.remote.php"],
];
for (const [remote, local] of backupTargets) {
  const result = await backupRemote(remote, local);
  report.backups.push(result);
  console.log(`backup ${result.ok ? "OK" : "WARN"} ${remote} -> ${result.target}`);
}

report.uploads.push(
  await uploadPlugin(
    "ttcqn-home-emergency-renderer",
    collectFiles(fromRoot("tools", "wp-plugins", "ttcqn-home-emergency-renderer"), "ttcqn-home-emergency-renderer"),
  ),
);
report.uploads.push(
  await uploadPlugin(
    "ttcqn-doorway-schema",
    collectFiles(fromRoot("tools", "wp-plugins", "ttcqn-doorway-schema"), "ttcqn-doorway-schema"),
  ),
);
report.uploads.push(
  await uploadPlugin("ttcqn-fix-home-img-alt", [
    [
      "ttcqn-fix-home-img-alt/ttcqn-fix-home-img-alt.php",
      readFileSync(fromRoot("tools", "mu-plugins", "ttcqn-fix-home-img-alt.php")),
    ],
  ]),
);
for (const upload of report.uploads) console.log(`upload ${upload.ok ? "OK" : "FAIL"} ${upload.slug} (${upload.zipBytes} bytes)`);

const cache = `?nowprocket=1&codex=forbidden-cleanup-${Date.now()}`;
const home = await fetchPublic(`/${cache}`);
const noForbiddenPattern =
  !/(Uy tín|uy tín|chuyên nghiệp|hàng đầu|tận tâm|hy vọng bài viết hữu ích|rev_mock|aggregateRating|testimonial-anh|testimonial-chat|khách hàng .*đánh giá)/iu.test(home.text);
report.verification.home = {
  status: home.status,
  hasNewLogoAlt: home.text.includes("Môi Trường Đô Thị Số 1 Quảng Ninh - phục vụ nhanh, sạch sẽ"),
  hasMockReviewName: /Trần Minh Quân|Nguyễn Thị Mai|Phạm Hoàng Long|Vũ Văn Nam|Phan Anh Tuấn|Nguyễn Hoàng Hải/u.test(home.text),
  hasAggregateRating: /aggregateRating/u.test(home.text),
  noForbiddenPattern,
};

const area = await fetchPublic(`/thong-tac-cong-cao-xanh/${cache}`);
report.verification.area = {
  status: area.status,
  hasRevMock: area.text.includes("rev_mock"),
  hasAggregateRating: /aggregateRating/u.test(area.text),
  hasServiceSchema: /"@type"\s*:\s*"Service"/u.test(area.text) || /"@type":\s*"Service"/u.test(area.text),
};

const active = await ability("plugins/list", { status: "active" });
const activeText = abilityText(active);
report.verification.activePlugins = {
  homeRenderer: activeText.includes("ttcqn-home-emergency-renderer"),
  doorwaySchema: activeText.includes("ttcqn-doorway-schema"),
  imgAlt: activeText.includes("ttcqn-fix-home-img-alt"),
};

report.success =
  report.uploads.every((item) => item.ok) &&
  report.verification.home.status === 200 &&
  report.verification.home.hasNewLogoAlt &&
  !report.verification.home.hasMockReviewName &&
  !report.verification.home.hasAggregateRating &&
  report.verification.home.noForbiddenPattern &&
  report.verification.area.status === 200 &&
  !report.verification.area.hasRevMock &&
  !report.verification.area.hasAggregateRating;

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
appendFileSync(
  CSV_PATH,
  `\n${TODAY},${new Date().toTimeString().slice(0, 5)},FORBIDDEN-CLEANUP-LIVE-${TODAY},seo_fix,deploy source cleanup tu cam review rating,https://${WP_HOST}/,,${report.success ? "done" : "needs_review"},high,,,,,backup ${BACKUP_DIR}; upload renderer schema img-alt; verify home+area,tools/deploy_forbidden_cleanup_live.mjs,,report ${REPORT_PATH},,,,,,`,
  "utf8",
);

console.log(JSON.stringify({
  success: report.success,
  backupDir: BACKUP_DIR,
  reportPath: REPORT_PATH,
  uploads: report.uploads.map(({ slug, ok }) => ({ slug, ok })),
  verification: report.verification,
}, null, 2));
if (!report.success) process.exitCode = 1;
