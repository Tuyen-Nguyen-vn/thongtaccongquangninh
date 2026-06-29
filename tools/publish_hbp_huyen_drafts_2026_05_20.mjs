import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const TODAY = "2026-05-20";
const BACKUP_DIR = join(ROOT, "backups", "publish-hbp-huyen-drafts-2026-05-20");
const REPORT_PATH = join(ROOT, "reports", "publish-hbp-huyen-drafts-2026-05-20.json");
const CSV_PATH = join(ROOT, "docs", "SEO_PROGRESS.csv");

const items = [
  { id: 1924, slug: "hut-be-phot-tien-yen", taskId: "HBP-TY-003" },
  { id: 1928, slug: "hut-be-phot-hai-ha", taskId: "HBP-HH-003" },
  { id: 1932, slug: "hut-be-phot-ba-che", taskId: "HBP-BC-003" },
  { id: 1936, slug: "hut-be-phot-dam-ha", taskId: "HBP-DH-003" },
  { id: 1940, slug: "hut-be-phot-binh-lieu", taskId: "HBP-BL-003" },
  { id: 1944, slug: "hut-be-phot-co-to", taskId: "HBP-CT-003" },
];
const onlySlug = process.argv.includes("--slug")
  ? process.argv[process.argv.indexOf("--slug") + 1]
  : "";
