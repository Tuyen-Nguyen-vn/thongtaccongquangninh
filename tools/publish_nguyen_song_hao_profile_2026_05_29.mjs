import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const ENV_PATH = join(PROJECT, ".env");
const REPORT_PATH = join(PROJECT, "WORDPRESS_PUBLISH_NGUYEN_SONG_HAO_PROFILE_2026-05-29.json");
const BACKUP_DIR = join(PROJECT, "backups", "nguyen-song-hao-profile-before-20260529");

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: { Authorization: auth, ...(init.headers ?? {}) },
  });
  const raw = await res.text();
  let data = raw;
  try {
    data = JSON.parse(raw);
  } catch {}
  if (!res.ok) {
    throw new Error(`WordPress ${res.status} ${path}: ${typeof data === "object" ? data.message || raw : raw}`);
  }
  return data;
}

async function uploadMedia(baseUrl, auth, image) {
  const fileName = basename(image.path);
  const searchBase = basename(fileName, extname(fileName));
  const found = await wp(baseUrl, auth, `/wp/v2/media?search=${encodeURIComponent(searchBase)}&per_page=20&context=edit`);
  const hit = Array.isArray(found) ? found.find((item) => String(item.source_url || "").includes(fileName)) : null;
  if (hit) {
    await wp(baseUrl, auth, `/wp/v2/media/${hit.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt_text: image.alt, caption: image.caption, title: image.title }),
    });
    return { item: hit, uploaded: false };
  }
  const item = await wp(baseUrl, auth, "/wp/v2/media", {
    method: "POST",
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
    body: createReadStream(image.path),
    duplex: "half",
  });
  await wp(baseUrl, auth, `/wp/v2/media/${item.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alt_text: image.alt, caption: image.caption, title: image.title }),
  });
  return { item, uploaded: true };
}

function figure(mediaItem, image) {
  return `<!-- wp:image {"id":${mediaItem.id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="${esc(mediaItem.source_url)}" alt="${esc(image.alt)}" class="wp-image-${mediaItem.id}"/><figcaption class="wp-element-caption">${esc(image.caption)}</figcaption></figure>
<!-- /wp:image -->`;
}

