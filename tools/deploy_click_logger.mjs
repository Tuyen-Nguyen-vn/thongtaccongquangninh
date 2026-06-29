import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = "D:\\.thongtaccongquangninh";
const ENV_PATH = path.join(ROOT, ".env");
const SLUG = "ttcqn-google-ads-click-logger";
const PLUGIN_FILE = path.join(ROOT, "tools", "wp-plugins", SLUG, `${SLUG}.php`);
const REPORT_PATH = path.join(ROOT, "WORDPRESS_CLICK_LOGGER_PLUGIN_UPLOAD_2026-06-21.json");
const SNIPPET_NAME = "TTCQN - Ghi log click Google Ads";

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = loadEnv(ENV_PATH);
for (const key of ["WP_BASE_URL", "WP_USERNAME", "WP_APP_PASSWORD"]) {
  if (!env[key]) throw new Error(`Thiếu ${key} trong ${ENV_PATH}`);
}
if (!existsSync(PLUGIN_FILE)) throw new Error(`Không tìm thấy ${PLUGIN_FILE}`);

const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const baseUrl = env.WP_BASE_URL.replace(/\/$/, "");

async function api(pathname, options = {}) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }
  return { status: response.status, payload };
}

let code = readFileSync(PLUGIN_FILE, "utf8").replace(/^\uFEFF?<\?php\s*/, "");
const activationHookIndex = code.indexOf("\nregister_activation_hook(");
if (activationHookIndex >= 0) code = code.slice(0, activationHookIndex).trimEnd();

const list = await api("/wp-json/code-snippets/v1/snippets?per_page=100");
if (list.status !== 200 || !Array.isArray(list.payload)) {
  throw new Error(`Không đọc được danh sách snippet: HTTP ${list.status}`);
}

const existing = list.payload.find((snippet) => snippet.name === SNIPPET_NAME);
const snippetPayload = {
  name: SNIPPET_NAME,
  desc: "Ghi GCLID, IP, user-agent và URL vào file riêng để hệ thống chống click ảo tải qua FTP.",
  code,
  tags: ["google-ads", "click-log", "ttcqn"],
  scope: "front-end",
  active: false,
  priority: 1,
};

const save = await api(
  existing
    ? `/wp-json/code-snippets/v1/snippets/${existing.id}`
    : "/wp-json/code-snippets/v1/snippets",
  {
    method: "POST",
    body: snippetPayload,
  },
);
if (![200, 201].includes(save.status)) {
  throw new Error(`Không lưu được snippet: HTTP ${save.status} ${JSON.stringify(save.payload)}`);
}

const snippetId = save.payload.id || existing?.id;
const activate = await api(`/wp-json/code-snippets/v1/snippets/${snippetId}/activate`, {
  method: "POST",
  body: {},
});

const report = {
  generatedAt: new Date().toISOString(),
  plugin: "code-snippets/code-snippets",
  snippetId,
  snippetName: SNIPPET_NAME,
  save,
  activate,
};
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({ report: REPORT_PATH, snippetId, save, activate }, null, 2));
