import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = {
  id: 2022,
  collection: "pages",
  slug: "he-thong-lien-ket-doi-tac",
  url: "https://thongtaccongquangninh.com/he-thong-lien-ket-doi-tac/",
};
const TITLE = "Hệ thống liên kết đối tác — Môi Trường Đô Thị Số 1 Quảng Ninh";
const META_DESC =
  "Danh bạ liên kết đối tác Môi Trường Đô Thị Số 1 Quảng Ninh: kênh truyền thông, hồ sơ doanh nghiệp và đầu mối liên hệ. Gọi 0963.953.533 / 0931.156.756.";
const FOCUS_KEYWORD = "hệ thống liên kết đối tác";
const FOCUS_ASCII = "he thong lien ket doi tac";
const CLEANUP_MARKER = "ttcqn-doi-tac-p1-cleanup-2026-06-03";
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-he-thong-lien-ket-doi-tac-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-he-thong-lien-ket-doi-tac-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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

function removeDiacritics(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/gu, (char) => (char === "Đ" ? "D" : "d"));
}

function wordCount(input) {
  const text = stripText(input);
  return text ? text.split(/\s+/u).filter(Boolean).length : 0;
}

function keywordStats(input) {
  const text = removeDiacritics(stripText(input)).toLowerCase();
  const total = text ? text.split(/\s+/u).filter(Boolean).length : 0;
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(FOCUS_ASCII, index)) !== -1) {
    count++;
    index += FOCUS_ASCII.length;
  }
  const density = total ? (count * FOCUS_ASCII.split(/\s+/u).length) / total : 0;
  return { count, total, density, densityPct: Number((density * 100).toFixed(2)) };
}

function countMatches(input, pattern) {
  return (String(input).match(pattern) || []).length;
}

function decodeEntities(input) {
  return String(input ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&quot;/g, '"');
}

function collectSchemaTypes(node, output) {
  if (!node || typeof node !== "object") return;
  const type = node["@type"];
  if (Array.isArray(type)) output.push(...type.map(String));
  else if (type) output.push(String(type));
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => collectSchemaTypes(item, output));
    else collectSchemaTypes(value, output);
  }
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
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)].map((m) => stripText(m[1]));
  const h2 = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/giu)].map((m) => stripText(m[1]));
  const mainHtml = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/iu)?.[1] || html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/iu)?.[1] || html;
  const schemaTypes = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)) {
    try {
      collectSchemaTypes(JSON.parse(match[1].trim()), schemaTypes);
    } catch {}
  }

  return {
    title,
    titleLen: [...title].length,
    metaDesc,
    metaDescLen: [...metaDesc].length,
    canonical,
    h1,
    h2,
    wordCount: wordCount(html),
    hotlineMain: countMatches(html, /0963[\s.\-]?953[\s.\-]?533|0931[\s.\-]?156[\s.\-]?756/giu),
    keyword: keywordStats(html),
    schemaTypes: [...new Set(schemaTypes)],
    hasCleanupMarker: html.includes(CLEANUP_MARKER),
    hasAuthorArchive: html.includes(AUTHOR_URL),
    hasForbidden: /(chuyên nghiệp|uy tín|hàng đầu|tận tâm)/iu.test(stripText(mainHtml)),
  };
}

function wpParagraph(text) {
  return `<!-- wp:paragraph -->\n<p>${text}</p>\n<!-- /wp:paragraph -->`;
}

function wpHeading(text, level = 2) {
  return `<!-- wp:heading {"level":${level}} -->\n<h${level}>${text}</h${level}>\n<!-- /wp:heading -->`;
}

function wpList(items) {
  return `<!-- wp:list -->\n<ul>\n${items.map((item) => `<li>${item}</li>`).join("\n")}\n</ul>\n<!-- /wp:list -->`;
}

