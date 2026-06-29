import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = existsSync(join(PROJECT, ".env"))
  ? join(PROJECT, ".env")
  : "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env";

const DRY_RUN = process.argv.includes("--dry-run");
const BACKUP_DIR = join(PROJECT, "backups", "office-nap-map-2026-06-04", DRY_RUN ? "live-rest-dry-run" : "live-rest-before");
const REPORT_PATH = join(PROJECT, "reports", `office-nap-live-rest-${DRY_RUN ? "dry-run" : "apply"}-2026-06-04.json`);

const OLD_NEEDLES = [
  "Gần Nhà Văn hóa, khu 3, Hà Lầm, Thành phố Hạ Long, Quảng Ninh 01111",
  "Gần Nhà Văn hóa, khu 3, Hà Lầm, Hạ Long",
  "Gần Nhà Văn hóa, khu 3, Hà Lầm",
  "161 Liên Phường, Hà Lầm, Hạ Long, Quảng Ninh",
];
const NEW_ADDRESS = "111 Cái Lân, Bãi Cháy, Quảng Ninh";

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  }
  return env;
}

function replaceNap(value) {
  if (typeof value !== "string") return { value, changed: false, hits: [] };

  let next = value;
  const hits = [];
  for (const needle of OLD_NEEDLES) {
    if (next.includes(needle)) {
      hits.push(needle);
      next = next.split(needle).join(NEW_ADDRESS);
    }
  }
  return { value: next, changed: next !== value, hits };
}

function replaceDeep(value, hits = []) {
  if (typeof value === "string") {
    const replaced = replaceNap(value);
    hits.push(...replaced.hits);
    return { value: replaced.value, changed: replaced.changed, hits };
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const replaced = replaceDeep(item, hits);
      changed ||= replaced.changed;
      return replaced.value;
    });
    return { value: next, changed, hits };
  }
  if (value && typeof value === "object") {
    let changed = false;
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      const replaced = replaceDeep(item, hits);
      changed ||= replaced.changed;
      next[key] = replaced.value;
    }
    return { value: next, changed, hits };
  }
  return { value, changed: false, hits };
}

async function wp(baseUrl, auth, path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...options,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex office NAP live REST fix",
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {}
  if (!response.ok) {
    throw new Error(`WP ${response.status} ${path}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
  }
  return payload;
}

async function listAll(baseUrl, auth, kind) {
  const rows = [];
  for (let page = 1; page < 20; page++) {
    const batch = await wp(baseUrl, auth, `/wp/v2/${kind}?status=any&context=edit&per_page=100&page=${page}`);
    rows.push(...batch);
    if (batch.length < 100) break;
  }
  return rows;
}

function titleText(row) {
  return String(row.title?.raw || row.title?.rendered || "").replace(/<[^>]*>/g, "");
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(join(PROJECT, "reports"), { recursive: true });

  const env = parseEnv(ENV_PATH);
  const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    baseUrl,
    backupDir: BACKUP_DIR,
    pageUpdates: [],
    widgetUpdates: [],
  };

  for (const kind of ["pages", "posts"]) {
    for (const row of await listAll(baseUrl, auth, kind)) {
      const raw = row.content?.raw || "";
      const replaced = replaceNap(raw);
      if (!replaced.changed) continue;

      writeFileSync(
        join(BACKUP_DIR, `${kind}-${row.id}-${row.slug || "no-slug"}.json`),
        `${JSON.stringify(row, null, 2)}\n`,
        "utf8",
      );

      if (!DRY_RUN) {
        await wp(baseUrl, auth, `/wp/v2/${kind}/${row.id}`, {
          method: "POST",
          body: JSON.stringify({ content: replaced.value }),
        });
      }

      report.pageUpdates.push({
        kind,
        id: row.id,
        slug: row.slug,
        status: row.status,
        title: titleText(row),
        hits: [...new Set(replaced.hits)],
        changed: true,
      });
    }
  }

  const widgets = await wp(baseUrl, auth, "/wp/v2/widgets?context=edit&per_page=100");
  writeFileSync(join(BACKUP_DIR, "widgets.json"), `${JSON.stringify(widgets, null, 2)}\n`, "utf8");
  for (const widget of widgets) {
    const replaced = replaceDeep(widget.instance || {});
    if (!replaced.changed) continue;

    if (!DRY_RUN) {
      await wp(baseUrl, auth, `/wp/v2/widgets/${encodeURIComponent(widget.id)}`, {
        method: "POST",
        body: JSON.stringify({ instance: replaced.value }),
      });
    }

    report.widgetUpdates.push({
      id: widget.id,
      sidebar: widget.sidebar,
      hits: [...new Set(replaced.hits)],
      changed: true,
    });
  }

  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    dryRun: DRY_RUN,
    reportPath: REPORT_PATH,
    pages: report.pageUpdates.length,
    widgets: report.widgetUpdates.length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
