import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = {
  id: 2332,
  collection: "posts",
  slug: "cam-nang-thong-tac-cong-tai-ha-long",
  url: "https://thongtaccongquangninh.com/cam-nang-thong-tac-cong-tai-ha-long/",
};
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const OLD_AUTHOR_URL = "https://thongtaccongquangninh.com/nguyen-song-hao/";
const NEW_TITLE = "Cẩm nang thông tắc cống tại Hạ Long: xử lý nhanh theo từng khu";
const NEW_DESC =
  "Cẩm nang thông tắc cống tại Hạ Long theo từng khu: Hồng Gai, Bãi Cháy, Cao Xanh, Hà Khẩu, Giếng Đáy. Gọi 0963.953.533 / 0931.156.756 xử lý 24/7, không đục phá.";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-cam-nang-ha-long-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-cam-nang-ha-long-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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
    .replace(/\s+/gu, " ")
    .trim();
}

function wordCount(input) {
  const text = stripText(input);
  return text ? text.split(/\s+/u).length : 0;
}

function countMatches(input, pattern) {
  return (String(input).match(pattern) || []).length;
}

function decodeEntities(input) {
  return String(input ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"');
}

function extractPublicMeta(html) {
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1] || "")
    .replace(/\s+/gu, " ")
    .trim();
  const metaDesc = decodeEntities(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/iu)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/iu)?.[1] ||
      "",
  );
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/iu)?.[1] || "";
  const content = stripText(html);
  return {
    title,
    titleLen: [...title].length,
    metaDesc,
    metaDescLen: [...metaDesc].length,
    canonical,
    h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)].map((m) => stripText(m[1])),
    h2: [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/giu)].map((m) => stripText(m[1])),
    wordCount: content ? content.split(/\s+/u).length : 0,
    hasServiceSchema: /"@type"\s*:\s*"Service"/iu.test(html),
    hasAuthorArchive: html.includes(AUTHOR_URL),
    hasOldAuthorUrl: html.includes(OLD_AUTHOR_URL),
    forbidden: {
      chuyenNghiep: countMatches(content, /chuyên nghiệp/giu),
      uyTin: countMatches(content, /uy tín/giu),
    },
  };
}

function replaceSection(content, startPattern, endPattern, replacement, label, replacements) {
  const start = content.search(startPattern);
  if (start === -1) {
    replacements.push({ label, changed: false, reason: "start_not_found" });
    return content;
  }
  const rest = content.slice(start);
  const endMatch = rest.match(endPattern);
  if (!endMatch || endMatch.index === undefined) {
    replacements.push({ label, changed: false, reason: "end_not_found" });
    return content;
  }
  const end = start + endMatch.index;
  replacements.push({
    label,
    changed: true,
    beforeWords: wordCount(content.slice(start, end)),
    afterWords: wordCount(replacement),
  });
  return `${content.slice(0, start)}${replacement}${content.slice(end)}`;
}

function serviceSchemaHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${TARGET.url}#service`,
    name: "Cẩm nang thông tắc cống tại Hạ Long",
    serviceType: "Thông tắc cống tại Hạ Long",
    url: TARGET.url,
    provider: {
      "@type": "LocalBusiness",
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      url: SITE,
      telephone: ["+84963953533", "+84931156756"],
    },
    areaServed: {
      "@type": "City",
      name: "Hạ Long, Quảng Ninh",
    },
    offers: {
      "@type": "Offer",
      url: TARGET.url,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
  };

  return `<!-- wp:html -->\n<script type="application/ld+json" data-ttcqn-service-schema="cam-nang-ha-long">${JSON.stringify(
    schema,
  )}</script>\n<!-- /wp:html -->`;
}

