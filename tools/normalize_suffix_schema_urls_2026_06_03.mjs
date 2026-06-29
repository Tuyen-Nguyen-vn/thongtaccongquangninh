import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = "https://thongtaccongquangninh.com";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = join(ROOT, "seo-revisions", `wp-before-schema-url-normalize-${STAMP}`);
const REPORT_JSON = join(ROOT, "reports", `schema-url-normalize-${STAMP}.json`);
const REPORT_MD = join(ROOT, "reports", `schema-url-normalize-${STAMP}.md`);

const TARGETS = [
  ["bon-cau-rut-cham-nguyen-nhan", "bon-cau-rut-cham-nguyen-nhan-3"],
  ["chi-phi-hut-be-phot-quang-ninh", "chi-phi-hut-be-phot-quang-ninh-2"],
  ["chu-ky-hut-be-phot", "chu-ky-hut-be-phot-3"],
  ["hoa-chat-tu-thong-cong", "hoa-chat-tu-thong-cong-3"],
  ["mui-hoi-cong-nguyen-nhan-xu-ly", "mui-hoi-cong-nguyen-nhan-xu-ly-4"],
  ["hut-be-phot-ba-che", "hut-be-phot-ba-che-2"],
  ["hut-be-phot-binh-lieu", "hut-be-phot-binh-lieu-2"],
  ["hut-be-phot-co-to", "hut-be-phot-co-to-2"],
  ["hut-be-phot-dam-ha", "hut-be-phot-dam-ha-2"],
  ["hut-be-phot-hai-ha", "hut-be-phot-hai-ha-2"],
  ["hut-be-phot-tien-yen", "hut-be-phot-tien-yen-2"],
  ["thong-tac-cong-hong-gai", "thong-tac-cong-hong-gai-2"],
];

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");

function parseEnv(file) {
  const env = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
}

function safeFilePart(input) {
  return String(input).replace(/[^a-zA-Z0-9_.-]+/g, "-");
}

function countNeedle(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function replaceAllExact(input, from, to) {
  return input.split(from).join(to);
}

const env = parseEnv(join(ROOT, ".env"));
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
}
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex schema URL normalizer",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let payload = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    // Keep raw text payload.
  }
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message || text : text;
    throw new Error(`WP ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function findPublishedBySlug(slug) {
  const rows = [];
  for (const collection of ["posts", "pages"]) {
    const found = await wp(`/wp/v2/${collection}?slug=${encodeURIComponent(slug)}&status=publish&context=edit&per_page=100`);
    for (const item of found) {
      rows.push({
        collection,
        id: item.id,
        slug: item.slug,
        title: stripHtml(item.title?.raw || item.title?.rendered || ""),
        link: item.link,
      });
    }
  }
  return rows;
}

async function fetchItem(collection, id) {
  return wp(`/wp/v2/${collection}/${id}?context=edit`);
}

async function updateContent(item, content, excerpt) {
  const body = { content };
  if (typeof excerpt === "string") body.excerpt = excerpt;
  return wp(`/wp/v2/${item.collection}/${item.id}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function backupItem(item, full) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const file = join(BACKUP_DIR, `${item.collection}-${item.id}-${safeFilePart(item.slug || "no-slug")}.json`);
  writeFileSync(file, JSON.stringify(full, null, 2), "utf8");
  return file;
}

function normalizeRawText(raw, canonicalSlug, oldSlug) {
  const plainFrom = `${baseUrl}/${oldSlug}/`;
  const plainTo = `${baseUrl}/${canonicalSlug}/`;
  const escapedFrom = `${baseUrl.replaceAll("/", "\\/")}\\/${oldSlug}\\/`;
  const escapedTo = `${baseUrl.replaceAll("/", "\\/")}\\/${canonicalSlug}\\/`;

  let next = raw;
  const replacements = [
    { from: plainFrom, to: plainTo, count: countNeedle(next, plainFrom) },
    { from: escapedFrom, to: escapedTo, count: countNeedle(next, escapedFrom) },
  ];

  for (const replacement of replacements) {
    next = replaceAllExact(next, replacement.from, replacement.to);
  }

  return {
    next,
    replacements,
    totalReplacements: replacements.reduce((sum, replacement) => sum + replacement.count, 0),
  };
}

const rows = [];
for (const [canonicalSlug, oldSlug] of TARGETS) {
  const found = await findPublishedBySlug(canonicalSlug);
  if (found.length !== 1) {
    rows.push({
      canonicalSlug,
      oldSlug,
      status: "failed",
      error: `Expected 1 published item, found ${found.length}`,
      found,
    });
    continue;
  }

  const item = found[0];
  const full = await fetchItem(item.collection, item.id);
  const contentRaw = full.content?.raw;
  const excerptRaw = full.excerpt?.raw;

  if (typeof contentRaw !== "string") {
    rows.push({
      canonicalSlug,
      oldSlug,
      status: "failed",
      error: "Missing editable content.raw",
      item,
    });
    continue;
  }

  const contentResult = normalizeRawText(contentRaw, canonicalSlug, oldSlug);
  const excerptResult = typeof excerptRaw === "string"
    ? normalizeRawText(excerptRaw, canonicalSlug, oldSlug)
    : { next: undefined, totalReplacements: 0, replacements: [] };
  const totalReplacements = contentResult.totalReplacements + excerptResult.totalReplacements;
  let backupFile = null;
  let updated = false;

  if (APPLY && totalReplacements > 0) {
    backupFile = backupItem(item, full);
    await updateContent(item, contentResult.next, excerptResult.next);
    updated = true;
  }

  rows.push({
    canonicalSlug,
    oldSlug,
    item,
    status: "ok",
    mode: APPLY ? "apply" : "dry-run",
    contentReplacements: contentResult.totalReplacements,
    excerptReplacements: excerptResult.totalReplacements,
    totalReplacements,
    updated,
    backupFile,
    contentPatterns: contentResult.replacements,
    excerptPatterns: excerptResult.replacements,
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  mode: APPLY ? "apply" : "dry-run",
  total: rows.length,
  ok: rows.filter((row) => row.status === "ok").length,
  failed: rows.filter((row) => row.status !== "ok").length,
  updated: rows.filter((row) => row.updated).length,
  replacements: rows.reduce((sum, row) => sum + (row.totalReplacements || 0), 0),
};

mkdirSync("reports", { recursive: true });
writeFileSync(REPORT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`, "utf8");
writeFileSync(
  REPORT_MD,
  [
    "# Schema URL Normalize",
    "",
    `- Generated: ${summary.generatedAt}`,
    `- Mode: ${summary.mode}`,
    `- Total: ${summary.total}`,
    `- OK: ${summary.ok}`,
    `- Failed: ${summary.failed}`,
    `- Updated: ${summary.updated}`,
    `- Replacements: ${summary.replacements}`,
    "",
    "| Slug sạch | Item | Replacements | Updated | Backup | Status |",
    "|---|---|---:|---:|---|---|",
    ...rows.map((row) => [
      `| ${row.canonicalSlug}`,
      row.item ? `${row.item.collection}/${row.item.id}` : "-",
      row.totalReplacements || 0,
      row.updated ? "yes" : "no",
      row.backupFile || "-",
      `${row.status}${row.error ? `: ${row.error}` : ""} |`,
    ].join(" | ")),
    "",
  ].join("\n"),
  "utf8",
);

console.log(JSON.stringify({ summary, reportJson: REPORT_JSON, reportMd: REPORT_MD }, null, 2));
if (summary.failed > 0) process.exitCode = 1;
