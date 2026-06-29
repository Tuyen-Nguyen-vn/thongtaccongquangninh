import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const PROJECT_ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const FROM_ROOT = (...parts) => (PROJECT_ROOT.startsWith("/") ? [PROJECT_ROOT, ...parts].join("/") : [PROJECT_ROOT, ...parts].join("\\"));
const ENV_PATH = [
  FROM_ROOT(".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
].find(existsSync);
const SEARCH_REPORT = FROM_ROOT("reports", "wp-content-search-nap-2026-05-31.json");
const REPORT_PATH = FROM_ROOT("reports", "nap-content-sync-2026-05-31.json");
const BACKUP_PATH = FROM_ROOT("backups", "nap-content-sync-2026-05-31", "content-before.json");

if (!ENV_PATH) {
  throw new Error("Missing .env for WordPress credentials");
}

function readEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function collectCandidates() {
  const report = JSON.parse(readFileSync(SEARCH_REPORT, "utf8"));
  const byKey = new Map();
  for (const entry of report) {
    const text = entry.res?.payload?.result?.content?.[0]?.text;
    if (!text) continue;
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      continue;
    }
    for (const item of payload?.data?.results || []) {
      if (!item.id || !item.type) continue;
      if (!["page", "post"].includes(item.type)) continue;
      byKey.set(`${item.type}:${item.id}`, {
        id: item.id,
        type: item.type,
        link: item.link,
        title: item.title,
      });
    }
  }
  return [...byKey.values()];
}

function replaceAll(value, find, replace) {
  return value.split(find).join(replace);
}

function syncContent(raw) {
  let next = raw;
  const before = next;

  const replacements = [
    [
      "111 Cái Lân, Phường Bãi Cháy, Thành phố Hạ Long, Quảng Ninh",
      "Gần Nhà Văn hóa, khu 3, Hà Lầm, Thành phố Hạ Long, Quảng Ninh 01111",
    ],
    [
      "111 Cái Lân, Phường Bãi Cháy, Hạ Long, Quảng Ninh",
      "Gần Nhà Văn hóa, khu 3, Hà Lầm, Hạ Long, Quảng Ninh 01111",
    ],
    [
      "111 Cái Lân, Phường Bãi Cháy, Hạ Long",
      "Gần Nhà Văn hóa, khu 3, Hà Lầm, Hạ Long",
    ],
    [
      "111 Cái Lân, Bãi Cháy, TP. Hạ Long, Quảng Ninh",
      "Gần Nhà Văn hóa, khu 3, Hà Lầm, TP. Hạ Long, Quảng Ninh 01111",
    ],
    [
      "111 Cái Lân, Bãi Cháy, Hạ Long, Quảng Ninh",
      "Gần Nhà Văn hóa, khu 3, Hà Lầm, Hạ Long, Quảng Ninh 01111",
    ],
    [
      "111 Cái Lân, Bãi Cháy, Hạ Long",
      "Gần Nhà Văn hóa, khu 3, Hà Lầm, Hạ Long",
    ],
    ["111 Cái Lân, Phường Bãi Cháy", "Gần Nhà Văn hóa, khu 3, Hà Lầm"],
    ["111 Cái Lân, Bãi Cháy", "Gần Nhà Văn hóa, khu 3, Hà Lầm"],
    ["111 Cái Lân", "Gần Nhà Văn hóa, khu 3, Hà Lầm"],
    ['"postalCode":"200000"', '"postalCode":"01111"'],
    ['"latitude":20.9515', '"latitude":20.9770511628745'],
    ['"longitude":107.0784', '"longitude":106.86333517321793'],
  ];

  for (const [find, replace] of replacements) {
    next = replaceAll(next, find, replace);
  }

  return {
    changed: next !== before,
    content: next,
    oldAddressCountBefore: (before.match(/111 Cái Lân/g) || []).length,
    oldAddressCountAfter: (next.match(/111 Cái Lân/g) || []).length,
  };
}

async function request(url, auth, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex NAP content sync",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

const env = readEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const candidates = collectCandidates();
const backup = [];
const report = {
  generatedAt: new Date().toISOString(),
  apply: APPLY,
  candidates: candidates.length,
  changed: [],
  unchanged: [],
  failures: [],
};

for (const item of candidates) {
  const collection = item.type === "post" ? "posts" : "pages";
  const getUrl = `${baseUrl}/wp-json/wp/v2/${collection}/${item.id}?context=edit`;
  const current = await request(getUrl, auth);
  if (current.status >= 400) {
    report.failures.push({ ...item, phase: "get", status: current.status, body: current.body });
    continue;
  }

  const raw = current.body?.content?.raw ?? current.body?.content?.rendered ?? "";
  const synced = syncContent(raw);
  if (!synced.changed) {
    report.unchanged.push(item);
    continue;
  }

  backup.push({ ...item, content: raw });
  const changedRecord = {
    ...item,
    oldAddressCountBefore: synced.oldAddressCountBefore,
    oldAddressCountAfter: synced.oldAddressCountAfter,
  };

  if (APPLY) {
    const update = await request(`${baseUrl}/wp-json/wp/v2/${collection}/${item.id}`, auth, {
      method: "POST",
      body: JSON.stringify({ content: synced.content }),
    });
    changedRecord.updateStatus = update.status;
    if (update.status >= 400) {
      report.failures.push({ ...item, phase: "update", status: update.status, body: update.body });
    }
  }
  report.changed.push(changedRecord);
}

mkdirSync(FROM_ROOT("reports"), { recursive: true });
mkdirSync(FROM_ROOT("backups", "nap-content-sync-2026-05-31"), { recursive: true });
writeFileSync(BACKUP_PATH, `${JSON.stringify(backup, null, 2)}\n`, "utf8");
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  apply: APPLY,
  candidates: report.candidates,
  changed: report.changed.length,
  unchanged: report.unchanged.length,
  failures: report.failures.length,
  report: REPORT_PATH,
  backup: BACKUP_PATH,
}, null, 2));

if (report.failures.length) {
  process.exitCode = 1;
}
