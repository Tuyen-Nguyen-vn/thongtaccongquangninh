/**
 * Fix P0 audit issues for /thong-tac-cong-24-7-quang-ninh/ (post 2782).
 *
 * Usage:
 *   node tools/fix_ttc_24_7_p0.mjs
 *   node tools/fix_ttc_24_7_p0.mjs --write
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WRITE = process.argv.includes("--write");
const POST_ID = 2782;
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const BACKUP_DIR = "D:\\.thongtaccongquangninh\\backups\\live-audit-fix-2026-06-12";

const NEW_TITLE = "Thông Tắc Cống 24/7 Quảng Ninh: Gọi Thợ Xử Lý Ngay Trong Đêm";
const NEW_META =
  "Thông tắc cống 24/7 Quảng Ninh, xử lý nước trào, mùi hôi, cống nghẹt ban đêm. Gọi 0963.953.533, báo giá rõ trước khi làm, hỗ trợ nhanh toàn tỉnh 24/7.";
const FOCUS_KW = "thông tắc cống 24/7 Quảng Ninh";

const DUP_IMAGE_URL = "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-24-7-quang-ninh-02.webp";
const REPLACEMENT_IMAGE_URL =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-gieng-day-may-lo-xo-03.webp";
const REPLACEMENT_ALT =
  "Máy lò xo thông tắc cống 24/7 tại Quảng Ninh không đục phá";
const REPLACEMENT_CAPTION =
  "Máy lò xo xử lý cống nghẹt 24/7 tại Quảng Ninh, hạn chế đục phá nền nhà.";

const CONTENT_EXPANSION = `
<h2>Dấu Hiệu Cần Gọi Thợ Thông Tắc Cống 24/7 Ngay</h2>
<p>Không phải ca tắc nào cũng cần gọi thợ giữa đêm. Nhưng nếu nước đã trào ngược, mùi hôi bốc mạnh hoặc nhiều điểm thoát nước cùng nghẹt, bạn nên gọi ngay để tránh nước bẩn lan ra sàn nhà, bếp và khu vệ sinh.</p>
<p><strong>Trường hợp cần xử lý khẩn cấp:</strong> nước từ sàn tắm trào lên khi xả bồn cầu, chậu rửa bếp thoát chậm kèm mùi hôi, hố ga đầy sau mưa lớn, hoặc cống ngoài sân ứ nước sát cửa nhà. Những dấu hiệu này thường cho thấy điểm tắc nằm sâu trong đường ống chính, tự đổ hóa chất dễ làm cặn bùn đóng đặc hơn.</p>
<p>Tại Hạ Long, các khu nhà cũ ở Hòn Gai, Hà Khánh, Cao Xanh hay gặp ống thoát có nhiều đoạn cong và hố ga nông. Tại Bãi Cháy, nhà hàng và khách sạn dễ tắc do dầu mỡ bếp dồn xuống cùng lúc sau giờ cao điểm. Tại Cẩm Phả và Uông Bí, nhiều khu dân cư có đường ống dài, độ dốc thấp, nên cặn bùn tích tụ lâu ngày mới phát hiện khi nước trào.</p>
<p>Khi gọi <strong>0963.953.533</strong>, bạn chỉ cần nói rõ 3 thông tin: vị trí tắc, nước đang trào hay chỉ thoát chậm, và khu vực cụ thể. Kỹ thuật viên sẽ hỏi thêm đường ống trong nhà, hố ga ngoài sân, thời điểm bắt đầu tắc để ước lượng thiết bị cần mang theo trước khi xuất phát.</p>
<h2>Cách Hạn Chế Cống Tắc Lại Sau Khi Xử Lý</h2>
<p>Sau khi thông tắc, việc xả thử nước mạnh chỉ xác nhận đường ống đã thoát tại thời điểm bàn giao. Muốn hạn chế tái tắc, cần xử lý đúng thói quen sinh hoạt và điểm tích tụ cặn trong hệ thống thoát nước.</p>
<p>Với bếp gia đình và nhà hàng, không đổ dầu mỡ thừa trực tiếp xuống chậu rửa. Dầu nóng nhìn như chất lỏng, nhưng khi gặp đoạn ống lạnh sẽ bám vào thành ống, giữ lại cơm thừa, cặn thức ăn và bọt xà phòng. Sau vài tuần, lớp bám này đủ làm nước rút chậm, sau vài tháng có thể bịt gần kín đường thoát.</p>
<p>Với nhà vệ sinh, không xả khăn ướt, tóc, băng vệ sinh, túi nilon hoặc vật cứng xuống bồn cầu và thoát sàn. Các vật này thường kẹt ở đoạn cong chữ P hoặc điểm nối ống, tạo lõi tắc để giấy và cặn bám tiếp. Nếu bồn cầu bắt đầu rút chậm, nghe tiếng ùng ục hoặc có mùi hôi ngược lên, nên kiểm tra sớm thay vì chờ tắc hoàn toàn.</p>
<p>Với hố ga, nên nạo vét định kỳ trước mùa mưa, đặc biệt tại khu nhà thấp, mặt sân trũng hoặc tuyến phố có nhiều bùn cát. Hố ga đầy không chỉ gây tắc cống mà còn làm mùi hôi quay ngược vào nhà. Nếu cần xử lý cả tuyến, xem thêm dịch vụ <a href="https://thongtaccongquangninh.com/nao-vet-ho-ga-quang-ninh/">nạo vét hố ga Quảng Ninh</a> để chọn đúng phương án.</p>
<p>Nếu hệ thống nhà bạn thường xuyên tắc dù đã thông nhiều lần, nguyên nhân có thể nằm ở độ dốc ống, hố ga sai vị trí hoặc rễ cây xâm nhập. Khi đó, đội thợ cần kiểm tra kỹ hơn thay vì chỉ phá lõi tắc. Mục tiêu là làm rõ nguyên nhân để không phải gọi thợ lặp lại sau vài tuần.</p>
`;

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + path,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "ttcqn-fix-ttc-24-7-p0/1.0",
        ...(bodyBuf
          ? {
              "Content-Type": "application/json",
              "Content-Length": bodyBuf.length,
            }
          : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://${WP_HOST}/thong-tac-cong-24-7-quang-ninh/#service`,
    name: "Thông tắc cống 24/7 Quảng Ninh",
    serviceType: "Thông tắc cống 24/7",
    provider: {
      "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      telephone: ["0963.953.533", "0931.156.756"],
      url: `https://${WP_HOST}/`,
    },
    areaServed: ["Hạ Long", "Cẩm Phả", "Uông Bí", "Quảng Yên", "Đông Triều", "Móng Cái", "Quảng Ninh"],
    availableChannel: {
      "@type": "ServiceChannel",
      servicePhone: {
        "@type": "ContactPoint",
        telephone: "0963.953.533",
        contactType: "customer service",
        availableLanguage: "vi",
      },
      serviceUrl: `https://${WP_HOST}/thong-tac-cong-24-7-quang-ninh/`,
    },
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    description:
      "Dịch vụ thông tắc cống 24/7 tại Quảng Ninh, xử lý nước trào, mùi hôi, cống nghẹt ban đêm, báo giá rõ trước khi làm.",
  };
}

function patchContent(raw) {
  let content = raw;

  content = content.replace(
    "<h2>Vì Sao Cống Tắc Thường Xảy Ra Ban Đêm?</h2>",
    "<h2>Nguyên Nhân Cống Tắc Thường Xảy Ra Ban Đêm</h2>",
  );

  const oldFigureRe = new RegExp(
    `<figure class="wp-block-image size-large"><img src="${DUP_IMAGE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*><figcaption>[\\s\\S]*?<\\/figcaption><\\/figure>`,
  );
  const newFigure = `<figure class="wp-block-image size-large"><img src="${REPLACEMENT_IMAGE_URL}" alt="${REPLACEMENT_ALT}" loading="lazy"><figcaption>${REPLACEMENT_CAPTION}</figcaption></figure>`;
  content = content.replace(oldFigureRe, newFigure);

  const editorialStart = content.indexOf("<p><strong>Gợi ý ảnh:");
  const authorLine =
    '<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>';
  const authorIndex = content.indexOf(authorLine);
  if (editorialStart !== -1 && authorIndex !== -1 && editorialStart < authorIndex) {
    content = content.slice(0, editorialStart).trimEnd() + "\n" + content.slice(authorIndex);
  }

  if (!content.includes("Dấu Hiệu Cần Gọi Thợ Thông Tắc Cống 24/7 Ngay")) {
    content = content.replace("<h2>Câu Hỏi Thường Gặp</h2>", `${CONTENT_EXPANSION}\n<h2>Câu Hỏi Thường Gặp</h2>`);
  }

  content = content
    .replaceAll("uy tín", "rõ thông tin")
    .replaceAll("Uy tín", "Rõ thông tin")
    .replaceAll("chuyên nghiệp", "đúng quy trình")
    .replaceAll("Chuyên nghiệp", "Đúng quy trình")
    .replaceAll("cam kết mang đến", "thực hiện theo đúng");

  const schemaHtml = `<script type="application/ld+json">${JSON.stringify(serviceSchema())}</script>\n`;
  if (!content.includes("/thong-tac-cong-24-7-quang-ninh/#service")) {
    const idx = content.indexOf(authorLine);
    content = idx === -1 ? content.trimEnd() + "\n" + schemaHtml : content.slice(0, idx) + schemaHtml + content.slice(idx);
  }

  return content;
}

function textFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countNeedle(haystack, needle) {
  return haystack.toLowerCase().split(needle.toLowerCase()).length - 1;
}

async function main() {
  console.log(`=== Fix TTC 24/7 P0 (${WRITE ? "WRITE" : "DRY-RUN"}) ===`);
  console.log(`Title length: ${[...NEW_TITLE].length}`);
  console.log(`Meta length: ${[...NEW_META].length}`);

  const current = await wpRequest("GET", `/wp/v2/posts/${POST_ID}?context=edit`);
  if (current.status !== 200) throw new Error(`GET post failed: ${current.status}`);

  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(`${BACKUP_DIR}\\post-2782-before-${stamp}.json`, JSON.stringify(current.data, null, 2), "utf8");

  const before = current.data.content?.raw || "";
  const after = patchContent(before);
  const plain = textFromHtml(after);
  const checks = {
    hasNguyenNhanH2: after.includes("<h2>Nguyên Nhân"),
    hasServiceSchema: after.includes("/thong-tac-cong-24-7-quang-ninh/#service"),
    replacedDuplicateImage: !after.includes(DUP_IMAGE_URL) && after.includes(REPLACEMENT_IMAGE_URL),
    forbiddenUyTin: countNeedle(plain, "uy tín"),
    forbiddenChuyenNghiep: countNeedle(plain, "chuyên nghiệp"),
    removedEditorialBlock: !after.includes("Gợi ý ảnh") && !after.includes("Checklist Rank Math"),
    beforeLen: before.length,
    afterLen: after.length,
    approxWords: plain.split(/\s+/).filter(Boolean).length,
  };
  console.log(JSON.stringify(checks, null, 2));

  writeFileSync(`${BACKUP_DIR}\\post-2782-after-preview.html`, after, "utf8");

  if (!WRITE) {
    console.log("[DRY-RUN] Preview written: backups/live-audit-fix-2026-06-12/post-2782-after-preview.html");
    return;
  }

  const updatePost = await wpRequest("POST", `/wp/v2/posts/${POST_ID}`, {
    title: NEW_TITLE,
    content: after,
  });
  if (updatePost.status !== 200) {
    throw new Error(`POST update failed: ${updatePost.status} ${JSON.stringify(updatePost.data).slice(0, 300)}`);
  }
  console.log(`Post updated: ${updatePost.data.link}`);

  const meta = await wpRequest("POST", "/rankmath/v1/updateMeta", {
    objectType: "post",
    objectID: POST_ID,
    meta: {
      rank_math_title: NEW_TITLE,
      rank_math_focus_keyword: FOCUS_KW,
      rank_math_description: NEW_META,
    },
  });
  console.log(`Rank Math update: ${meta.status} ${JSON.stringify(meta.data).slice(0, 180)}`);
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
