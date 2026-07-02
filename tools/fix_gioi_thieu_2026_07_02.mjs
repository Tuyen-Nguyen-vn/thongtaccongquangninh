import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = { id: 62, collection: "pages", slug: "gioi-thieu", url: `${SITE}/gioi-thieu/` };
const FOCUS_KEYWORD = "dịch vụ thông tắc Quảng Ninh";
const TITLE = "Dịch Vụ Thông Tắc Quảng Ninh – Hút Bể Phốt, Thông Cống 24/7 Toàn Tỉnh";
const META_DESC =
  "Dịch vụ thông tắc Quảng Ninh: hút bể phốt, thông tắc cống bồn cầu, nạo vét hố ga. Có mặt 15-30 phút, báo giá trước, không phát sinh. Gọi 0963.953.533.";

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-gioi-thieu-${stamp}`);
const reportPath = join(ROOT, "reports", `gioi-thieu-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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

const NEW_SECTION = `
<h2>Vì sao nên chọn dịch vụ thông tắc Quảng Ninh của chúng tôi</h2>
<p>Nhiều hộ gia đình tại Quảng Ninh tự xử lý sự cố thoát nước bằng hóa chất hoặc dụng cụ tự chế trước khi gọi thợ, nhưng cách này chỉ hiệu quả với tắc nhẹ ở bề mặt. Khi nguyên nhân nằm sâu trong đường ống hoặc liên quan đến bể phốt, dịch vụ thông tắc Quảng Ninh với thiết bị chuyên dụng (máy lò xo, máy áp lực, camera nội soi) sẽ xử lý dứt điểm và tránh tái phát.</p>
<p>Khi so sánh giữa tự làm và gọi dịch vụ thông tắc Quảng Ninh, người dùng nên cân nhắc ba yếu tố: mức độ nghiêm trọng của sự cố, rủi ro hư hại đường ống nếu thao tác sai, và thời gian xử lý. Một ca tự làm không dứt điểm có thể khiến sự cố quay lại sau vài ngày, trong khi dịch vụ thông tắc Quảng Ninh có kiểm tra bằng camera nội soi giúp xác định đúng điểm tắc ngay từ lần đầu.</p>
<p>Đội thợ dịch vụ thông tắc Quảng Ninh luôn báo giá trước khi thi công và không tự ý phát sinh thêm hạng mục. Với các ca phức tạp như tắc trục đứng chung cư hoặc hố ga đầy bùn lâu năm, dịch vụ thông tắc Quảng Ninh điều thêm nhân sự và thiết bị áp lực cao để rút ngắn thời gian xử lý, hạn chế ảnh hưởng đến sinh hoạt của khách hàng.</p>
<h2>Câu hỏi thường gặp khi chọn dịch vụ thông tắc Quảng Ninh</h2>
<p>Khách hàng lần đầu sử dụng dịch vụ thông tắc Quảng Ninh thường hỏi về chi phí, thời gian có mặt và cách xác định nguyên nhân. Chi phí dịch vụ thông tắc Quảng Ninh phụ thuộc vào loại sự cố (thông tắc bồn cầu, thông tắc cống hay hút bể phốt) và mức độ khó của điểm tắc; đội thợ luôn khảo sát thực tế trước khi báo giá cuối cùng thay vì báo giá qua điện thoại.</p>
<p>Thời gian có mặt của dịch vụ thông tắc Quảng Ninh trong nội thành Hạ Long, Cẩm Phả thường từ 15-30 phút; khu vực xa hơn như Vân Đồn, Móng Cái có thể mất 30-60 phút. Với sự cố khẩn cấp như nước trào ngược, dịch vụ thông tắc Quảng Ninh ưu tiên điều xe gần nhất để hạn chế thiệt hại lan rộng. Khách hàng có thể gọi hotline bất kỳ lúc nào để được dịch vụ thông tắc Quảng Ninh tư vấn nhanh trước khi đội thợ đến tận nơi.</p>
`;

