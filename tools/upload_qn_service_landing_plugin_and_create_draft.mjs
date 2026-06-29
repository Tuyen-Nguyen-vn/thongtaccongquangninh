import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { dirname, join } from "node:path";
import { env as shellEnv, platform } from "node:process";

function firstExisting(paths) {
  return paths.find((candidate) => existsSync(candidate)) || paths[0];
}

const PROJECT_ROOT =
  platform === "linux" && existsSync("/mnt/d/.thongtaccongquangninh")
    ? "/mnt/d/.thongtaccongquangninh"
    : firstExisting(["D:\\.thongtaccongquangninh", "/mnt/d/.thongtaccongquangninh"]);
const ROOT_IS_POSIX = PROJECT_ROOT.startsWith("/");
const fromRoot = (...parts) => (ROOT_IS_POSIX ? [PROJECT_ROOT, ...parts].join("/") : [PROJECT_ROOT, ...parts].join("\\"));
const homeDir = shellEnv.USERPROFILE || shellEnv.HOMEPATH || "C:\\Users\\DELL";
const wslUser = shellEnv.USER || "DELL";
const ENV_PATH = firstExisting([
  fromRoot(".env"),
  [homeDir, "Documents", "Codex", "2026-04-28", "chatgpt-apps-plugin-chatgpt-apps-openai", ".env"].join("\\"),
  `/mnt/c/Users/${wslUser}/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env`,
]);

const PLUGIN_SLUG = "ttcqn-qn-service-landing";
const ZIP_FILENAME = `${PLUGIN_SLUG}.zip`;
const ZIP_PATH = fromRoot("tools", "wp-plugins", ZIP_FILENAME);
const TARGET_SLUG = "hut-be-phot-thong-tac-cong-quang-ninh";
const TITLE = "Thông Tắc Cống, Hút Bể Phốt Tại Quảng Ninh | Hotline 0963.953.533";
const META_DESCRIPTION =
  "Dịch vụ thông tắc cống, thông tắc bồn cầu, xử lý mùi hôi, hút bể phốt tại Quảng Ninh. Tiếp nhận 05:00-22:00, báo giá rõ ràng. Gọi 0963.953.533.";
const FOCUS_KEYWORD = "thông tắc cống Quảng Ninh, hút bể phốt Quảng Ninh";
const SHORTCODE_CONTENT = "[ttcqn_qn_service_landing]";
const REPORT_PATH = fromRoot("WORDPRESS_QN_SERVICE_LANDING_DRAFT_2026-06-10.json");
const BACKUP_DIR = fromRoot("backups", "qn-service-landing-before-draft-2026-06-10");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function requestText(urlString, init = {}) {
  const url = new URL(urlString);
  const client = url.protocol === "https:" ? https : http;
  const body = init.body ?? null;
  const headers = { ...(init.headers ?? {}) };
  if (body && !headers["Content-Length"]) {
    headers["Content-Length"] = Buffer.byteLength(body);
  }

  const options = {
    method: init.method || (body ? "POST" : "GET"),
    headers,
    timeout: 45000,
  };

  if (url.hostname === WP_HOST && SERVER_IP) {
    options.lookup = (_hostname, lookupOptions, callback) => {
      if (lookupOptions?.all) {
        callback(null, [{ address: SERVER_IP, family: 4 }]);
        return;
      }
      callback(null, SERVER_IP, 4);
    };
    options.servername = WP_HOST;
  }

  return new Promise((resolve, reject) => {
    const req = client.request(url, options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const rawHeaders = res.headers || {};
        resolve({
          ok: Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 300),
          status: res.statusCode || 0,
          text: () => Promise.resolve(Buffer.concat(chunks).toString("utf8")),
          headers: {
            get(name) {
              const value = rawHeaders[String(name).toLowerCase()];
              return Array.isArray(value) ? value[0] : value || null;
            },
          },
        });
      });
    });

    req.on("timeout", () => req.destroy(new Error(`Request timed out: ${urlString}`)));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function readEnvFile(filePath) {
  try {
    const env = {};
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
    return env;
  } catch {
    return {};
  }
}