function buildContent(media) {
  const award2022 = figure(media.award2022, {
    alt: "Giấy chứng nhận Kỷ niệm chương Doanh nhân trẻ Việt Nam trao cho Nguyễn Song Hào",
    caption: "Giấy chứng nhận Kỷ niệm chương Vì sự phát triển phong trào Doanh nhân trẻ Việt Nam trao cho Nguyễn Song Hào năm 2022.",
  });
  const dongBac = figure(media.dongBac2023, {
    alt: "Bằng khen Bộ Tài nguyên và Môi trường tặng Công ty Cổ phần Môi Trường Đông Bắc",
    caption: "Bằng khen Bộ Tài nguyên và Môi trường tặng Công ty Cổ phần Môi Trường Đông Bắc năm 2023.",
  });
  const entec = figure(media.entec2023, {
    alt: "Bằng khen Bộ Tài nguyên và Môi trường tặng Trung tâm Công nghệ Môi trường ENTEC",
    caption: "Bằng khen Bộ Tài nguyên và Môi trường tặng Trung tâm Công nghệ Môi trường ENTEC năm 2023.",
  });

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nguyễn Song Hào",
    jobTitle:
      "Phó Chủ tịch Công ty Cổ phần Môi Trường Đông Bắc; Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh",
    image: media.award2022.source_url,
    url: "https://thongtaccongquangninh.com/nguyen-song-hao/",
    birthDate: "1985",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Đại học Bách Khoa Hà Nội",
      url: "https://hust.edu.vn/",
    },
    knowsAbout: ["Kỹ thuật môi trường", "Hút bể phốt", "Thông tắc cống", "Xử lý thoát nước", "Nạo vét hố ga"],
    worksFor: {
      "@type": "Organization",
      name: "Công ty Môi Trường Đô Thị Số 1 Quảng Ninh",
      url: "https://thongtaccongquangninh.com/",
      telephone: "+84963953533",
      areaServed: "Quảng Ninh",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Nguyễn Song Hào là ai?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Nguyễn Song Hào sinh năm 1985, là Phó Chủ tịch Công ty Cổ phần Môi Trường Đông Bắc và Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh.",
        },
      },
      {
        "@type": "Question",
        name: "Nguyễn Song Hào học trường nào?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nguyễn Song Hào học chuyên ngành Kỹ thuật Môi trường tại Đại học Bách Khoa Hà Nội.",
        },
      },
      {
        "@type": "Question",
        name: "Nguyễn Song Hào đang điều hành công ty nào?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nguyễn Song Hào hiện giữ vai trò Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh.",
        },
      },
      {
        "@type": "Question",
        name: "Công ty Môi Trường Đô Thị Số 1 Quảng Ninh cung cấp dịch vụ gì?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Công ty cung cấp dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi và vệ sinh đường ống thoát nước tại Quảng Ninh.",
        },
      },
    ],
  };

  return `<!-- wp:paragraph -->
<p><em>Cập nhật ngày 29/05/2026</em></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Nguyễn Song Hào</strong>, sinh năm 1985, là Phó Chủ tịch Công ty Cổ phần Môi Trường Đông Bắc và hiện giữ vai trò Giám đốc điều hành <a href="https://thongtaccongquangninh.com/">Công ty Môi Trường Đô Thị Số 1 Quảng Ninh</a>. Anh phụ trách định hướng vận hành, kiểm soát kỹ thuật và tổ chức đội ngũ xử lý các dịch vụ môi trường tại Quảng Ninh.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Trang này cung cấp thông tin về học vấn, hành trình làm nghề, vai trò điều hành và các ghi nhận đã được thể hiện trên giấy chứng nhận, bằng khen. Khách cần tư vấn dịch vụ có thể gọi <strong>0963.953.533</strong>.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li><a href="#doi-net">Đôi nét về Nguyễn Song Hào</a></li>
<li><a href="#hanh-trinh">Hành trình theo ngành môi trường</a></li>
<li><a href="#vai-tro">Vai trò điều hành hiện nay</a></li>
<li><a href="#khen-thuong">Ghi nhận và khen thưởng</a></li>
<li><a href="#lien-he">Thông tin liên hệ</a></li>
<li><a href="#faq">Câu hỏi thường gặp</a></li>
</ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 id="doi-net">Đôi nét về Nguyễn Song Hào</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li><strong>Họ tên:</strong> Nguyễn Song Hào</li>
<li><strong>Năm sinh:</strong> 1985</li>
<li><strong>Quê quán:</strong> Thái Bình</li>
<li><strong>Chuyên môn:</strong> Kỹ thuật Môi trường, Đại học Bách Khoa Hà Nội</li>
<li><strong>Chức danh:</strong> Phó Chủ tịch Công ty Cổ phần Môi Trường Đông Bắc</li>
<li><strong>Vai trò hiện tại:</strong> Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh</li>
<li><strong>Lĩnh vực phụ trách:</strong> quản lý vận hành, kỹ thuật môi trường, xử lý thoát nước, <a href="https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a>, <a href="https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/">thông tắc cống Quảng Ninh</a>, nạo vét hố ga, xử lý mùi hôi</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Triết lý làm nghề của anh là xử lý đúng nguyên nhân, làm rõ chi phí trước khi thi công và chịu trách nhiệm sau khi bàn giao. Với nhóm dịch vụ liên quan đến thoát nước, bể phốt và hố ga, cách làm này giúp giảm rủi ro tái tắc, mùi hôi và phát sinh ngoài hiện trường.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 id="hanh-trinh">Hành trình theo ngành môi trường</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nguyễn Song Hào lớn lên ở Thái Bình và sớm quan tâm đến công việc vệ sinh môi trường đô thị. Những trải nghiệm thực tế khi làm việc cùng công nhân môi trường tại Quảng Ninh giúp anh hiểu rõ đặc thù của nghề: vất vả, nhiều tình huống phát sinh, nhưng có ảnh hưởng trực tiếp đến sinh hoạt của từng gia đình và khu dân cư.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Sau thời gian ôn thi và làm việc thực tế, anh theo học ngành Kỹ thuật Môi trường tại <a href="https://hust.edu.vn/" target="_blank" rel="noopener noreferrer">Đại học Bách Khoa Hà Nội</a>. Nền tảng kỹ thuật này là cơ sở để anh xây dựng quy trình khảo sát, lựa chọn thiết bị và kiểm soát chất lượng thi công tại hiện trường.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Trong quá trình làm nghề, anh tham gia các mảng vệ sinh môi trường, thoát nước, xử lý chất thải và dịch vụ đô thị. Kinh nghiệm thực địa giúp anh nhìn rõ một vấn đề quan trọng: ngành môi trường cần kết hợp con người, máy móc, quy trình và trách nhiệm sau dịch vụ.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 id="vai-tro">Vai trò điều hành hiện nay</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Ở vai trò Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh, Nguyễn Song Hào trực tiếp định hướng vận hành đội ngũ, điều phối kỹ thuật viên và kiểm soát các nhóm dịch vụ chính.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li>Hút bể phốt dân dụng, nhà hàng, khách sạn, khu dân cư và công trình.</li>
<li>Thông tắc cống, thông tắc bồn cầu, thông tắc chậu rửa.</li>
<li>Nạo vét hố ga, vệ sinh đường ống thoát nước.</li>
<li>Xử lý mùi hôi cống, mùi hôi nhà vệ sinh, mùi hôi hố ga.</li>
<li>Điều phối xe bồn, máy lò xo, thiết bị hút và phương án thi công theo từng hiện trạng.</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Đội ngũ dưới sự điều hành của anh tập trung vào ba việc: tiếp nhận nhanh, khảo sát rõ tình trạng, báo phương án trước khi thi công. Khi khách cần xử lý sự cố tại Quảng Ninh, hotline tiếp nhận là <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 id="khen-thuong">Ghi nhận và khen thưởng</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Các thông tin dưới đây được trích theo nội dung hiển thị trên giấy chứng nhận và bằng khen đã cung cấp.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Kỷ niệm chương Vì sự phát triển phong trào Doanh nhân trẻ Việt Nam năm 2022</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Năm 2022, Nguyễn Song Hào được Hội Doanh nhân trẻ Việt Nam trao Giấy chứng nhận Kỷ niệm chương “Vì sự phát triển phong trào Doanh nhân trẻ Việt Nam”. Trên giấy chứng nhận, anh được ghi nhận với vai trò <strong>Phó Chủ tịch Hội Doanh nhân trẻ tỉnh Quảng Ninh – Phó Chủ tịch Công ty Cổ phần Môi Trường Đông Bắc</strong>.</p>
<!-- /wp:paragraph -->

<!-- wp:table -->
<figure class="wp-block-table"><table><tbody>
<tr><td>Năm</td><td>2022</td></tr>
<tr><td>Hình thức ghi nhận</td><td>Kỷ niệm chương “Vì sự phát triển phong trào Doanh nhân trẻ Việt Nam”</td></tr>
<tr><td>Đơn vị trao</td><td>Hội Doanh nhân trẻ Việt Nam</td></tr>
<tr><td>Người nhận</td><td>Nguyễn Song Hào</td></tr>
<tr><td>Số quyết định / số chứng nhận</td><td>90/QĐ/UBTU-DNT</td></tr>
<tr><td>Ngày ghi trên chứng nhận</td><td>25/11/2022</td></tr>
</tbody></table></figure>
<!-- /wp:table -->

${award2022}

<!-- wp:heading {"level":3} -->
<h3>Bằng khen Bộ Tài nguyên và Môi trường năm 2023</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Năm 2023, Bộ Tài nguyên và Môi trường tặng bằng khen cho Công ty Cổ phần Môi Trường Đông Bắc và Trung tâm Công nghệ Môi trường ENTEC vì thành tích tiêu biểu trong lĩnh vực tài nguyên và môi trường. Đây là tư liệu bổ sung cho năng lực hoạt động môi trường trong hệ sinh thái đơn vị do Nguyễn Song Hào tham gia điều hành.</p>
<!-- /wp:paragraph -->

<!-- wp:table -->
<figure class="wp-block-table"><table><tbody>
<tr><td>Năm</td><td>2023</td></tr>
<tr><td>Đơn vị trao</td><td>Bộ Tài nguyên và Môi trường</td></tr>
<tr><td>Đơn vị nhận</td><td>Công ty Cổ phần Môi Trường Đông Bắc; Trung tâm Công nghệ Môi trường ENTEC</td></tr>
<tr><td>Số quyết định</td><td>3398/QĐ-BTNMT</td></tr>
<tr><td>Ngày ghi trên bằng khen</td><td>17/11/2023</td></tr>
</tbody></table></figure>
<!-- /wp:table -->

${dongBac}

${entec}

<!-- wp:heading -->
<h2 id="lien-he">Thông tin liên hệ</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Công ty Môi Trường Đô Thị Số 1 Quảng Ninh</strong></p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li><strong>Người điều hành:</strong> Nguyễn Song Hào</li>
<li><strong>Hotline:</strong> <a href="tel:0963953533">0963.953.533</a> – <a href="tel:0931156756">0931.156.756</a></li>
<li><strong>Website:</strong> <a href="https://thongtaccongquangninh.com/">thongtaccongquangninh.com</a></li>
<li><strong>Dịch vụ:</strong> hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi, vệ sinh đường ống thoát nước</li>
<li><strong>Khu vực phục vụ:</strong> Hạ Long, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn, Cẩm Phả và các khu vực lân cận tại Quảng Ninh</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Cần xử lý sự cố bể phốt, cống tắc hoặc mùi hôi tại Quảng Ninh? Gọi <strong>0963.953.533</strong> để đội kỹ thuật tiếp nhận tình trạng và báo phương án xử lý.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 id="faq">Câu hỏi thường gặp</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Nguyễn Song Hào là ai?</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Nguyễn Song Hào sinh năm 1985, là Phó Chủ tịch Công ty Cổ phần Môi Trường Đông Bắc và Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Nguyễn Song Hào học trường nào?</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Anh học chuyên ngành Kỹ thuật Môi trường tại Đại học Bách Khoa Hà Nội.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Nguyễn Song Hào đang điều hành công ty nào?</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Anh hiện giữ vai trò Giám đốc điều hành Công ty Môi Trường Đô Thị Số 1 Quảng Ninh.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Công ty Môi Trường Đô Thị Số 1 Quảng Ninh cung cấp dịch vụ gì?</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Công ty cung cấp dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi và vệ sinh đường ống thoát nước tại Quảng Ninh.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<script type="application/ld+json">${JSON.stringify(personSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<!-- /wp:html -->
`;
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const before = await wp(baseUrl, auth, "/wp/v2/pages?slug=nguyen-song-hao&status=any&context=edit");
  writeFileSync(join(BACKUP_DIR, "before-pages-nguyen-song-hao.json"), JSON.stringify(before, null, 2));

  const images = {
    award2022: {
      path: join(PROJECT, "Ảnh Đã Xử Lý SEO", "nguyen-song-hao-ky-niem-chuong-doanh-nhan-tre-viet-nam-2022-ha-long.jpg"),
      alt: "Giấy chứng nhận Kỷ niệm chương Doanh nhân trẻ Việt Nam trao cho Nguyễn Song Hào",
      caption: "Giấy chứng nhận Kỷ niệm chương Vì sự phát triển phong trào Doanh nhân trẻ Việt Nam trao cho Nguyễn Song Hào năm 2022.",
      title: "Nguyễn Song Hào nhận Kỷ niệm chương Doanh nhân trẻ Việt Nam 2022",
    },
    dongBac2023: {
      path: join(PROJECT, "Ảnh Đã Xử Lý SEO", "cong-ty-moi-truong-dong-bac-bang-khen-bo-tai-nguyen-moi-truong-2023-ha-long.jpg"),
      alt: "Bằng khen Bộ Tài nguyên và Môi trường tặng Công ty Cổ phần Môi Trường Đông Bắc",
      caption: "Bằng khen Bộ Tài nguyên và Môi trường tặng Công ty Cổ phần Môi Trường Đông Bắc năm 2023.",
      title: "Bằng khen Bộ Tài nguyên và Môi trường tặng Công ty Môi Trường Đông Bắc",
    },
    entec2023: {
      path: join(PROJECT, "Ảnh Đã Xử Lý SEO", "trung-tam-cong-nghe-moi-truong-entec-bang-khen-bo-tai-nguyen-moi-truong-2023-ha-long.jpg"),
      alt: "Bằng khen Bộ Tài nguyên và Môi trường tặng Trung tâm Công nghệ Môi trường ENTEC",
      caption: "Bằng khen Bộ Tài nguyên và Môi trường tặng Trung tâm Công nghệ Môi trường ENTEC năm 2023.",
      title: "Bằng khen Bộ Tài nguyên và Môi trường tặng ENTEC",
    },
  };
  for (const image of Object.values(images)) {
    if (!existsSync(image.path)) throw new Error(`Missing image: ${image.path}`);
  }

  const uploaded = {};
  for (const [key, image] of Object.entries(images)) {
    uploaded[key] = await uploadMedia(baseUrl, auth, image);
  }

  const mediaItems = Object.fromEntries(Object.entries(uploaded).map(([key, value]) => [key, value.item]));
  const title = "Nguyễn Song Hào – Nhà Sáng Lập Môi Trường Đô Thị Số 1 Quảng Ninh";
  const metaDesc =
    "Nguyễn Song Hào – kỹ sư Kỹ thuật Môi trường ĐH Bách Khoa Hà Nội, nhà sáng lập Công ty Môi Trường Đô Thị Số 1 Quảng Ninh. Tư vấn dịch vụ: 0963.953.533.";
  const content = buildContent(mediaItems);
  const payload = {
    title,
    slug: "nguyen-song-hao",
    status: "publish",
    content,
    excerpt: metaDesc,
    featured_media: mediaItems.award2022.id,
    meta: {
      rank_math_title: title,
      rank_math_description: metaDesc,
      rank_math_focus_keyword: "Nguyễn Song Hào",
    },
  };

  let page;
  if (Array.isArray(before) && before[0]) {
    page = await wp(baseUrl, auth, `/wp/v2/pages/${before[0].id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    page = await wp(baseUrl, auth, "/wp/v2/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectType: "post",
        objectID: page.id,
        meta: {
          rank_math_title: title,
          rank_math_description: metaDesc,
          rank_math_focus_keyword: "Nguyễn Song Hào",
        },
      }),
    });
  } catch (error) {
    // REST meta above is enough on this install when Rank Math endpoint is unavailable.
  }

  const verify = await wp(baseUrl, auth, `/wp/v2/pages/${page.id}?context=edit`);
  const liveRes = await fetch(`${baseUrl}/nguyen-song-hao/?nowprocket=1&codex=profile-publish-20260529`);
  const liveHtml = await liveRes.text();
  const report = {
    page: { id: page.id, link: page.link, slug: page.slug, status: page.status },
    uploaded: Object.fromEntries(
      Object.entries(uploaded).map(([key, value]) => [
        key,
        { id: value.item.id, source_url: value.item.source_url, uploaded: value.uploaded },
      ]),
    ),
    verify: {
      restStatus: verify.status,
      liveStatus: liveRes.status,
      hasTitle: liveHtml.includes("Nguyễn Song Hào"),
      hasAward2022: liveHtml.includes("90/QĐ/UBTU-DNT"),
      hasPersonSchema: liveHtml.includes('"@type":"Person"') || liveHtml.includes('"@type": "Person"'),
      hasFaqSchema: liveHtml.includes('"@type":"FAQPage"') || liveHtml.includes('"@type": "FAQPage"'),
      imageCount: (liveHtml.match(/<img\\b/gi) || []).length,
    },
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
