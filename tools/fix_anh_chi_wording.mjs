import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-anh-chi-wording-${STAMP}`);
const REPORT_PATH = join(PROJECT, `WORDPRESS_FIX_ANH_CHI_WORDING_${STAMP}.json`);
const LOCAL_REPORT_PATH = join(PROJECT, `LOCAL_FIX_ANH_CHI_WORDING_${STAMP}.json`);
const CONTENT_DRAFTS = join(PROJECT, "content-drafts");
const STATUSES = ["publish", "draft", "pending", "private"];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function replacePronouns(input) {
  return String(input ?? "")
    .replace(/(?<![\p{L}\p{N}/])Anh(?![\p{L}\p{N}/])/gu, "Anh/Chị")
    .replace(/(?<![\p{L}\p{N}/])anh(?![\p{L}\p{N}/])/gu, "anh/chị");
}

function countPronouns(input) {
  const text = String(input ?? "");
  return {
    anhUpper: (text.match(/(?<![\p{L}\p{N}/])Anh(?![\p{L}\p{N}/])/gu) ?? []).length,
    anhLower: (text.match(/(?<![\p{L}\p{N}/])anh(?![\p{L}\p{N}/])/gu) ?? []).length,
    anhChiUpper: (text.match(/Anh\/Chị/g) ?? []).length,
    anhChiLower: (text.match(/anh\/chị/g) ?? []).length,
  };
}

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function fixLocalDrafts() {
  const changed = [];
  for (const file of walkFiles(CONTENT_DRAFTS).filter((item) => extname(item).toLowerCase() === ".md")) {
    const before = readFileSync(file, "utf8");
    const after = replacePronouns(before);
    if (after === before) continue;
    writeFileSync(file, after, "utf8");
    changed.push({
      file,
      before: countPronouns(before),
      after: countPronouns(after),
    });
  }
  const report = {
    ok: true,
    changedCount: changed.length,
    changed,
  };
  writeFileSync(LOCAL_REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  return report;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex anh chi wording fix",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(60000),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? raw : payload;
    throw new Error(`WordPress ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function listCollection(baseUrl, auth, collection, status) {
  const all = [];
  for (let page = 1; page < 30; page++) {
    const items = await wp(
      baseUrl,
      auth,
      `/wp/v2/${collection}?status=${encodeURIComponent(status)}&context=edit&per_page=100&page=${page}`
    );
    all.push(...items.map((item) => ({ ...item, collection, status })));
    if (items.length < 100) break;
  }
  return all;
}

async function fixWordPress() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const items = [];
  for (const collection of ["pages", "posts"]) {
    for (const status of STATUSES) {
      try {
        items.push(...(await listCollection(baseUrl, auth, collection, status)));
      } catch (error) {
        if (!String(error.message).includes("rest_post_invalid_page_number")) throw error;
      }
    }
  }

  const changed = [];
  for (const item of items) {
    const beforeContent = item.content?.raw ?? "";
    const beforeExcerpt = item.excerpt?.raw ?? "";
    const afterContent = replacePronouns(beforeContent);
    const afterExcerpt = replacePronouns(beforeExcerpt);
    const patch = {};
    if (afterContent !== beforeContent) patch.content = afterContent;
    if (afterExcerpt !== beforeExcerpt) patch.excerpt = afterExcerpt;
    if (!Object.keys(patch).length) continue;

    writeFileSync(
      join(BACKUP_DIR, `${item.collection}-${item.id}-${item.slug || "no-slug"}.json`),
      JSON.stringify(item, null, 2),
      "utf8"
    );
    const updated = await wp(baseUrl, auth, `/wp/v2/${item.collection}/${item.id}`, {
      method: "POST",
      body: JSON.stringify(patch),
    });
    changed.push({
      collection: item.collection,
      id: item.id,
      status: item.status,
      slug: item.slug,
      link: updated.link,
      before: countPronouns(`${beforeContent}\n${beforeExcerpt}`),
      after: countPronouns(`${afterContent}\n${afterExcerpt}`),
    });
    console.log(`${item.collection}/${item.id} ${item.slug}: fixed`);
  }

  const report = {
    ok: true,
    backupDir: BACKUP_DIR,
    scannedCount: items.length,
    changedCount: changed.length,
    changed,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  return report;
}

async function main() {
  const local = fixLocalDrafts();
  const wordpress = await fixWordPress();
  console.log(
    JSON.stringify(
      {
        ok: true,
        localChanged: local.changedCount,
        wordpressChanged: wordpress.changedCount,
        reportPath: REPORT_PATH,
        localReportPath: LOCAL_REPORT_PATH,
        backupDir: BACKUP_DIR,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
