/**
 * Push a new landing page to WordPress as draft or publish.
 *
 * Usage:
 *   node tools/push_new_landing.mjs <markdown-file> [--publish]
 *
 * Example:
 *   node tools/push_new_landing.mjs seo-revisions/2026-04-29/landing-thong-tac-bon-cau-quang-yen.md
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertImageSeoReadyForPublish } from "./image_seo_gate.mjs";

const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";

/* ── helpers ─────────────────────────────────────────────────────── */

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, label) {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "m");
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inlineMd(input) {
  return escapeHtml(input)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = [];
  let table = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(
        `<ul>${list.map((item) => `<li>${inlineMd(item)}</li>`).join("")}</ul>`
      );
      list = [];
    }
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((row) => !/^\|\s*-+/.test(row))
      .map((row) =>
        row
          .replace(/^\||^\|$/g, "")
          .split("|")
          .map((cell) => cell.trim())
      );
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(
        `<table><thead><tr>${head
          .map((cell) => `<th>${inlineMd(cell)}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${inlineMd(cell)}</td>`).join("")}</tr>`
          )
          .join("")}</tbody></table>`
      );
    }
    table = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    // Skip HTML comment blocks (meta block)
    if (line.startsWith("<!--") || line.startsWith("-->")) continue;
    if (line.startsWith("Meta Title:") || line.startsWith("Meta Description:") || line.startsWith("Focus Keyword:")) continue;

    if (line.startsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();
    if (line === "---") {
      flushParagraph();
      flushList();
      out.push("<hr>");
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      out.push(`<h3>${inlineMd(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      out.push(`<h2>${inlineMd(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      // Skip H1 — WordPress uses post title as H1
      flushParagraph();
      flushList();
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  flushTable();
  return out.join("\n");
}

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex SEO push",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }
  if (!res.ok) {
    const msg = typeof payload === "object" ? payload.message ?? text : payload;
    throw new Error(`WordPress ${res.status} ${path}: ${msg}`);
  }
  return payload;
}

/* ── main ────────────────────────────────────────────────────────── */

async function main() {
  const args = process.argv.slice(2);
  const mdFile = args.find((a) => !a.startsWith("--"));
  const doPublish = args.includes("--publish");

  if (!mdFile) {
    console.error("Usage: node tools/push_new_landing.mjs <markdown-file> [--publish]");
    process.exit(1);
  }

  const mdPath = resolve(mdFile);
  const md = readFileSync(mdPath, "utf8");
  let imageSeoGate = null;
  if (doPublish) {
    imageSeoGate = assertImageSeoReadyForPublish({ markdownPath: mdPath });
  }

  const metaTitle = field(md, "Meta Title");
  const metaDescription = field(md, "Meta Description");
  const focusKeyword = field(md, "Focus Keyword");

  if (!metaTitle) {
    console.error("ERROR: Meta Title not found in markdown file.");
    process.exit(1);
  }

  const slug = slugify(focusKeyword || metaTitle);
  const htmlContent = markdownToHtml(md);
  const status = doPublish ? "publish" : "draft";

  console.log("== Push New Landing ==");
  console.log(`File:     ${mdPath}`);
  console.log(`Title:    ${metaTitle}`);
  console.log(`Slug:     ${slug}`);
  console.log(`Keyword:  ${focusKeyword}`);
  console.log(`Status:   ${status}`);
  if (imageSeoGate) console.log(`ImageSEO: ${imageSeoGate.status}`);
  console.log(`MetaDesc: ${metaDescription.slice(0, 80)}...`);
  console.log("");

  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  // Test auth
  console.log("Testing WordPress auth...");
  const me = await wp(baseUrl, auth, "/wp/v2/users/me");
  console.log(`Auth OK: ${me.name} (${me.slug})`);

  // Create post
  console.log("Creating post...");
  const post = await wp(baseUrl, auth, "/wp/v2/posts", {
    method: "POST",
    body: JSON.stringify({
      title: metaTitle,
      slug,
      content: htmlContent,
      excerpt: metaDescription,
      status,
    }),
  });

  console.log(`Post created: ID=${post.id}, status=${post.status}`);
  console.log(`Link: ${post.link}`);

  // Update Rank Math meta
  let rankMetaOk = false;
  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: post.id,
        meta: {
          rank_math_title: metaTitle,
          rank_math_description: metaDescription,
          rank_math_focus_keyword: focusKeyword,
        },
      }),
    });
    rankMetaOk = true;
    console.log("Rank Math meta updated: OK");
  } catch (err) {
    console.warn("Rank Math meta update failed:", err.message);
  }

  console.log("");
  console.log("=== RESULT ===");
  console.log(`Post ID:       ${post.id}`);
  console.log(`Slug:          ${slug}`);
  console.log(`Status:        ${post.status}`);
  console.log(`Link:          ${post.link}`);
  console.log(`Rank Math:     ${rankMetaOk ? "OK" : "FAILED"}`);
  console.log(`Title:         ${metaTitle}`);
  console.log(`Description:   ${metaDescription}`);
  console.log(`Focus KW:      ${focusKeyword}`);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
