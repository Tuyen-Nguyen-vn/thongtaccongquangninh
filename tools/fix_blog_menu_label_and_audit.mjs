import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = process.cwd();
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-blog-menu-label-${STAMP}`);
const REPORT_PATH = join(PROJECT, `WORDPRESS_FIX_BLOG_MENU_LABEL_${STAMP}.json`);
const BLOG_URL_PATH = "/blog/";
const MENU_LABEL = "Blog";
const HOTLINE = "0963.953.533 / 0931.156.756";
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(input) {
  return (stripHtml(input).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

function fieldLength(input) {
  return [...String(input ?? "")].length;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex blog menu label fix",
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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex blog menu verify" },
    signal: AbortSignal.timeout(60000),
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

function auditBlogSeo(page) {
  const title = stripHtml(page.title?.raw ?? page.title?.rendered ?? "");
  const excerpt = stripHtml(page.excerpt?.raw ?? page.excerpt?.rendered ?? "");
  const content = page.content?.raw ?? page.content?.rendered ?? "";
  const plain = stripHtml(content);
  const headings = [...content.matchAll(/<h([1-3])[^>]*>(.*?)<\/h\1>/gis)].map((m) => ({
    level: Number(m[1]),
    text: stripHtml(m[2]),
  }));
  const h1Count = headings.filter((h) => h.level === 1).length;
  const h2Texts = headings.filter((h) => h.level === 2).map((h) => h.text);
  const imageCount = (content.match(/<img\b/gi) ?? []).length;
  const imageMissingAlt = [...content.matchAll(/<img\b[^>]*>/gi)].filter((m) => !/\balt=["'][^"']+["']/i.test(m[0])).length;
  const focus = "blog vệ sinh môi trường Quảng Ninh";
  const focusCount = (plain.match(new RegExp(focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) ?? []).length;
  const wordCount = countWords(content);

  const requiredH2 = [
    "Nguyên nhân",
    "Tại sao chọn",
    "Bảng giá",
    "Quy trình 5 bước",
    "Case study",
    "NAP liên hệ",
    "FAQ",
  ];

  const warnings = [];
  if (title !== MENU_LABEL) warnings.push("Page title vẫn rất dài; menu đã sửa riêng để không kéo nguyên title lên header.");
  if (fieldLength(title) < 60 || fieldLength(title) > 70) warnings.push(`Title dài ${fieldLength(title)} ký tự, ngoài chuẩn 60-70.`);
  if (excerpt && (fieldLength(excerpt) < 150 || fieldLength(excerpt) > 160)) warnings.push(`Meta/excerpt dài ${fieldLength(excerpt)} ký tự, nên giữ 150-160.`);
  if (h1Count !== 1) warnings.push(`H1 hiện có ${h1Count}, cần đúng 1 H1.`);
  if (!plain.includes(HOTLINE)) warnings.push("Thiếu hotline trong nội dung.");
  if (FORBIDDEN.some((word) => plain.toLowerCase().includes(word))) warnings.push("Có từ sáo rỗng trong danh sách cấm.");
  if (wordCount < 2500 || wordCount > 3000) warnings.push(`Độ dài ${wordCount} từ, ngoài chuẩn 2500-3000.`);
  for (const h2 of requiredH2) {
    if (!h2Texts.some((text) => text.toLowerCase().includes(h2.toLowerCase()))) warnings.push(`Thiếu H2 bắt buộc: ${h2}.`);
  }
  if (imageCount < 3) warnings.push(`Live content mới thấy ${imageCount} ảnh, nên có tối thiểu 3 ảnh cho bài SEO/local.`);
  if (imageMissingAlt > 0) warnings.push(`Có ${imageMissingAlt} ảnh thiếu alt text.`);
  if (/dịch vụ chính[^.]+blog vệ sinh môi trường Quảng Ninh/i.test(plain)) warnings.push("NAP đang liệt kê 'blog vệ sinh môi trường Quảng Ninh' như một dịch vụ chính, đọc sai intent.");
  if (/Bảng giá blog vệ sinh môi trường Quảng Ninh/i.test(plain)) warnings.push("H2 bảng giá biến Blog thành dịch vụ có giá, không hợp intent blog hub.");
  if (/Khu vực nhận blog vệ sinh môi trường Quảng Ninh/i.test(plain)) warnings.push("H2 khu vực nhận Blog bị sai nghĩa; nên đổi thành khu vực hỗ trợ dịch vụ.");
  if (/CTA cuối bài:/i.test(plain)) warnings.push("Đang lộ chữ 'CTA cuối bài:' trên frontend, nên bỏ nhãn kỹ thuật này.");
  if (focusCount > 18) warnings.push(`Cụm focus '${focus}' lặp ${focusCount} lần, dễ đọc như nhồi keyword.`);
  if (/Case study E-E-A-T/i.test(plain) && !/ảnh thực tế|biên bản|video thực tế/i.test(plain)) warnings.push("Case study E-E-A-T chưa có bằng chứng cụ thể; nên đổi thành tình huống thường gặp nếu chưa xác minh.");

  return {
    title,
    titleLength: fieldLength(title),
    excerpt,
    excerptLength: fieldLength(excerpt),
    wordCount,
    h1Count,
    h2Texts,
    imageCount,
    imageMissingAlt,
    focusCount,
    forbidden: FORBIDDEN.filter((word) => plain.toLowerCase().includes(word)),
    warnings,
  };
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(join(PROJECT, ".env"));
  const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const pageRows = await wp(baseUrl, auth, "/wp/v2/pages?slug=blog&context=edit&status=any");
  const blogPage = pageRows[0];
  if (!blogPage) throw new Error("Không tìm thấy page slug blog.");
  writeFileSync(join(BACKUP_DIR, `page-${blogPage.id}-blog.json`), JSON.stringify(blogPage, null, 2), "utf8");

  const menuItems = await wp(baseUrl, auth, "/wp/v2/menu-items?per_page=100&context=edit");
  const targets = menuItems.filter((item) => {
    const url = String(item.url ?? "");
    const objectId = Number(item.object_id ?? 0);
    return url.endsWith(BLOG_URL_PATH) || objectId === blogPage.id;
  });
  if (!targets.length) throw new Error("Không tìm thấy menu item trỏ về /blog/.");

  const updated = [];
  for (const item of targets) {
    writeFileSync(join(BACKUP_DIR, `menu-item-${item.id}.json`), JSON.stringify(item, null, 2), "utf8");
    if (stripHtml(item.title?.raw ?? item.title?.rendered ?? "") !== MENU_LABEL) {
      const after = await wp(baseUrl, auth, `/wp/v2/menu-items/${item.id}`, {
        method: "POST",
        body: JSON.stringify({ title: MENU_LABEL, status: "publish" }),
      });
      updated.push({ id: item.id, before: stripHtml(item.title?.raw ?? item.title?.rendered ?? ""), after: stripHtml(after.title?.raw ?? after.title?.rendered ?? "") });
    } else {
      updated.push({ id: item.id, before: MENU_LABEL, after: MENU_LABEL, skipped: true });
    }
  }

  const afterItems = await wp(baseUrl, auth, "/wp/v2/menu-items?per_page=100&context=edit");
  const afterBlogItems = afterItems
    .filter((item) => String(item.url ?? "").endsWith(BLOG_URL_PATH) || Number(item.object_id ?? 0) === blogPage.id)
    .map((item) => ({ id: item.id, title: stripHtml(item.title?.raw ?? item.title?.rendered ?? ""), url: item.url, menus: item.menus, type: item.type }));

  const live = await fetchText(`${baseUrl}${BLOG_URL_PATH}?codex_verify=${Date.now()}`);
  const longLabel = "Blog vệ sinh môi trường Quảng Ninh 24/7, xử lý nhanh trong ngày";
  const navSnippetMatch = live.text.match(/<nav[\s\S]{0,6000}<\/nav>/i);
  const navSnippet = navSnippetMatch ? stripHtml(navSnippetMatch[0]) : "";

  const freshPage = await wp(baseUrl, auth, `/wp/v2/pages/${blogPage.id}?context=edit`);
  const report = {
    ok: true,
    backupDir: BACKUP_DIR,
    page: {
      id: freshPage.id,
      slug: freshPage.slug,
      title: stripHtml(freshPage.title?.raw ?? freshPage.title?.rendered ?? ""),
      link: freshPage.link,
      status: freshPage.status,
    },
    menuUpdate: updated,
    menuVerify: {
      afterBlogItems,
      allBlogMenuItemsShort: afterBlogItems.every((item) => item.title === MENU_LABEL),
    },
    liveVerify: {
      status: live.status,
      ok: live.ok,
      containsLongMenuLabel: navSnippet ? navSnippet.includes(longLabel) : live.text.includes(longLabel),
      containsShortBlogLabel: navSnippet ? /\bBlog\b/.test(navSnippet) : live.text.includes(">Blog<"),
      navTextSample: navSnippet.slice(0, 500),
    },
    seoAudit: auditBlogSeo(freshPage),
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
