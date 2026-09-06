// Tạo 7 bài blog "Cẩm Nang Thông Tắc Bồn Cầu Tại ..." (Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên,
// Móng Cái, Đông Triều, Vân Đồn) trên WordPress qua REST API, ở trạng thái NHÁP (draft).
// Hoàn tất dịch vụ thứ 3 trong yêu cầu ban đầu (hút bể phốt + thông tắc cống đã xong ở các
// batch trước) — site đã có 7 trang dịch vụ thong-tac-bon-cau-* nhưng CHƯA có bài cẩm nang
// blog nào cho dịch vụ này. Cùng cơ chế với các file publish_cam_nang_*.mjs khác.
//
// Cách chạy (trên máy Windows có D:/.thongtaccongquangninh/.env):
//   node tools/publish_cam_nang_thong_tac_bon_cau_batch1.mjs --dry     # xem trước
//   node tools/publish_cam_nang_thong_tac_bon_cau_batch1.mjs           # tạo 7 bài NHÁP thật
//
// Sau khi chạy thật: mở link "editLink" in ra cho từng bài, thêm 2 ảnh thật/bài, đọc lại
// rồi mới bấm Đăng.

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

const POSTS = [
  {
    city: "Hạ Long", slug: "cam-nang-thong-tac-bon-cau-tai-ha-long",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-bon-cau-ha-long/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-ha-long/", relatedAnchor: "hút bể phốt tại Hạ Long",
    causesHeading: "Nguyên nhân bồn cầu tắc tại Hạ Long thường gặp",
    causes: [
      "<strong>Xi phông bồn cầu đời cũ ở nhà phố cổ</strong> (Hồng Gai, Bạch Đằng) — thiết kế đường cong hẹp hơn bồn cầu hiện đại, dễ mắc giấy dày.",
      "<strong>Khách du lịch dùng giấy vệ sinh không tan</strong> ở homestay, khách sạn khu Bãi Cháy — giấy ướt, khăn giấy dày xả trực tiếp gây tắc.",
      "<strong>Cặn vôi đóng trong lòng bồn</strong> — nước cứng lâu ngày làm hẹp đường thoát của bồn cầu, giảm dần lưu lượng xả.",
    ],
    equipmentNote: "máy lò xo cỡ nhỏ chuyên dụng cho bồn cầu, không dùng cỡ lớn dễ làm nứt men sứ",
    caseStudy: "Một khách sạn nhỏ tại Bãi Cháy gọi thông bồn cầu gấp vì khách phàn nàn nước không rút hết sau khi xả. " +
      "Khảo sát phát hiện khăn giấy ướt mắc trong xi phông. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-bon-cau-ha-long/\">quy trình đầy đủ tại đây</a>, " +
      "khách sạn được tư vấn đặt biển nhắc khách không xả khăn giấy ướt xuống bồn cầu.",
  },
  {
    city: "Cẩm Phả", slug: "cam-nang-thong-tac-bon-cau-tai-cam-pha",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-bon-cau-cam-pha/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-cam-pha/", relatedAnchor: "hút bể phốt tại Cẩm Phả",
    causesHeading: "Nguyên nhân bồn cầu tắc tại Cẩm Phả thường gặp",
    causes: [
      "<strong>Bồn cầu đời cũ tại nhà tập thể khu mỏ</strong> (Cẩm Trung, Cẩm Thủy) — nhiều bồn dùng chung đường ống đứng, dễ ảnh hưởng lẫn nhau khi một hộ xả rác cứng.",
      "<strong>Giấy vệ sinh dày và băng vệ sinh</strong> xả trực tiếp, đặc biệt phổ biến ở nhà trọ đông người.",
      "<strong>Cặn vôi và bùn khoáng</strong> — nguồn nước một số khu vực gần mỏ có lẫn khoáng chất, đóng cặn nhanh hơn khu vực khác.",
    ],
    equipmentNote: "máy lò xo cỡ nhỏ chuyên dụng cho bồn cầu, kiểm tra kỹ đường ống đứng chung khi ở nhà tập thể",
    caseStudy: "Một hộ tại nhà tập thể Cẩm Trung gọi thông bồn cầu vì xả nước dềnh lên thay vì rút xuống. " +
      "Khảo sát phát hiện băng vệ sinh mắc trong đoạn ống gần xi phông. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-bon-cau-cam-pha/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà được nhắc các hộ trong dãy không xả băng vệ sinh xuống bồn cầu để tránh ảnh hưởng đường ống chung.",
  },
  {
    city: "Uông Bí", slug: "cam-nang-thong-tac-bon-cau-tai-uong-bi",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-bon-cau-uong-bi/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-uong-bi/", relatedAnchor: "hút bể phốt tại Uông Bí",
    causesHeading: "Nguyên nhân bồn cầu tắc tại Uông Bí thường gặp",
    causes: [
      "<strong>Nhà nghỉ, hàng quán mùa lễ hội Yên Tử</strong> — lượng khách tăng đột biến đầu năm, giấy vệ sinh xả nhiều hơn thiết kế bồn cầu chịu được cùng lúc.",
      "<strong>Nhà trọ công nhân mỏ</strong> (Yên Thanh, Quang Trung) dùng chung bồn cầu, tần suất sử dụng cao hơn nhà ở đơn lẻ.",
      "<strong>Bồn cầu đời cũ ở khu đồi Vàng Danh</strong> — áp lực nước yếu hơn khu trung tâm khiến giấy khó trôi hết trong một lần xả.",
    ],
    equipmentNote: "máy lò xo cỡ nhỏ chuyên dụng cho bồn cầu, ưu tiên kiểm tra áp lực nước tại khu đồi trước khi xử lý",
    caseStudy: "Một nhà nghỉ gần Yên Tử gọi thông bồn cầu gấp trước mùa lễ hội vì lo đông khách. Khảo sát cho thấy " +
      "giấy vệ sinh tích tụ nhiều do áp lực xả yếu chưa đẩy hết. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-bon-cau-uong-bi/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà nghỉ được tư vấn xả 2 lần với lượng giấy nhiều thay vì dồn một lần.",
  },
  {
    city: "Quảng Yên", slug: "cam-nang-thong-tac-bon-cau-tai-quang-yen",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-yen/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-quang-yen/", relatedAnchor: "hút bể phốt tại Quảng Yên",
    causesHeading: "Nguyên nhân bồn cầu tắc tại Quảng Yên thường gặp",
    causes: [
      "<strong>Nhà nền thấp ven sông</strong> — áp lực thoát yếu hơn khi nước sông dâng theo triều, giấy vệ sinh khó trôi hết.",
      "<strong>Nhà trọ khu công nghiệp</strong> dùng chung bồn cầu, tần suất sử dụng cao hơn nhà ở đơn lẻ.",
      "<strong>Bồn cầu đời cũ đã xuống cấp</strong> ở nhà xây lâu năm, xi phông hẹp hơn thiết kế hiện đại.",
    ],
    equipmentNote: "máy lò xo cỡ nhỏ chuyên dụng cho bồn cầu, kiểm tra thêm áp lực thoát khi nhà nền thấp gần sông",
    caseStudy: "Một hộ dân ven sông tại Quảng Yên gọi thông bồn cầu vì xả nước rút rất chậm sau đợt triều cường. " +
      "Khảo sát cho thấy áp lực thoát yếu khiến giấy vệ sinh tích tụ dần trong xi phông. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-yen/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà được tư vấn hạn chế xả giấy dày vào những ngày triều cao.",
  },
  {
    city: "Móng Cái", slug: "cam-nang-thong-tac-bon-cau-tai-mong-cai",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-bon-cau-mong-cai/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-mong-cai/", relatedAnchor: "hút bể phốt tại Móng Cái",
    causesHeading: "Nguyên nhân bồn cầu tắc tại Móng Cái thường gặp",
    causes: [
      "<strong>Nhà nghỉ, khách sạn đông khách qua biên giới</strong> — công suất phòng biến động mạnh theo mùa, có lúc vượt xa tần suất bồn cầu chịu được liên tục.",
      "<strong>Nhà phố kinh doanh khu chợ</strong> dùng bồn cầu chung cho cả gia đình và khách hàng ra vào.",
      "<strong>Giấy vệ sinh không tan</strong> xả trực tiếp, phổ biến ở nhà nghỉ bình dân khu chợ cửa khẩu.",
    ],
    equipmentNote: "máy lò xo cỡ nhỏ chuyên dụng cho bồn cầu, phù hợp xử lý nhanh cho nhà nghỉ đông khách",
    caseStudy: "Một nhà nghỉ khu chợ cửa khẩu Móng Cái gọi thông bồn cầu gấp vì khách phàn nàn tắc liên tục nhiều phòng. " +
      "Khảo sát phát hiện giấy vệ sinh loại dày không tan tích tụ trong xi phông nhiều phòng. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-bon-cau-mong-cai/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà nghỉ được tư vấn đổi sang loại giấy dễ tan hơn cho các phòng cho thuê.",
  },
  {
    city: "Đông Triều", slug: "cam-nang-thong-tac-bon-cau-tai-dong-trieu",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-bon-cau-dong-trieu/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-dong-trieu/", relatedAnchor: "hút bể phốt tại Đông Triều",
    causesHeading: "Nguyên nhân bồn cầu tắc tại Đông Triều thường gặp",
    causes: [
      "<strong>Nhà vườn có bể phốt xây xa nhà chính</strong> — đường ống dẫn dài từ bồn cầu ra bể dễ lắng cặn giấy dọc đường trước khi bể kịp đầy.",
      "<strong>Nhà trọ công nhân mỏ Mạo Khê</strong> dùng chung bồn cầu, tần suất sử dụng cao hơn nhà ở đơn lẻ.",
      "<strong>Bồn cầu đời cũ ở nhà xây lâu năm</strong> — xi phông hẹp hơn thiết kế hiện đại, dễ mắc giấy dày.",
    ],
    equipmentNote: "máy lò xo cỡ nhỏ chuyên dụng cho bồn cầu, kiểm tra thêm đoạn ống dẫn dài ra bể nếu nhà vườn",
    caseStudy: "Một nhà vườn tại Đông Triều gọi thông bồn cầu vì xả nước rút chậm dù bể phốt chưa đầy. Khảo sát cho thấy " +
      "giấy vệ sinh lắng cặn dọc đoạn ống dài hơn 10m từ nhà ra bể. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-bon-cau-dong-trieu/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà được tư vấn kiểm tra định kỳ đoạn ống này thay vì chỉ nghĩ do bể phốt.",
  },
  {
    city: "Vân Đồn", slug: "cam-nang-thong-tac-bon-cau-tai-van-don",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-bon-cau-van-don/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-van-don/", relatedAnchor: "hút bể phốt tại Vân Đồn",
    causesHeading: "Nguyên nhân bồn cầu tắc tại Vân Đồn thường gặp",
    causes: [
      "<strong>Homestay, resort đông khách mùa hè</strong> — tần suất sử dụng bồn cầu tăng mạnh so với ngày thường, vượt tải xi phông thiết kế.",
      "<strong>Giấy vệ sinh không tan</strong> khách du lịch xả trực tiếp, phổ biến ở homestay bình dân.",
      "<strong>Bồn cầu đời cũ ở nhà dân ven biển</strong> — độ ẩm cao vùng biển có thể ảnh hưởng đến gioăng, khớp nối lâu ngày.",
    ],
    equipmentNote: "máy lò xo cỡ nhỏ chuyên dụng cho bồn cầu, phù hợp xử lý nhanh cho homestay đông khách mùa cao điểm",
    caseStudy: "Một homestay ven biển tại Vân Đồn gọi thông bồn cầu gấp giữa mùa hè vì khách phàn nàn tắc liên tục. " +
      "Khảo sát phát hiện giấy vệ sinh dày tích tụ trong xi phông do khách đông cùng lúc. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-bon-cau-van-don/\">quy trình đầy đủ tại đây</a>, " +
      "chủ homestay được tư vấn đặt sọt rác riêng trong nhà vệ sinh cho khách.",
  },
];

