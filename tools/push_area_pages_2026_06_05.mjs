/**
 * Push 4 thong-tac-cong area pages to WordPress with real images.
 * Uploads images from local folder, replaces placeholder paths, does full content replace.
 *
 * Usage:
 *   node tools/push_area_pages_2026_06_05.mjs            → push as draft
 *   node tools/push_area_pages_2026_06_05.mjs --publish  → push and publish
 *   node tools/push_area_pages_2026_06_05.mjs --slug=thong-tac-cong-bai-chay  → single slug
 */
import { readFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const CSV_PATH = join(PROJECT, "docs", "SEO_PROGRESS.csv");
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);

const PAGES = [
  {
    slug: "thong-tac-cong-bai-chay",
    id: 2054,
    type: "posts",
    draftFile: "content-drafts/thong-tac-cong-bai-chay-rankmath-draft.md",
    imageDir: "Ảnh Đã Xử Lý SEO/thong-tac-cong-bai-chay",
    packageFile: "image-briefs/thong-tac-cong-bai-chay-image-package.json",
    difficulty: "easy",
  },
  {
    slug: "thong-tac-cong-cao-xanh",
    id: 991,
    type: "pages",
    draftFile: "content-drafts/thong-tac-cong-cao-xanh-rankmath-draft.md",
    imageDir: "Ảnh Đã Xử Lý SEO/thong-tac-cong-cao-xanh",
    packageFile: "image-briefs/thong-tac-cong-cao-xanh-image-package.json",
    difficulty: "easy",
  },
  {
    slug: "thong-tac-cong-tuan-chau",
    id: 993,
    type: "pages",
    draftFile: "content-drafts/thong-tac-cong-tuan-chau-ha-long-rankmath-draft.md",
    imageDir: "Ảnh Đã Xử Lý SEO/thong-tac-cong-tuan-chau",
    packageFile: "image-briefs/thong-tac-cong-tuan-chau-image-package.json",
    difficulty: "easy",
  },
  {
    slug: "thong-tac-cong-gieng-day",
    id: 992,
    type: "pages",
    draftFile: "content-drafts/thong-tac-cong-gieng-day-ha-long-rankmath-draft.md",
    imageDir: "Ảnh Đã Xử Lý SEO/thong-tac-cong-gieng-day",
    packageFile: "image-briefs/thong-tac-cong-gieng-day-image-package.json",
    difficulty: "easy",
  },
];

const FORBIDDEN_REPLACEMENTS = [
  [/chuyên nghiệp/gi, "đúng kỹ thuật"],
  [/uy tín/gi, "rõ giá"],
  [/hàng đầu/gi, "được gọi nhiều"],
  [/tận tâm/gi, "làm rõ việc"],
];
const SYMBOL_RE = /[⭐✅☎️⏱️➜→‹›「」【】]/g;
const AUTHOR_LINE =
  '<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>';

/* ── helpers ── */

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, label) {
  const m = md.match(new RegExp(`^${label}:\\s*(.+)$`, "mi"));
  return m ? m[1].trim() : "";
}

function cleanContent(html) {
  let v = String(html ?? "").replace(SYMBOL_RE, "");
  for (const [from, to] of FORBIDDEN_REPLACEMENTS) v = v.replace(from, to);
  return v;
}

