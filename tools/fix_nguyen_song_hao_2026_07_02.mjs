import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = { id: 2356, collection: "pages", slug: "nguyen-song-hao", url: `${SITE}/nguyen-song-hao/` };
const FOCUS_KEYWORD = "Nguyễn Song Hào chuyên gia vệ sinh môi trường";
const TITLE = "Nguyễn Song Hào Chuyên Gia Vệ Sinh Môi Trường Tại Quảng Ninh";
const META_DESC =
  "Nguyễn Song Hào chuyên gia vệ sinh môi trường Quảng Ninh, 10 năm kinh nghiệm, tư vấn miễn phí. Gọi 0963.953.533 / 0931.156.756 để được hỗ trợ kỹ thuật.";

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-nguyen-song-hao-${stamp}`);
const reportPath = join(ROOT, "reports", `nguyen-song-hao-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

function parseEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripText(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

function wordCount(input) {
  const t = stripText(input);
  return t ? t.split(/\s+/u).filter(Boolean).length : 0;
}

function keywordCount(input, keyword) {
  const text = stripText(input).toLowerCase();
  const kw = keyword.toLowerCase();
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(kw, index)) !== -1) {
    count++;
    index += kw.length;
  }
  return count;
}

function countMatches(input, pattern) {
  return (String(input).match(pattern) || []).length;
}