function readEnv() {
  const fileEnv = readEnvFile(ENV_PATH);
  const env = {
    WP_BASE_URL: fileEnv.WP_BASE_URL || shellEnv.WP_BASE_URL || "https://thongtaccongquangninh.com",
    WP_USERNAME: fileEnv.WP_USERNAME || shellEnv.WP_USERNAME,
    WP_APP_PASSWORD: fileEnv.WP_APP_PASSWORD || shellEnv.WP_APP_PASSWORD,
  };
  const missing = ["WP_USERNAME", "WP_APP_PASSWORD"].filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing required credentials: ${missing.join(", ")}`);
  return env;
}

function buildAuth(env) {
  const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
  return {
    baseUrl,
    auth: `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`,
  };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await requestText(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Codex QN service landing draft",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? text : payload;
    throw new Error(`WordPress ${response.status} ${path}: ${message}`);
  }
  return { status: response.status, payload };
}

async function rpc(url, auth, method, params, id, sessionId) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "Codex QN service landing plugin upload",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const response = await requestText(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  return { status: response.status, sessionId: response.headers.get("mcp-session-id"), payload };
}

async function callAbility(endpoint, auth, sessionId, abilityName, parameters, id) {
  return rpc(
    endpoint,
    auth,
    "tools/call",
    {
      name: "wp-mcp-ultimate-execute-ability",
      arguments: { ability_name: abilityName, parameters },
    },
    id,
    sessionId
  );
}

function extractText(payload) {
  const text = payload?.result?.content?.[0]?.text;
  if (typeof text === "string" && text.trim()) return text.trim();
  if (payload?.error) return `ERROR: ${JSON.stringify(payload.error)}`;
  return JSON.stringify(payload, null, 2);
}

function parseUpload(upload) {
  const text = extractText(upload.payload);
  let structured = upload.payload?.result?.structuredContent;
  try {
    if (text.startsWith("{")) structured = JSON.parse(text);
  } catch {}
  const successFlag =
    typeof structured?.data?.success === "boolean"
      ? structured.data.success
      : typeof structured?.success === "boolean"
        ? structured.success
        : true;
  const normalized = text.toLowerCase();
  return {
    text,
    success:
      upload.status === 200 &&
      !upload.payload?.error &&
      successFlag &&
      (/success|installed|uploaded|activated/.test(normalized)),
  };
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function uploadPlugin(baseUrl, auth) {
  if (!existsSync(ZIP_PATH)) {
    throw new Error(`Missing plugin zip file: ${ZIP_PATH}`);
  }

  const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;
  const init = await rpc(
    endpoint,
    auth,
    "initialize",
    {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "codex", version: "1" },
    },
    1
  );
  if (init.status !== 200 || !init.sessionId) {
    throw new Error(`MCP initialize failed HTTP ${init.status}: ${JSON.stringify(init.payload)}`);
  }

  const upload = await callAbility(
    endpoint,
    auth,
    init.sessionId,
    "plugins/upload-base64",
    {
      content_base64: readFileSync(ZIP_PATH).toString("base64"),
      filename: ZIP_FILENAME,
      activate: true,
      overwrite: true,
    },
    2
  );
  const parsed = parseUpload(upload);
  const plugins = await callAbility(endpoint, auth, init.sessionId, "plugins/list", { status: "active" }, 3);
  const activeList = extractText(plugins.payload);
  const activeConfirmed = activeList.toLowerCase().includes(PLUGIN_SLUG);

  return {
    endpoint,
    init,
    upload,
    uploadText: parsed.text,
    plugins,
    summary: {
      uploadSuccess: parsed.success,
      activeConfirmed,
      success: parsed.success && activeConfirmed,
    },
  };
}

async function findPagesBySlug(baseUrl, auth) {
  const path = `/wp/v2/pages?slug=${encodeURIComponent(TARGET_SLUG)}&status=any&context=edit`;
  return (await wp(baseUrl, auth, path)).payload;
}

async function backupPreChange(baseUrl, auth) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const me = await wp(baseUrl, auth, "/wp/v2/users/me?context=edit");
  const matchingPages = await findPagesBySlug(baseUrl, auth);
  const activePlugins = null;
  const backup = {
    generatedAt: new Date().toISOString(),
    envPath: ENV_PATH,
    zipPath: ZIP_PATH,
    targetSlug: TARGET_SLUG,
    authUser: {
      id: me.payload?.id,
      name: me.payload?.name,
      slug: me.payload?.slug,
    },
    matchingPages,
    activePlugins,
  };
  writeJson(join(BACKUP_DIR, "pre-change.json"), backup);
  return backup;
}

async function createOrUpdateDraftPage(baseUrl, auth, existingPages) {
  const published = existingPages.filter((page) => page.status === "publish");
  if (published.length > 0) {
    throw new Error(
      `Refusing to overwrite published page with slug "${TARGET_SLUG}". Existing IDs: ${published.map((page) => page.id).join(", ")}`
    );
  }

  const draft = existingPages.find((page) => ["draft", "pending", "future", "private"].includes(page.status));
  const body = {
    title: TITLE,
    slug: TARGET_SLUG,
    content: SHORTCODE_CONTENT,
    excerpt: META_DESCRIPTION,
    status: "draft",
  };

  if (draft) {
    const updated = await wp(baseUrl, auth, `/wp/v2/pages/${draft.id}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return { action: "updated", page: updated.payload };
  }

  const created = await wp(baseUrl, auth, "/wp/v2/pages", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { action: "created", page: created.payload };
}

