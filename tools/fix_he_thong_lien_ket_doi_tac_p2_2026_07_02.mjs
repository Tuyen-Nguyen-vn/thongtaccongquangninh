import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = { id: 2022, collection: "pages", slug: "he-thong-lien-ket-doi-tac", url: `${SITE}/he-thong-lien-ket-doi-tac/` };
const FOCUS_KEYWORD = "đối tác bể phốt Quảng Ninh";
const TITLE = "Đối Tác Bể Phốt Quảng Ninh – Hệ Thống Liên Kết Truyền Thông Xác Thực";
const META_DESC =
  "Đối tác bể phốt Quảng Ninh – hệ thống liên kết truyền thông, đầu mối xác minh NAP chính thức của Thông Tắc Cống Quảng Ninh. Gọi 0963.953.533 / 0931.156.756.";
const FEATURED_MEDIA = 2104;

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p2-he-thong-lien-ket-doi-tac-${stamp}`);
const reportPath = join(ROOT, "reports", `p2-he-thong-lien-ket-doi-tac-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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
  const text = stripText(input);
  return text ? text.split(/\s+/u).filter(Boolean).length : 0;
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

function first100WordsHasKeyword(input, keyword) {
  const words = stripText(input).toLowerCase().split(/\s+/u).filter(Boolean).slice(0, 100).join(" ");
  return words.includes(keyword.toLowerCase());
}

function countMatches(input, pattern) {
  return (String(input).match(pattern) || []).length;
}