function transformContent(raw) {
  let html = raw;

  // --- Fix broken placeholder-name bug (earlier script mistakenly replaced "Nguyễn Song Hào" with pronouns) ---
  const nameFixes = [
    ['<li><strong>Người điều hành:</strong> anh</li>', '<li><strong>Người điều hành:</strong> Nguyễn Song Hào</li>'],
    ['<h3 class="wp-block-heading">anh là ai?</h3>', '<h3 class="wp-block-heading">Nguyễn Song Hào là ai?</h3>'],
    ['<p>giám đốc sinh năm 1985, là Phó Chủ tịch', '<p>Nguyễn Song Hào sinh năm 1985, là Phó Chủ tịch'],
    ['<h3 class="wp-block-heading">giám đốc học trường nào?</h3>', '<h3 class="wp-block-heading">Nguyễn Song Hào học trường nào?</h3>'],
    ['<h3 class="wp-block-heading">giám đốc đang điều hành công ty nào?</h3>', '<h3 class="wp-block-heading">Nguyễn Song Hào đang điều hành công ty nào?</h3>'],
    ['<td>Người nhận</td><td>anh</td>', '<td>Người nhận</td><td>Nguyễn Song Hào</td>'],
    ['"name": "giám đốc", "jobTitle"', '"name": "Nguyễn Song Hào", "jobTitle"'],
    ['"name": "giám đốc là ai?", "acceptedAnswer": {"@type": "Answer", "text": "ông sinh năm 1985,',
      '"name": "Nguyễn Song Hào là ai?", "acceptedAnswer": {"@type": "Answer", "text": "Nguyễn Song Hào sinh năm 1985,'],
    ['"name": "ông học trường nào?", "acceptedAnswer": {"@type": "Answer", "text": "ông học chuyên ngành',
      '"name": "Nguyễn Song Hào học trường nào?", "acceptedAnswer": {"@type": "Answer", "text": "Nguyễn Song Hào học chuyên ngành'],
    ['"name": "ông đang điều hành công ty nào?", "acceptedAnswer": {"@type": "Answer", "text": "ông hiện giữ vai trò',
      '"name": "Nguyễn Song Hào đang điều hành công ty nào?", "acceptedAnswer": {"@type": "Answer", "text": "Nguyễn Song Hào hiện giữ vai trò'],
  ];
  for (const [from, to] of nameFixes) {
    if (!html.includes(from)) throw new Error(`Name-fix anchor not found: ${from.slice(0, 60)}...`);
    html = html.replace(from, to);
  }

  // 1) Insert focus keyword phrase right at the opening sentence (within first 100 words)
  html = html.replace(
    "<p><strong>Nguyễn Song Hào</strong>, sinh năm 1985, là Phó Chủ tịch",
    "<p><strong>Nguyễn Song Hào chuyên gia vệ sinh môi trường tại Quảng Ninh</strong>, sinh năm 1985, là Phó Chủ tịch",
  );

  // 2) Sprinkle extra exact-match focus-keyword mentions in the biography sections (raises density)
  const inject = [
    [
      "Nguyễn Song Hào lớn lên ở Thái Bình và sớm quan tâm đến công việc vệ sinh môi trường đô thị.",
      "Nguyễn Song Hào chuyên gia vệ sinh môi trường lớn lên ở Thái Bình và sớm quan tâm đến công việc vệ sinh môi trường đô thị.",
    ],
    [
      "Ở vai trò Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh, Nguyễn Song Hào trực tiếp định hướng vận hành đội ngũ,",
      "Ở vai trò Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh, Nguyễn Song Hào chuyên gia vệ sinh môi trường trực tiếp định hướng vận hành đội ngũ,",
    ],
    [
      "Liên hệ Nguyễn Song Hào để tư vấn kỹ thuật hoặc đặt lịch xử lý sự cố tại Quảng Ninh:",
      "Liên hệ Nguyễn Song Hào chuyên gia vệ sinh môi trường để tư vấn kỹ thuật hoặc đặt lịch xử lý sự cố tại Quảng Ninh:",
    ],
    [
      "Nguyễn Song Hào đào tạo chuyên ngành Kỹ thuật Môi trường tại Đại học Bách Khoa Hà Nội, sau đó có thêm 3 năm thực hành hiện trường",
      "Nguyễn Song Hào chuyên gia vệ sinh môi trường đào tạo chuyên ngành Kỹ thuật Môi trường tại Đại học Bách Khoa Hà Nội, sau đó có thêm 3 năm thực hành hiện trường",
    ],
    [
      "Nguyễn Song Hào đặt nguyên tắc \"chẩn đoán trước, xử lý sau\" làm trung tâm trong mọi ca làm việc.",
      "Nguyễn Song Hào chuyên gia vệ sinh môi trường đặt nguyên tắc \"chẩn đoán trước, xử lý sau\" làm trung tâm trong mọi ca làm việc.",
    ],
    [
      "Trang này cung cấp thông tin về học vấn, hành trình làm nghề, vai trò điều hành và các ghi nhận đã được thể hiện trên giấy chứng nhận, bằng khen.",
      "Trang này cung cấp thông tin về học vấn, hành trình làm nghề của Nguyễn Song Hào chuyên gia vệ sinh môi trường, vai trò điều hành và các ghi nhận đã được thể hiện trên giấy chứng nhận, bằng khen.",
    ],
    [
      "Triết lý làm nghề của anh là xử lý đúng nguyên nhân, làm rõ chi phí trước khi thi công và chịu trách nhiệm sau khi bàn giao.",
      "Triết lý làm nghề của Nguyễn Song Hào chuyên gia vệ sinh môi trường là xử lý đúng nguyên nhân, làm rõ chi phí trước khi thi công và chịu trách nhiệm sau khi bàn giao.",
    ],
    [
      "Một số bài viết do Nguyễn Song Hào biên soạn dựa trên kinh nghiệm thực địa tại Quảng Ninh:",
      "Một số bài viết do Nguyễn Song Hào chuyên gia vệ sinh môi trường biên soạn dựa trên kinh nghiệm thực địa tại Quảng Ninh:",
    ],
    [
      "Cần xử lý sự cố bể phốt, cống tắc hoặc mùi hôi tại Quảng Ninh? Gọi <strong>0963.953.533</strong> để đội kỹ thuật tiếp nhận tình trạng và báo phương án xử lý.",
      "Cần xử lý sự cố bể phốt, cống tắc hoặc mùi hôi tại Quảng Ninh? Liên hệ Nguyễn Song Hào chuyên gia vệ sinh môi trường qua <strong>0963.953.533</strong> để đội kỹ thuật tiếp nhận tình trạng và báo phương án xử lý.",
    ],
    [
      "Sau thời gian ôn thi và làm việc thực tế, anh theo học ngành Kỹ thuật Môi trường tại",
      "Sau thời gian ôn thi và làm việc thực tế, Nguyễn Song Hào chuyên gia vệ sinh môi trường theo học ngành Kỹ thuật Môi trường tại",
    ],
    [
      "Những trải nghiệm thực tế khi làm việc cùng công nhân môi trường tại Quảng Ninh giúp anh hiểu rõ đặc thù của nghề",
      "Những trải nghiệm thực tế khi làm việc cùng công nhân môi trường tại Quảng Ninh giúp Nguyễn Song Hào chuyên gia vệ sinh môi trường hiểu rõ đặc thù của nghề",
    ],
    [
      "Khi khách cần xử lý sự cố tại Quảng Ninh, hotline tiếp nhận là <strong>0963.953.533</strong>",
      "Khi khách cần xử lý sự cố tại Quảng Ninh, hotline tiếp nhận của Nguyễn Song Hào chuyên gia vệ sinh môi trường là <strong>0963.953.533</strong>",
    ],
    [
      "Các thông tin dưới đây được trích theo nội dung hiển thị trên giấy chứng nhận và bằng khen đã cung cấp.",
      "Các thông tin dưới đây về Nguyễn Song Hào chuyên gia vệ sinh môi trường được trích theo nội dung hiển thị trên giấy chứng nhận và bằng khen đã cung cấp.",
    ],
    [
      "<p>Công ty cung cấp dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi và vệ sinh đường ống thoát nước tại Quảng Ninh.</p>",
      "<p>Công ty cung cấp dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi và vệ sinh đường ống thoát nước tại Quảng Ninh dưới sự giám sát của Nguyễn Song Hào chuyên gia vệ sinh môi trường.</p>",
    ],
  ];
  for (const [from, to] of inject) {
    if (!html.includes(from)) throw new Error(`Inject anchor not found: ${from.slice(0, 40)}...`);
    html = html.replace(from, to);
  }

  return html;
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: { Authorization: auth, Accept: "application/json", "Content-Type": "application/json", "User-Agent": "TTCQN nguyen-song-hao fix" },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  const rawBody = await response.text();
  let payload = rawBody;
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {}
  if (!response.ok) throw new Error(`WP ${response.status} ${path}: ${typeof payload === "object" ? payload.message || rawBody : rawBody}`);
  return payload;
}

