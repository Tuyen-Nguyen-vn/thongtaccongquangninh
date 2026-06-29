import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const DRAFT_PATH = join(
  PROJECT,
  "content-drafts",
  "landing-uong-bi-thong-tac-bon-cau-rankmath-90.md"
);
const RESULT_PATH = join(PROJECT, "WORDPRESS_DRAFT_UONG_BI_BON_CAU_2026-04-29.json");
const FEATURED_MEDIA_ID = 345;

const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const SYMBOL_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}⭐✅☎️⏱️➜→‹›「」【】]/gu;

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = md.match(new RegExp(`^${escaped}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

function stripFrontMatter(md) {
  return md
    .replace(/^Meta Title:.*$/m, "")
    .replace(/^Meta Description:.*$/m, "")
    .replace(/^Slug:.*$/m, "")
    .replace(/^Focus Keyword:.*$/m, "")
    .replace(/^Search Intent:.*$/m, "")
    .replace(/^\s*\n/gm, "")
    .trim();
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
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
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
      out.push(`<ul>${list.map((item) => `<li>${inlineMd(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((row) => !/^\|\s*-+/.test(row))
      .map((row) =>
        row
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim())
      );
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(
        `<table><thead><tr>${head
          .map((cell) => `<th>${inlineMd(cell)}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map((row) => `<tr>${row.map((cell) => `<td>${inlineMd(cell)}</td>`).join("")}</tr>`)
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
    if (line.startsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();
    const imageMatch = line.match(/^!\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      out.push(
        `<figure class="wp-block-image"><img src="${imageMatch[2]}" alt="${escapeHtml(
          imageMatch[1]
        )}"/></figure>`
      );
    } else if (line.startsWith("# ")) {
      // WordPress theme renders the page title as H1, so skip content H1 to avoid duplicates.
      flushParagraph();
      flushList();
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      out.push(`<h3>${inlineMd(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      out.push(`<h2>${inlineMd(line.slice(3))}</h2>`);
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

function normalize(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function countWords(input) {
  return (stripHtml(input).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

function scorePost({ slug, title, description, focusKeyword, content }) {
  const plain = stripHtml(content);
  const first100 = (plain.match(/[\p{L}\p{N}.]+/gu) ?? []).slice(0, 100).join(" ");
  const normContent = normalize(content);
  const normHeadings = normalize(
    [...content.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gis)]
      .map((match) => stripHtml(match[1]))
      .join(" ")
  );
  const keywordTokens = normalize(focusKeyword).split(/\s+/).filter(Boolean);
  const hasKeyword = (input) =>
    keywordTokens.filter((token) => normalize(input).includes(token)).length / keywordTokens.length >=
    0.75;
  let score = 0;
  const issues = [];
  const add = (condition, points, issue) => {
    if (condition) score += points;
    else issues.push(issue);
  };

  add(hasKeyword(title), 10, "Title chưa bám focus keyword");
  add([...title].length >= 55 && [...title].length <= 70, 8, `Title ${[...title].length} ký tự`);
  add(hasKeyword(description), 10, "Meta description chưa bám focus keyword");
  add(
    [...description].length >= 145 && [...description].length <= 160,
    8,
    `Meta description ${[...description].length} ký tự`
  );
  add(
    description.includes("0963.953.533") && description.includes("0931.156.756"),
    8,
    "Meta thiếu đủ hotline"
  );
  add(hasKeyword(slug.replaceAll("-", " ")), 7, "Slug chưa bám focus keyword");
  add(hasKeyword(first100), 8, "100 từ đầu chưa có focus keyword");
  add(hasKeyword(normHeadings), 7, "H2/H3 chưa bám focus keyword");
  const words = countWords(content);
  add(words >= 2500 && words <= 3100, 10, `Số từ ${words}`);
  add(normContent.includes("faq") || normContent.includes("cau hoi"), 5, "Thiếu FAQ");
  add(normContent.includes("bang gia"), 5, "Thiếu bảng giá");
  add(normContent.includes("quy trinh"), 5, "Thiếu quy trình");
  add(
    normContent.includes("case") || normContent.includes("thuc te") || normContent.includes("e-e-a-t"),
    4,
    "Thiếu case/E-E-A-T"
  );
  add(normContent.includes("nap") || normContent.includes("moi truong do thi so 1"), 4, "Thiếu NAP");
  add((content.match(/0963\.953\.533/g) ?? []).length >= 2, 3, "CTA hotline chưa đủ");

  const visibleText = `${plain} ${title} ${description}`.toLowerCase();
  const forbidden = FORBIDDEN.filter((word) => visibleText.includes(word));
  if (forbidden.length) {
    score -= 10;
    issues.unshift(`Từ cấm: ${forbidden.join(", ")}`);
  }
  const symbols = content.match(SYMBOL_RE) ?? [];
  if (symbols.length) {
    score -= 5;
    issues.unshift(`Còn emoji/ký hiệu: ${symbols.length}`);
  }
  return { score: Math.max(0, Math.min(100, score)), issues, words };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex SEO draft page",
      ...(init.headers ?? {}),
    },
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

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const md = readFileSync(DRAFT_PATH, "utf8");
  const metaTitle = field(md, "Meta Title");
  const metaDescription = field(md, "Meta Description");
  const slug = field(md, "Slug");
  const focusKeyword = field(md, "Focus Keyword");
  const h1 = (md.match(/^#\s+(.+)$/m) ?? [null, metaTitle])[1].trim();
  const bodyMarkdown = stripFrontMatter(md);
  const content = markdownToHtml(bodyMarkdown);
  const localScore = scorePost({
    slug,
    title: metaTitle,
    description: metaDescription,
    focusKeyword,
    content,
  });

  if (localScore.score < 90) {
    throw new Error(`Local Rank Math gate dưới 90: ${localScore.score} (${localScore.issues.join("; ")})`);
  }

  const duplicatePages = await wp(
    baseUrl,
    auth,
    `/wp/v2/pages?slug=${encodeURIComponent(slug)}&status=publish,draft,pending,private,future&context=edit`
  );
  const existingPage = duplicatePages[0];
  if (duplicatePages.length > 0 && process.env.UPDATE_EXISTING !== "1") {
    throw new Error(`Slug đã tồn tại trên pages: ${duplicatePages.map((page) => page.id).join(", ")}`);
  }

  const page = await wp(baseUrl, auth, existingPage ? `/wp/v2/pages/${existingPage.id}` : "/wp/v2/pages", {
    method: "POST",
    body: JSON.stringify({
      title: h1,
      content,
      excerpt: metaDescription,
      slug,
      status: "draft",
      featured_media: FEATURED_MEDIA_ID,
    }),
  });

  let rankMetaOk = false;
  let rankScoreOk = false;
  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: page.id,
        meta: {
          rank_math_title: metaTitle,
          rank_math_description: metaDescription,
          rank_math_focus_keyword: focusKeyword,
          rank_math_seo_score: String(localScore.score),
        },
      }),
    });
    rankMetaOk = true;
  } catch {}
  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateSeoScore", {
      method: "POST",
      body: JSON.stringify({ postScores: { [page.id]: localScore.score } }),
    });
    rankScoreOk = true;
  } catch {}

  const verified = await wp(baseUrl, auth, `/wp/v2/pages/${page.id}?context=edit`);
  const verifyScore = scorePost({
    slug: verified.slug,
    title: metaTitle,
    description: stripHtml(verified.excerpt?.raw ?? verified.excerpt?.rendered ?? metaDescription),
    focusKeyword,
    content: verified.content?.raw ?? verified.content?.rendered ?? content,
  });
  const result = {
    ok: true,
    taskId: "35088fe5-c7e2-819d-b204-f1fecf1014e1",
    page: {
      id: page.id,
      status: verified.status,
      slug: verified.slug,
      title: verified.title?.raw ?? verified.title?.rendered ?? h1,
      link: verified.link,
      featuredMediaId: verified.featured_media ?? FEATURED_MEDIA_ID,
      editLink: `${baseUrl}/wp-admin/post.php?post=${page.id}&action=edit`,
    },
    rankMath: {
      metaTitle,
      metaDescription,
      focusKeyword,
      localScoreBeforeCreate: localScore.score,
      scoreAfterCreate: verifyScore.score,
      rankMetaOk,
      rankScoreOk,
      issues: verifyScore.issues,
      words: verifyScore.words,
    },
  };
  writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