function escapeHtml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function inlineMd(input) {
  const s = String(input);
  // If already contains HTML tags, only process markdown bold; don't re-escape
  if (/<[a-z]/i.test(s)) {
    return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

// Map placeholder filename to image slot
function slotFromPlaceholder(path) {
  const p = path.toLowerCase();
  if (p.includes("anh-dau-bai") || p.includes("dau-bai")) return "hero";
  if (p.includes("quy-trinh") || p.includes("process")) return "process";
  if (p.includes("case-study") || p.includes("case_study")) return "case-study";
  return null;
}

function buildFigure(wpUrl, altText, title, caption) {
  return (
    `<figure class="wp-block-image size-full">` +
    `<img src="${wpUrl}" alt="${escapeHtml(altText)}" title="${escapeHtml(title)}" loading="lazy">` +
    `<figcaption>${escapeHtml(caption)}</figcaption>` +
    `</figure>`
  );
}

function markdownToHtml(md, imageSlotMap) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = [];
  let table = [];
  let inRawBlock = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    out.push(`<ul>${list.map((item) => `<li>${inlineMd(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((row) => !/^\|\s*[-:]+/.test(row))
      .map((row) =>
        row
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim())
      );
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(
        `<table><thead><tr>${head.map((c) => `<th>${inlineMd(c)}</th>`).join("")}</tr></thead>` +
          `<tbody>${body
            .map(
              (row) => `<tr>${row.map((c) => `<td>${inlineMd(c)}</td>`).join("")}</tr>`
            )
            .join("")}</tbody></table>`
      );
    }
    table = [];
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    i++;

    // Raw HTML blocks (<script>, <style>)
    if (inRawBlock) {
      out.push(raw);
      if (line.startsWith("</script>") || line.startsWith("</style>")) inRawBlock = false;
      continue;
    }
    if (/^<(script|style)\b/i.test(line)) {
      flushParagraph();
      flushList();
      flushTable();
      out.push(raw);
      if (!/<\/(script|style)>/i.test(line)) inRawBlock = true;
      continue;
    }

    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    // Skip meta header fields
    if (/^(Meta Title|Meta Description|Slug|Focus Keyword|Search Intent):/i.test(line)) continue;

    // Image placeholders ![alt](src)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      flushParagraph();
      flushList();
      flushTable();
      const slot = slotFromPlaceholder(imgMatch[2]);
      const imgInfo = slot ? imageSlotMap[slot] : null;
      if (imgInfo) {
        // Consume next line if italic caption *...*
        if (i < lines.length && /^\*[^*].*[^*]\*$/.test(lines[i].trim())) i++;
        out.push(buildFigure(imgInfo.wpUrl, imgInfo.altText, imgInfo.title, imgInfo.caption));
      }
      // Unmatched placeholder: skip silently
      continue;
    }

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
      flushParagraph();
      flushList();
      // H1 skipped — WordPress uses post title
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      flushList();
      out.push(`<p>${inlineMd(line)}</p>`);
    } else if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      out.push(`<blockquote><p>${inlineMd(line.slice(2))}</p></blockquote>`);
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  flushTable();
  return out.join("\n");
}

/* ── WordPress helpers ── */

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
    const msg = typeof payload === "object" ? (payload.message ?? text) : payload;
    throw new Error(`WP ${res.status} ${path}: ${msg}`);
  }
  return payload;
}

