/**
 * Push a hut-be-phot phuong/xa article to WordPress as draft,
 * uploading images from image-package.json first.
 *
 * Usage:
 *   node tools/push_hut_be_phot_phuong_draft.mjs --slug <slug>
 *
 * Example:
 *   node tools/push_hut_be_phot_phuong_draft.mjs --slug hut-be-phot-hong-gai
 *
 * Always creates a DRAFT. Never publishes.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(join(fileURLToPath(import.meta.url), "..", ".."));
const ENV_CANDIDATES = [
  process.env.WP_ENV_PATH,
  resolve(join(ROOT, ".env")),
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
].filter(Boolean);

/* ── helpers ─────────────────────────────────────────────────────── */

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function resolveEnvPath() {
  const envPath = ENV_CANDIDATES.find((p) => existsSync(p));
  if (!envPath) {
    throw new Error(`No WordPress .env found. Tried:\n${ENV_CANDIDATES.join("\n")}`);
  }
  return envPath;
}

function localPath(p) {
  if (!p || existsSync(p)) return p;
  const m = String(p).match(/^([A-Za-z]):[\\/](.*)$/);
  if (!m) return p;
  return `/mnt/${m[1].toLowerCase()}/${m[2].replaceAll("\\", "/")}`;
}

function field(md, label) {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "m");
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

