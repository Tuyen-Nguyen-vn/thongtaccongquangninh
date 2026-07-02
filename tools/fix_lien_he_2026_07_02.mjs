import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = { id: 63, collection: "pages", slug: "lien-he", url: `${SITE}/lien-he/` };
const FOCUS_KEYWORD = "liên hệ thông tắc cống Quảng Ninh";
const TITLE = "Liên Hệ Thông Tắc Cống Quảng Ninh – Hotline 24/7, Có Mặt Nhanh";
const META_DESC =
  "Liên hệ thông tắc cống Quảng Ninh qua hotline 0963.953.533 / 0931.156.756. Tiếp nhận 24/7, thợ có mặt 15-30 phút, báo giá trước khi làm, không phát sinh.";

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-lien-he-${stamp}`);
const reportPath = join(ROOT, "reports", `lien-he-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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
<h2>Vì sao nên liên hệ thông tắc cống Quảng Ninh sớm khi phát hiện sự cố</h2>
<p>Khi phát hiện cống thoát chậm, có mùi hoặc trào ngược, nhiều người có xu hướng chờ xem tình trạng có tự hết không. Thực tế, nếu liên hệ thông tắc cống Quảng Ninh ngay từ dấu hiệu đầu tiên, đội thợ có thể xử lý nhanh hơn và tránh để cặn dầu mỡ, rác thải tích tụ dày thêm gây khó xử lý về sau.</p>
<p>Việc liên hệ thông tắc cống Quảng Ninh sớm cũng giúp tiết kiệm chi phí, vì tắc nhẹ mới phát sinh thường chỉ cần dụng cụ đơn giản, trong khi để lâu có thể phải dùng máy áp lực cao hoặc camera nội soi mới xác định đúng điểm nghẹt. Đội thợ luôn khuyến khích khách hàng liên hệ thông tắc cống Quảng Ninh ngay khi thấy dấu hiệu bất thường thay vì chờ đến khi tắc hoàn toàn.</p>
<p>Với các hộ gia đình lần đầu liên hệ thông tắc cống Quảng Ninh, đội điều phối sẽ hỏi kỹ vị trí, mức độ tắc và thời điểm bắt đầu để chuẩn bị đúng thiết bị trước khi lên đường, tránh mất thời gian quay lại lấy dụng cụ. Doanh nghiệp, nhà hàng hoặc khách sạn khi liên hệ thông tắc cống Quảng Ninh có thể yêu cầu khung giờ xử lý ít ảnh hưởng khách, ví dụ ngoài giờ cao điểm hoặc sau khi đóng cửa.</p>
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
<p>Với việc đặt lịch xử lý sự cố tại Quảng Ninh, hãy gọi <strong>0963.953.533 / 0931.156.756</strong> và mô tả rõ địa chỉ, dấu hiệu, thời điểm bắt đầu và ảnh hiện trường nếu có. Thợ sẽ tư vấn bước an toàn trước khi đến kiểm tra.</p>

`;
  const firstIndex = html.indexOf(duplicateBlock);
  const secondIndex = html.indexOf(duplicateBlock, firstIndex + 1);
  if (firstIndex === -1 || secondIndex === -1) throw new Error("Duplicate block not found twice as expected");
  html = html.slice(0, secondIndex) + html.slice(secondIndex + duplicateBlock.length);

  // 2) Rework opening sentence so exact focus keyword appears within first 100 words
  html = html.replace(
    "<p><strong>Liên hệ đặt lịch hút bể phốt, thông tắc cống Quảng Ninh 05:00-22:00 qua hotline 0963.953.533 / 0931.156.756 khi cần hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga hoặc xử lý mùi hôi.</strong>",
    "<p><strong>Liên hệ thông tắc cống Quảng Ninh để đặt lịch hút bể phốt 05:00-22:00 qua hotline 0963.953.533 / 0931.156.756 khi cần hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga hoặc xử lý mùi hôi.</strong>",
  );

  // 3) Sprinkle extra exact-match keyword mentions in a few existing sentences
  const inject = [
    [
      "Sau khi nhận thông tin, đội thợ sẽ hỏi thêm vài dấu hiệu để phân biệt tắc nhẹ, tắc sâu, bể đầy hay lỗi đường ống.",
      "Sau khi liên hệ thông tắc cống Quảng Ninh, đội thợ sẽ hỏi thêm vài dấu hiệu để phân biệt tắc nhẹ, tắc sâu, bể đầy hay lỗi đường ống.",
    ],
    [
      "Nhận hỗ trợ tại Hạ Long, Cẩm Phả, Uông Bí, Đông Triều, Quảng Yên, Móng Cái, Vân Đồn và các huyện lân cận trong Quảng Ninh.",
      "Khách hàng liên hệ thông tắc cống Quảng Ninh sẽ được hỗ trợ tại Hạ Long, Cẩm Phả, Uông Bí, Đông Triều, Quảng Yên, Móng Cái, Vân Đồn và các huyện lân cận trong Quảng Ninh.",
    ],
    [
      "Để tiết kiệm thời gian cho cả hai bên, quy trình làm việc được chuẩn hóa như sau:",
      "Để tiết kiệm thời gian cho cả hai bên, quy trình sau khi liên hệ thông tắc cống Quảng Ninh được chuẩn hóa như sau:",
    ],
    [
      "Mọi thắc mắc trước, trong hoặc sau khi dùng dịch vụ đều có thể liên hệ trực tiếp qua số",
      "Mọi thắc mắc trước, trong hoặc sau khi liên hệ thông tắc cống Quảng Ninh đều có thể liên hệ trực tiếp qua số",
    ],
    [
      "Để ca làm việc diễn ra nhanh và sạch hơn, bạn có thể chuẩn bị trước:",
      "Để ca làm việc diễn ra nhanh và sạch hơn sau khi liên hệ thông tắc cống Quảng Ninh, bạn có thể chuẩn bị trước:",
    ],
    [
      "Với các công trình lớn (khu công nghiệp, chung cư, bệnh viện), liên hệ trước ít nhất 24 giờ để điều phối đội và xe phù hợp.",
      "Với các công trình lớn (khu công nghiệp, chung cư, bệnh viện), hãy liên hệ thông tắc cống Quảng Ninh trước ít nhất 24 giờ để điều phối đội và xe phù hợp.",
    ],
  ];
  for (const [from, to] of inject) {
    if (!html.includes(from)) throw new Error(`Inject anchor not found: ${from.slice(0, 40)}...`);
    html = html.replace(from, to);
  }

  // 4) Add new section with keyword mentions before seo-supplement to cover word-count/density
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
    headers: { Authorization: auth, Accept: "application/json", "Content-Type": "application/json", "User-Agent": "TTCQN lien-he fix" },
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
  const response = await fetch(url, { headers: { "User-Agent": "TTCQN lien-he verifier" }, signal: AbortSignal.timeout(60000) });
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