async function uploadMedia(baseUrl, auth, filePath, altText, title, caption) {
  const fileName = filePath.replace(/\\/g, "/").split("/").pop();
  const buf = readFileSync(filePath);
  const mime = fileName.endsWith(".webp")
    ? "image/webp"
    : /\.jpe?g$/i.test(fileName)
    ? "image/jpeg"
    : "image/png";

  const uploadRes = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "User-Agent": "Codex SEO push",
    },
    body: buf,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Media upload failed (${fileName}): ${err}`);
  }
  const uploaded = await uploadRes.json();

  // Update alt, title, caption
  await fetch(`${baseUrl}/wp-json/wp/v2/media/${uploaded.id}`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex SEO push",
    },
    body: JSON.stringify({
      alt_text: altText,
      title: { raw: title },
      caption: { raw: caption },
    }),
  }).catch(() => {});

  return { id: uploaded.id, url: uploaded.source_url };
}

/* ── main ── */

async function main() {
  const args = process.argv.slice(2);
  const doPublish = args.includes("--publish");
  const onlySlug = (args.find((a) => a.startsWith("--slug=")) ?? "").replace("--slug=", "");

  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const me = await wp(baseUrl, auth, "/wp/v2/users/me");
  console.log(`Auth OK: ${me.name} — base URL: ${baseUrl}`);

  const pages = onlySlug ? PAGES.filter((p) => p.slug === onlySlug) : PAGES;
  if (!pages.length) {
    console.error(`No page found for slug: ${onlySlug}`);
    process.exit(1);
  }

  const results = [];

  for (const page of pages) {
    console.log(`\n═══ ${page.slug} (id=${page.id}) ═══`);

    // 1. Load image package
    const pkg = JSON.parse(readFileSync(join(PROJECT, page.packageFile), "utf8"));

    // 2. Upload images
    const imageSlotMap = {};
    for (const img of pkg.images) {
      const localPath = join(PROJECT, img.filePath);
      if (!existsSync(localPath)) {
        console.warn(`  SKIP: file not found: ${localPath}`);
        continue;
      }
      process.stdout.write(`  Uploading ${img.fileName}... `);
      try {
        const { id, url } = await uploadMedia(
          baseUrl,
          auth,
          localPath,
          img.altText,
          img.title,
          img.caption
        );
        imageSlotMap[img.slot] = {
          wpUrl: url,
          wpId: id,
          altText: img.altText,
          title: img.title,
          caption: img.caption,
        };
        console.log(`OK (id=${id})`);
      } catch (e) {
        console.log(`FAILED: ${e.message}`);
      }
    }

    // 3. Build HTML content from draft
    const md = readFileSync(join(PROJECT, page.draftFile), "utf8");
    const title = field(md, "Meta Title");
    const description = field(md, "Meta Description");
    const focusKeyword = field(md, "Focus Keyword");

    if (!title) {
      console.error(`  ERROR: Meta Title not found in ${page.draftFile}`);
      results.push({ ...page, finalStatus: "error", issues: "Meta Title missing" });
      continue;
    }

    const rawHtml = markdownToHtml(md, imageSlotMap);
    const content = cleanContent(rawHtml) + "\n" + AUTHOR_LINE;

    // 4. Update WordPress page/post (full replace)
    const status = doPublish ? "publish" : "draft";
    console.log(`  Pushing content (${content.length} chars, status=${status})...`);
    await wp(baseUrl, auth, `/wp/v2/${page.type}/${page.id}`, {
      method: "POST",
      body: JSON.stringify({ title, content, excerpt: description, status }),
    });
    console.log(`  Content pushed OK`);

    // 5. Update Rank Math meta
    try {
      await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
        method: "POST",
        body: JSON.stringify({
          objectType: "post",
          objectID: page.id,
          meta: {
            rank_math_title: title,
            rank_math_description: description,
            rank_math_focus_keyword: focusKeyword,
          },
        }),
      });
      console.log(`  Rank Math meta OK`);
    } catch (e) {
      console.log(`  Rank Math meta SKIP: ${e.message}`);
    }

    const imagesUploaded = Object.keys(imageSlotMap).length;
    results.push({
      slug: page.slug,
      id: page.id,
      type: page.type,
      finalStatus: status,
      imagesUploaded,
      title,
      focusKeyword,
    });
    console.log(`  DONE: ${status}, ${imagesUploaded}/${pkg.images.length} images`);
  }

  // 6. Summary
  console.log("\n═══ SUMMARY ═══");
  for (const r of results) {
    console.log(
      `${r.slug} → status=${r.finalStatus} images=${r.imagesUploaded ?? "error"}`
    );
  }

  // 7. Log to SEO_PROGRESS.csv
  const slugs = results.map((r) => r.slug).join("|");
  const issues = results
    .filter((r) => r.issues)
    .map((r) => `${r.slug}:${r.issues}`)
    .join("; ");
  const csvRow =
    `\n${TODAY},${TIME},PUSH-AREA-4-PAGES-${TODAY},push_content,thong tac cong khu vuc,` +
    `https://thongtaccongquangninh.com/thong-tac-cong-[4-pages]/,` +
    `${slugs},${doPublish ? "published" : "draft_pushed"},easy,,,,,` +
    `Push noi dung + upload anh cho 4 trang khu vuc (bai-chay/cao-xanh/tuan-chau/gieng-day),` +
    `tools/push_area_pages_2026_06_05.mjs image-briefs/ content-drafts/,` +
    `${issues || "none"},` +
    `Verify Rank Math score tren WP admin sau khi push,` +
    `Script tu dong upload anh + push HTML content voi real WP image URLs,,,,,,`;
  appendFileSync(CSV_PATH, csvRow, "utf8");
  console.log(`\nLogged to docs/SEO_PROGRESS.csv`);
}

main().catch((e) => {
  console.error(e.stack ?? e.message);
  process.exit(1);
});
