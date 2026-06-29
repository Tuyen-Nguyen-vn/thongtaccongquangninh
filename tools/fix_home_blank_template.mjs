import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const PROJECT_ROOT = "D:\\.thongtaccongquangninh";
const ENV_PATH = join(PROJECT_ROOT, ".env");
const REPORT_PATH = join(PROJECT_ROOT, `WORDPRESS_FIX_HOME_BLANK_TEMPLATE_${new Date().toISOString().slice(0, 10)}.json`);

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function authHeader(env) {
  return `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
}

async function wp(baseUrl, auth, path, options = {}) {
  const response = await retryFetch(`${baseUrl}/wp-json${path}`, {
    ...options,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex emergency homepage repair",
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let body = raw;
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    throw new Error(`WP ${response.status} ${path}: ${typeof body === "object" ? body.message || raw : raw}`);
  }
  return body;
}

async function fetchHtml(url) {
  const response = await retryFetch(url, {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "User-Agent": "Mozilla/5.0 Codex emergency homepage repair",
    },
  });
  const html = await response.text();
  return {
    status: response.status,
    length: html.length,
    title: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || ["", ""])[1].trim(),
    hasHtml: /<!doctype html|<html\b/i.test(html),
    hasHotline: html.includes("0963.953.533") || html.includes("0931.156.756"),
    cache: response.headers.get("x-litespeed-cache") || response.headers.get("x-litespeed-cache-control") || "",
  };
}

async function retryFetch(url, options, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const auth = authHeader(env);

const settings = await wp(baseUrl, auth, "/wp/v2/settings");
const pageId = Number(settings.page_on_front || 23);
const before = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}?context=edit`);
const backupPath = join(PROJECT_ROOT, "backups", `page-${pageId}-before-home-blank-template-fix-${timestamp()}.json`);
mkdirSync(dirname(backupPath), { recursive: true });
writeFileSync(backupPath, `${JSON.stringify(before, null, 2)}\n`, "utf8");

const liveBefore = await fetchHtml(`${baseUrl}/`);
const updatePayload = {
  title: before.title?.raw || before.title?.rendered || undefined,
  content: before.content?.raw || "",
  status: before.status || "publish",
  template: "",
};

const updated = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}`, {
  method: "POST",
  body: JSON.stringify(updatePayload),
});
const after = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}?context=edit`);
const liveAfterNoCache = await fetchHtml(`${baseUrl}/?codex_home_fix=${Date.now()}`);
const liveAfterRoot = await fetchHtml(`${baseUrl}/`);

const report = {
  generatedAt: new Date().toISOString(),
  pageId,
  backupPath,
  action: "Set front page template to default to bypass blank custom page-home.php render.",
  before: {
    status: before.status,
    slug: before.slug,
    template: before.template,
    contentLength: (before.content?.raw || "").length,
    title: before.title?.raw || before.title?.rendered || "",
  },
  updated: {
    id: updated.id,
    modified: updated.modified,
    status: updated.status,
    template: updated.template,
  },
  after: {
    status: after.status,
    slug: after.slug,
    template: after.template,
    contentLength: (after.content?.raw || "").length,
    title: after.title?.raw || after.title?.rendered || "",
  },
  liveBefore,
  liveAfterNoCache,
  liveAfterRoot,
};

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));

if (!liveAfterRoot.hasHtml || liveAfterRoot.length < 1000) {
  process.exitCode = 1;
}