function transformContent(raw) {
  let html = raw;

  // 1) Fix banned word "uy tín" (keep meaning, drop banned term)
  html = html.replace(
    "Tăng uy tín thương hiệu địa phương",
    "Tăng độ nhận diện thương hiệu địa phương",
  );
  html = html.replace(
    "là backlink chất lượng từ nguồn uy tín địa phương",
    "là backlink chất lượng từ nguồn đã xác minh tại địa phương",
  );

  // 2) Insert focus keyword near the very start (within first 100 words)
  html = html.replace(
    '<p>Hệ thống liên kết đối tác của Môi Trường Đô Thị Số 1 Quảng Ninh là trang công bố các kênh truyền thông,',
    '<p>Đối tác bể phốt Quảng Ninh là mạng lưới hồ sơ doanh nghiệp và kênh truyền thông chính thức của Môi Trường Đô Thị Số 1 Quảng Ninh. Hệ thống liên kết đối tác của Môi Trường Đô Thị Số 1 Quảng Ninh là trang công bố các kênh truyền thông,',
  );

  // 3) Trim redundant paragraphs to bring word count into 2500-3000
  const cuts = [
    // "Vì sao không công khai danh sách hàng trăm URL" — whole section, redundant with earlier sections
    /<!-- wp:heading \{"level":2\} -->\n<h2>Vì sao không công khai danh sách hàng trăm URL<\/h2>\n<!-- \/wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Một danh sách hàng trăm URL[\s\S]*?<!-- \/wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p>Bản rút gọn vì vậy không xóa mất dữ liệu kiểm soát[\s\S]*?<!-- \/wp:paragraph -->\n\n/,
    // redundant second paragraph in "Nhóm kênh đang được quản lý"
    /<!-- wp:paragraph -->\n<p>Mỗi nhóm có cách dùng khác nhau nên không nên gom tất cả thành một lưới link lớn[\s\S]*?<!-- \/wp:paragraph -->\n\n/,
    // tangential privacy paragraph in "Cách tiếp nhận yêu cầu cập nhật từ đối tác"
    /<!-- wp:paragraph -->\n<p>Các yêu cầu liên quan đến khách hàng, hình ảnh thực tế hoặc case study[\s\S]*?<!-- \/wp:paragraph -->\n\n/,
  ];
  for (const pattern of cuts) {
    html = html.replace(pattern, "");
  }

  // 4) Sprinkle extra exact-match focus-keyword mentions across existing sections (raises density)
  const inject = [
    [
      "Trang này làm nhiệm vụ đó: xác nhận tên đơn vị, website chính, nhóm dịch vụ đang cung cấp và số điện thoại đang sử dụng.",
      "Trang này làm nhiệm vụ đó: xác nhận tên đơn vị, website chính, nhóm dịch vụ đang cung cấp và số điện thoại đang sử dụng của đối tác bể phốt Quảng Ninh.",
    ],
    [
      "Vì vậy trang đối tác không chỉ để trình bày danh bạ, mà còn là lớp xác minh công khai cho những ai cần kiểm tra lại trước khi đặt lịch.",
      "Vì vậy trang đối tác bể phốt Quảng Ninh không chỉ để trình bày danh bạ, mà còn là lớp xác minh công khai cho những ai cần kiểm tra lại trước khi đặt lịch.",
    ],
    [
      "Các hồ sơ công khai cần thể hiện tên đơn vị, lĩnh vực môi trường đô thị, khu vực Quảng Ninh hoặc nhóm dịch vụ liên quan.",
      "Các hồ sơ công khai của đối tác bể phốt Quảng Ninh cần thể hiện tên đơn vị, lĩnh vực môi trường đô thị, khu vực Quảng Ninh hoặc nhóm dịch vụ liên quan.",
    ],
    [
      "Nếu một kênh chỉ tạo ra liên kết nhưng không giúp người đọc hiểu thêm về dịch vụ, kênh đó không nên xuất hiện dày đặc trên HTML public.",
      "Nếu một kênh đối tác bể phốt Quảng Ninh chỉ tạo ra liên kết nhưng không giúp người đọc hiểu thêm về dịch vụ, kênh đó không nên xuất hiện dày đặc trên HTML public.",
    ],
    [
      "Các kênh được chia thành bốn nhóm chính.",
      "Hệ thống đối tác bể phốt Quảng Ninh được chia thành bốn nhóm chính.",
    ],
    [
      "Liên kết đối tác được kiểm tra định kỳ theo từng đợt để tránh tình trạng trang công khai chứa URL chết, URL đổi chủ hoặc URL có nội dung không còn phù hợp.",
      "Liên kết của đối tác bể phốt Quảng Ninh được kiểm tra định kỳ theo từng đợt để tránh tình trạng trang công khai chứa URL chết, URL đổi chủ hoặc URL có nội dung không còn phù hợp.",
    ],
    [
      "Nếu một liên kết đối tác bị lỗi 404, chuyển sang domain lạ hoặc không còn chứa thông tin doanh nghiệp, liên kết đó không nên nằm trên trang.",
      "Nếu một liên kết của đối tác bể phốt Quảng Ninh bị lỗi 404, chuyển sang domain lạ hoặc không còn chứa thông tin doanh nghiệp, liên kết đó không nên nằm trên trang.",
    ],
    [
      "Đối tác truyền thông khi nhắc đến Môi Trường Đô Thị Số 1 Quảng Ninh nên ghi đúng tên đơn vị, đúng website và đúng hotline.",
      "Đối tác bể phốt Quảng Ninh khi nhắc đến Môi Trường Đô Thị Số 1 Quảng Ninh nên ghi đúng tên đơn vị, đúng website và đúng hotline.",
    ],
    [
      "Khi một đối tác muốn cập nhật hồ sơ, đội vận hành cần hỏi ba thông tin: URL cần cập nhật, nội dung đang sai và nội dung đề xuất thay thế.",
      "Khi một đối tác bể phốt Quảng Ninh muốn cập nhật hồ sơ, đội vận hành cần hỏi ba thông tin: URL cần cập nhật, nội dung đang sai và nội dung đề xuất thay thế.",
    ],
    [
      "Với các hồ sơ không còn đăng nhập được, không nên cố giữ chỉ vì đã từng tạo backlink.",
      "Với các hồ sơ đối tác bể phốt Quảng Ninh không còn đăng nhập được, không nên cố giữ chỉ vì đã từng tạo backlink.",
    ],
    [
      "Đơn vị vận hành: Môi Trường Đô Thị Số 1 Quảng Ninh.",
      "Đơn vị vận hành hệ thống đối tác bể phốt Quảng Ninh: Môi Trường Đô Thị Số 1 Quảng Ninh.",
    ],
    [
      "Không. Trang này dùng để xác minh hệ thống nhận diện và quản lý các kênh đã nhắc tới thương hiệu. Các liên kết không được dùng để thay thế nội dung dịch vụ chính và không nên xuất hiện dưới dạng danh sách hàng trăm URL trên public.",
      "Không. Trang này dùng để xác minh hệ thống đối tác bể phốt Quảng Ninh và quản lý các kênh đã nhắc tới thương hiệu. Các liên kết không được dùng để thay thế nội dung dịch vụ chính và không nên xuất hiện dưới dạng danh sách hàng trăm URL trên public.",
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
    headers: { Authorization: auth, Accept: "application/json", "Content-Type": "application/json", "User-Agent": "TTCQN p2 doi-tac fix" },
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
  const response = await fetch(url, { headers: { "User-Agent": "TTCQN p2 verifier" }, signal: AbortSignal.timeout(60000) });
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
    before: { wordCount: wordCount(raw), keywordCount: keywordCount(raw, FOCUS_KEYWORD), banned: countMatches(stripText(raw), /uy tín|chuyên nghiệp|hàng đầu|tận tâm/giu) },
    after: {
      wordCount: wordCount(content),
      keywordCount: keywordCount(content, FOCUS_KEYWORD),
      density: Number(((keywordCount(content, FOCUS_KEYWORD) / wordCount(content)) * 100).toFixed(2)),
      first100HasKeyword: first100WordsHasKeyword(content, FOCUS_KEYWORD),
      banned: countMatches(stripText(content), /uy tín|chuyên nghiệp|hàng đầu|tận tâm/giu),
      titleLen: [...TITLE].length,
      descLen: [...META_DESC].length,
    },
  };

  const report = { ok: false, mode: dryRun ? "dry-run" : "apply", generatedAt: new Date().toISOString(), target: TARGET, backupDir, stats, verify: null };

  console.log(JSON.stringify(stats, null, 2));

  if (!dryRun) {
    mkdirSync(backupDir, { recursive: true });
    writeFileSync(join(backupDir, `page-${TARGET.id}-before.json`), JSON.stringify(before, null, 2) + "\n", "utf8");
    writeFileSync(join(backupDir, `page-${TARGET.id}-before-content.html`), raw, "utf8");

    await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}`, {
      method: "POST",
      body: { title: TITLE, excerpt: META_DESC, content, featured_media: FEATURED_MEDIA },
    });

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
