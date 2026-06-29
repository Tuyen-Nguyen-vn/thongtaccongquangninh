import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const APPLY = process.argv.includes("--apply");
const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "");
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-quang-yen-uong-bi-p1-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `quang-yen-uong-bi-p1-fix-${ts}.json`);

const TARGETS = [
  {
    id: 424,
    slug: "thong-tac-cong-quang-yen",
    area: "Quảng Yên",
    title: "Thông tắc cống Quảng Yên 24/7 cho nhà ven sông, hố ga thấp nhanh",
    excerpt:
      "Thông tắc cống Quảng Yên 24/7, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi tại nhà, nhà hàng ngay trong ngày.",
    why: `<h2>Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh tại Quảng Yên</h2>
<p>Quảng Yên có nhiều khu nhà ven sông, khu dân cư thấp, nhà xưởng nhỏ và tuyến thoát nước chịu ảnh hưởng mạnh sau mưa. Khi cống chậm, thợ không chỉ nhìn miệng thoát trong nhà mà cần kiểm tra thêm hố ga, dòng thoát ngoài sân và đoạn ống dẫn ra tuyến chung.</p>
<p>Đội kỹ thuật hỏi trước vị trí công trình, loại cống đang tắc, thời điểm bắt đầu có mùi hoặc trào nước, sau đó chuẩn bị máy lò xo, dụng cụ mở hố ga và phương án nạo vét nếu cần. Cách làm này giúp hạn chế xử lý sai điểm nghẽn, nhất là với nhà ven sông, khu thấp hoặc mặt bằng thường bị bùn cát kéo vào hố ga.</p>
<p>Với nhà hàng, cửa hàng hoặc cơ sở sản xuất nhỏ tại Quảng Yên, thời gian xử lý cần gọn để không làm gián đoạn hoạt động. Thợ sẽ báo trước khu vực cần thao tác, phần nào có thể xử lý qua miệng thoát, phần nào phải mở hố ga, và phần nào cần theo dõi thêm sau khi xả thử.</p>
<h2>Cam kết 3 Không khi thông tắc cống Quảng Yên</h2>
<ul>
<li><strong>Không đục phá khi chưa có căn cứ kỹ thuật:</strong> ưu tiên thông qua miệng thoát, hố ga hoặc điểm kỹ thuật sẵn có; chỉ bàn tháo lắp khi nghi ngờ ống vỡ, lún hoặc sai độ dốc.</li>
<li><strong>Không báo giá ảo:</strong> thợ kiểm tra vị trí tắc, độ sâu, mức bùn/mỡ và thời điểm thi công rồi báo chi phí trước khi làm.</li>
<li><strong>Không làm nửa chừng:</strong> sau khi thông, thợ xả thử nhiều lần, kiểm tra mùi, tốc độ thoát nước và nhắc điểm dễ tái phát để khách chủ động phòng tránh.</li>
</ul>
<h2>Tình huống thường gặp tại Quảng Yên</h2>
<p>Với nhà ven sông hoặc khu thấp, sự cố thường bắt đầu sau mưa lớn: sân thoát chậm, hố ga dâng nước, miệng cống trong nhà có mùi và bếp rửa không còn rút nhanh như bình thường. Nếu chỉ vệ sinh rọ chắn rác trong nhà, nước có thể rút tạm nhưng hố ga ngoài sân vẫn là điểm nghẽn chính.</p>
<p>Với cửa hàng ăn uống, lớp dầu mỡ trong ống bếp có thể đóng dần ở đoạn nằm ngang. Ban đầu khách chỉ thấy nước chậm, sau đó mùi hôi rõ hơn và rác nhỏ bị giữ lại ở miệng thoát. Trường hợp này cần thông đúng đoạn ống bếp, xả thử nhiều lần và kiểm tra bẫy mỡ nếu công trình có lắp.</p>
<p>Với nhà xưởng hoặc nhà dân gần khu có nhiều bùn cát, hố ga nên được kiểm tra định kỳ. Khi bùn chiếm nhiều thể tích, nước mưa hoặc nước thải sinh hoạt không còn đường thoát ổn định. Nếu thợ chỉ thông ống mà không xử lý hố ga đầy, khả năng tắc lại sẽ cao hơn.</p>`,
    nap: `<h2>NAP liên hệ thông tắc cống Quảng Yên</h2>
<p>Nên gọi thợ ngay khi nước thải đã trào ra sàn, mùi hôi bốc mạnh hoặc cống tắc lặp lại sau khi tự xử lý. Đây là dấu hiệu điểm nghẽn có thể nằm sâu hơn miệng thoát, liên quan đến hố ga hoặc đường ống chính.</p>
<p>Trước khi thợ đến, nên ngừng xả thêm nước, mở lối vào hố ga nếu biết vị trí và chụp lại khu vực nước trào. Không nên đổ nhiều loại hóa chất cùng lúc vì có thể tạo mùi nặng, gây khó thao tác và không giải quyết được bùn cát hoặc dị vật trong tuyến ống.</p>
<p>Nếu công trình là nhà ven sông, nhà xưởng hoặc cửa hàng đông khách, hãy nói rõ giờ có thể thi công và điểm đặt dụng cụ. Thợ sẽ ưu tiên xử lý gọn khu vực bếp, sân hoặc hố ga để giảm ảnh hưởng sinh hoạt và kinh doanh.</p>
<p>Khi mô tả sự cố, nên nói rõ nước rút chậm ở một điểm hay nhiều điểm, mùi hôi xuất hiện ở bếp hay nhà vệ sinh, hố ga có váng mỡ hoặc bùn đen hay không. Nếu nhà gần khu thấp, ven sông hoặc thường ngập sau mưa, thông tin này giúp thợ chuẩn bị phương án kiểm tra ngoài sân ngay từ đầu.</p>
<p>Sau khi xử lý, khách nên theo dõi lại trong 24-48 giờ đầu: tốc độ nước rút, mùi hôi và mực nước trong hố ga. Nếu cống tắc lặp lại nhanh, nguyên nhân có thể không còn là rác gần miệng thoát mà nằm ở tuyến ống chính, hố ga đầy hoặc độ dốc thoát nước yếu.</p>
<p>Với khu bếp, nên gom dầu mỡ riêng, dùng rọ chắn rác và xả kiểm tra định kỳ vào cuối ngày. Với sân hoặc hố ga ngoài nhà, nên mở nắp kiểm tra khi bắt đầu thấy nước dâng chậm sau mưa. Những thao tác nhỏ này giúp phát hiện sớm trước khi nước thải trào ngược vào khu sinh hoạt.</p>
<p>Khi nhà nằm gần tuyến thoát thấp hoặc khu có nền sân thấp hơn mặt đường, khách nên báo rõ cống thường tắc sau mưa hay tắc cả ngày nắng. Hai tình huống này khác nhau: tắc sau mưa thường liên quan đến hố ga, bùn cát hoặc dòng thoát ngoài sân; tắc cả ngày nắng thường liên quan đến mảng bám trong ống bếp, dị vật hoặc đoạn ống có độ dốc yếu. Phân biệt đúng từ đầu giúp thợ chuẩn bị dụng cụ kiểm tra phù hợp và tránh tháo mở không cần thiết.</p>
<p>Nếu gia đình từng tự dùng bột thông cống, móc dây thép hoặc nước nóng nhưng chỉ đỡ trong thời gian ngắn, nên nói rõ thời điểm đã xử lý và miệng thoát nào phản ứng trước. Thợ sẽ ưu tiên kiểm tra đoạn ống dễ giữ mỡ, vị trí nối chữ T, đoạn cua hoặc hố ga gần bếp. Với công trình kinh doanh, nên chọn khung giờ ít khách để có đủ thời gian xả thử, dọn khu vực thao tác và bàn giao lại mặt bằng sạch.</p>
<p><strong>Tên đơn vị:</strong> Môi Trường Đô Thị Số 1 Quảng Ninh.</p>
<p><strong>Website:</strong> https://thongtaccongquangninh.com</p>
<p><strong>Hotline:</strong> <strong>0963.953.533 / 0931.156.756</strong></p>
<p><strong>Dịch vụ tại Quảng Yên:</strong> thông tắc cống, xử lý cống bếp dầu mỡ, thông thoát sàn, kiểm tra hố ga, nạo vét hố ga và xử lý mùi hôi nhà vệ sinh.</p>
<p><strong>Khu vực hỗ trợ:</strong> Yên Giang, Hà An, Minh Thành, Cộng Hòa, Phong Cốc, Sông Khoai và các khu dân cư, nhà xưởng, cửa hàng lân cận. Khi gọi, hãy mô tả rõ nước trào ở đâu, hố ga có đầy bùn không và công trình có lối vào hẹp hay không để thợ chuẩn bị đúng dụng cụ.</p>`,
  },
  {
    id: 405,
    slug: "thong-tac-cong-uong-bi",
    area: "Uông Bí",
    title: "Thông tắc cống Uông Bí 24/7 cho hệ ống cũ, nhà trọ đông dân nhanh",
    excerpt:
      "Thông tắc cống Uông Bí 24/7, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi tại nhà, nhà hàng ngay trong ngày.",
    why: `<h2>Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh tại Uông Bí</h2>
<p>Uông Bí có nhiều khu dân cư cũ, nhà trọ, nhà ống và cơ sở kinh doanh dùng chung tuyến thoát nhỏ. Khi cống nghẹt, dấu hiệu thường không dừng ở một miệng thoát mà lan sang thoát sàn, bồn rửa, hố ga hoặc khu sân sau.</p>
<p>Đội kỹ thuật tiếp nhận theo từng tình huống: nhà trọ đông người, cống bếp quán ăn, đường ống lâu năm, hố ga chưa nạo vét hoặc nước trào sau mưa. Trước khi thao tác, thợ kiểm tra điểm thoát gần nhất, hỏi các cách khách đã thử và xác định có cần mở hố ga hay không.</p>
<p>Với nhà trọ và khu dân cư đông người, việc xử lý cần hạn chế mùi, hạn chế nước bẩn tràn thêm và bàn giao rõ ràng sau khi xả thử. Nếu phát hiện nguyên nhân nằm ở hố ga đầy bùn, bể phốt quá tải hoặc ống sai độ dốc, thợ báo riêng để khách không hiểu nhầm là chỉ cần thông miệng cống.</p>
<h2>Cam kết 3 Không khi thông tắc cống Uông Bí</h2>
<ul>
<li><strong>Không đục phá khi chưa có căn cứ kỹ thuật:</strong> ưu tiên xử lý bằng máy lò xo, dây thông, điểm thoát sẵn có hoặc hố ga kiểm tra.</li>
<li><strong>Không báo giá ảo:</strong> báo theo vị trí tắc, mức độ nghẹt, thời điểm gọi và hạng mục cần làm; khách đồng ý rồi mới triển khai.</li>
<li><strong>Không bỏ qua nguyên nhân gốc:</strong> sau khi nước rút, thợ kiểm tra lại mùi, dòng chảy và hố ga liên quan để giảm rủi ro tái phát.</li>
</ul>
<h2>Tình huống thường gặp tại Uông Bí</h2>
<p>Với nhà trọ hoặc khu dân cư đông người, cống thường chịu tải liên tục từ bếp, nhà vệ sinh và khu giặt rửa. Dấu hiệu ban đầu là nước thoát chậm vào giờ cao điểm, sau đó có tiếng ọc nước hoặc mùi hôi từ thoát sàn. Nếu nhiều phòng cùng gặp tình trạng này, cần kiểm tra tuyến thoát chung thay vì chỉ xử lý một miệng cống.</p>
<p>Với quán ăn, cặn dầu mỡ và thức ăn vụn có thể bám trong đường ống bếp. Khi lớp mỡ dày lên, nước nóng hoặc hóa chất chỉ làm mềm tạm thời, không đẩy hết mảng bám ra ngoài. Thợ cần dùng máy phù hợp, xả kiểm tra và nhắc chủ quán cách gom dầu mỡ để giảm tắc lại.</p>
<p>Với công trình có đường ống lâu năm, nguyên nhân có thể nằm ở độ dốc yếu, ống võng hoặc hố ga đầy bùn. Những ca này cần quan sát nước rút sau khi thông, kiểm tra thêm điểm thoát gần nhất và báo rõ nếu cần nạo vét hoặc sửa đoạn ống lỗi.</p>`,
    nap: `<h2>NAP liên hệ thông tắc cống Uông Bí</h2>
<p>Nên gọi thợ ngay nếu cống trào ngược ở nhiều điểm, nhà vệ sinh có mùi hôi nặng hoặc nước rút chậm dù đã vệ sinh miệng thoát. Với nhà trọ, quán ăn và công trình đông người, chờ thêm thường làm nước bẩn lan rộng và khó vệ sinh hơn.</p>
<p>Trước khi thợ đến, nên hạn chế xả nước, tách khu vực có nước bẩn, báo rõ đã dùng hóa chất hay chưa và gửi ảnh hố ga nếu có. Thông tin này giúp kỹ thuật chọn dụng cụ phù hợp, tránh xử lý nhầm giữa tắc ống nhánh, hố ga đầy bùn hoặc tuyến thoát chung bị nghẽn.</p>
<p>Nếu công trình là nhà trọ, cửa hàng ăn uống hoặc nhà ống cũ, hãy báo rõ số điểm thoát đang chậm và thời điểm đông người sử dụng. Thợ sẽ chọn cách thao tác gọn, kiểm tra dòng chảy sau khi thông và nhắc điểm cần theo dõi.</p>
<p>Khi mô tả sự cố, nên nói rõ cống bếp, thoát sàn hay hố ga đang có vấn đề; nước trào sau mưa hay trào ngay khi xả; đã từng thông gần đây hay chưa. Với nhà trọ hoặc khu dân cư cũ, những chi tiết này giúp phân biệt tắc cục bộ trong phòng với tắc tuyến chung ngoài sân.</p>
<p>Sau khi xử lý, chủ nhà nên theo dõi lại dòng thoát trong vài ngày đầu, nhất là giờ cao điểm dùng nước. Nếu nhiều điểm cùng chậm lại, cần kiểm tra thêm hố ga, bể phốt hoặc đoạn ống chính thay vì tiếp tục đổ hóa chất vào từng miệng thoát riêng lẻ.</p>
<p>Với nhà trọ, nên đặt rọ chắn rác ở khu giặt rửa, nhắc người thuê không xả khăn ướt, tóc, thức ăn thừa hoặc dầu mỡ xuống cống. Với quán ăn, nên vệ sinh khu bếp và bẫy mỡ đều hơn vào ngày đông khách. Cách phòng ngừa này giảm áp lực cho hệ ống cũ và hạn chế tắc lặp lại.</p>
<p>Với dãy trọ đông phòng, người quản lý nên ghi lại phòng nào bị trào trước, thời điểm trào và các điểm thoát còn lại có chậm theo hay không. Nếu chỉ một phòng bị nghẹt, khả năng cao là tắc ống nhánh trong phòng; nếu nhiều phòng cùng có mùi hoặc nước rút chậm, cần kiểm tra tuyến gom chung và hố ga ngoài sân. Cách mô tả này giúp thợ khoanh vùng nhanh hơn khi đến hiện trường.</p>
<p>Với nhà ống cũ hoặc cửa hàng ăn uống, đừng chỉ theo dõi miệng cống sau khi đã thông xong. Nên xả thử liên tục ở bếp, nhà vệ sinh và khu giặt rửa để xem điểm nào phản ứng chậm nhất. Nếu nước rút tốt lúc đầu nhưng mùi quay lại sau vài giờ, thợ cần kiểm tra thêm bẫy nước, hố ga và đoạn ống có thể bị hở hoặc lắng cặn lâu ngày. Những thông tin này giúp tránh tình trạng xử lý một điểm nhưng bỏ sót nguyên nhân tái phát.</p>
<p><strong>Tên đơn vị:</strong> Môi Trường Đô Thị Số 1 Quảng Ninh.</p>
<p><strong>Website:</strong> https://thongtaccongquangninh.com</p>
<p><strong>Hotline:</strong> <strong>0963.953.533 / 0931.156.756</strong></p>
<p><strong>Dịch vụ tại Uông Bí:</strong> thông tắc cống, xử lý cống bếp, thông thoát sàn, kiểm tra hố ga, nạo vét hố ga, xử lý mùi hôi và tư vấn khi đường ống cũ tắc lặp lại.</p>
<p><strong>Khu vực hỗ trợ:</strong> Yên Thanh, Quang Trung, Thanh Sơn, Phương Đông, Phương Nam, Vàng Danh, Bắc Sơn và các khu nhà trọ, hộ gia đình, cửa hàng lân cận. Khi gọi, hãy nói rõ công trình là nhà dân, nhà trọ hay quán ăn để thợ chọn khung giờ và thiết bị phù hợp.</p>`,
  },
];

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wp(baseUrl, auth, route, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: auth,
      "User-Agent": "Codex TTCQN P1 Quang Yen Uong Bi fix",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let payload = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? text : payload;
    throw new Error(`WordPress ${response.status} ${route}: ${message}`);
  }
  return payload;
}

