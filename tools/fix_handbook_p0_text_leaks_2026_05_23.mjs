import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const DATE = "2026-05-23";
const BACKUP_DIR = join(PROJECT, "backups", `handbook-p0-text-leaks-before-${DATE}`);
const REPORT_PATH = join(PROJECT, `WORDPRESS_HANDBOOK_P0_TEXT_FIX_${DATE}.json`);
const TARGETS = [
  { id: 2056, slug: "thong-tac-cong-gieng-day-2", trimFrom: ["Trạng thái nghiệm thu"] },
  {
    id: 2055,
    slug: "thong-tac-cong-cao-xanh-2",
    trimFrom: [
      "Gợi ý ảnh và alt",
      "Internal link đề xuất",
      "External link đề xuất",
      "Checklist Rank Math tự chấm",
    ],
  },
  { id: 2041, slug: "thong-tac-cong-tuan-chau", trimFrom: ["Trạng thái nghiệm thu"] },
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
      "User-Agent": "TTCQN-Handbook-P0-Text-Fix/2026-05-23",
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function trimH2Section(html, heading) {
  const escaped = escapeRegExp(heading);
  const section = new RegExp(
    `<h2\\b[^>]*>\\s*${escaped}\\s*<\\/h2>[\\s\\S]*?(?=<h2\\b|$)`,
    "i",
  );
  return html.replace(section, "");
}

function inspectIssues(html) {
  return {
    rawMarkdownH1: /<p>\s*#\s*[^<]+<\/p>/i.test(html),
    markdownImage: /!\[[^\]]*\]\([^)]*image-briefs[^)]*\)/i.test(html),
    escapedStrong: /&lt;\/?strong&gt;/i.test(html),
    escapedJsonLd: /&lt;script\b[^>]*application\/ld\+json/i.test(html),
    imagePackageNote: /package ảnh SEO|trạng thái chờ ảnh/i.test(html),
    pendingImageSeo: /PENDING_IMAGE_SEO|Chưa được publish/i.test(html),
    rankMathNote: /Checklist Rank Math|Điểm Rank Math|Focus keyword|SEO Title|Meta Description/i.test(html),
  };
}

function cleanContent(html, target) {
  let output = String(html || "");

  output = output.replace(/<p>\s*#\s*[^<]+<\/p>\s*/gi, "");
  output = output.replace(
    /<p>\s*!\[[^\]]*\]\([^)]*image-briefs[^)]*\)(?:(?!<\/p>)[\s\S])*<\/p>\s*/gi,
    "",
  );
  output = output.replace(/&lt;(\/?)strong&gt;/gi, "<$1strong>");
  output = output.replace(/<p>\s*&lt;script\b[\s\S]*?&lt;\/script&gt;\s*<\/p>\s*/gi, "");
  output = output.replace(
    /<p\b[^>]*>(?:(?!<\/p>)[\s\S])*(?:package ảnh SEO|giữ trạng thái chờ ảnh)(?:(?!<\/p>)[\s\S])*<\/p>\s*/gi,
    "",
  );

  for (const heading of target.trimFrom) output = trimH2Section(output, heading);

  return output.replace(/\n{3,}/g, "\n\n").trim();
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const report = {
    date: DATE,
    baseUrl: BASE,
    backupDir: BACKUP_DIR,
    targets: [],
  };

  for (const target of TARGETS) {
    const post = await wp(`/wp/v2/posts/${target.id}?context=edit`);
    const before = post.content?.raw || "";
    const after = cleanContent(before, target);
    const backupPath = join(BACKUP_DIR, `${target.slug}.json`);
    if (!existsSync(backupPath)) {
      writeFileSync(backupPath, JSON.stringify(post, null, 2), "utf8");
    }

    const minExpectedLength = Math.max(1000, Math.floor(before.length * 0.5));
    if (before.length > 0 && after.length < minExpectedLength) {
      throw new Error(
        `Dừng ${target.slug}: content sau clean ngắn bất thường ${after.length}/${before.length}`,
      );
    }

    let updated = false;
    let updateStatus = "unchanged";
    if (after !== before) {
      const saved = await wp(`/wp/v2/posts/${target.id}`, {
        method: "POST",
        body: JSON.stringify({ content: after }),
      });
      updated = true;
      updateStatus = saved.status;
    }

    report.targets.push({
      id: target.id,
      slug: target.slug,
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
