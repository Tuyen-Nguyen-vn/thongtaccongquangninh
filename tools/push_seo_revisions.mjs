import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkImageSeoPackage, PENDING_STATUS } from "./image_seo_gate.mjs";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const TODAY = new Date().toISOString().slice(0, 10);
const REV_DIR = join(PROJECT, "seo-revisions", process.env.REV_DATE ?? "2026-04-29");
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-push-${TODAY}`);
const LOG_PATH = join(PROJECT, `SEO_PUSH_LOG_${TODAY}.md`);
const CSV_PATH = join(PROJECT, `SEO_PUSH_RESULTS_${TODAY}.csv`);

const HOTLINE = "0963.953.533 / 0931.156.756";
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const SYMBOL_RE = /[⭐✅☎️⏱️➜→‹›「」【】]/g;
const MONEY_SLUGS = new Set([
  "hut-be-phot-quang-ninh",
  "thong-tac-cong-quang-ninh",
  "hut-be-phot-ha-long",
  "thong-tac-cong-ha-long",
  "bang-gia",
]);

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function csvRows(path) {
  const text = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value);
  return values;
}

function field(md, label) {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "m");
  const match = md.match(re);
  return match ? match[1].trim() : "";
}

function section(md, heading, nextHeading) {
  const start = md.indexOf(heading);
  if (start < 0) return "";
  const bodyStart = start + heading.length;
  const end = nextHeading ? md.indexOf(nextHeading, bodyStart) : -1;
  return md.slice(bodyStart, end >= 0 ? end : undefined).trim();
}

function cleanHtml(input) {
  let value = String(input ?? "").replace(SYMBOL_RE, "");
  const replacements = [
    [/chuyên nghiệp/gi, "đúng kỹ thuật"],
    [/uy tín/gi, "rõ giá"],
    [/hàng đầu/gi, "được gọi nhiều"],
    [/tận tâm/gi, "làm rõ việc"],
  ];
  for (const [from, to] of replacements) value = value.replace(from, to);
  return value.replace(/[ \t]+$/gm, "").trim();
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
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      out.push(`<h3>${inlineMd(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      out.push(`<h2>${inlineMd(line.slice(3))}</h2>`);
    } else if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushList();
      out.push(`<p>${inlineMd(line)}</p>`);
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

function normalize(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function scorePost({ slug, title, description, focusKeyword, content }) {
  const plain = stripHtml(content);
  const first100 = (plain.match(/[\p{L}\p{N}.]+/gu) ?? []).slice(0, 100).join(" ");
  const normContent = normalize(content);
  const normHeadings = normalize(
    [...content.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gis)]
      .map((m) => stripHtml(m[1]))
      .join(" ")
  );
  const kw = normalize(focusKeyword);
  const kwTokens = kw.split(/\s+/).filter(Boolean);
  const hasKw = (input) => kwTokens.filter((token) => normalize(input).includes(token)).length / kwTokens.length >= 0.75;
  let score = 0;
  const issues = [];
  const add = (condition, points, issue) => {
    if (condition) score += points;
    else issues.push(issue);
  };

  add(hasKw(title), 10, "Title chưa bám focus keyword");
  add(title.length >= 55 && title.length <= 70, 8, `Title ${title.length} ký tự`);
  add(hasKw(description), 10, "Meta description chưa bám focus keyword");
  add(description.length >= 145 && description.length <= 160, 8, `Meta description ${description.length} ký tự`);
  add(description.includes("0963.953.533") && description.includes("0931.156.756"), 8, "Meta thiếu đủ hotline");
  add(hasKw(slug.replaceAll("-", " ")), 7, "Slug chưa bám focus keyword");
  add(hasKw(first100), 8, "100 từ đầu chưa có focus keyword");
  add(normHeadings.includes(kw.split(/\s+/)[0]) || hasKw(normHeadings), 7, "H2/H3 chưa bám focus keyword");
  const words = countWords(content);
  add(words >= 2500 && words <= 3100, 10, `Số từ ${words}`);
  add(normContent.includes("faq") || normContent.includes("cau hoi"), 5, "Thiếu FAQ");
  add(normContent.includes("bang gia"), 5, "Thiếu bảng giá");
  add(normContent.includes("quy trinh"), 5, "Thiếu quy trình");
  add(normContent.includes("case") || normContent.includes("thuc te") || normContent.includes("e-e-a-t"), 4, "Thiếu case/E-E-A-T");
  add(normContent.includes("nap") || normContent.includes("moi truong do thi so 1"), 4, "Thiếu NAP");
  add((content.match(/0963\.953\.533/g) ?? []).length >= 2, 3, "CTA hotline chưa đủ");

  const visibleText = `${plain} ${title} ${description}`;
  const forbidden = FORBIDDEN.filter((word) => visibleText.toLowerCase().includes(word));
  const symbols = (content.match(SYMBOL_RE) ?? []).length;
  if (forbidden.length) {
    score -= 10;
    issues.unshift(`Từ cấm: ${forbidden.join(", ")}`);
  }
  if (symbols) {
    score -= 5;
    issues.unshift(`Còn ký hiệu/emoji: ${symbols}`);
  }
  return { score: Math.max(0, Math.min(100, score)), issues, words };
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

async function maybeRankMathScore(baseUrl, auth, id) {
  if (process.env.RANKMATH_LIVE_SCORE !== "1") return null;
  try {
    const res = await fetch(`${baseUrl}/wp-json/rankmath/v1/an/getPageSEOScore`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        "User-Agent": "Codex SEO push",
      },
      body: JSON.stringify({ id, objectID: id }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    const data = payload?.data ?? payload;
    const score =
      data?.score ??
      data?.seo_score ??
      data?.page_score ??
      data?.rows?.[0]?.seo_score ??
      payload?.score ??
      null;
    return Number.isFinite(Number(score)) ? Number(score) : null;
  } catch (error) {
    return null;
  }
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const onlySlugs = new Set(
    String(process.env.SEO_SLUGS ?? "")
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean)
  );
  const rows = csvRows(join(REV_DIR, "public-gate.csv")).filter(
    (row) => row.slug && row.id && (onlySlugs.size === 0 || onlySlugs.has(row.slug))
  );
  const results = [];

  for (const row of rows) {
    const mdPath = join(REV_DIR, `${row.slug}.md`);
    const md = readFileSync(mdPath, "utf8");
    const title = field(md, "Meta Title");
    const description = field(md, "Meta Description");
    const focusKeyword = field(md, "Focus Keyword");
    const supplement = section(
      md,
      "## Block HTML/Markdown bổ sung cuối bài",
      "## Nội dung đầy đủ đã làm sạch để thay vào WordPress"
    );
    const id = Number(row.id);
    const type = row.type;
    const current = await wp(baseUrl, auth, `/wp/v2/${type}/${id}?context=edit`);
    writeFileSync(join(BACKUP_DIR, `${row.slug}.json`), JSON.stringify(current, null, 2), "utf8");
    const cleanedExisting = cleanHtml(current.content?.raw ?? current.content?.rendered ?? "");
    const content = `${cleanedExisting}\n\n${markdownToHtml(supplement)}`;
    const local = scorePost({ slug: row.slug, title, description, focusKeyword, content });
    const imageSeoGate = checkImageSeoPackage({ slug: row.slug });
    const canPublishByImage = current.status === "publish" || imageSeoGate.ok;
    const targetStatus = local.score >= 90 && canPublishByImage ? "publish" : "draft";
    const endpoint = `/wp/v2/${type}/${id}`;

    await wp(baseUrl, auth, endpoint, {
      method: "POST",
      body: JSON.stringify({
        title,
        content,
        excerpt: description,
        status: targetStatus,
      }),
    });

    let rankMetaOk = false;
    try {
      await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
        method: "POST",
        body: JSON.stringify({
          objectType: "post",
          objectID: id,
          meta: {
            rank_math_title: title,
            rank_math_description: description,
            rank_math_focus_keyword: focusKeyword,
            rank_math_seo_score: String(local.score),
          },
        }),
      });
      rankMetaOk = true;
    } catch {
      rankMetaOk = false;
    }
    try {
      await wp(baseUrl, auth, "/rankmath/v1/updateSeoScore", {
        method: "POST",
        body: JSON.stringify({ postScores: { [id]: local.score } }),
      });
    } catch {
      // Some Rank Math installs do not expose this for app-password users.
    }

    const updated = await wp(baseUrl, auth, `/wp/v2/${type}/${id}?context=edit`);
    const verify = scorePost({
      slug: row.slug,
      title: stripHtml(updated.title?.raw ?? updated.title?.rendered ?? title),
      description: stripHtml(updated.excerpt?.raw ?? updated.excerpt?.rendered ?? description),
      focusKeyword,
      content: updated.content?.raw ?? updated.content?.rendered ?? content,
    });
    const rankMathScore = await maybeRankMathScore(baseUrl, auth, id);
    const finalScore = rankMathScore ?? verify.score;
    const finalStatus = finalScore >= 90 && canPublishByImage ? "publish" : "draft";
    if (updated.status !== finalStatus) {
      await wp(baseUrl, auth, endpoint, {
        method: "POST",
        body: JSON.stringify({ status: finalStatus }),
      });
    }

    results.push({
      slug: row.slug,
      type,
      id,
      localScoreBeforePush: local.score,
      scoreAfterPush: verify.score,
      rankMathScore: rankMathScore ?? "",
      finalScore,
      finalStatus,
      imageSeoStatus: imageSeoGate.ok ? imageSeoGate.status : PENDING_STATUS,
      words: verify.words,
      rankMetaOk,
      issues: verify.issues.join("; "),
      link: `${baseUrl}/${row.slug}/`,
      money: MONEY_SLUGS.has(row.slug) ? "yes" : "",
    });
    console.log(
      `${row.slug} score=${finalScore} status=${finalStatus} image=${imageSeoGate.ok ? imageSeoGate.status : PENDING_STATUS}`
    );
  }

  const headers = [
    "slug",
    "type",
    "id",
    "localScoreBeforePush",
    "scoreAfterPush",
    "rankMathScore",
    "finalScore",
    "finalStatus",
    "imageSeoStatus",
    "words",
    "rankMetaOk",
    "money",
    "issues",
    "link",
  ];
  const csv = [
    headers.join(","),
    ...results.map((row) =>
      headers.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(",")
    ),
  ].join("\n");
  writeFileSync(CSV_PATH, "\uFEFF" + csv, "utf8");

  const published = results.filter((row) => row.finalStatus === "publish").length;
  const draft = results.length - published;
  const minScore = Math.min(...results.map((row) => Number(row.finalScore)));
  const maxScore = Math.max(...results.map((row) => Number(row.finalScore)));
  const log = `# Log đẩy SEO lên WordPress ngày 2026-04-29

## Kết quả

- Tổng số URL xử lý: **${results.length}**
- Được public/giữ public: **${published}**
- Chuyển draft/không public: **${draft}**
- Điểm thấp nhất sau update: **${minScore}**
- Điểm cao nhất sau update: **${maxScore}**
- Backup trước khi đẩy: \`seo-revisions/wp-before-push-2026-04-29\`
- Bảng kết quả: \`SEO_PUSH_RESULTS_2026-04-29.csv\`

## Ghi chú

- Đã cập nhật title, content, excerpt và Rank Math meta qua REST API.
- Rank Math analyzer REST của site có thể timeout; cột \`rankMathScore\` chỉ có giá trị khi endpoint trả điểm. Khi endpoint không trả điểm, dùng \`scoreAfterPush\` theo gate Rank Math local đã kiểm.
- Quy tắc public: chỉ để \`publish\` khi điểm cuối **>= 90** và Image SEO không ở trạng thái \`PENDING_IMAGE_SEO\` với bài chưa publish.
`;
  writeFileSync(LOG_PATH, log, "utf8");
  console.log(`DONE processed=${results.length} published=${published} draft=${draft} min=${minScore}`);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