function stripTags(html) {
  return String(html ?? "")
    .replace(/<script\b[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/g, " ");
}

function ascii(input) {
  return String(input ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function metrics(html, area) {
  const text = ascii(stripTags(html));
  const words = text.match(/[a-z0-9]+/g) ?? [];
  const focus = `thong tac cong ${ascii(area).replace(/\s+/g, " ")}`;
  const keywordCount = (text.match(new RegExp(focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
  return {
    wordCount: words.length,
    keywordCount,
    keywordDensity: words.length ? Number(((keywordCount * 4 * 100) / words.length).toFixed(2)) : 0,
    imgCount: (String(html).match(/<img\b/giu) ?? []).length,
    hasWhyH2: /<h2[^>]*>[^<]*(Tại sao chọn|Cam kết 3 Không)/iu.test(html),
    hasNapH2: /<h2[^>]*>[^<]*(NAP|liên hệ)/iu.test(html),
    forbidden: /(chuyên nghiệp|uy tín|hàng đầu|tận tâm)/iu.test(stripTags(html)),
  };
}

function patchContent(raw, target) {
  let html = String(raw ?? "");
  html = html.replace(new RegExp(`\\n?${target.why.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n?`, "u"), "\n");
  html = html.replace(new RegExp(`\\n?${target.nap.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n?`, "u"), "\n");
  html = html.replace(/<h2>Tại sao chọn[^<]*<\/h2>[\s\S]*?(?=<h2>Quy trình thợ xử lý<\/h2>)/u, "");
  html = html.replace(/<h2>NAP liên hệ[^<]*<\/h2>[\s\S]*?(?=<h2>Câu hỏi thường gặp<\/h2>)/u, "");

  if (!/<h2[^>]*>[^<]*(Tại sao chọn|Cam kết 3 Không)/iu.test(html)) {
    html = html.replace(/<h2>Quy trình thợ xử lý<\/h2>/u, `${target.why}\n<h2>Quy trình thợ xử lý</h2>`);
  }
  if (!/<h2[^>]*>[^<]*(NAP|liên hệ)/iu.test(html)) {
    html = html.replace(/<h2>Câu hỏi thường gặp<\/h2>/u, `${target.nap}\n<h2>Câu hỏi thường gặp</h2>`);
  }
  return html.replace(/\n{3,}/g, "\n\n").trim();
}

async function liveCheck(url) {
  const res = await fetch(`${url}?nowprocket=1&codex=p1-qyub-${Date.now()}`, { redirect: "manual" });
  const html = await res.text();
  return {
    status: res.status,
    canonicalOk: html.includes(`<link rel="canonical" href="${url}"`),
    noindex: /<meta[^>]+name=["']robots["'][^>]+noindex/iu.test(html),
    h1Count: (html.match(/<h1\b/giu) ?? []).length,
    imgCount: (html.match(/<img\b/giu) ?? []).length,
    hasServiceSchema: /"@type"\s*:\s*"Service"/iu.test(html),
    hasWhyH2: /<h2[^>]*>[^<]*(Tại sao chọn|Cam kết 3 Không)/iu.test(html),
    hasNapH2: /<h2[^>]*>[^<]*(NAP|liên hệ)/iu.test(html),
  };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Thiếu WP_USERNAME/WP_APP_PASSWORD trong .env");
  const baseUrl = (env.WP_BASE_URL || BASE_URL).replace(/\/$/, "");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const results = [];

  if (APPLY) mkdirSync(BACKUP_DIR, { recursive: true });

  for (const target of TARGETS) {
    const existing = await wp(baseUrl, auth, `/wp/v2/pages/${target.id}?context=edit`);
    const beforeContent = existing.content?.raw ?? existing.content?.rendered ?? "";
    const afterContent = patchContent(beforeContent, target);
    const before = metrics(beforeContent, target.area);
    const after = metrics(afterContent, target.area);
    const item = {
      id: target.id,
      slug: target.slug,
      area: target.area,
      url: `${baseUrl}/${target.slug}/`,
      before,
      after,
      oldTitle: existing.title?.raw ?? "",
      newTitle: target.title,
      pass: after.wordCount >= 1800 && after.keywordDensity <= 1.6 && after.imgCount >= 3 && after.hasWhyH2 && after.hasNapH2 && !after.forbidden,
    };

    if (APPLY) {
      const backupPath = path.join(BACKUP_DIR, `pages-${target.id}-${target.slug}.json`);
      writeFileSync(backupPath, JSON.stringify(existing, null, 2), "utf8");
      const pushed = await wp(baseUrl, auth, `/wp/v2/pages/${target.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: target.title,
          excerpt: target.excerpt,
          content: afterContent,
          status: "publish",
        }),
      });
      const rankMathUpdate = await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectType: "post",
          objectID: target.id,
          meta: {
            rank_math_title: target.title,
            rank_math_description: target.excerpt,
            rank_math_focus_keyword: `thông tắc cống ${target.area}`,
          },
        }),
      }).catch((error) => ({ error: error.message }));
      item.backupPath = backupPath;
      item.pushed = { id: pushed.id, status: pushed.status, link: pushed.link };
      item.rankMathUpdate = rankMathUpdate;
      item.live = await liveCheck(item.url);
    }
    results.push(item);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    backupDir: APPLY ? BACKUP_DIR : null,
    results,
    ok: results.every((item) => item.pass),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ reportPath: REPORT_PATH, ...report }, null, 2));
  if (!report.ok) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