function imageBlocks() {
  return `<!-- wp:image {"id":2104,"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/05/he-thong-lien-ket-doi-tac-may-lo-xo-thong-cong-1.webp" alt="Thợ dùng máy lò xo thông cống cho dịch vụ thông tắc cống tại Quảng Ninh" class="wp-image-2104"/><figcaption class="wp-element-caption">Ảnh thợ dùng máy lò xo kiểm tra đường ống thoát nước tại Quảng Ninh.</figcaption></figure>\n<!-- /wp:image -->\n\n<!-- wp:image {"id":2105,"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/05/he-thong-lien-ket-doi-tac-may-lo-xo-thong-cong-2.webp" alt="Thợ thông tắc cống xử lý đường ống cho nhà dân tại Quảng Ninh" class="wp-image-2105"/><figcaption class="wp-element-caption">Thiết bị thông tắc cống được dùng trong các ca xử lý nghẹt tại nhà dân.</figcaption></figure>\n<!-- /wp:image -->\n\n<!-- wp:image {"id":2106,"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/05/he-thong-lien-ket-doi-tac-may-lo-xo-thong-cong-3.webp" alt="Dịch vụ thông tắc cống Quảng Ninh dùng máy lò xo kiểm tra điểm nghẹt" class="wp-image-2106"/><figcaption class="wp-element-caption">Hình ảnh minh họa năng lực thi công được dùng trong hồ sơ đối tác.</figcaption></figure>\n<!-- /wp:image -->`;
}

function faqSchemaHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${TARGET.url}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "Trang này có phải trang bán link không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Không. Trang này dùng để xác minh hệ thống nhận diện và quản lý các kênh đã nhắc tới thương hiệu. Các liên kết không được dùng để thay thế nội dung dịch vụ chính.",
        },
      },
      {
        "@type": "Question",
        name: "Vì sao danh sách liên kết cũ được rút gọn?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Danh sách cũ quá dài, nhiều mục không giúp người đọc ra quyết định và làm trang bị phình to. Bản rút gọn giữ lại bối cảnh, tiêu chí, quy trình kiểm tra và thông tin liên hệ.",
        },
      },
      {
        "@type": "Question",
        name: "Đối tác cần cập nhật thông tin thì liên hệ ai?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Đối tác có thể gọi 0963.953.533 / 0931.156.756 để xác minh tên đơn vị, website, dịch vụ và khu vực phục vụ trước khi chỉnh sửa hồ sơ hoặc bài giới thiệu.",
        },
      },
      {
        "@type": "Question",
        name: "Khách hàng cần đặt dịch vụ thì xem trang nào?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Khách hàng nên xem trang dịch vụ chính hoặc gọi thẳng hotline 0963.953.533 / 0931.156.756 nếu đang tắc cống, bồn cầu trào, bể phốt đầy hoặc có mùi hôi nặng.",
        },
      },
    ],
  };

  return `<!-- wp:html -->\n<script type="application/ld+json" data-ttcqn-faq-schema="he-thong-lien-ket-doi-tac">${JSON.stringify(schema)}</script>\n<!-- /wp:html -->`;
}

