import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const REPORT_DIR = join(PROJECT, "logs");
const REPORT_PATH = join(REPORT_DIR, `live-md-artifacts-${new Date().toISOString().slice(0, 10)}.json`);
const SITE = "https://thongtaccongquangninh.com";
const AUTH = process.env.WP_AUTH || "";

async function wp(path) {
  const res = await fetch(`${SITE}/wp-json${path}`, {
    headers: {
      ...(AUTH ? { Authorization: AUTH } : {}),
      "User-Agent": "Codex live md artifact scan",
    },
  });
  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : [];
  } catch {
    payload = text;
  }
  if (!res.ok) throw new Error(`WP ${res.status} ${path}: ${typeof payload === "object" ? JSON.stringify(payload) : payload}`);
  return payload;
}

function detectIssues(raw) {
  const issues = [];
  if (/\[[^\]]+\]\(https?:\/\//.test(raw)) issues.push("markdown_link_raw");
  if (/^\|.+\|$/m.test(raw)) issues.push("table_row_raw");
  if (/\|\s*-{3,}\s*\|/.test(raw)) issues.push("table_separator_raw");
  return issues;
}

async function scanType(type) {
  const hits = [];
  for (let page = 1; page <= 5; page += 1) {
    const items = await wp(`/wp/v2/${type}?context=edit&per_page=100&page=${page}`);
    if (!Array.isArray(items) || !items.length) break;
    for (const item of items) {
      const raw = item?.content?.raw ?? item?.content?.rendered ?? "";
      const issues = detectIssues(String(raw));
      if (issues.length) {
        hits.push({ type, id: item.id, slug: item.slug, link: item.link, issues });
      }
    }
  }
  return hits;
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });
  const pages = await scanType("pages");
  const posts = await scanType("posts");
  const result = { generatedAt: new Date().toISOString(), pages, posts };
  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err.stack ?? err.message);
  process.exit(1);
});
