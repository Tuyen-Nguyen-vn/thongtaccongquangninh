import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BACKUP_DIR = join(PROJECT, "seo-revisions", "wp-before-lien-he-word-count-fix-2026-04-30");
const REPORT_PATH = join(PROJECT, "WORDPRESS_FIX_LIEN_HE_WORD_COUNT_2026-04-30.json");
const PAGE_ID = 63;
const ADDENDUM = `
<p>Khi <strong>liên hệ</strong>, khách nên nói rõ địa chỉ, dấu hiệu tắc nghẽn, mùi hôi hoặc trào ngược, thời điểm phát sinh và lối xe có vào gần được không. Nếu có ảnh hiện trạng, gửi thêm để đội kỹ thuật chuẩn bị đúng máy lò xo, ống hút, dụng cụ nạo vét hoặc xe bồn trước khi đến.</p>
`;

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

function wordCount(input) {
  return (stripHtml(input).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex lien he word count fix",
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

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const page = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}?context=edit`);
  writeFileSync(join(BACKUP_DIR, `pages-${PAGE_ID}-lien-he.json`), JSON.stringify(page, null, 2), "utf8");
  const current = page.content?.raw ?? page.content?.rendered ?? "";
  const content = current.includes("Nếu có ảnh hiện trạng, gửi thêm để đội kỹ thuật")
    ? current
    : `${current.trim()}\n${ADDENDUM}`;
  const updated = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  const report = {
    ok: true,
    id: updated.id,
    link: updated.link,
    beforeWords: wordCount(current),
    afterWords: wordCount(content),
    backupDir: BACKUP_DIR,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
