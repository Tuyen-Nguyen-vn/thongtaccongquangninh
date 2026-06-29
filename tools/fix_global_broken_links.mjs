import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BACKUP_DIR = join(PROJECT, "seo-revisions", "wp-before-global-link-fix-2026-04-30");
const REPORT_PATH = join(PROJECT, "WORDPRESS_FIX_GLOBAL_LINKS_2026-04-30.json");

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex global broken link fix",
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

async function fetchStatus(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "Codex global broken link verify" },
      signal: AbortSignal.timeout(30000),
    });
    return { ok: response.ok, status: response.status, finalUrl: response.url };
  } catch (error) {
    return { ok: false, status: 0, error: error.message };
  }
}

async function updateHomePage(baseUrl, auth, result) {
  const pages = await wp(baseUrl, auth, "/wp/v2/pages?slug=trang-chu&status=any&context=edit");
  const page = pages[0];
  if (!page) throw new Error("Không tìm thấy trang chủ theo slug trang-chu");
  const raw = page.content?.raw ?? page.content?.rendered ?? "";
  const next = raw
    .replaceAll("/hut-be-phot-tien-yen/", "/hut-be-phot-quang-ninh/")
    .replaceAll("/ve-chung-toi/", "/gioi-thieu/");
  writeFileSync(join(BACKUP_DIR, `pages-${page.id}-trang-chu.json`), JSON.stringify(page, null, 2), "utf8");
  if (next !== raw) {
    await wp(baseUrl, auth, `/wp/v2/pages/${page.id}`, {
      method: "POST",
      body: JSON.stringify({ content: next }),
    });
  }
  result.homePage = {
    id: page.id,
    changed: next !== raw,
    replacedTienYen: raw.includes("/hut-be-phot-tien-yen/"),
    replacedVeChungToi: raw.includes("/ve-chung-toi/"),
  };
}

async function updateMenuItem(baseUrl, auth, result) {
  try {
    const item = await wp(baseUrl, auth, "/wp/v2/menu-items/201?context=edit");
    writeFileSync(join(BACKUP_DIR, "menu-item-201.json"), JSON.stringify(item, null, 2), "utf8");
    const target = await wp(baseUrl, auth, "/wp/v2/pages?slug=thong-tac-cong-quang-ninh&status=publish&context=edit");
    const targetPage = target[0];
    if (!targetPage) throw new Error("Không tìm thấy page thong-tac-cong-quang-ninh");
    const body = {
      title: item.title?.raw ?? "Vệ Sinh Đường Ống",
      url: targetPage.link,
      object_id: targetPage.id,
      object: "page",
      type: "post_type",
      status: "publish",
    };
    await wp(baseUrl, auth, "/wp/v2/menu-items/201", {
      method: "POST",
      body: JSON.stringify(body),
    });
    result.menuItem201 = {
      changed: true,
      beforeUrl: item.url,
      afterUrl: targetPage.link,
      title: stripHtml(item.title?.raw ?? item.title?.rendered ?? "Vệ Sinh Đường Ống"),
    };
  } catch (error) {
    result.menuItem201 = { changed: false, error: error.message };
  }
}

async function updateWidgets(baseUrl, auth, result) {
  result.widgets = [];
  let widgets;
  try {
    widgets = await wp(baseUrl, auth, "/wp/v2/widgets?context=edit&per_page=100");
  } catch (error) {
    result.widgets.push({ changed: false, error: error.message });
    return;
  }
  writeFileSync(join(BACKUP_DIR, "widgets.json"), JSON.stringify(widgets, null, 2), "utf8");
  for (const widget of widgets) {
    const serialized = JSON.stringify(widget);
    if (!serialized.includes("/ve-chung-toi/") && !serialized.includes("?page_id=39")) continue;
    const instance = widget.instance ?? {};
    const nextInstance = JSON.parse(JSON.stringify(instance));
    let changed = false;
    const replaceDeep = (value) => {
      if (typeof value === "string") {
        const next = value.replaceAll("/ve-chung-toi/", "/gioi-thieu/").replaceAll("?page_id=39", "thong-tac-cong-quang-ninh/");
        if (next !== value) changed = true;
        return next;
      }
      if (Array.isArray(value)) return value.map(replaceDeep);
      if (value && typeof value === "object") {
        for (const key of Object.keys(value)) value[key] = replaceDeep(value[key]);
      }
      return value;
    };
    replaceDeep(nextInstance);
    if (!changed) continue;
    try {
      await wp(baseUrl, auth, `/wp/v2/widgets/${encodeURIComponent(widget.id)}`, {
        method: "POST",
        body: JSON.stringify({ instance: nextInstance }),
      });
      result.widgets.push({ id: widget.id, changed: true });
    } catch (error) {
      result.widgets.push({ id: widget.id, changed: false, error: error.message });
    }
  }
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const result = {
    ok: true,
    backupDir: BACKUP_DIR,
    checksBefore: {},
    checksAfter: {},
  };
  for (const path of ["/?page_id=39", "/ve-chung-toi/", "/hut-be-phot-tien-yen/"]) {
    result.checksBefore[path] = await fetchStatus(`${baseUrl}${path}`);
  }
  await updateHomePage(baseUrl, auth, result);
  await updateMenuItem(baseUrl, auth, result);
  await updateWidgets(baseUrl, auth, result);
  for (const path of ["/?page_id=39", "/ve-chung-toi/", "/hut-be-phot-tien-yen/", "/gioi-thieu/", "/thong-tac-cong-quang-ninh/", "/hut-be-phot-quang-ninh/"]) {
    result.checksAfter[path] = await fetchStatus(`${baseUrl}${path}`);
  }
  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