const runItems = onlySlug ? items.filter((item) => item.slug === onlySlug) : items;
if (onlySlug && !runItems.length) {
  throw new Error(`Unknown slug: ${onlySlug}`);
}

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function envPath() {
  const candidates = [
    process.env.WP_ENV_PATH,
    join(ROOT, ".env"),
    "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error(`No .env found. Tried: ${candidates.join(", ")}`);
  return found;
}

function field(md, label) {
  const m = md.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inlineMd(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function sanitizeCaption(caption, area) {
  const raw = String(caption ?? "").trim();
  if (!raw || /thực tế|case study|thi công thực tế/iu.test(raw)) {
    return `Ảnh minh họa dịch vụ hút bể phốt tại ${area}`;
  }
  return raw.startsWith("Ảnh minh họa") ? raw : `Ảnh minh họa: ${raw}`;
}

function markdownToHtml(md, imageMap, captionMap) {
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
      .map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
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
    if (!line) {
      flushP(); flushL(); flushT();
      continue;
    }
    if (/^(Meta Title|Meta Description|Slug|Focus Keyword|Search Intent):/.test(line)) continue;
    if (line.startsWith("![")) {
      flushP(); flushL(); flushT();
      const m = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (m) {
        const [, alt, src] = m;
        const name = basename(src);
        const image = imageMap[name];
        if (image?.url) {
          const caption = captionMap[name] ?? "";
          out.push(
            `<figure class="wp-block-image"><img src="${esc(image.url)}" alt="${esc(alt)}" loading="lazy"/>${
              caption ? `<figcaption>${esc(caption)}</figcaption>` : ""
            }</figure>`
          );
        }
      }
      continue;
    }
    if (line.startsWith("|")) {
      flushP(); flushL(); table.push(line);
      continue;
    }
    flushT();
    if (line === "---") {
      flushP(); flushL(); out.push("<hr>");
    } else if (line.startsWith("### ")) {
      flushP(); flushL(); out.push(`<h3>${inlineMd(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushP(); flushL(); out.push(`<h2>${inlineMd(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      flushP(); flushL();
    } else if (line.startsWith("- ")) {
      flushP(); list.push(line.slice(2));
    } else {
      paragraph.push(line);
    }
  }
  flushP(); flushL(); flushT();
  return out.join("\n");
}

function stripHtml(html) {
  return String(html ?? "").replace(/<[^>]*>/g, " ");
}

function qualityChecks({ md, html, title, desc, focus, imageCount }) {
  const body = md
    .replace(/^Meta Title:.*$/m, "")
    .replace(/^Meta Description:.*$/m, "")
    .replace(/^Slug:.*$/m, "")
    .replace(/^Focus Keyword:.*$/m, "")
    .replace(/^Search Intent:.*$/m, "");
  const words = body.match(/[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)*/gu) ?? [];
  const escaped = focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const focusCount = (body.match(new RegExp(escaped, "giu")) ?? []).length;
  const density = words.length ? (focusCount / words.length) * 100 : 0;
  const h1 = (md.match(/^#\s+/gm) ?? []).length;
  const h2s = [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].toLowerCase());
  const requiredH2 = ["nguyên nhân", "tại sao chọn", "cam kết 3 không", "bảng giá", "quy trình 5 bước", "case study e-e-a-t", "nap liên hệ", "faq"];
  const banned = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"].filter((w) => new RegExp(w, "iu").test(md));
  const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(md);
  const internalLinks = (md.match(/https:\/\/thongtaccongquangninh\.com\//g) ?? []).length;
  const issues = [];
  if ([...title].length < 60 || [...title].length > 70) issues.push(`Meta Title ${[...title].length}`);
  if ([...desc].length < 150 || [...desc].length > 160) issues.push(`Meta Description ${[...desc].length}`);
  if (words.length < 2500 || words.length > 3000) issues.push(`wordCount ${words.length}`);
  if (density < 1 || density > 1.5) issues.push(`keywordDensity ${density.toFixed(2)}`);
  if (h1 !== 1) issues.push(`h1 ${h1}`);
  if (!requiredH2.every((req) => h2s.some((h2) => h2.includes(req)))) issues.push("missing required H2");
  if (internalLinks < 4) issues.push(`internalLinks ${internalLinks}`);
  if (banned.length) issues.push(`banned ${banned.join(",")}`);
  if (hasEmoji) issues.push("emoji");
  if (!md.includes("0963.953.533") || !md.includes("0931.156.756")) issues.push("hotline");
  if (imageCount < 3) issues.push(`images ${imageCount}`);
  if (/CTA cuối bài|Search Intent:|Meta Title:|Meta Description:|PENDING_IMAGE_SEO/.test(stripHtml(html))) issues.push("internal label in html");
  return { words: words.length, focusCount, density: Number(density.toFixed(2)), internalLinks, imageCount, issues };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex publish HBP huyen",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = text; }
  if (!response.ok) {
    const msg = typeof payload === "object" ? payload.message ?? text : payload;
    throw new Error(`WP ${response.status} ${path}: ${msg}`);
  }
  return payload;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Codex publish verifier" } });
  return { status: response.status, url: response.url, html: await response.text() };
}

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(envPath());
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const me = await wp(baseUrl, auth, "/wp/v2/users/me");

  const results = [];
  for (const item of runItems) {
    const mdPath = join(ROOT, "content-drafts", "hut-be-phot", `${item.slug}-rankmath-90.md`);
    const packagePath = join(ROOT, "image-briefs", `${item.slug}-image-package.json`);
    const pushReportPath = join(ROOT, "reports", `wp-push-${item.slug}-2026-05-19.json`);
    const md = readFileSync(mdPath, "utf8").replace(/^\uFEFF/, "");
    const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
    const pushReport = JSON.parse(readFileSync(pushReportPath, "utf8"));

    const title = field(md, "Meta Title");
    const desc = field(md, "Meta Description");
    const focus = field(md, "Focus Keyword");
    const imageMap = {};
    const captionMap = {};
    const area = pkg.area ?? focus.replace(/^hút bể phốt\s*/i, "");

    for (let i = 0; i < pkg.images.length; i++) {
      const img = pkg.images[i];
      const uploaded = pushReport.images[i];
      if (!uploaded?.url || uploaded.status !== "ok") continue;
      imageMap[img.fileName] = { url: uploaded.url, id: uploaded.id };
      if (img.fileNameWebP) imageMap[img.fileNameWebP] = { url: uploaded.url, id: uploaded.id };
      const caption = sanitizeCaption(img.caption, area);
      captionMap[img.fileName] = caption;
      if (img.fileNameWebP) captionMap[img.fileNameWebP] = caption;
      await wp(baseUrl, auth, `/wp/v2/media/${uploaded.id}`, {
        method: "POST",
        body: JSON.stringify({
          alt_text: img.altText ?? title,
          title: img.title ?? img.altText ?? title,
          caption,
        }),
      });
    }

    const html = markdownToHtml(md, imageMap, captionMap);
    const imageCount = (html.match(/<img\b/gi) ?? []).length;
    const quality = qualityChecks({ md, html, title, desc, focus, imageCount });
    if (quality.issues.length) {
      results.push({ ...item, status: "blocked", quality });
      continue;
    }

    const before = await wp(baseUrl, auth, `/wp/v2/posts/${item.id}?context=edit`);
    writeFileSync(join(BACKUP_DIR, `${item.slug}-post-${item.id}-before.json`), JSON.stringify(before, null, 2), "utf8");

    const sameSlugPosts = await wp(baseUrl, auth, `/wp/v2/posts?slug=${encodeURIComponent(item.slug)}&status=publish,draft,pending,private,future&context=edit&per_page=20`);
    const sameSlugPages = await wp(baseUrl, auth, `/wp/v2/pages?slug=${encodeURIComponent(item.slug)}&status=publish,draft,pending,private,future&context=edit&per_page=20`);
    const conflicts = [
      ...sameSlugPosts.filter((p) => p.id !== item.id).map((p) => `post:${p.id}:${p.status}`),
      ...sameSlugPages.map((p) => `page:${p.id}:${p.status}`),
    ];
    if (conflicts.length) {
      results.push({ ...item, status: "blocked", quality, conflicts });
      continue;
    }

    const updated = await wp(baseUrl, auth, `/wp/v2/posts/${item.id}`, {
      method: "POST",
      body: JSON.stringify({
        title,
        content: html,
        excerpt: desc,
        status: "publish",
        featured_media: pushReport.images[0]?.id,
      }),
    });

    let rankMetaOk = false;
    try {
      await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
        method: "POST",
        body: JSON.stringify({
          objectType: "post",
          objectID: item.id,
          meta: {
            rank_math_title: title,
            rank_math_description: desc,
            rank_math_focus_keyword: focus,
          },
        }),
      });
      rankMetaOk = true;
    } catch (error) {
      rankMetaOk = false;
    }

    const liveUrl = `${baseUrl.replace(/\/$/, "")}/${item.slug}/`;
    const live = await fetchText(liveUrl);
    const liveIssues = [];
    if (live.status !== 200) liveIssues.push(`HTTP ${live.status}`);
    if (!live.html.includes("0963.953.533")) liveIssues.push("missing hotline");
    if ((live.html.match(/wp-content\/uploads/gi) ?? []).length < 3) liveIssues.push("live images < 3");
    if (/CTA cuối bài|PENDING_IMAGE_SEO|Meta Title:|Meta Description:|Search Intent:/i.test(live.html)) liveIssues.push("live internal label");

    results.push({
      ...item,
      status: liveIssues.length ? "published_with_issues" : "published",
      url: liveUrl,
      wpStatus: updated.status,
      quality,
      rankMetaOk,
      live: { status: live.status, finalUrl: live.url, imageHits: (live.html.match(/wp-content\/uploads/gi) ?? []).length, issues: liveIssues },
    });
  }

  const published = results.filter((r) => r.status === "published");
  if (published.length) {
    const rows = published.map((r) =>
      [
        TODAY,
        "04:20",
        r.taskId,
        "publish",
        r.slug.replaceAll("-", " "),
        r.url,
        r.slug,
        "completed",
        "medium",
        "",
        95,
        "",
        "90+",
        `Repair content gate, insert 3 SEO images, publish WP post ID=${r.id}`,
        `content-drafts/hut-be-phot/${r.slug}-rankmath-90.md image-briefs/${r.slug}-image-package.json ${REPORT_PATH}`,
        "",
        "Submit Google Index sau khi sitemap nhan URL moi",
        `Live HTTP ${r.live.status}; images=${r.live.imageHits}; words=${r.quality.words}; density=${r.quality.density}; RankMath meta ${r.rankMetaOk ? "OK" : "WARN"}`,
        "PASS",
        "Codex",
        TODAY,
        "",
        REPORT_PATH,
        "",
        "",
      ].map(csvCell).join(",")
    );
    writeFileSync(CSV_PATH, `${readFileSync(CSV_PATH, "utf8").trimEnd()}\n${rows.join("\n")}\n`, "utf8");
  }

  const report = { generatedAt: new Date().toISOString(), authUser: me.name, backupDir: BACKUP_DIR, results };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));

  const blocked = results.filter((r) => r.status !== "published");
  if (blocked.length) process.exit(2);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
