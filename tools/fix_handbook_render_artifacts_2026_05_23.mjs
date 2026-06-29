import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const DATE = "2026-05-23";
const BACKUP_DIR = join(PROJECT, "backups", `handbook-render-artifacts-before-${DATE}`);
const REPORT_PATH = join(PROJECT, `WORDPRESS_HANDBOOK_RENDER_ARTIFACT_FIX_${DATE}.json`);
const TARGETS = [
  { id: 2054, slug: "thong-tac-cong-bai-chay" },
  { id: 2053, slug: "thong-tac-cong-hong-gai-2" },
  { id: 2052, slug: "hut-be-phot-tien-yen-2" },
  { id: 2051, slug: "hut-be-phot-hai-ha-2" },
  { id: 2050, slug: "hut-be-phot-dam-ha-2" },
  { id: 2049, slug: "hut-be-phot-co-to-2" },
  { id: 2048, slug: "hut-be-phot-binh-lieu-2" },
  { id: 2047, slug: "hut-be-phot-ba-che-2" },
  { id: 2046, slug: "mui-hoi-cong-nguyen-nhan-xu-ly-4" },
  { id: 2045, slug: "hoa-chat-tu-thong-cong-3" },
  { id: 2044, slug: "chu-ky-hut-be-phot-3" },
  { id: 2043, slug: "bon-cau-rut-cham-nguyen-nhan-3" },
  { id: 2026, slug: "chi-phi-hut-be-phot-quang-ninh" },
  { id: 2025, slug: "chi-phi-hut-be-phot-quang-ninh-2", type: "pages" },
];

function parseEnv() {
  const env = {};
  for (const line of readFileSync(join(PROJECT, ".env"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv();
const BASE = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${BASE}/wp-json${path}`, {
    ...options,
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      "User-Agent": "TTCQN-Handbook-Render-Artifact-Fix/2026-05-23",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text.slice(0, 1000) };
  }
  if (!response.ok) throw new Error(`${response.status} ${path}: ${text.slice(0, 500)}`);
  return json;
}

function inspectIssues(html) {
  return {
    rawMarkdownH1: /<p>\s*#\s*[^<]+<\/p>/i.test(html),
    visibleAnchorSyntax: /\{#[^}]+\}/.test(html),
    headingCheckEmoji: /<h[2-4]\b[^>]*>[^<]*[✅☑✔]/u.test(html),
  };
}

function cleanHeadingAnchors(html) {
  return html.replace(
    /<h([2-4])([^>]*)>([\s\S]*?)\s*\{#([^}]+)\}\s*<\/h\1>/gi,
    (_match, level, attrs, text, anchor) => {
      const cleanAttrs = /\bid\s*=/.test(attrs) ? attrs : `${attrs} id="${anchor.trim()}"`;
      return `<h${level}${cleanAttrs}>${text.trim()}</h${level}>`;
    },
  );
}

function stripCheckEmojiFromHeadings(html) {
  return html.replace(
    /<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, level, attrs, text) => {
      const cleanText = text
        .replace(/[✅☑✔]/gu, "")
        .replace(/\uFE0F/gu, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      return `<h${level}${attrs}>${cleanText}</h${level}>`;
    },
  );
}

function cleanContent(html) {
  let output = String(html || "");

  output = output.replace(/<p>\s*#\s*[^<]+<\/p>\s*/gi, "");
  output = cleanHeadingAnchors(output);
  output = stripCheckEmojiFromHeadings(output);
  output = output.replace(/\s*\{#[^}]+\}/g, "");

  return output.replace(/\n{3,}/g, "\n\n").trim();
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const report = { date: DATE, baseUrl: BASE, backupDir: BACKUP_DIR, targets: [] };

  for (const target of TARGETS) {
    const type = target.type || "posts";
    const post = await wp(`/wp/v2/${type}/${target.id}?context=edit`);
    const before = post.content?.raw || "";
    const after = cleanContent(before);
    const backupPath = join(BACKUP_DIR, `${target.slug}.json`);

    if (!existsSync(backupPath)) {
      writeFileSync(backupPath, JSON.stringify(post, null, 2), "utf8");
    }

    const minExpectedLength = Math.max(1000, Math.floor(before.length * 0.8));
    if (before.length > 0 && after.length < minExpectedLength) {
      throw new Error(
        `Dừng ${target.slug}: content sau clean ngắn bất thường ${after.length}/${before.length}`,
      );
    }

    let updated = false;
    let updateStatus = "unchanged";
    if (after !== before) {
      const saved = await wp(`/wp/v2/${type}/${target.id}`, {
        method: "POST",
        body: JSON.stringify({ content: after }),
      });
      updated = true;
      updateStatus = saved.status;
    }

    report.targets.push({
      id: target.id,
      slug: target.slug,
      type,
      link: post.link,
      backupPath,
      updated,
      updateStatus,
      beforeLength: before.length,
      afterLength: after.length,
      beforeIssues: inspectIssues(before),
      afterIssues: inspectIssues(after),
    });
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
