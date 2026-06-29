import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const PROJECT_ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = existsSync(join(PROJECT_ROOT, ".env"))
  ? join(PROJECT_ROOT, ".env")
  : existsSync("/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env")
    ? "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
    : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

async function wp(baseUrl, auth, path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...options,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex home lead form cache touch",
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    throw new Error(`WordPress ${response.status} ${path}: ${typeof payload === "object" ? payload.message || raw : raw}`);
  }
  return payload;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const reportPath = join(PROJECT_ROOT, "WORDPRESS_HOME_LEAD_FORM_CACHE_TOUCH_2026-05-12.json");

const settings = await wp(baseUrl, auth, "/wp/v2/settings");
const pageId = Number(settings.page_on_front || 23);
const before = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}?context=edit`);
const backupPath = join(PROJECT_ROOT, "backups", `page-${pageId}-before-home-lead-form-cache-touch-${timestamp()}.json`);
mkdirSync(dirname(backupPath), { recursive: true });
writeFileSync(backupPath, JSON.stringify(before, null, 2), "utf8");

const rawContent = before.content?.raw ?? "";
const rawTitle = before.title?.raw ?? before.title?.rendered ?? "";
const touched = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}`, {
  method: "POST",
  body: JSON.stringify({
    title: rawTitle,
    content: rawContent,
    status: before.status,
  }),
});
const after = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}?context=edit`);

const report = {
  generatedAt: new Date().toISOString(),
  pageId,
  backupPath,
  before: {
    status: before.status,
    slug: before.slug,
    template: before.template,
    title: rawTitle,
    contentLength: rawContent.length,
  },
  touched: {
    id: touched.id,
    modified: touched.modified,
    status: touched.status,
  },
  after: {
    status: after.status,
    slug: after.slug,
    template: after.template,
    title: after.title?.raw ?? after.title?.rendered ?? "",
    contentLength: (after.content?.raw ?? "").length,
    unchangedContent: (after.content?.raw ?? "") === rawContent,
  },
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
