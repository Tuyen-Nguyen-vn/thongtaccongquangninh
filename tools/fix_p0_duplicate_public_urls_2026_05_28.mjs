import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const APPLY = process.argv.includes("--apply");
const STAMP = timestamp();
const BACKUP_DIR = join(ROOT, "seo-revisions", `wp-before-p0-url-cleanup-${STAMP}`);
const REPORT_PATH = join(ROOT, "reports", `p0-url-cleanup-${STAMP}.json`);

const TARGETS = [
  {
    collection: "posts",
    id: 2041,
    slug: "thong-tac-cong-tuan-chau",
    reason: "Duplicate post shares the canonical page URL /thong-tac-cong-tuan-chau/.",
    requestedUrl: "/thong-tac-cong-tuan-chau/",
    expectedStatus: 200,
    expectedFinalUrl: "https://thongtaccongquangninh.com/thong-tac-cong-tuan-chau/",
  },
  {
    collection: "pages",
    id: 59,
    slug: "hut-be-phot-hoanh-bo",
    reason: "Retired Hoanh Bo page redirects to the Ha Long canonical page and is excluded from sitemap.",
    requestedUrl: "/hut-be-phot-hoanh-bo/",
    expectedStatus: 301,
    expectedLocation: "https://thongtaccongquangninh.com/hut-be-phot-ha-long/",
  },
  {
    collection: "posts",
    id: 2026,
    slug: "chi-phi-hut-be-phot-quang-ninh",
    reason: "Duplicate post redirects to canonical page /chi-phi-hut-be-phot-quang-ninh-2/.",
    requestedUrl: "/chi-phi-hut-be-phot-quang-ninh/",
    expectedStatus: 301,
    expectedLocation: "https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh-2/",
  },
  {
    collection: "posts",
    id: 2055,
    slug: "thong-tac-cong-cao-xanh-2",
    reason: "Duplicate post redirects to canonical page /thong-tac-cong-cao-xanh/.",
    requestedUrl: "/thong-tac-cong-cao-xanh-2/",
    expectedStatus: 301,
    expectedLocation: "https://thongtaccongquangninh.com/thong-tac-cong-cao-xanh/",
  },
  {
    collection: "posts",
    id: 2056,
    slug: "thong-tac-cong-gieng-day-2",
    reason: "Duplicate post redirects to canonical page /thong-tac-cong-gieng-day/.",
    requestedUrl: "/thong-tac-cong-gieng-day-2/",
    expectedStatus: 301,
    expectedLocation: "https://thongtaccongquangninh.com/thong-tac-cong-gieng-day/",
  },
];

function timestamp(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function parseEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(join(ROOT, ".env"));
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
}
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Codex P0 URL cleanup",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message || raw : raw;
    throw new Error(`WP ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function headNoFollow(path) {
  const response = await fetch(`${baseUrl}${path}?nowprocket=1&codex=p0-url-cleanup`, {
    method: "HEAD",
    redirect: "manual",
    headers: { "User-Agent": "Codex P0 URL cleanup" },
  });
  return {
    status: response.status,
    location: response.headers.get("location"),
    xRedirectBy: response.headers.get("x-redirect-by"),
    link: response.headers.get("link"),
  };
}

async function main() {
  if (APPLY) mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(dirname(REPORT_PATH), { recursive: true });

  const result = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    backupDir: APPLY ? BACKUP_DIR : null,
    targets: [],
  };

  for (const target of TARGETS) {
    const before = await wp(`/wp/v2/${target.collection}/${target.id}?context=edit`);
    const beforeSummary = {
      id: before.id,
      collection: target.collection,
      status: before.status,
      slug: before.slug,
      link: before.link,
      title: before.title?.raw || before.title?.rendered || "",
    };
    let backupPath = null;
    let update = null;
    if (APPLY) {
      backupPath = join(BACKUP_DIR, `${target.collection}-${target.id}-${target.slug}.json`);
      writeFileSync(backupPath, JSON.stringify(before, null, 2), "utf8");
      update = await wp(`/wp/v2/${target.collection}/${target.id}`, {
        method: "POST",
        body: { status: "draft" },
      });
    }
    const after = APPLY ? await wp(`/wp/v2/${target.collection}/${target.id}?context=edit`) : before;
    const live = await headNoFollow(target.requestedUrl);
    result.targets.push({
      ...target,
      before: beforeSummary,
      backupPath,
      updatedStatus: update?.status || null,
      afterStatus: after.status,
      live,
      pass:
        (!APPLY || after.status === "draft") &&
        live.status === target.expectedStatus &&
        (!target.expectedLocation || live.location === target.expectedLocation),
    });
  }

  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify({ ok: result.targets.every((row) => row.pass), reportPath: REPORT_PATH, mode: result.mode, targets: result.targets.map((row) => ({ slug: row.slug, before: row.before.status, after: row.afterStatus, live: row.live, pass: row.pass })) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