function transformContent(raw) {
  let html = raw;

  // 1) Remove the literal duplicate block (content bug: same 4 sections repeated twice)
  const duplicateBlock = `<h2>Phần kiểm tra chuyên sâu trước khi xử lý</h2>
<p>Trước khi chọn phương án, cần xác định sự cố xảy ra ở một điểm hay toàn hệ thống. Một điểm thoát chậm thường là tắc cục bộ; nhiều điểm cùng chậm thường liên quan đến hố ga, bể phốt hoặc đường ống chính.</p>
<p>Người dùng nên ghi lại thời điểm bắt đầu, đã tự xử lý bằng cách nào, có mùi hôi hay nước trào không. Những thông tin này giúp thợ chọn đúng dụng cụ và hạn chế phát sinh.</p>
<h2>Bảng quyết định nhanh</h2>
<table><thead><tr><th>Tình trạng</th><th>Có thể tự xử lý</th><th>Nên gọi thợ</th></tr></thead><tbody>
<tr><td>Nước rút chậm nhẹ, không mùi</td><td>Vệ sinh miệng thoát, thử pittong hoặc nước ấm</td><td>Nếu lặp lại nhiều lần</td></tr>
<tr><td>Có mùi hôi rõ</td><td>Kiểm tra thoát sàn/xi phông</td><td>Nếu mùi kéo dài hoặc kèm rút chậm</td></tr>
<tr><td>Nước trào ngược</td><td>Dừng xả nước, che chắn khu vực</td><td>Nên gọi sớm để tránh tràn rộng</td></tr>
<tr><td>Nghi bể phốt/hố ga đầy</td><td>Không tự mở hố sâu</td><td>Cần kiểm tra bằng dụng cụ phù hợp</td></tr>
</tbody></table>
<h2>Lỗi cần tránh</h2>
<ul>
<li>Không xả nước liên tục khi nước đã dâng cao.</li>
<li>Không trộn nhiều loại hóa chất thông tắc.</li>
<li>Không dùng vật sắc chọc sâu vào ống nhựa.</li>
<li>Không bỏ qua dấu hiệu mùi hôi kèm nước rút chậm.</li>
<li>Không chỉ xử lý bề mặt nếu sự cố lặp lại trong vài ngày.</li>
</ul>
<h2>Liên hệ hỗ trợ</h2>
<p>Với dịch vụ vệ sinh môi trường tại Quảng Ninh, hãy gọi <strong>0963.953.533 / 0931.156.756</strong> và mô tả rõ địa chỉ, dấu hiệu, thời điểm bắt đầu và ảnh hiện trường nếu có. Thợ sẽ tư vấn bước an toàn trước khi đến kiểm tra.</p>

`;
  const firstIndex = html.indexOf(duplicateBlock);
  const secondIndex = html.indexOf(duplicateBlock, firstIndex + 1);
  if (firstIndex === -1 || secondIndex === -1) throw new Error("Duplicate block not found twice as expected");
  html = html.slice(0, secondIndex) + html.slice(secondIndex + duplicateBlock.length);

  // 2) Insert focus keyword near the very start (within first 100 words)
  html = html.replace(
    "<p><strong>Chúng tôi chuyên xử lý các sự cố thoát nước dân dụng và công trình nhỏ: hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh.</strong>",
    "<p><strong>Chúng tôi cung cấp dịch vụ thông tắc Quảng Ninh chuyên xử lý các sự cố thoát nước dân dụng và công trình nhỏ: hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh.</strong>",
  );

  // 3) Fix banned word "chuyên nghiệp"
  html = html.replace(
    "dùng dụng cụ chuyên nghiệp (máy hút, búng áp lực, cần lò xo)",
    "dùng dụng cụ đúng chuẩn kỹ thuật (máy hút, búng áp lực, cần lò xo)",
  );

  // 4) Append new section with more focus-keyword mentions, before the seo-supplement block
  html = html.replace("\n\n<!-- seo-supplement -->", `\n${NEW_SECTION}\n<!-- seo-supplement -->`);

  return html;
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: { Authorization: auth, Accept: "application/json", "Content-Type": "application/json", "User-Agent": "TTCQN gioi-thieu fix" },
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
  const response = await fetch(url, { headers: { "User-Agent": "TTCQN gioi-thieu verifier" }, signal: AbortSignal.timeout(60000) });
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
