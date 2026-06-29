import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BACKUP_DIR = join(PROJECT, "seo-revisions", "wp-before-menu-link-source-fix-2026-04-30");
const REPORT_PATH = join(PROJECT, "WORDPRESS_FIX_MENU_LINK_SOURCES_2026-04-30.json");

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex menu link source fix",
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

async function getPageBySlug(baseUrl, auth, slug) {
  const rows = await wp(baseUrl, auth, `/wp/v2/pages?slug=${encodeURIComponent(slug)}&status=any&context=edit`);
  return rows[0];
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const report = { ok: true, backupDir: BACKUP_DIR, actions: [] };

  const gioiThieu = await getPageBySlug(baseUrl, auth, "gioi-thieu");
  const thongTacCong = await getPageBySlug(baseUrl, auth, "thong-tac-cong-quang-ninh");
  const veSinhDuongOng = await getPageBySlug(baseUrl, auth, "ve-sinh-duong-ong-quang-ninh");
  if (!gioiThieu || !thongTacCong || !veSinhDuongOng) throw new Error("Thiếu page đích để sửa menu");

  for (const id of [103, 201]) {
    const item = await wp(baseUrl, auth, `/wp/v2/menu-items/${id}?context=edit`);
    writeFileSync(join(BACKUP_DIR, `menu-item-${id}.json`), JSON.stringify(item, null, 2), "utf8");
  }
  writeFileSync(join(BACKUP_DIR, `page-${veSinhDuongOng.id}.json`), JSON.stringify(veSinhDuongOng, null, 2), "utf8");

  await wp(baseUrl, auth, "/wp/v2/menu-items/103", {
    method: "POST",
    body: JSON.stringify({
      title: "Về Chúng Tôi",
      type: "custom",
      url: gioiThieu.link,
      status: "publish",
    }),
  });
  report.actions.push({ id: 103, type: "menu", url: gioiThieu.link });

  await wp(baseUrl, auth, "/wp/v2/menu-items/201", {
    method: "POST",
    body: JSON.stringify({
      title: "Vệ Sinh Đường Ống",
      type: "custom",
      url: thongTacCong.link,
      status: "publish",
      parent: 195,
      menus: 8,
    }),
  });
  report.actions.push({ id: 201, type: "menu", url: thongTacCong.link });

  // Keep the old draft reachable if cached HTML still points at ?page_id=39.
  // It is not a new article; it is an existing draft that menu/cache already exposed.
  await wp(baseUrl, auth, `/wp/v2/pages/${veSinhDuongOng.id}`, {
    method: "POST",
    body: JSON.stringify({
      status: "publish",
      title: "Vệ sinh đường ống Quảng Ninh",
      excerpt:
        "Vệ sinh đường ống Quảng Ninh, xử lý cặn bẩn, mùi hôi, dòng thoát yếu. Gọi 0963.953.533 / 0931.156.756 để kiểm tra nhanh.",
    }),
  });
  report.actions.push({ id: veSinhDuongOng.id, type: "publish-existing-page", slug: veSinhDuongOng.slug });

  const after = {};
  for (const id of [103, 201]) after[`menu-${id}`] = await wp(baseUrl, auth, `/wp/v2/menu-items/${id}?context=edit`);
  after[`page-${veSinhDuongOng.id}`] = await wp(baseUrl, auth, `/wp/v2/pages/${veSinhDuongOng.id}?context=edit`);
  report.after = after;
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