function inlineMd(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(md, imageMap) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = [];
  let table = [];

  const flushP = () => {
    if (paragraph.length) {
      out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushL = () => {
    if (list.length) {
      out.push(`<ul>${list.map((i) => `<li>${inlineMd(i)}</li>`).join("")}</ul>`);
      list = [];
    }
  };
  const flushT = () => {
    if (!table.length) return;
    const rows = table
      .filter((r) => !/^\|\s*-+/.test(r))
      .map((r) =>
        r.replace(/^\||^\|$/g, "").split("|").map((c) => c.trim())
      );
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(
        `<table><thead><tr>${head.map((c) => `<th>${inlineMd(c)}</th>`).join("")}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c) => `<td>${inlineMd(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`
      );
    }
    table = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flushP(); flushL(); flushT(); continue; }
    // Skip meta fields
    if (/^(Meta Title|Meta Description|Slug|Focus Keyword|Search Intent):/.test(line)) continue;
    // Image markdown
    if (line.startsWith("![")) {
      flushP(); flushL(); flushT();
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        const [, alt, localPath] = imgMatch;
        const fileName = basename(localPath);
        const wpUrl = imageMap[fileName];
        if (wpUrl) {
          out.push(`<figure class="wp-block-image"><img src="${wpUrl}" alt="${alt}" loading="lazy"/></figure>`);
        }
      }
      continue;
    }
    if (line.startsWith("|")) { flushP(); flushL(); table.push(line); continue; }
    flushT();
    if (line === "---") { flushP(); flushL(); out.push("<hr>"); }
    else if (line.startsWith("### ")) { flushP(); flushL(); out.push(`<h3>${inlineMd(line.slice(4))}</h3>`); }
    else if (line.startsWith("## ")) { flushP(); flushL(); out.push(`<h2>${inlineMd(line.slice(3))}</h2>`); }
    else if (line.startsWith("# ")) { flushP(); flushL(); /* Skip H1 - WP uses post title */ }
    else if (line.startsWith("- ")) { flushP(); list.push(line.slice(2)); }
    else { paragraph.push(line); }
  }
  flushP(); flushL(); flushT();
  return out.join("\n");
}

async function wpFetch(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex SEO push phuong",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = text; }
  if (!res.ok) {
    const msg = typeof payload === "object" ? payload.message ?? text : payload;
    throw new Error(`WP ${res.status} ${path}: ${msg}`);
  }
  return payload;
}

async function uploadImage(baseUrl, auth, filePath, altText, title, caption) {
  const ext = filePath.split(".").pop().toLowerCase();
  const mimeMap = { jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", png: "image/png" };
  const mime = mimeMap[ext] ?? "image/jpeg";
  const fileName = basename(filePath);

  const res = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": mime,
      "User-Agent": "Codex SEO push phuong",
    },
    body: readFileSync(filePath),
  });
  const text = await res.text();
  let media;
  try { media = JSON.parse(text); } catch { throw new Error(`Upload parse error: ${text.slice(0, 200)}`); }
  if (!res.ok) throw new Error(`Upload failed ${res.status}: ${media.message ?? text.slice(0, 200)}`);

  // Update alt, title, caption
  await wpFetch(baseUrl, auth, `/wp/v2/media/${media.id}`, {
    method: "POST",
    body: JSON.stringify({ alt_text: altText, title, caption }),
  });

  return { id: media.id, url: media.source_url ?? media.guid?.rendered, fileName };
}

/* ── main ────────────────────────────────────────────────────────── */

async function main() {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf("--slug");
  const slug = slugIdx !== -1 ? args[slugIdx + 1] : null;

  if (!slug) {
    console.error("Usage: node tools/push_hut_be_phot_phuong_draft.mjs --slug <slug>");
    process.exit(1);
  }

  const mdCandidates = [
    resolve(join(ROOT, "content-drafts", "hut-be-phot", `${slug}-rankmath-90.md`)),
    resolve(join(ROOT, "content-drafts", "thong-tac-cong", `${slug}-rankmath-90.md`)),
    resolve(join(ROOT, "content-drafts", `${slug}-rankmath-draft.md`)),
    resolve(join(ROOT, "content-drafts", `${slug}-rankmath-90.md`)),
    // handle slugs that have a city suffix in filename, e.g. thong-tac-cong-tuan-chau-ha-long
    resolve(join(ROOT, "content-drafts", `${slug}-ha-long-rankmath-draft.md`)),
    resolve(join(ROOT, "content-drafts", "blog", `${slug}-rankmath-90.md`)),
    resolve(join(ROOT, "content-drafts", "blog", `${slug}-quang-ninh-rankmath-90.md`)),
    resolve(join(ROOT, "content-drafts", "remaining", `${slug}-rankmath-90.md`)),
  ];
  const mdPath = mdCandidates.find(p => existsSync(p));
  const packagePath = resolve(join(ROOT, "image-briefs", `${slug}-image-package.json`));
  const reportPath = resolve(join(ROOT, "reports", `wp-push-${slug}-${new Date().toISOString().slice(0, 10)}.json`));

  if (!mdPath) { console.error(`MD not found. Tried:\n${mdCandidates.join("\n")}`); process.exit(1); }
  if (!existsSync(packagePath)) { console.error(`Image package not found: ${packagePath}`); process.exit(1); }

  const md = readFileSync(mdPath, "utf8").replace(/^﻿/, ""); // strip BOM
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));

  const metaTitle = field(md, "Meta Title");
  const metaDescription = field(md, "Meta Description");
  const focusKeyword = field(md, "Focus Keyword");

  if (!metaTitle) { console.error("ERROR: Meta Title missing in MD file."); process.exit(1); }

  const env = parseEnv(resolveEnvPath());
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log("=== Push Hút Bể Phốt Phường Draft ===");
  console.log(`Slug:     ${slug}`);
  console.log(`Title:    ${metaTitle}`);
  console.log(`Keyword:  ${focusKeyword}`);
  console.log(`Status:   draft (ALWAYS)`);
  console.log(`Images:   ${pkg.images.length}`);
  console.log("");

  // Test auth
  console.log("Testing WordPress auth...");
  const me = await wpFetch(baseUrl, auth, "/wp/v2/users/me");
  console.log(`Auth OK: ${me.name}`);

  // Upload images
  console.log(`\nUploading ${pkg.images.length} images...`);
  const imageMap = {};
  let featuredMediaId = null;
  const uploadResults = [];

  for (let i = 0; i < pkg.images.length; i++) {
    const img = pkg.images[i];
    // Prefer WebP, fall back to JPG
    const jpgPath = localPath(img.filePath);
    const webpPath = jpgPath?.replace(/\.jpg$/i, ".webp");
    const filePath = existsSync(webpPath ?? "") ? webpPath : jpgPath;
    if (!existsSync(filePath)) {
      console.warn(`  [${i + 1}] SKIP (file not found): ${filePath}`);
      uploadResults.push({ fileName: img.fileName, status: "skipped" });
      continue;
    }
    try {
      const result = await uploadImage(baseUrl, auth, filePath, img.altText, img.title ?? img.altText, img.caption ?? "");
      console.log(`  [${i + 1}] OK  ${result.fileName} → ${result.url}`);
      imageMap[img.fileName] = result.url;
      imageMap[basename(filePath)] = result.url;
      if (i === 0) featuredMediaId = result.id;
      uploadResults.push({ fileName: img.fileName, status: "ok", url: result.url, id: result.id });
    } catch (err) {
      console.error(`  [${i + 1}] FAIL ${img.fileName}: ${err.message}`);
      uploadResults.push({ fileName: img.fileName, status: "error", error: err.message });
    }
  }

  // Convert markdown to HTML (with image URLs injected)
  const htmlContent = markdownToHtml(md, imageMap);

  // Create post as draft
  console.log("\nCreating WordPress post (draft)...");
  const post = await wpFetch(baseUrl, auth, "/wp/v2/posts", {
    method: "POST",
    body: JSON.stringify({
      title: metaTitle,
      slug,
      content: htmlContent,
      excerpt: metaDescription,
      status: "draft",
      ...(featuredMediaId ? { featured_media: featuredMediaId } : {}),
    }),
  });
  console.log(`Post created: ID=${post.id}, status=${post.status}`);
  console.log(`Link: ${post.link}`);

  // Update Rank Math meta
  let rankMetaOk = false;
  try {
    await wpFetch(baseUrl, auth, "/rankmath/v1/updateMeta", {
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
    console.log("Rank Math meta: OK");
  } catch (err) {
    console.warn("Rank Math meta failed:", err.message);
  }

  // Write report
  const report = {
    createdAt: new Date().toISOString(),
    slug,
    postId: post.id,
    status: post.status,
    link: post.link,
    metaTitle,
    metaDescription,
    focusKeyword,
    rankMetaOk,
    images: uploadResults,
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\n=== RESULT ===");
  console.log(`Post ID:     ${post.id}`);
  console.log(`Status:      ${post.status}`);
  console.log(`Link:        ${post.link}`);
  console.log(`Rank Math:   ${rankMetaOk ? "OK" : "FAILED"}`);
  console.log(`Images OK:   ${uploadResults.filter((r) => r.status === "ok").length}/${pkg.images.length}`);
  console.log(`Report:      ${reportPath}`);
  console.log("\nTiếp theo: Tuyền review trong WP-Admin → Bài viết → Bản nháp → bấm Publish khi duyệt.");
}

main().catch((err) => {
  console.error(err.stack ?? err.message);
  process.exit(1);
});