async function fetchPublic() {
  const url = new URL(TARGET.url);
  url.searchParams.set("nowprocket", "1");
  url.searchParams.set("v", String(Date.now()));
  const response = await fetch(url, { headers: { "User-Agent": "TTCQN nguyen-song-hao verifier" }, signal: AbortSignal.timeout(60000) });
  const html = await response.text();
  const metaDesc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/iu)?.[1] || "").trim();
  return { status: response.status, length: html.length, metaDescLen: [...metaDesc].length, hasFocusKeyword: html.includes(FOCUS_KEYWORD) };
}

async function main() {
  mkdirSync(dirname(reportPath), { recursive: true });

  const before = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
  if (before.slug !== TARGET.slug || before.status !== "publish") throw new Error(`Unexpected target state: ${before.slug}/${before.status}`);

  const raw = before.content?.raw || "";
  const content = transformContent(raw);

  const stats = {
    before: { wordCount: wordCount(raw), keywordCount: keywordCount(raw, FOCUS_KEYWORD) },
    after: {
      wordCount: wordCount(content),
      keywordCount: keywordCount(content, FOCUS_KEYWORD),
      density: Number(((keywordCount(content, FOCUS_KEYWORD) / wordCount(content)) * 100).toFixed(2)),
      banned: countMatches(stripText(content), /uy tín|chuyên nghiệp|hàng đầu|tận tâm/giu),
      titleLen: [...TITLE].length,
      descLen: [...META_DESC].length,
    },
  };

  console.log(JSON.stringify(stats, null, 2));

  const report = { ok: false, mode: dryRun ? "dry-run" : "apply", generatedAt: new Date().toISOString(), target: TARGET, backupDir, stats, verify: null };

  if (!dryRun) {
    mkdirSync(backupDir, { recursive: true });
    writeFileSync(join(backupDir, `page-${TARGET.id}-before.json`), JSON.stringify(before, null, 2) + "\n", "utf8");
    writeFileSync(join(backupDir, `page-${TARGET.id}-before-content.html`), raw, "utf8");

    await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}`, { method: "POST", body: { title: TITLE, excerpt: META_DESC, content } });

    try {
      report.rankMath = await wp("/rankmath/v1/updateMeta", {
        method: "POST",
        body: { objectType: "post", objectID: TARGET.id, meta: { rank_math_title: TITLE, rank_math_description: META_DESC, rank_math_focus_keyword: FOCUS_KEYWORD } },
      });
    } catch (error) {
      report.rankMath = { error: String(error.message || error) };
    }

    const after = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
    writeFileSync(join(backupDir, `page-${TARGET.id}-after.json`), JSON.stringify(after, null, 2) + "\n", "utf8");
    report.verify = await fetchPublic();
  }

  report.ok = dryRun || Boolean(report.verify?.status === 200 && report.verify?.hasFocusKeyword);
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, reportPath, backupDir, verify: report.verify }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
