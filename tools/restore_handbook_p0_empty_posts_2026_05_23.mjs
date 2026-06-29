import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const DATE = "2026-05-23";
const BACKUP_DIR = join(PROJECT, "backups", `handbook-p0-text-leaks-before-${DATE}`);
const REPORT_PATH = join(PROJECT, `WORDPRESS_HANDBOOK_P0_RESTORE_${DATE}.json`);
const TARGETS = [
  { id: 2056, slug: "thong-tac-cong-gieng-day-2" },
  { id: 2041, slug: "thong-tac-cong-tuan-chau" },
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
      "User-Agent": "TTCQN-Handbook-P0-Restore/2026-05-23",
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

async function main() {
  const report = { date: DATE, baseUrl: BASE, restored: [] };

  for (const target of TARGETS) {
    const backup = JSON.parse(
      readFileSync(join(BACKUP_DIR, `${target.slug}.json`), "utf8"),
    );
    const content = backup.content?.raw || "";
    if (!content) throw new Error(`Backup rỗng cho ${target.slug}`);

    const current = await wp(`/wp/v2/posts/${target.id}?context=edit`);
    const saved = await wp(`/wp/v2/posts/${target.id}`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });

    report.restored.push({
      id: target.id,
      slug: target.slug,
      currentRawLength: current.content?.raw?.length || 0,
      restoredRawLength: content.length,
      savedStatus: saved.status,
      link: saved.link,
    });
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