function compactContent() {
  const blocks = [
    `<!-- ${CLEANUP_MARKER} -->`,
    wpParagraph(
      "Hệ thống liên kết đối tác của Môi Trường Đô Thị Số 1 Quảng Ninh là trang công bố các kênh truyền thông, hồ sơ doanh nghiệp và đầu mối tham chiếu phục vụ hoạt động nhận diện thương hiệu. Trang này không phải nơi bán link, không dùng để nhồi anchor và không thay thế các trang dịch vụ chính. Mục tiêu là giúp khách hàng, cộng tác viên và đơn vị truyền thông kiểm tra đúng website, đúng hotline và đúng phạm vi dịch vụ trước khi liên hệ.",
    ),
    wpParagraph(
      "Trước đây trang được xuất tự động thành một danh bạ quá dài, chứa hàng trăm liên kết ngoài và nhiều nội dung lặp. Cách trình bày đó khiến người đọc khó nắm thông tin, đồng thời tạo tín hiệu kém sạch cho SEO. Bản hiện tại được rút gọn để giữ phần có giá trị: bối cảnh đối tác, tiêu chí kiểm tra, nhóm kênh được dùng, thông tin NAP và hướng liên hệ trực tiếp qua hotline 0963.953.533 / 0931.156.756.",
    ),
    wpHeading("Vai trò của hệ thống liên kết đối tác"),
    wpParagraph(
      "Hệ thống liên kết đối tác giúp gom các điểm xuất hiện của thương hiệu trên môi trường số. Khi một khách hàng tìm thấy tên Môi Trường Đô Thị Số 1 Quảng Ninh ở hồ sơ doanh nghiệp, mạng xã hội, diễn đàn địa phương hoặc bài giới thiệu dịch vụ, họ cần có một trang trung tâm để đối chiếu. Trang này làm nhiệm vụ đó: xác nhận tên đơn vị, website chính, nhóm dịch vụ đang cung cấp và số điện thoại đang sử dụng.",
    ),
    wpParagraph(
      "Với ngành hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi, thông tin sai số điện thoại có thể làm khách gọi nhầm đội thợ không rõ nguồn gốc. Vì vậy trang đối tác không chỉ để trình bày danh bạ, mà còn là lớp xác minh công khai cho những ai cần kiểm tra lại trước khi đặt lịch. Khi cần xử lý gấp, khách vẫn nên gọi trực tiếp 0963.953.533 / 0931.156.756 để được hướng dẫn tình huống tại chỗ.",
    ),
    wpParagraph(
      "Nội dung trên trang được viết theo hướng dễ đọc, không phóng đại và không đưa lời hứa vượt quá năng lực thi công. Mỗi nhóm liên kết chỉ nên đóng vai trò dẫn nguồn nhận diện; phần quyết định dịch vụ vẫn nằm ở trang dịch vụ chính, trang bảng giá, trang liên hệ và trao đổi thực tế với kỹ thuật. Cách làm này giúp trang gọn hơn, có ích hơn và giảm rủi ro bị xem như một danh sách liên kết tràn lan.",
    ),
    imageBlocks(),
    wpHeading("Nguyên tắc chọn và rà soát kênh đối tác"),
    wpParagraph(
      "Một kênh đối tác chỉ nên được giữ lại khi có thông tin nhận diện rõ ràng, không mạo danh thương hiệu, không che giấu mục đích và không đặt người đọc vào vòng chuyển hướng khó hiểu. Các hồ sơ công khai cần thể hiện tên đơn vị, lĩnh vực môi trường đô thị, khu vực Quảng Ninh hoặc nhóm dịch vụ liên quan. Những hồ sơ cũ, trùng lặp, không còn đăng nhập được hoặc có biểu hiện spam phải được đưa ra khỏi trang công khai.",
    ),
    wpParagraph(
      "Khi rà soát, đội SEO kiểm tra bốn điểm: domain còn truy cập được hay không, nội dung có nhắc đúng thương hiệu hay không, số điện thoại có khớp NAP hay không và đường dẫn có gây rủi ro cho người dùng hay không. Nếu một kênh chỉ tạo ra liên kết nhưng không giúp người đọc hiểu thêm về dịch vụ, kênh đó không nên xuất hiện dày đặc trên HTML public. Thông tin đầy đủ vẫn có thể được lưu nội bộ để theo dõi chiến dịch.",
    ),
    wpList([
      "Ưu tiên kênh có trang hồ sơ rõ ràng, không tự động chuyển hướng sang nội dung khác.",
      "Ưu tiên nội dung có nhắc đúng website `thongtaccongquangninh.com` và đúng hotline.",
      "Không dùng anchor lặp hàng loạt cho cùng một cụm từ khóa dịch vụ.",
      "Không đưa danh sách hàng trăm URL lên một trang nếu người đọc không cần dùng trực tiếp.",
      "Không giữ các kênh có nội dung nhạy cảm, sai ngành, sai địa phương hoặc khó kiểm chứng.",
    ]),
    wpHeading("Nhóm kênh đang được quản lý"),
    wpParagraph(
      "Các kênh được chia thành bốn nhóm chính. Nhóm hồ sơ doanh nghiệp dùng để xác nhận tên đơn vị và thông tin liên hệ. Nhóm truyền thông dùng cho bài giới thiệu, cập nhật hoạt động hoặc nội dung giáo dục về xử lý nước thải sinh hoạt. Nhóm cộng đồng dùng để trả lời câu hỏi thực tế khi người dân gặp tắc cống, bồn cầu trào hoặc mùi hôi nhà vệ sinh. Nhóm tài nguyên nội bộ dùng để quản lý ảnh, video, tài liệu NAP và báo cáo SEO.",
    ),
    wpParagraph(
      "Mỗi nhóm có cách dùng khác nhau nên không nên gom tất cả thành một lưới link lớn. Với hồ sơ doanh nghiệp, thông tin cần ổn định và ngắn gọn. Với truyền thông, nội dung cần có bối cảnh thật, không sao chép đoạn quảng cáo. Với cộng đồng, câu trả lời phải đi vào dấu hiệu, nguyên nhân và cách xử lý an toàn. Với tài nguyên nội bộ, chỉ dùng cho đội vận hành, không đưa ra public nếu không phục vụ người đọc.",
    ),
    wpParagraph(
      "Trang này vì vậy chỉ giữ phần định hướng và các đường dẫn nội bộ quan trọng. Khách cần xem dịch vụ có thể đọc trang <a href=\"https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/\">thông tắc cống Quảng Ninh</a>, <a href=\"https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/\">hút bể phốt Quảng Ninh</a>, <a href=\"https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-ninh/\">thông tắc bồn cầu Quảng Ninh</a> hoặc <a href=\"https://thongtaccongquangninh.com/bang-gia/\">bảng giá dịch vụ</a>. Khi cần xác nhận nhanh, gọi 0963.953.533 / 0931.156.756.",
    ),
    wpHeading("Quy trình kiểm tra liên kết định kỳ"),
    wpParagraph(
      "Liên kết đối tác được kiểm tra định kỳ theo từng đợt để tránh tình trạng trang công khai chứa URL chết, URL đổi chủ hoặc URL có nội dung không còn phù hợp. Bước đầu là xuất danh sách nguồn hiện có từ hệ thống quản lý. Bước thứ hai là kiểm tra HTTP, canonical, nội dung hiển thị và anchor. Bước thứ ba là phân loại giữ lại, sửa mô tả, chuyển vào danh sách nội bộ hoặc loại khỏi trang public. Bước cuối là ghi lại ngày kiểm tra để lần sau không phải rà soát từ đầu.",
    ),
    wpParagraph(
      "Nếu một liên kết đối tác bị lỗi 404, chuyển sang domain lạ hoặc không còn chứa thông tin doanh nghiệp, liên kết đó không nên nằm trên trang. Nếu một hồ sơ vẫn còn giá trị nhưng chỉ phục vụ quản lý chiến dịch, nó có thể nằm trong bảng theo dõi nội bộ thay vì HTML public. Cách làm này giảm word count, giảm số external link không cần thiết và giúp người đọc tập trung vào thông tin liên hệ thật.",
    ),
    wpList([
      "Bước 1: kiểm tra domain, trạng thái HTTP và chuyển hướng.",
      "Bước 2: đọc nội dung trang đích để xem có còn đúng thương hiệu hay không.",
      "Bước 3: đối chiếu NAP gồm tên đơn vị, website, hotline và khu vực phục vụ.",
      "Bước 4: loại bỏ từ ngữ sáo rỗng, anchor lặp và mô tả không có giá trị.",
      "Bước 5: cập nhật báo cáo để biết liên kết nào được giữ lại hoặc chuyển vào nội bộ.",
    ]),
    wpHeading("Vì sao không công khai danh sách hàng trăm URL"),
    wpParagraph(
      "Một danh sách hàng trăm URL có thể thuận tiện cho việc theo dõi nội bộ, nhưng lại không thân thiện với người đọc trên website dịch vụ. Khách truy cập trang này thường chỉ cần biết đây có phải website chính hay không, số hotline nào đang dùng và đơn vị có cung cấp đúng dịch vụ tại Quảng Ninh hay không. Khi trang hiển thị quá nhiều domain lạ, thông tin cốt lõi bị chìm xuống dưới và người đọc khó xác định đâu là đầu mối cần liên hệ.",
    ),
    wpParagraph(
      "Về mặt SEO, trang quá nhiều external link cũng dễ tạo cảm giác giống danh mục tự động. Nếu mỗi thẻ chỉ có tên miền và dòng anchor giống nhau, Google khó hiểu giá trị thật của trang. Cách tốt hơn là giữ bản công khai ở mức có chọn lọc, giải thích rõ tiêu chí và lưu danh sách đầy đủ trong file quản trị. Khi một đối tác thật sự cần được nhắc tên, nội dung nên có bối cảnh: họ hỗ trợ mảng truyền thông nào, thông tin nào được xác minh và người đọc nhận được lợi ích gì khi xem nguồn đó.",
    ),
    wpParagraph(
      "Bản rút gọn vì vậy không xóa mất dữ liệu kiểm soát. Bản cũ đã được backup trước khi ghi live, còn trang public chỉ giữ những gì cần thiết cho người dùng và cho tín hiệu chất lượng. Nếu sau này cần mở lại một nhóm liên kết cụ thể, đội SEO có thể tạo trang con riêng theo chủ đề, mỗi trang có mô tả đầy đủ, số link vừa phải và mục đích rõ thay vì dồn tất cả vào một URL duy nhất.",
    ),
    wpHeading("Chuẩn ghi NAP cho đối tác truyền thông"),
    wpParagraph(
      "Đối tác truyền thông khi nhắc đến Môi Trường Đô Thị Số 1 Quảng Ninh nên ghi đúng tên đơn vị, đúng website và đúng hotline. Cách ghi gọn nhất là: Môi Trường Đô Thị Số 1 Quảng Ninh, website `thongtaccongquangninh.com`, hotline 0963.953.533 / 0931.156.756, dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh. Không nên tự thêm danh xưng phóng đại, không tự đổi số điện thoại và không dùng ảnh thi công ngoài nguồn được duyệt.",
    ),
    wpParagraph(
      "Khi viết bài giới thiệu, phần dịch vụ nên tách rõ theo tình huống thực tế. Ví dụ, thông tắc cống cần nói đến nước rút chậm, cống bốc mùi, dầu mỡ bám trong ống hoặc hố ga đầy bùn. Hút bể phốt cần nói đến bể đầy, bồn cầu dội yếu, xe hút vào ngõ sâu và báo giá theo khối lượng. Xử lý mùi hôi cần nói đến bẫy nước, thoát sàn, lavabo, bể phốt và đường ống thông hơi. Nội dung càng rõ tình huống thì người đọc càng dễ kiểm tra nhu cầu của mình.",
    ),
    wpParagraph(
      "Nếu đối tác cần dẫn link, nên dẫn về trang phù hợp thay vì luôn trỏ về trang chủ. Bài nói về cống nghẹt nên dẫn về trang thông tắc cống Quảng Ninh. Bài nói về bồn cầu tắc nên dẫn về trang thông tắc bồn cầu Quảng Ninh. Bài hỏi giá nên dẫn về bảng giá. Bài cần xác minh đơn vị nên dẫn về trang giới thiệu hoặc liên hệ. Cách dẫn này giúp người đọc đi đúng luồng và giúp cấu trúc nội bộ của website rõ hơn.",
    ),
    wpHeading("Cách tiếp nhận yêu cầu cập nhật từ đối tác"),
    wpParagraph(
      "Khi một đối tác muốn cập nhật hồ sơ, đội vận hành cần hỏi ba thông tin: URL cần cập nhật, nội dung đang sai và nội dung đề xuất thay thế. Nếu thay đổi liên quan đến số điện thoại, địa chỉ website, tên thương hiệu hoặc hình ảnh thi công, cần kiểm tra lại trước khi xác nhận. Những thay đổi nhỏ như sửa chính tả, thay mô tả dịch vụ hoặc cập nhật ảnh đại diện có thể xử lý nhanh hơn, nhưng vẫn cần lưu ngày chỉnh sửa để tiện kiểm tra sau này.",
    ),
    wpParagraph(
      "Với các hồ sơ không còn đăng nhập được, không nên cố giữ chỉ vì đã từng tạo backlink. Nếu hồ sơ sai thông tin và không thể sửa, cách tốt hơn là đánh dấu ngừng dùng trong bảng theo dõi nội bộ. Với các kênh còn kiểm soát được, hãy cập nhật lại NAP, thay ảnh nếu cần và bỏ các cụm mô tả sáo rỗng. Mục tiêu cuối cùng là để khách nhìn thấy một thông tin nhất quán, dễ xác minh và có số gọi đúng khi cần xử lý gấp.",
    ),
    wpParagraph(
      "Các yêu cầu liên quan đến khách hàng, hình ảnh thực tế hoặc case study phải được kiểm tra kỹ hơn. Không đưa tên khách, địa chỉ chi tiết hoặc ảnh có biển số, mặt người, thông tin riêng tư lên trang đối tác nếu chưa có căn cứ sử dụng. Khi cần dùng minh họa, ưu tiên ảnh đã tối ưu SEO trong thư mục dự án và caption nói đúng bối cảnh thi công. Trang đối tác chỉ nên đóng vai trò xác minh hệ thống, không biến thành nơi đăng mọi dữ liệu chiến dịch.",
    ),
    wpHeading("Thông tin NAP và liên hệ xác minh"),
    wpParagraph(
      "Đơn vị vận hành: Môi Trường Đô Thị Số 1 Quảng Ninh. Website chính: `thongtaccongquangninh.com`. Hotline xác minh: 0963.953.533 / 0931.156.756. Nhóm dịch vụ đang phục vụ gồm hút bể phốt, thông tắc cống, thông tắc bồn cầu, thông tắc chậu rửa, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh, Hải Phòng và một số khu vực miền Bắc.",
    ),
    wpParagraph(
      "Khi đối tác truyền thông cần kiểm chứng thông tin, hãy dùng website và hotline ở trên. Không tự lấy số điện thoại từ nguồn chưa rõ, không đổi tên thương hiệu theo cách gây nhầm lẫn và không dùng hình ảnh thi công nếu chưa có quyền sử dụng. Nếu cần xác nhận nội dung trước khi đăng, có thể liên hệ 0963.953.533 / 0931.156.756 để đối chiếu dịch vụ, địa bàn và cách ghi NAP.",
    ),
    wpHeading("FAQ về liên kết đối tác"),
    wpHeading("Trang này có phải trang bán link không?", 3),
    wpParagraph(
      "Không. Trang này dùng để xác minh hệ thống nhận diện và quản lý các kênh đã nhắc tới thương hiệu. Các liên kết không được dùng để thay thế nội dung dịch vụ chính và không nên xuất hiện dưới dạng danh sách hàng trăm URL trên public.",
    ),
    wpHeading("Vì sao danh sách liên kết cũ được rút gọn?", 3),
    wpParagraph(
      "Danh sách cũ quá dài, nhiều mục không giúp người đọc ra quyết định và làm trang bị phình to. Bản rút gọn giữ lại bối cảnh, tiêu chí, quy trình kiểm tra và thông tin liên hệ để trang rõ hơn, dễ bảo trì hơn.",
    ),
    wpHeading("Đối tác cần cập nhật thông tin thì liên hệ ai?", 3),
    wpParagraph(
      "Đối tác có thể gọi 0963.953.533 / 0931.156.756 để xác minh tên đơn vị, website, dịch vụ và khu vực phục vụ trước khi chỉnh sửa hồ sơ hoặc bài giới thiệu. Nội dung cần đúng NAP và không dùng mô tả gây hiểu nhầm.",
    ),
    wpHeading("Khách hàng cần đặt dịch vụ thì xem trang nào?", 3),
    wpParagraph(
      "Khách hàng nên xem trang dịch vụ chính hoặc gọi thẳng hotline. Nếu đang tắc cống, bồn cầu trào, bể phốt đầy hoặc có mùi hôi nặng, gọi 0963.953.533 / 0931.156.756 để được hỏi nhanh hiện tượng và hướng xử lý ban đầu.",
    ),
    faqSchemaHtml(),
    wpParagraph(`Tác giả: <a href="${AUTHOR_URL}">Nguyễn Song Hào</a>`),
  ];

  return blocks.join("\n\n");
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
      "User-Agent": "Codex P1 doi tac cleanup",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(60000),
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
  url.searchParams.set("codex", `doi-tac-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex P1 doi tac verifier" },
    signal: AbortSignal.timeout(60000),
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
  const content = compactContent();
  const beforeExternalLinks = countMatches(raw, /<a\b[^>]+href=["']https?:\/\/(?![^"']*thongtaccongquangninh\.com)[^"']+["']/giu);
  const report = {
    ok: false,
    mode: dryRun ? "dry-run" : "apply",
    generatedAt: new Date().toISOString(),
    target: TARGET,
    backupDir,
    before: {
      title: before.title?.raw,
      excerpt: stripText(before.excerpt?.raw || ""),
      contentLen: raw.length,
      rawWordCount: wordCount(raw),
      externalLinks: beforeExternalLinks,
      forbidden: countMatches(stripText(raw), /chuyên nghiệp|uy tín|hàng đầu|tận tâm/giu),
      hotlineRaw: countMatches(stripText(raw), /0963[\s.\-]?953[\s.\-]?533|0931[\s.\-]?156[\s.\-]?756/giu),
    },
    update: {
      title: TITLE,
      excerpt: META_DESC,
      excerptLen: [...META_DESC].length,
      contentLen: content.length,
      rawWordCount: wordCount(content),
      keyword: keywordStats(content),
      externalLinks: countMatches(content, /<a\b[^>]+href=["']https?:\/\/(?![^"']*thongtaccongquangninh\.com)[^"']+["']/giu),
      forbidden: countMatches(stripText(content), /chuyên nghiệp|uy tín|hàng đầu|tận tâm/giu),
      hotlineRaw: countMatches(stripText(content), /0963[\s.\-]?953[\s.\-]?533|0931[\s.\-]?156[\s.\-]?756/giu),
      images: countMatches(content, /<img\b/giu),
      hasCleanupMarker: content.includes(CLEANUP_MARKER),
      hasAuthorArchive: content.includes(AUTHOR_URL),
    },
    rankMath: null,
    after: null,
    verify: null,
  };

  if (!dryRun) {
    mkdirSync(backupDir, { recursive: true });
    writeFileSync(join(backupDir, `page-${TARGET.id}-before.json`), JSON.stringify(before, null, 2) + "\n", "utf8");
    writeFileSync(join(backupDir, `page-${TARGET.id}-before-content.html`), raw, "utf8");

    await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}`, {
      method: "POST",
      body: {
        title: "Hệ Thống Liên Kết Đối Tác & Truyền Thông",
        excerpt: META_DESC,
        content,
      },
    });

    try {
      report.rankMath = await wp("/rankmath/v1/updateMeta", {
        method: "POST",
        body: {
          objectType: "post",
          objectID: TARGET.id,
          meta: {
            rank_math_title: TITLE,
            rank_math_description: META_DESC,
            rank_math_focus_keyword: FOCUS_KEYWORD,
          },
        },
      });
    } catch (error) {
      report.rankMath = { error: String(error.message || error) };
    }

    const after = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
    writeFileSync(join(backupDir, `page-${TARGET.id}-after.json`), JSON.stringify(after, null, 2) + "\n", "utf8");
    report.after = {
      title: after.title?.raw,
      excerpt: stripText(after.excerpt?.raw || ""),
      contentLen: after.content?.raw?.length || 0,
      rawWordCount: wordCount(after.content?.raw || ""),
    };

    report.verify = await fetchPublic();
  }

  report.ok =
    dryRun ||
    Boolean(
      report.verify?.status === 200 &&
        report.verify?.metaDescLen >= 150 &&
        report.verify?.metaDescLen <= 160 &&
        report.verify?.canonical === TARGET.url &&
        report.verify?.h1?.length === 1 &&
        report.verify?.hasCleanupMarker &&
        report.verify?.hotlineMain >= 2 &&
        !report.verify?.hasForbidden,
    );

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, reportPath, backupDir, before: report.before, update: report.update, verify: report.verify }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
