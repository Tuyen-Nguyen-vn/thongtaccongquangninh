// Tạo 7 bài blog "Cẩm Nang Hút Hầm Cầu Tại ..." (Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên,
// Móng Cái, Đông Triều, Vân Đồn) trên WordPress qua REST API, ở trạng thái NHÁP (draft).
// Hoàn tất dịch vụ cuối cùng trong 4 dịch vụ yêu cầu ban đầu (hút bể phốt, thông tắc cống,
// thông tắc bồn cầu đã xong ở các batch trước). Site chỉ có 1 trang dịch vụ cấp tỉnh
// (hut-ham-cau-quang-ninh) - KHÔNG tạo thêm trang dịch vụ cấp thành phố (dễ cannibalize
// với hút bể phốt cùng ý định tìm kiếm), nhưng bài BLOG dạng cẩm nang thì an toàn vì khác
// định dạng - tất cả 7 bài đều trỏ link về đúng 1 trang dịch vụ hut-ham-cau-quang-ninh.
//
// Cách chạy (trên máy Windows có D:/.thongtaccongquangninh/.env):
//   node tools/publish_cam_nang_hut_ham_cau_batch1.mjs --dry     # xem trước
//   node tools/publish_cam_nang_hut_ham_cau_batch1.mjs           # tạo 7 bài NHÁP thật

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import https from "node:https";

const ENV_PATH = "D:/.thongtaccongquangninh/.env";
const HOST = "thongtaccongquangninh.com";
const ROOT = "D:/.thongtaccongquangninh";
const DRY = process.argv.includes("--dry");

function readEnv(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return values;
}