function updateBlogPostingSchema(content) {
  return String(content).replace(
    /(<script type="application\/ld\+json" data-ttcqn-author-nguyen-song-hao="1">)([\s\S]*?)(<\/script>)/u,
    (full, open, json, close) => {
      try {
        const schema = JSON.parse(json);
        schema["@id"] = `${TARGET.url}#blogposting`;
        schema.mainEntityOfPage = TARGET.url;
        schema.headline = NEW_TITLE;
        schema.description = NEW_DESC;
        schema.dateModified = new Date().toISOString();
        if (schema.author && typeof schema.author === "object") {
          schema.author.url = AUTHOR_URL;
        }
        return `${open}${JSON.stringify(schema)}${close}`;
      } catch {
        return full;
      }
    },
  );
}

function removeFinalAuthorLine(content) {
  return String(content).replace(
    /\s*(?:<!-- wp:paragraph -->\s*)?<p>\s*Tác giả:\s*<a href="https:\/\/thongtaccongquangninh\.com\/author\/nguyensonghao\/">Nguyễn Song Hào<\/a>\s*<\/p>\s*(?:<!-- \/wp:paragraph -->\s*)?$/u,
    "",
  );
}

function updateContent(raw) {
  let content = String(raw);
  const replacements = [];

  content = content.replace(
    "cách chọn đơn vị uy tín",
    "cách chọn đội thợ đủ thiết bị và báo giá rõ",
  );
  content = content.replace(
    "bằng máy lò xo chuyên nghiệp",
    "bằng máy lò xo công suất phù hợp",
  );
  content = content.replaceAll(OLD_AUTHOR_URL, AUTHOR_URL);

  content = replaceSection(
    content,
    /<h2>Mục lục<\/h2>/u,
    /<h2>Khi nào cần gọi thông tắc cống tại Hạ Long ngay<\/h2>/u,
    "",
    "remove_toc",
    replacements,
  );

  content = replaceSection(
    content,
    /<h2>Khi nào cần gọi thông tắc cống tại Hạ Long ngay<\/h2>/u,
    /<h2>Nguyên nhân cống tắc đặc thù tại Hạ Long<\/h2>/u,
    `<h2>Khi nào cần gọi thông tắc cống tại Hạ Long ngay</h2>
<p>Gọi thợ ngay khi nước thoát sàn rút chậm, chậu rửa có mùi dầu mỡ, hố ga dâng nước hoặc nước thải trào ngược. Với nhà hàng, khách sạn ở Bãi Cháy, không nên đợi qua ca cao điểm vì mỡ bếp có thể đóng cứng sâu hơn trong ống.</p>
<ul><li>Nước rút yếu ở nhiều điểm cùng lúc</li><li>Bồn cầu hoặc thoát sàn kêu ọc ọc</li><li>Hố ga có bọt khí, váng dầu hoặc mùi nặng</li><li>Đã thử pittong, dây tay nhưng không hết</li></ul>
<p>Nếu chỉ có tóc hoặc rác mắc ngay miệng thoát, có thể nhấc nắp phễu thu và vệ sinh nhẹ. Nếu nước trào từ nhiều điểm hoặc mùi hôi bốc lên liên tục, điểm nghẹt thường đã nằm sâu trong ống chính hoặc hố ga.</p>
<p>Khi gọi, nói rõ địa chỉ, loại công trình, vị trí nước trào và xe lớn có vào được không. Thông tin này giúp thợ mang đúng máy lò xo, máy nén khí hoặc dụng cụ mở hố ga ngay từ đầu.</p>`,
    "shorten_when_to_call",
    replacements,
  );

  content = replaceSection(
    content,
    /<h2>Nguyên nhân cống tắc đặc thù tại Hạ Long<\/h2>/u,
    /<h2>Đặc điểm cống tắc theo từng khu phố<\/h2>/u,
    `<h2>Nguyên nhân cống tắc đặc thù tại Hạ Long</h2>
<p>Cống tắc ở Hạ Long thường đến từ 5 nhóm nguyên nhân: dầu mỡ nhà hàng tại Bãi Cháy, ống thoát cũ ở Hồng Gai, cát và bùn sau mưa lớn, trục đứng chung cư Cao Xanh - Hà Khẩu và hố ga lâu ngày chưa nạo vét.</p>
<p>Điểm khó là mỗi khu có địa hình khác nhau. Khu đồi dốc dễ sai độ dốc ống sau cải tạo nhà; khu ven biển dễ có cát và nước mặn lẫn vào hố ga; khu nhà hàng có lớp mỡ bám dày sau 6-12 tháng. Vì vậy cần kiểm tra cả miệng thoát, đoạn ống chính và hố ga trước khi chọn cách xử lý.</p>
<p>Không nên đổ hóa chất mạnh khi chưa biết điểm tắc. Hóa chất có thể làm mềm gioăng cao su, tạo hơi nóng trong ống nhựa hoặc đẩy mảng mỡ đi sâu hơn, khiến ca xử lý sau đó tốn thời gian hơn.</p>`,
    "shorten_causes",
    replacements,
  );

  content = replaceSection(
    content,
    /<h2>Đặc điểm cống tắc theo từng khu phố<\/h2>/u,
    /<h2>Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh<\/h2>/u,
    `<h2>Đặc điểm cống tắc theo từng khu phố</h2>
<p>Bảng dưới giúp chọn hướng xử lý nhanh theo khu vực. Đây là dấu hiệu thường gặp, không thay thế bước khảo sát tại chỗ.</p>
<table><thead><tr><th>Khu vực</th><th>Dạng tắc hay gặp</th><th>Cách xử lý phù hợp</th></tr></thead><tbody><tr><td>Hồng Gai</td><td>Ống cũ, ngõ hẹp, cặn vôi</td><td>Máy lò xo nhỏ, kiểm tra qua miệng thoát hoặc hố ga gần nhất</td></tr><tr><td>Bãi Cháy</td><td>Dầu mỡ bếp nhà hàng, khách sạn</td><td>Máy lò xo công suất lớn, kết hợp nước nóng khi cần</td></tr><tr><td>Cao Xanh - Hà Khẩu</td><td>Trục đứng chung cư, nhiều tầng cùng ảnh hưởng</td><td>Tiếp cận tầng hầm hoặc tầng kỹ thuật, dùng dây dài</td></tr><tr><td>Giếng Đáy, Hà Khẩu</td><td>Nhà liền kề, hố ga lẫn bùn rác</td><td>Kiểm tra miệng thoát, ống chính và hố ga trước khi báo giá</td></tr><tr><td>Tuần Châu, Hùng Thắng</td><td>Cát biển, lá cây, hố ga ngoài sân</td><td>Nạo vét hố ga kết hợp thông cống chính</td></tr></tbody></table>
<p>Với ngõ hẹp, hãy nói trước chiều rộng ngõ và điểm xe có thể dừng. Với chung cư, cần báo ban quản lý để mở tầng kỹ thuật hoặc tầng hầm nếu điểm tắc nằm ở trục đứng.</p>`,
    "shorten_local_sections",
    replacements,
  );

  content = replaceSection(
    content,
    /<h2>Bảng giá tham khảo thông tắc cống tại Hạ Long<\/h2>/u,
    /<h2 class="wp-block-heading">Tác giả bài viết<\/h2>/u,
    `<h2>Bảng giá tham khảo thông tắc cống tại Hạ Long</h2>
<p>Giá phụ thuộc vị trí tắc, chiều dài ống, có cần mở hố ga hay không và loại thiết bị phải dùng. Thợ báo giá chính thức sau khi khảo sát, không tự thêm khoản ngoài phạm vi đã thống nhất.</p>
<table><thead><tr><th>Loại công việc</th><th>Dải giá tham khảo</th></tr></thead><tbody><tr><td>Tắc nhẹ ở nhà dân</td><td>200.000 - 400.000đ</td></tr><tr><td>Cống thoát sàn, chậu rửa, bếp gia đình</td><td>350.000 - 700.000đ</td></tr><tr><td>Cống bếp nhà hàng, quán ăn</td><td>500.000 - 1.200.000đ</td></tr><tr><td>Trục đứng chung cư hoặc cống chính lớn</td><td>1.500.000 - 5.000.000đ</td></tr></tbody></table>
<p>Ca cần camera nội soi, mở nhiều hố ga hoặc kết hợp hút bùn sẽ được báo riêng. Nếu chưa đồng ý giá, thợ không tự ý thi công.</p>
<p>Muốn biết chi phí sát hơn, gọi <strong>0963.953.533 / 0931.156.756</strong> và gửi ảnh vị trí thoát nước qua Zalo.</p>
<!-- wp:image {"id":2329,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/05/cam-nang-thong-tac-cong-tai-ha-long-bang-gia.webp" alt="Ảnh minh họa thợ kiểm tra hố ga và báo giá thông tắc cống tại Hạ Long trước khi thi công" class="wp-image-2329"/><figcaption class="wp-element-caption">Thợ kiểm tra hố ga và báo giá rõ trước khi xử lý thông tắc cống Hạ Long</figcaption></figure>
<!-- /wp:image -->`,
    "shorten_pricing",
    replacements,
  );

  content = replaceSection(
    content,
    /<h2>Quy trình 5 bước xử lý<\/h2>/u,
    /<h2>Case study thực tế tại Hạ Long<\/h2>/u,
    `<h2>Quy trình 5 bước xử lý</h2>
<ol><li><strong>Tiếp nhận:</strong> hỏi địa chỉ, dấu hiệu nước trào, loại công trình và đường xe vào.</li><li><strong>Khảo sát:</strong> kiểm tra miệng thoát, hố ga, dòng chảy và mùi hôi.</li><li><strong>Báo giá:</strong> nêu rõ thiết bị, phạm vi xử lý và thời gian dự kiến.</li><li><strong>Thi công:</strong> dùng máy lò xo, máy nén khí, xe bồn hoặc camera nội soi tùy tình trạng.</li><li><strong>Nghiệm thu:</strong> xả thử nhiều lần, vệ sinh khu vực thi công và ghi nhận bảo hành.</li></ol>
<p>Với nhà dân, ca nhẹ thường xử lý trong 30-60 phút. Với nhà hàng hoặc chung cư, thời gian phụ thuộc chiều dài ống, số điểm mở hố ga và lượng dầu mỡ hoặc bùn cặn trong đường thoát.</p>
<!-- wp:image {"id":2330,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/05/cam-nang-thong-tac-cong-tai-ha-long-quy-trinh.webp" alt="Ảnh minh họa quy trình thông tắc cống bằng máy lò xo tại bếp nhà hàng khu Bãi Cháy Hạ Long" class="wp-image-2330"/><figcaption class="wp-element-caption">Quy trình thông tắc cống bếp nhà hàng tại Hạ Long bằng máy lò xo công suất phù hợp</figcaption></figure>
<!-- /wp:image -->`,
    "shorten_process",
    replacements,
  );

  content = replaceSection(
    content,
    /<h2>Case study thực tế tại Hạ Long<\/h2>/u,
    /<h2>Khu vực phục vụ và thông tin liên hệ<\/h2>/u,
    `<h2>Tình huống thường gặp khi thông tắc cống tại Hạ Long</h2>
<p><strong>Nhà hàng Bãi Cháy:</strong> nước bếp trào do dầu mỡ đóng trong ống chính. Cách xử lý là kéo cặn bằng máy lò xo, xả nước nóng và kiểm tra hố ga tách mỡ.</p>
<p><strong>Chung cư Cao Xanh:</strong> nhiều tầng cùng rút nước chậm vì trục đứng bị nghẹt. Thợ cần tiếp cận tầng kỹ thuật hoặc tầng hầm, dùng dây dài để không phải đục phá trong căn hộ.</p>
<p><strong>Nhà dân Hồng Gai:</strong> ngõ hẹp, ống cũ, xe lớn khó vào. Ưu tiên máy lò xo cầm tay, kiểm tra từng co ống trước khi mở hố ga.</p>
<p>Các tình huống trên đều cần hỏi kỹ trước khi điều thợ. Một cuộc gọi rõ địa chỉ và hiện trạng giúp giảm thời gian chờ, tránh mang sai thiết bị và hạn chế phát sinh.</p>
<h2>Checklist chuẩn bị trước khi thợ đến</h2>
<p>Trước khi thợ tới, hãy ngừng xả thêm nước vào điểm đang trào. Nếu cống bếp nghẹt, gom hết rác thực phẩm quanh miệng thoát để thợ nhìn rõ dòng nước. Nếu nhà có trẻ nhỏ hoặc người già, nên đóng cửa khu vực có mùi hôi và bật quạt thông gió nhẹ.</p>
<ul><li>Chụp ảnh vị trí nước trào, hố ga hoặc miệng thoát gửi trước qua Zalo</li><li>Dọn lối đi tới nhà vệ sinh, bếp hoặc hố ga ngoài sân</li><li>Chuẩn bị thông tin lần gần nhất đã thông cống, hút bể phốt hoặc nạo vét hố ga</li><li>Không đổ thêm axit, bột thông cống hoặc nước sôi khi chưa được hướng dẫn</li></ul>
<p>Với nhà hàng, nên tạm ngưng xả rửa ở khu bếp cho tới khi thợ kiểm tra. Với chung cư, báo ban quản lý để mở phòng kỹ thuật, tầng hầm hoặc nắp trục nếu cần.</p>`,
    "replace_case_with_common_situations",
    replacements,
  );

  content = updateBlogPostingSchema(content);

  const serviceBlock = serviceSchemaHtml();
  if (content.includes('data-ttcqn-service-schema="cam-nang-ha-long"')) {
    content = content.replace(
      /<!-- wp:html -->\s*<script type="application\/ld\+json" data-ttcqn-service-schema="cam-nang-ha-long">[\s\S]*?<\/script>\s*<!-- \/wp:html -->/u,
      serviceBlock,
    );
  } else {
    content = `${content.trim()}\n\n${serviceBlock}`;
  }

  content = removeFinalAuthorLine(content);
  content = `${content.trim()}\n\n<!-- wp:paragraph -->\n<p>Tác giả: <a href="${AUTHOR_URL}">Nguyễn Song Hào</a></p>\n<!-- /wp:paragraph -->`;

  return {
    content,
    replacements,
  };
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
}
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Codex P1 Cam Nang Ha Long cleanup",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message || raw : raw;
    throw new Error(`WP ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function fetchPublic() {
  const url = new URL(TARGET.url);
  url.searchParams.set("nowprocket", "1");
  url.searchParams.set("codex", `cam-nang-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex P1 Cam Nang Ha Long verifier" },
  });
  const html = await response.text();
  return { status: response.status, url: response.url, ...extractPublicMeta(html) };
}