function buildContent(post) {
  const title = `Cẩm Nang Thông Tắc Bồn Cầu Tại ${post.city} – Nguyên Nhân, Cách Xử Lý`;
  const faq = [
    [`Thông tắc bồn cầu tại ${post.city} có làm được vào buổi tối không?`,
      "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
    ["Thông bồn cầu có làm nứt men sứ không?",
      `Không, thợ dùng ${post.equipmentNote}, không dùng lực quá mạnh gây nứt hoặc trầy men sứ.`],
    ["Xả nước không rút hết nhưng chưa hẳn tắc hoàn toàn thì có cần gọi thợ không?",
      "Nên gọi kiểm tra sớm nếu tình trạng lặp lại quá 2-3 lần liên tiếp, tránh để tắc hoàn toàn mới xử lý sẽ mất công hơn."],
    [`Thông tắc bồn cầu tại ${post.city} có bảo hành không?`,
      "Có ghi nhận ngày xử lý. Nếu tắc lại trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
  ];
  return {
    title,
    metaDesc: `Cẩm nang thông tắc bồn cầu tại ${post.city}: nguyên nhân thường gặp, cách xử lý không đục phá. Cần thợ đến ngay, gọi 0963.953.533 / 0931.156.756.`,
    focusKeyword: `thông tắc bồn cầu tại ${post.city.toLowerCase()}`,
    content: [
      p(`Bồn cầu tắc, xả nước không rút hoặc trào ngược đều có nguyên nhân cụ thể, phần lớn xử lý được bằng máy ` +
        `chuyên dụng mà không cần tháo bồn. Cẩm nang này ghi lại nguyên nhân thường gặp tại ${post.city} và cách xử lý ` +
        `thực tế. Cần thợ đến khảo sát ngay, gọi <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>.`),
      h2(`Khi nào cần thông tắc bồn cầu tại ${post.city} ngay`),
      ul([
        "Xả nước nhiều lần vẫn không rút hết, nước dềnh lên gần miệng bồn.",
        "Có tiếng ục ục hoặc sủi bọt bất thường khi xả ở khu vực khác trong nhà.",
        "Mùi hôi bốc lên quanh bồn cầu dù đã dội nước sạch.",
      ]),
      h2(post.causesHeading),
      ol(post.causes),
      h2("Cách xử lý — không cần đục phá hay tháo bồn"),
      p(`Phần lớn trường hợp xử lý được bằng ${post.equipmentNote}, đẩy qua điểm tắc trong xi phông hoặc đoạn ống ` +
        "gần bồn cầu mà không cần tháo bồn ra khỏi sàn. Chỉ đề xuất tháo bồn khi dị vật cứng (đồ chơi, vật lạ) mắc " +
        "kẹt không đẩy qua được bằng máy."),
      h2("Quy trình xử lý"),
      ol([
        "<strong>Tiếp nhận qua điện thoại</strong> — hỏi tình trạng xả nước, có dấu hiệu trào ngược hay chỉ chậm.",
        "<strong>Khảo sát tại chỗ</strong> — kiểm tra xi phông, xác định do bồn cầu hay do đường ống phía sau.",
        "<strong>Xử lý bằng máy lò xo cỡ nhỏ</strong> — đẩy qua điểm tắc, không dùng lực quá mạnh gây hại men sứ.",
        "<strong>Xả thử nhiều lần</strong> — kiểm tra chắc chắn thông hoàn toàn trước khi bàn giao.",
      ]),
      h2("Cách hạn chế bồn cầu tắc lại"),
      ul([
        "Không xả giấy vệ sinh dày, khăn giấy ướt, băng vệ sinh hoặc tã giấy xuống bồn cầu.",
        "Đặt sọt rác nhỏ trong nhà vệ sinh cho các loại rác không nên xả trực tiếp.",
        "Nếu nhà có trẻ nhỏ, để ý đồ chơi nhỏ rơi vào bồn cầu — nguyên nhân phổ biến gây tắc cứng đầu.",
      ]),
      h2("Tình huống thực tế"),
      p(post.caseStudy),
      h2("Câu hỏi thường gặp"),
      ...faq.flatMap(([q, a]) => [h3(q), p(a)]),
      p(`Nếu nghi ngờ do bể phốt đầy chứ không phải bồn cầu tắc, xem thêm <a href="${post.relatedPage}">${post.relatedAnchor}</a>.`),
      h2("Liên hệ"),
      p(`Môi Trường Đô Thị Số 1 Quảng Ninh — thông tắc bồn cầu tại ${post.city} và các phường lân cận. ` +
        `Hotline: <strong>0963.953.533 / 0931.156.756</strong>. Xem chi tiết dịch vụ và bảng giá tại <a href="${post.servicePage}">trang Thông tắc bồn cầu ${post.city}</a>.`),
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
  for (const post of POSTS) {
    const built = buildContent(post);
    const words = built.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
    console.log(`\n=== ${post.slug} ===`);
    console.log(`Title (${built.title.length} ky tu): ${built.title}`);
    console.log(`Meta (${built.metaDesc.length} ky tu): ${built.metaDesc}`);
    console.log(`Uoc tinh so tu: ~${words}`);
    if (DRY) continue;

    const env = readEnv(ENV_PATH);
    const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
    const categoryId = await findCategoryId(auth, "Cẩm nang") || await findCategoryId(auth, "Blog");
    const payload = {
      title: built.title, content: built.content, slug: post.slug, status: "draft",
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
    writeFileSync(`${ROOT}/reports/publish-${post.slug}-${Date.now()}.json`,
      JSON.stringify({ id: created.id, link: created.link, editLink }, null, 2), "utf8");
    console.log(`DA TAO BAI NHAP: ${editLink}`);
  }
  if (DRY) console.log("\n--dry: chua ghi gi len WordPress. Bo --dry de tao bai nhap that.");
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