function request(method, urlPath, auth, payload) {
  return new Promise((resolve, reject) => {
    const body = payload === undefined ? null : Buffer.from(JSON.stringify(payload), "utf8");
    const req = https.request(
      { hostname: HOST, port: 443, path: urlPath, method,
        headers: { Authorization: auth, Accept: "application/json",
          ...(body ? { "Content-Type": "application/json", "Content-Length": body.length } : {}) } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (body) req.write(body);
    req.end();
  });
}

function p(t) { return `<p>${t}</p>`; }
function h2(t) { return `<h2>${t}</h2>`; }
function h3(t) { return `<h3>${t}</h3>`; }
function ul(items) { return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`; }
function ol(items) { return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`; }
function faqSchema(faq) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  })}</script>`;
}

const SERVICE_PAGE = "https://thongtaccongquangninh.com/hut-ham-cau-quang-ninh/";
const CITY_SLUG = {
  "Hạ Long": "ha-long", "Cẩm Phả": "cam-pha", "Uông Bí": "uong-bi",
  "Quảng Yên": "quang-yen", "Móng Cái": "mong-cai", "Đông Triều": "dong-trieu", "Vân Đồn": "van-don",
};

const CITIES = [
  {
    city: "Hạ Long", slug: "cam-nang-hut-ham-cau-tai-ha-long",
    causesHeading: "Nguyên nhân hầm cầu tại Hạ Long nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Nhà phố cổ khu Hồng Gai, Bạch Đằng</strong> — hầm cầu xây gạch từ trước 1990, dung tích nhỏ hơn nhiều so với bể tự hoại bê tông hiện đại.",
      "<strong>Mùa du lịch cao điểm ở Bãi Cháy</strong> — homestay, khách sạn nhỏ có lượng khách tăng đột biến hè, vượt tải hầm cầu thiết kế cho ngày thường.",
      "<strong>Mực nước ngầm cao gần biển</strong> khiến hầm cầu khó thoát nước phụ ra đất xung quanh so với khu đất cao.",
    ],
    areas: [
      "<strong>Hồng Gai, Bạch Đằng — phố cổ:</strong> hầm cầu gạch cũ, cần điều chỉnh lực hút để không làm nứt thêm thành hầm.",
      "<strong>Bãi Cháy, Hùng Thắng — khách sạn, homestay:</strong> nên hút định kỳ trước mùa cao điểm thay vì đợi đầy.",
      "<strong>Cao Xanh, Giếng Đáy — nhà liền kề:</strong> hầm cầu bê tông hiện đại hơn, dung tích lớn, chu kỳ hút dài hơn.",
    ],
    caseStudy: "Một nhà phố cổ tại Hồng Gai gọi hút hầm cầu gấp vì nước thải trào lên nền nhà tắm. Khảo sát cho thấy hầm xây gạch từ những năm 1980, đã hơn 5 năm chưa hút. Sau khi hút và kiểm tra " +
      `<a href="${SERVICE_PAGE}">quy trình đầy đủ tại đây</a>, chủ nhà được tư vấn hút định kỳ 2-3 năm/lần thay vì chờ đầy hẳn mới gọi.`,
  },
  {
    city: "Cẩm Phả", slug: "cam-nang-hut-ham-cau-tai-cam-pha",
    causesHeading: "Nguyên nhân hầm cầu tại Cẩm Phả nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Nhà tập thể khu mỏ (Cẩm Trung, Cẩm Thủy)</strong> — hầm cầu xây từ thời bao cấp, dùng chung cho nhiều hộ, tải trọng vượt xa thiết kế ban đầu.",
      "<strong>Nền đất pha than bùn</strong> ở một số khu vực khiến hầm khó thoát nước phụ, nước tồn đọng lâu hơn.",
      "<strong>Khu công nghiệp, cảng Cửa Ông, Mông Dương</strong> — nhà trọ công nhân đông người dùng chung hầm cầu.",
    ],
    areas: [
      "<strong>Cẩm Trung, Cẩm Thủy — nhà tập thể:</strong> cần xác định đúng ngăn chứa của từng dãy trước khi hút.",
      "<strong>Cửa Ông, Mông Dương — khu công nghiệp:</strong> nhà trọ đông người, nên rút ngắn chu kỳ hút.",
      "<strong>Khu trung tâm Cẩm Phả:</strong> hầm cầu bê tông hiện đại hơn, chu kỳ hút dài hơn.",
    ],
    caseStudy: "Một dãy nhà tập thể tại Cẩm Trung (dùng chung 1 hầm cầu cho 6 hộ) gọi hút gấp vì mùi hôi nồng nặc quanh khu vực. Sau khi hút và kiểm tra " +
      `<a href="${SERVICE_PAGE}">quy trình đầy đủ tại đây</a>, các hộ được tư vấn chia lịch hút định kỳ để tránh tình trạng dồn đầy đột ngột.`,
  },
  {
    city: "Uông Bí", slug: "cam-nang-hut-ham-cau-tai-uong-bi",
    causesHeading: "Nguyên nhân hầm cầu tại Uông Bí nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Địa hình đồi ở khu Vàng Danh</strong> — hầm cầu xây trên nền dốc thoát nước phụ chậm hơn khu đất bằng.",
      "<strong>Mùa lễ hội Yên Tử</strong> — nhà nghỉ, hàng quán quanh tuyến đường lên chùa tăng đột biến khách đầu năm.",
      "<strong>Nhà trọ công nhân mỏ (Yên Thanh, Quang Trung)</strong> — hầm cầu dùng chung nhiều phòng.",
    ],
    areas: [
      "<strong>Vàng Danh — khu đồi:</strong> xe nhỏ hoặc ống nối dài khi xe lớn khó tiếp cận.",
      "<strong>Yên Thanh, Quang Trung — nhà trọ:</strong> nên hút định kỳ ngắn hơn do dùng chung nhiều phòng.",
      "<strong>Khu vực gần Yên Tử:</strong> nên hút trước mùa lễ hội đầu năm.",
    ],
    caseStudy: "Một nhà nghỉ gần Yên Tử gọi hút hầm cầu trước Tết vì lo đông khách hành hương. Khảo sát cho thấy hầm chưa hút hơn 3 năm. Sau khi hút và kiểm tra " +
      `<a href="${SERVICE_PAGE}">quy trình đầy đủ tại đây</a>, chủ nhà nghỉ được tư vấn hút định kỳ trước mỗi mùa lễ hội.`,
  },
  {
    city: "Quảng Yên", slug: "cam-nang-hut-ham-cau-tai-quang-yen",
    causesHeading: "Nguyên nhân hầm cầu tại Quảng Yên nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Nhà nền thấp ven sông</strong> — nước dâng theo triều khiến hầm khó thoát nước phụ.",
      "<strong>Khu công nghiệp</strong> — nhà trọ công nhân đông người dùng chung hầm cầu.",
      "<strong>Hầm cầu xây lâu năm</strong> ở khu dân cư cũ, dung tích nhỏ so với nhu cầu hiện tại.",
    ],
    areas: [
      "<strong>Khu ven sông, nền thấp:</strong> kiểm tra thêm van một chiều để tránh nước sông tràn ngược.",
      "<strong>Khu công nghiệp, nhà trọ:</strong> nên rút ngắn chu kỳ hút.",
      "<strong>Trung tâm thị xã:</strong> xe tiếp cận trực tiếp phần lớn tuyến đường chính.",
    ],
    caseStudy: "Một hộ dân ven sông tại Quảng Yên gọi hút hầm cầu vì trào ngược sau đợt triều cường. Sau khi hút và kiểm tra " +
      `<a href="${SERVICE_PAGE}">quy trình đầy đủ tại đây</a>, chủ nhà được tư vấn kiểm tra gioăng nắp hầm định kỳ.`,
  },
  {
    city: "Móng Cái", slug: "cam-nang-hut-ham-cau-tai-mong-cai",
    causesHeading: "Nguyên nhân hầm cầu tại Móng Cái nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Nhà nghỉ, khách sạn đông khách qua biên giới</strong> — công suất phòng biến động mạnh theo mùa.",
      "<strong>Nhà phố khu chợ cửa khẩu</strong> — hầm cầu dùng chung cho gia đình và khách hàng.",
      "<strong>Hầm cầu xây lâu năm</strong> ở nhà phố liền kề, khó mở rộng dung tích.",
    ],
    areas: [
      "<strong>Khu chợ cửa khẩu:</strong> lượng khách đông, nên hút định kỳ ngắn hơn.",
      "<strong>Khu nhà nghỉ, khách sạn:</strong> nên hút trước mùa cao điểm khách qua biên giới.",
      "<strong>Khu nhà phố trung tâm:</strong> xe tiếp cận trực tiếp phần lớn tuyến đường chính.",
    ],
    caseStudy: "Một nhà nghỉ khu chợ cửa khẩu Móng Cái gọi hút hầm cầu gấp vì khách phàn nàn mùi hôi. Sau khi hút và kiểm tra " +
      `<a href="${SERVICE_PAGE}">quy trình đầy đủ tại đây</a>, chủ nhà nghỉ được tư vấn đăng ký hút định kỳ trước mùa cao điểm.`,
  },
  {
    city: "Đông Triều", slug: "cam-nang-hut-ham-cau-tai-dong-trieu",
    causesHeading: "Nguyên nhân hầm cầu tại Đông Triều nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Nhà vườn diện tích rộng</strong> — hầm cầu xây xa nhà chính, đường ống dẫn dài dễ lắng cặn.",
      "<strong>Khu Mạo Khê — vùng khai thác than</strong> — nhà trọ công nhân mỏ đông người dùng chung hầm.",
      "<strong>Hầm cầu xây lâu năm</strong> ở nhà cũ, dung tích nhỏ so với nhu cầu hiện tại.",
    ],
    areas: [
      "<strong>Nhà vườn:</strong> kiểm tra thêm đoạn ống dẫn dài để phát hiện sớm điểm lắng cặn.",
      "<strong>Mạo Khê — nhà trọ công nhân mỏ:</strong> nên rút ngắn chu kỳ hút.",
      "<strong>Ven quốc lộ — quán ăn, cửa hàng:</strong> hầm cầu chịu tải cao hơn nhà ở thông thường.",
    ],
    caseStudy: "Một nhà vườn tại Đông Triều gọi hút hầm cầu vì nhà vệ sinh thoát chậm dần. Sau khi hút và kiểm tra " +
      `<a href="${SERVICE_PAGE}">quy trình đầy đủ tại đây</a>, chủ nhà được tư vấn kiểm tra đoạn ống dẫn dài định kỳ.`,
  },
  {
    city: "Vân Đồn", slug: "cam-nang-hut-ham-cau-tai-van-don",
    causesHeading: "Nguyên nhân hầm cầu tại Vân Đồn nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Homestay, resort ven biển</strong> — công suất phòng tăng mạnh mùa du lịch hè.",
      "<strong>Nền đất pha cát ven biển</strong> — nước ngầm dâng theo triều khiến hầm khó thoát nước phụ.",
      "<strong>Đường vào đảo, khu du lịch hẹp</strong> — hạn chế xe lớn tiếp cận thường xuyên.",
    ],
    areas: [
      "<strong>Homestay, resort ven biển:</strong> nên hút định kỳ trước mùa du lịch hè.",
      "<strong>Khu dân cư gần biển:</strong> kiểm tra thêm van một chiều tại miệng hầm.",
      "<strong>Khu đường đảo, ven đồi:</strong> dùng xe nhỏ hoặc ống nối dài.",
    ],
    caseStudy: "Một homestay ven biển tại Vân Đồn gọi hút hầm cầu trước mùa hè vì lo công suất phòng tăng đột biến. Sau khi hút và kiểm tra " +
      `<a href="${SERVICE_PAGE}">quy trình đầy đủ tại đây</a>, chủ homestay được tư vấn hút định kỳ trước mỗi mùa du lịch.`,
  },
];

function buildContent(item) {
  const title = `Cẩm Nang Hút Hầm Cầu Tại ${item.city} – Dấu Hiệu, Cách Xử Lý`;
  const faq = [
    [`Hút hầm cầu tại ${item.city} có làm được vào buổi tối không?`,
      "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
    ["Hầm cầu và bể phốt có phải hút giống nhau không?",
      "Hầm cầu (kiểu cũ, thường xây gạch) và bể tự hoại (bê tông hiện đại) dùng chung một loại xe bồn và quy trình khảo sát, chỉ khác cách xác định vị trí và độ bền thành hầm khi hút."],
    ["Hầm cầu xây gạch cũ có hút được không?",
      "Được, nhưng thợ điều chỉnh lực hút phù hợp để không làm nứt thêm thành hầm đã yếu, khác với hầm bê tông hiện đại."],
    [`Hút hầm cầu tại ${item.city} xong có được bảo hành không?`,
      "Có ghi nhận ngày hút và kiểm tra đường ống trong buổi làm việc. Nếu đầy lại bất thường trong thời gian ngắn, liên hệ lại để kiểm tra miễn phí."],
  ];
  return {
    title,
    metaDesc: `Cẩm nang hút hầm cầu tại ${item.city}: dấu hiệu đầy, nguyên nhân theo khu vực, cách xử lý không đục phá. Gọi 0963.953.533 / 0931.156.756.`,
    focusKeyword: `hút hầm cầu tại ${item.city.toLowerCase()}`,
    content: [
      p(`Hầm cầu đầy, trào ngược hay bốc mùi đều có dấu hiệu báo trước. Cẩm nang này ghi lại cách nhận biết, ` +
        `nguyên nhân đặc thù theo từng khu vực tại ${item.city}. Cần xe đến khảo sát ngay, gọi ` +
        `<strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>.`),
      h2(`Khi nào cần hút hầm cầu tại ${item.city} ngay`),
      ul([
        "Nước từ bồn cầu hoặc phễu thoát sàn rút chậm hẳn so với bình thường.",
        "Mùi hôi bốc lên quanh khu vực đặt hầm, rõ nhất vào buổi trưa nắng hoặc sau mưa lớn.",
        "Nắp hầm hoặc miệng hố ga gần đó ẩm ướt, sũng nước dù trời không mưa.",
      ]),
      h2(item.causesHeading),
      ol(item.causes),
      h2("Đặc điểm xử lý theo từng khu vực"),
      ul(item.areas),
      h2("Hầm cầu kiểu cũ khác gì bể tự hoại hiện đại"),
      p("Hầm cầu truyền thống thường xây gạch, dung tích nhỏ, thành hầm dễ nứt theo thời gian nếu hút áp lực " +
        "quá mạnh. Bể tự hoại bê tông hiện đại chịu lực tốt hơn, dung tích lớn hơn. Khi khảo sát, thợ kiểm tra " +
        "vật liệu xây trước khi quyết định công suất máy hút phù hợp, tránh làm hư hại thêm với hầm cũ đã yếu."),
      h2("Tình huống thực tế"),
      p(item.caseStudy),
      h2("Câu hỏi thường gặp"),
      ...faq.flatMap(([q, a]) => [h3(q), p(a)]),
      h2(`Dịch vụ liên quan tại ${item.city}`),
      ul((() => {
        const citySlug = CITY_SLUG[item.city];
        return [
          `<a href="https://thongtaccongquangninh.com/hut-be-phot-${citySlug}/">Hút bể phốt tại ${item.city}</a> — cho nhà xây bể tự hoại bê tông hiện đại thay vì hầm cầu kiểu cũ`,
          `<a href="https://thongtaccongquangninh.com/thong-tac-cong-${citySlug}/">Thông tắc cống tại ${item.city}</a> — nếu nghi ngờ do cống chung tắc chứ không phải hầm cầu đầy`,
          `<a href="${SERVICE_PAGE}">Trang dịch vụ Hút hầm cầu Quảng Ninh đầy đủ</a> — bảng giá, khu vực phục vụ toàn tỉnh, đặt lịch nhanh`,
        ];
      })()),
      h2("Liên hệ"),
      p(`Môi Trường Đô Thị Số 1 Quảng Ninh — hút hầm cầu tại ${item.city} và các phường lân cận. ` +
        `Hotline: <strong>0963.953.533 / 0931.156.756</strong>. Xem chi tiết dịch vụ tại <a href="${SERVICE_PAGE}">trang Hút hầm cầu Quảng Ninh</a>.`),
      faqSchema(faq),
    ].join("\n"),
  };
}

async function findCategoryId(auth, name) {
  const res = await request("GET", `/wp-json/wp/v2/categories?search=${encodeURIComponent(name)}`, auth);
  if (res.status !== 200) return null;
  try { const list = JSON.parse(res.text); return list.length ? list[0].id : null; } catch { return null; }
}

async function main() {
  for (const item of CITIES) {
    const built = buildContent(item);
    const words = built.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
    console.log(`\n=== ${item.slug} ===`);
    console.log(`Title (${built.title.length} ky tu): ${built.title}`);
    console.log(`Meta (${built.metaDesc.length} ky tu): ${built.metaDesc}`);
    console.log(`Uoc tinh so tu: ~${words}`);
    if (DRY) continue;

    const env = readEnv(ENV_PATH);
    const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
    const categoryId = await findCategoryId(auth, "Cẩm nang") || await findCategoryId(auth, "Blog");
    const payload = {
      title: built.title, content: built.content, slug: item.slug, status: "draft",
      meta: { rank_math_description: built.metaDesc, rank_math_focus_keyword: built.focusKeyword },
      ...(categoryId ? { categories: [categoryId] } : {}),
    };
    if (!categoryId) console.warn("CANH BAO: khong tim thay chuyen muc 'Cam nang'/'Blog'.");

    const res = await request("POST", "/wp-json/wp/v2/posts", auth, payload);
    console.log(`Status: ${res.status}`);
    if (res.status !== 201 && res.status !== 200) {
      console.error("Tao bai THAT BAI:", res.text.slice(0, 500));
      continue;
    }
    const created = JSON.parse(res.text);
    const editLink = `https://${HOST}/wp-admin/post.php?post=${created.id}&action=edit`;
    mkdirSync(`${ROOT}/reports`, { recursive: true });
    writeFileSync(`${ROOT}/reports/publish-${item.slug}-${Date.now()}.json`,
      JSON.stringify({ id: created.id, link: created.link, editLink }, null, 2), "utf8");
    console.log(`DA TAO BAI NHAP: ${editLink}`);
  }
  if (DRY) console.log("\n--dry: chua ghi gi len WordPress. Bo --dry de tao bai nhap that.");
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