async function main() {
  mkdirSync(dirname(reportPath), { recursive: true });

  const before = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
  if (before.slug !== TARGET.slug || before.status !== "publish") {
    throw new Error(`Unexpected target state: ${before.slug}/${before.status}`);
  }

  const raw = before.content?.raw || "";
  const update = updateContent(raw);
  const report = {
    ok: false,
    mode: dryRun ? "dry-run" : "apply",
    generatedAt: new Date().toISOString(),
    target: TARGET,
    backupDir,
    newTitle: NEW_TITLE,
    newTitleLen: [...NEW_TITLE].length,
    newDesc: NEW_DESC,
    newDescLen: [...NEW_DESC].length,
    before: {
      title: before.title?.raw,
      excerpt: stripText(before.excerpt?.raw || ""),
      rawWordCount: wordCount(raw),
      rawH1Count: countMatches(raw, /<h1\b/giu),
      rawH2Count: countMatches(raw, /<h2\b/giu),
      images: countMatches(raw, /<img\b/giu),
      hasOldAuthorUrl: raw.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: raw.includes(AUTHOR_URL),
      hasServiceSchema: raw.includes('data-ttcqn-service-schema="cam-nang-ha-long"') || /"@type"\s*:\s*"Service"/iu.test(raw),
      forbidden: {
        chuyenNghiep: countMatches(stripText(raw), /chuyên nghiệp/giu),
        uyTin: countMatches(stripText(raw), /uy tín/giu),
      },
    },
    update: {
      replacements: update.replacements,
      afterRawWordCount: wordCount(update.content),
      afterRawH1Count: countMatches(update.content, /<h1\b/giu),
      afterRawH2Count: countMatches(update.content, /<h2\b/giu),
      images: countMatches(update.content, /<img\b/giu),
      hasOldAuthorUrl: update.content.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: update.content.includes(AUTHOR_URL),
      hasServiceSchema: update.content.includes('data-ttcqn-service-schema="cam-nang-ha-long"'),
      forbidden: {
        chuyenNghiep: countMatches(stripText(update.content), /chuyên nghiệp/giu),
        uyTin: countMatches(stripText(update.content), /uy tín/giu),
      },
      finalAuthorLine: update.content.trim().endsWith(`<p>Tác giả: <a href="${AUTHOR_URL}">Nguyễn Song Hào</a></p>\n<!-- /wp:paragraph -->`),
    },
    rankMath: null,
    verify: null,
  };

  if (!dryRun) {
    mkdirSync(backupDir, { recursive: true });
    writeFileSync(join(backupDir, `post-${TARGET.id}-before.json`), JSON.stringify(before, null, 2) + "\n", "utf8");
    writeFileSync(join(backupDir, `post-${TARGET.id}-before-content.html`), raw, "utf8");

    await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}`, {
      method: "POST",
      body: {
        title: NEW_TITLE,
        excerpt: NEW_DESC,
        content: update.content,
      },
    });

    try {
      report.rankMath = await wp("/rankmath/v1/updateMeta", {
        method: "POST",
        body: {
          objectType: "post",
          objectID: TARGET.id,
          meta: {
            rank_math_title: NEW_TITLE,
            rank_math_description: NEW_DESC,
          },
        },
      });
    } catch (error) {
      report.rankMath = { error: String(error.message || error) };
    }

    const after = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
    writeFileSync(join(backupDir, `post-${TARGET.id}-after.json`), JSON.stringify(after, null, 2) + "\n", "utf8");
    report.after = {
      title: after.title?.raw,
      excerpt: stripText(after.excerpt?.raw || ""),
      rawWordCount: wordCount(after.content?.raw || ""),
      contentLen: (after.content?.raw || "").length,
    };

    report.verify = await fetchPublic();
  }

  report.ok =
    dryRun ||
    Boolean(
      report.verify?.status === 200 &&
        report.verify?.titleLen >= 60 &&
        report.verify?.titleLen <= 70 &&
        report.verify?.metaDescLen >= 150 &&
        report.verify?.metaDescLen <= 160 &&
        report.verify?.canonical === TARGET.url &&
        report.verify?.h1?.length === 1 &&
        /cẩm nang thông/iu.test(report.verify?.h1?.[0] || "") &&
        report.verify?.h2?.some((h) => /nguyên nhân/iu.test(h)) &&
        report.verify?.h2?.some((h) => /liên hệ|nap/iu.test(h)) &&
        report.verify?.hasServiceSchema &&
        report.verify?.hasAuthorArchive &&
        !report.verify?.hasOldAuthorUrl &&
        report.verify?.forbidden?.chuyenNghiep === 0 &&
        report.verify?.forbidden?.uyTin === 0,
    );

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, reportPath, backupDir, verify: report.verify, update: report.update }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