async function updateRankMathMeta(baseUrl, auth, pageId) {
  try {
    const result = await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: pageId,
        meta: {
          rank_math_title: TITLE,
          rank_math_description: META_DESCRIPTION,
          rank_math_focus_keyword: FOCUS_KEYWORD,
        },
      }),
    });
    return { ok: true, result: result.payload };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function main() {
  const env = readEnv();
  const { baseUrl, auth } = buildAuth(env);
  const report = {
    generatedAt: new Date().toISOString(),
    pluginSlug: PLUGIN_SLUG,
    zipPath: ZIP_PATH,
    targetSlug: TARGET_SLUG,
    targetStatus: "draft",
  };

  report.backup = await backupPreChange(baseUrl, auth);
  report.pluginUpload = await uploadPlugin(baseUrl, auth);
  if (!report.pluginUpload.summary.success) {
    writeJson(REPORT_PATH, report);
    throw new Error(`Plugin upload failed: ${JSON.stringify(report.pluginUpload.summary)}`);
  }

  const pagesAfterUpload = await findPagesBySlug(baseUrl, auth);
  report.pageWrite = await createOrUpdateDraftPage(baseUrl, auth, pagesAfterUpload);
  report.rankMath = await updateRankMathMeta(baseUrl, auth, report.pageWrite.page.id);
  report.verifyDraft = (await wp(baseUrl, auth, `/wp/v2/pages/${report.pageWrite.page.id}?context=edit`)).payload;
  report.summary = {
    success: Boolean(report.pluginUpload.summary.success && report.pageWrite.page?.id),
    pluginActive: report.pluginUpload.summary.activeConfirmed,
    pageAction: report.pageWrite.action,
    pageId: report.pageWrite.page?.id,
    pageStatus: report.pageWrite.page?.status,
    pageLink: report.pageWrite.page?.link,
    rankMathUpdated: report.rankMath.ok,
  };

  writeJson(REPORT_PATH, report);
  console.log(JSON.stringify(report.summary, null, 2));
  if (!report.summary.success) process.exitCode = 1;
}

main().catch((error) => {
  const failure = {
    generatedAt: new Date().toISOString(),
    pluginSlug: PLUGIN_SLUG,
    zipPath: ZIP_PATH,
    targetSlug: TARGET_SLUG,
    error: error.stack ?? error.message,
  };
  writeJson(REPORT_PATH, failure);
  console.error(error.stack ?? error.message);
  process.exit(1);
});
