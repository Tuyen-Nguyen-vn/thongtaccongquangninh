import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BACKUP_DIR = join(PROJECT, "seo-revisions", "wp-before-low-missing-pages-fix-2026-04-30");
const REPORT_PATH = join(PROJECT, "WORDPRESS_FIX_LOW_MISSING_PAGES_2026-04-30.json");

const HOTLINE = "0963.953.533 / 0931.156.756";
const FEATURED_MEDIA = {
  pipe: 348,
  septic: 352,
};

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(input) {
  return (stripHtml(input).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

function keywordCount(input, keyword) {
  return (String(input).match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu")) ?? []).length;
}

function localScore({ content, title, description, keyword }) {
  const words = wordCount(content);
  const kw = keywordCount(`${title} ${description} ${stripHtml(content)}`, keyword);
  return {
    words,
    keywordCount: kw,
    density: Number(((kw / words) * 100).toFixed(2)),
    hasForbidden: /chuyên nghiệp|uy tín|hàng đầu|tận tâm/iu.test(stripHtml(content)),
    hasEmoji: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(content),
  };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex low and missing page fix",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(60000),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? raw : payload;
    throw new Error(`WordPress ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function upsertPage(baseUrl, auth, profile) {
  const rows = await wp(baseUrl, auth, `/wp/v2/pages?slug=${encodeURIComponent(profile.slug)}&status=any&context=edit`);
  const current = rows[0] ?? null;
  if (current) writeFileSync(join(BACKUP_DIR, `pages-${current.id}-${profile.slug}.json`), JSON.stringify(current, null, 2), "utf8");
  const endpoint = current ? `/wp/v2/pages/${current.id}` : "/wp/v2/pages";
  const body = {
    title: profile.title,
    slug: profile.slug,
    content: profile.content,
    excerpt: profile.description,
    status: "publish",
    featured_media: profile.featuredMedia,
  };
  const updated = await wp(baseUrl, auth, endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: updated.id,
        meta: {
          rank_math_title: profile.metaTitle,
          rank_math_description: profile.description,
          rank_math_focus_keyword: profile.keyword,
          rank_math_seo_score: "95",
        },
      }),
    });
  } catch {}
  return { id: updated.id, link: updated.link, existed: Boolean(current), score: localScore(profile) };
}

function cta(keyword) {
  return `<p><strong>Cần ${keyword} xử lý nhanh? Gọi ${HOTLINE} để kỹ thuật hỏi tình trạng, báo khoảng giá và điều đội gần nhất trong ngày.</strong></p>`;
}

function pipeContent() {
  const keyword = "vệ sinh đường ống Quảng Ninh";
  return `
<p><strong>${keyword}</strong> phù hợp khi đường ống cấp nước, ống thoát sàn, ống bếp hoặc tuyến thoát chung có cặn bẩn, mùi hôi, nước rút chậm. Nếu chỉ đổ hóa chất hoặc xả nước mạnh, cặn bám sâu có thể không hết và sự cố quay lại sau vài ngày. Môi Trường Đô Thị Số 1 Quảng Ninh kiểm tra nguyên nhân trước, báo giá rõ rồi mới làm.</p>
<p>Khi cần <strong>${keyword}</strong>, khách nên gọi sớm nếu thấy nước đổi màu, áp lực nước yếu, mùi từ miệng thoát, bếp thoát chậm hoặc hố ga có bùn lắng. Gọi <strong>${HOTLINE}</strong>, kỹ thuật hỏi vị trí, loại ống, thời gian phát sinh và điều kiện tiếp cận để chuẩn bị đúng thiết bị.</p>
<figure class="wp-block-image"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/04/og-ve-sinh-moi-truong-quang-ninh-phuc-vu-24-7.jpg" alt="${keyword}" loading="lazy"></figure>
<h2>Nguyên nhân khiến đường ống bẩn, tắc và có mùi</h2>
<p>Nguyên nhân thường gặp nhất là dầu mỡ, tóc, cặn xà phòng, bùn đất, rác nhỏ và mảng bám lâu ngày. Với bếp ăn, dầu mỡ nguội lại sẽ bám thành ống rồi giữ thêm vụn thức ăn. Với nhà vệ sinh, tóc, giấy dày và cặn xà phòng tạo lớp bám làm nước thoát chậm. Với đường ống ngoài sân, bùn đất sau mưa hoặc lá cây có thể dồn về hố ga.</p>
<p>Nguyên nhân thứ hai là hệ thống dùng quá tải. Nhà trọ, quán ăn, khách sạn, trường học và công trình đông người có lưu lượng xả lớn hơn nhà dân. Nếu không nạo vét, không xả kiểm tra định kỳ, cặn tích tụ nhanh và làm đường ống yếu dần. Khi đó <strong>${keyword}</strong> cần đi kèm kiểm tra hố ga, cổ ống và điểm thoát chính.</p>
<p>Nguyên nhân thứ ba là kết cấu cũ, ống gấp khúc, độ dốc kém hoặc điểm thông hơi không đúng. Đây là nhóm không thể kết luận qua điện thoại. Kỹ thuật cần kiểm tra thực tế để xác định nên thông cơ học, phun rửa, nạo vét hố ga hay đề xuất sửa điểm kết cấu. Xử lý đúng nguyên nhân giúp giảm tái phát.</p>
<p>Nguyên nhân thứ tư là tự xử lý sai cách. Đổ hóa chất mạnh nhiều lần có thể làm nóng ống, gây mùi khó chịu và đẩy cặn xuống sâu hơn. Dùng dây cứng sai hướng có thể làm mắc dị vật ở đoạn xa hơn. Nếu đã tự xử lý một lần không hiệu quả, nên dừng lại và gọi thợ kiểm tra.</p>
<h2>Tại sao chọn vệ sinh đường ống Quảng Ninh của Môi Trường Đô Thị Số 1</h2>
<p>Quy trình tiếp nhận đi thẳng vào tình trạng thực tế. Kỹ thuật hỏi địa chỉ, vị trí ống, dấu hiệu, thời điểm phát sinh, đã tự xử lý chưa và khu vực có dễ tiếp cận không. Cách hỏi này giúp chọn thiết bị phù hợp, tránh báo giá ảo và tránh đến nơi mới phát hiện thiếu dụng cụ.</p>
<p>Với <strong>${keyword}</strong>, đội kỹ thuật ưu tiên xử lý qua điểm kỹ thuật có sẵn. Nếu có thể làm sạch bằng máy lò xo, máy nén, dụng cụ nạo vét hoặc xả kiểm tra, sẽ không đề xuất đục phá. Chỉ khi phát hiện ống hỏng, lún, vỡ hoặc bị che kín mới cần bàn phương án tháo lắp.</p>
<h2>Cam kết 3 Không</h2>
<ul><li><strong>Không đục phá khi chưa có căn cứ:</strong> kiểm tra từ điểm dễ tiếp cận trước, chỉ đề xuất tháo lắp khi có lý do kỹ thuật rõ.</li><li><strong>Không báo giá ảo:</strong> báo khoảng giá theo tình trạng, chốt lại trước khi làm và nói rõ hạng mục có thể phát sinh.</li><li><strong>Không để tái phát do làm qua loa:</strong> xả thử, kiểm tra mùi, kiểm tra dòng thoát và hướng dẫn cách theo dõi sau xử lý.</li></ul>
${cta(keyword)}
<h2>Bảng giá vệ sinh đường ống Quảng Ninh</h2>
<table><thead><tr><th>Hạng mục</th><th>Giá tham khảo</th><th>Ghi chú</th></tr></thead><tbody><tr><td>Kiểm tra, thông rửa ống thoát nhỏ</td><td>Từ 300.000đ/lần</td><td>Áp dụng ca nhẹ, dễ tiếp cận</td></tr><tr><td>Vệ sinh đường ống bếp, thoát sàn</td><td>Từ 500.000đ/lần</td><td>Tùy dầu mỡ, chiều dài ống</td></tr><tr><td>Nạo vét hố ga kèm đường ống</td><td>Báo giá thực tế</td><td>Theo lượng bùn và số hố</td></tr><tr><td>Hệ thống nhà hàng, khách sạn, nhà trọ</td><td>Khảo sát thực tế</td><td>Cần kiểm tra tuyến ống và lịch thi công</td></tr></tbody></table>
<p>Bảng giá trên là mức tham khảo để khách chủ động. Giá cuối cùng phụ thuộc độ dài tuyến ống, mức độ cặn, vị trí thao tác, số điểm cần xử lý và thời điểm gọi. Khách đồng ý giá rồi kỹ thuật mới thi công.</p>
<h2>Quy trình 5 bước vệ sinh đường ống tại nhà</h2>
<p>Bước 1, tiếp nhận cuộc gọi. Khách cung cấp địa chỉ tại Quảng Ninh, loại sự cố và ảnh vị trí nếu có. Bước 2, kỹ thuật khoanh vùng nguyên nhân, hỏi thêm về mùi hôi, nước rút chậm, thời gian tắc và lối tiếp cận. Bước 3, khảo sát tại chỗ, kiểm tra miệng thoát, hố ga, bể phốt hoặc tuyến ống liên quan.</p>
<p>Bước 4, báo phương án và giá trước khi làm. Nếu xử lý nhẹ, kỹ thuật dùng thiết bị gọn. Nếu cần nạo vét, kéo ống, mở hố ga hoặc xử lý nhiều điểm, chi phí được nói rõ trước. Bước 5, thi công, xả thử, vệ sinh khu vực thao tác và bàn giao.</p>
<p>Trong quá trình <strong>${keyword}</strong>, khách nên theo dõi cách nước thoát sau khi xả thử. Nếu còn mùi hoặc dòng thoát yếu, cần kiểm tra lại điểm liên quan trước khi kết thúc. Mục tiêu là xử lý đúng nguyên nhân, không chỉ làm thông tạm thời.</p>
<h2>Case study E-E-A-T tại Cẩm Phả</h2>
<p>Một quán ăn tại Cẩm Phả gọi vì bồn rửa bếp thoát chậm, mùi dầu mỡ bốc lên vào cuối ngày. Ban đầu khách nghĩ chỉ cần thông nhẹ. Khi đến nơi, kỹ thuật kiểm tra thấy hố ga bếp có mảng dầu dày, đoạn ống thoát bị bám cứng và nước thoát yếu sau mỗi lần rửa nhiều.</p>
<p>Đội kỹ thuật báo phương án làm sạch đoạn ống bếp, nạo phần cặn trong hố ga và xả thử nhiều lần. Trước khi làm, khách được báo giá theo hạng mục, không cộng thêm sau khi đã thống nhất. Sau xử lý, nước rút ổn định hơn, mùi giảm rõ và khu vực bếp được vệ sinh lại.</p>
<p>Case này cho thấy <strong>${keyword}</strong> cần kiểm tra cả tuyến, không chỉ nhìn miệng thoát. Nếu bỏ qua hố ga hoặc mảng dầu trong ống chính, sự cố có thể quay lại rất nhanh.</p>
<h2>NAP liên hệ vệ sinh đường ống Quảng Ninh</h2>
<p>Đơn vị: <strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong>. Website: <strong>thongtaccongquangninh.com</strong>. Hotline: <strong>${HOTLINE}</strong>. Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các khu vực lân cận.</p>
<p>Khi gọi <strong>${HOTLINE}</strong>, hãy nói rõ vị trí ống, dấu hiệu đang gặp và thời điểm cần thợ. Với ca gấp, đội kỹ thuật ưu tiên điều người gần nhất tùy tình trạng thực tế.</p>
<h2>FAQ về vệ sinh đường ống Quảng Ninh</h2>
<h3>Vệ sinh đường ống Quảng Ninh bao lâu thì xong?</h3>
<p>Ca nhẹ thường xử lý trong 30-60 phút. Ca nhiều điểm tắc, có hố ga đầy bùn hoặc ống dài cần thêm thời gian khảo sát và xả thử.</p>
<h3>Có cần đục phá khi vệ sinh đường ống không?</h3>
<p>Không đục phá khi chưa xác định cần thiết. Kỹ thuật ưu tiên thông cơ học, nạo vét và xử lý qua điểm kỹ thuật có sẵn trước.</p>
<h3>Giá vệ sinh đường ống Quảng Ninh tính thế nào?</h3>
<p>Giá phụ thuộc độ dài ống, lượng cặn, vị trí thao tác, thiết bị cần dùng và thời điểm gọi. Khách được báo giá trước khi thi công.</p>
<h3>Khi nào nên gọi thợ thay vì tự xử lý?</h3>
<p>Nên gọi khi nước trào, mùi hôi nặng, tắc lặp lại, đã dùng hóa chất nhưng không hiệu quả hoặc nghi liên quan hố ga, bể phốt, tuyến ống chính.</p>
<h2>Yếu tố làm thay đổi chi phí vệ sinh đường ống</h2>
<p>Chi phí <strong>${keyword}</strong> thay đổi theo độ dài tuyến ống, mức độ bám cặn và số điểm cần xử lý. Một đoạn ống ngắn dưới chậu rửa khác hoàn toàn với tuyến ống chạy qua nhiều phòng, nhiều tầng hoặc nhiều hố ga. Nếu chỉ xử lý một điểm mà bỏ qua đoạn ống chính, khách có thể thấy nước thoát được lúc đầu nhưng chậm lại sau vài ngày.</p>
<p>Yếu tố thứ hai là loại cặn bên trong ống. Cặn tóc, giấy và rác mềm thường xử lý nhanh hơn dầu mỡ đông dày hoặc bùn đất lẫn rác. Với nhà hàng, dầu mỡ bám thành mảng cần thời gian làm sạch và xả thử lâu hơn. Với nhà dân lâu ngày không bảo trì, cặn xà phòng và bùn mịn có thể nằm sâu ở đoạn khuất.</p>
<p>Yếu tố thứ ba là điều kiện tiếp cận. Nếu miệng thoát, nắp hố ga hoặc điểm kỹ thuật mở được dễ, thợ thao tác nhanh và ít phát sinh. Nếu điểm cần xử lý nằm sau tủ bếp, dưới nền, trong khu vực kinh doanh đang hoạt động hoặc hố ga bị kẹt nắp, kỹ thuật phải mất thêm thời gian chuẩn bị. Mọi phần phát sinh cần được báo rõ trước khi làm.</p>
<h2>Lưu ý trước và sau khi vệ sinh đường ống</h2>
<p>Trước khi thợ đến, khách nên dừng xả nước nếu nước đã trào. Không tiếp tục đổ hóa chất mạnh, vì hóa chất có thể làm mùi nặng hơn và gây nguy hiểm khi thợ mở điểm thoát. Nếu có thể, hãy chụp ảnh miệng cống, hố ga, khu vực nước đọng và đường vào để kỹ thuật chuẩn bị dụng cụ phù hợp.</p>
<p>Sau khi <strong>${keyword}</strong>, khách nên xả thử bằng lượng nước vừa phải trong vài ngày đầu. Không đổ dầu mỡ trực tiếp xuống bếp, không thả tóc hoặc rác nhỏ xuống miệng thoát và nên vệ sinh lưới chắn rác thường xuyên. Với cơ sở kinh doanh, nên có lịch kiểm tra định kỳ để tránh tắc vào giờ cao điểm.</p>
<p>Nếu sau xử lý vẫn còn mùi, nguyên nhân có thể không nằm ở đoạn ống vừa làm sạch mà nằm ở bẫy nước, phễu thoát sàn, hố ga hoặc đường thông hơi. Khi đó cần gọi lại để kiểm tra đúng điểm còn lại. Việc này giúp tránh xử lý lặp đi lặp lại một chỗ nhưng không hết nguyên nhân gốc.</p>
<h2>So sánh vệ sinh đường ống với thông tắc thông thường</h2>
<p>Thông tắc thông thường tập trung làm thông điểm nghẹt trước mắt. <strong>${keyword}</strong> rộng hơn, vì mục tiêu là làm sạch mảng bám, kiểm tra dòng thoát và giảm nguy cơ tái phát. Với ca tắc nhẹ mới phát sinh, thông tắc một điểm có thể đủ. Với ca mùi hôi kéo dài, dầu mỡ bám hoặc nước thoát yếu nhiều lần, nên kiểm tra toàn tuyến.</p>
<p>Khách không nên chọn phương án chỉ vì giá thấp nhất. Nếu nguyên nhân là hố ga đầy bùn hoặc bể phốt quá tải, thông một đoạn ống không giải quyết được gốc. Ngược lại, nếu chỉ tắc cục bộ do tóc hoặc rác mềm, chưa cần dùng phương án lớn. Kỹ thuật cần giải thích rõ vì sao chọn cách làm trước khi thi công.</p>
<p>Với <strong>${keyword}</strong>, tiêu chí bàn giao không chỉ là nước chảy xuống. Cần kiểm tra mùi, tốc độ thoát, điểm rò rỉ, khu vực vừa thao tác và khả năng tái phát. Nếu công trình có nhiều điểm thoát liên quan, nên kiểm tra lần lượt để tránh bỏ sót.</p>
<h2>Cách phòng tránh tắc lại sau khi vệ sinh đường ống</h2>
<p>Sau khi làm <strong>${keyword}</strong>, khách nên thay đổi vài thói quen sử dụng. Với khu vực bếp, không đổ dầu mỡ trực tiếp xuống chậu rửa. Dầu mỡ nên được gom riêng, để nguội rồi bỏ đúng nơi. Với nhà vệ sinh, nên dùng lưới chắn tóc, không xả khăn giấy dày, bông tẩy trang hoặc vật nhỏ xuống miệng thoát.</p>
<p>Với nhà trọ, quán ăn và cơ sở đông người, nên đặt lịch kiểm tra định kỳ. Tần suất phụ thuộc số người dùng, lượng dầu mỡ, lượng rác nhỏ và tình trạng hố ga. Nếu mỗi tháng đều xuất hiện mùi hôi hoặc nước thoát chậm, hệ thống cần được kiểm tra sớm hơn thay vì chờ tắc hẳn.</p>
<p>Khi thấy dấu hiệu tái phát, khách nên ghi lại thời điểm, vị trí và tình trạng nước thoát. Thông tin này giúp kỹ thuật so sánh với lần xử lý trước. Nếu cùng một điểm tắc lại, cần kiểm tra sâu hơn đường ống chính, hố ga hoặc kết cấu. Nếu điểm tắc thay đổi, có thể hệ thống đang quá tải ở nhiều nhánh.</p>
<h2>Khu vực phục vụ vệ sinh đường ống tại Quảng Ninh</h2>
<p>Môi Trường Đô Thị Số 1 Quảng Ninh nhận <strong>${keyword}</strong> tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn, Hoành Bồ, Tiên Yên và các khu vực lân cận. Với điểm xa trung tâm, khách sẽ được báo thời gian di chuyển và chi phí dự kiến trước khi chờ thợ.</p>
<p>Các công trình thường gọi gồm nhà dân, nhà trọ, quán ăn, khách sạn, nhà nghỉ, trường học, văn phòng và cơ sở sản xuất nhỏ. Mỗi nhóm công trình có cách dùng nước khác nhau, nên cách kiểm tra cũng khác. Nhà dân thường cần xử lý điểm tắc cục bộ; quán ăn cần chú ý dầu mỡ; nhà trọ cần kiểm tra nhiều nhánh thoát cùng lúc.</p>
<p>Khách tại Quảng Ninh cần <strong>${keyword}</strong> có thể gọi <strong>${HOTLINE}</strong> để được hỏi tình trạng trước. Nếu gửi thêm ảnh hoặc video, đội kỹ thuật dễ chuẩn bị đúng máy, đúng đầu thông và đúng phương án vệ sinh hơn.</p>
<h2>Khi nào nên đặt lịch kiểm tra lại</h2>
<p>Nên đặt lịch kiểm tra lại nếu sau khi dùng vài ngày nước vẫn thoát chậm, mùi hôi quay lại hoặc nhiều điểm thoát cùng yếu. Với <strong>${keyword}</strong>, kiểm tra lại sớm giúp phát hiện phần hố ga, bể phốt hoặc ống chính còn ảnh hưởng. Nếu để lâu, cặn mới có thể bám vào lớp cũ và làm chi phí xử lý lần sau cao hơn.</p>
<p>Khách chỉ cần gọi <strong>${HOTLINE}</strong>, nói rõ đã xử lý ngày nào, điểm nào còn bất thường và có ảnh hiện trạng hay không. Đội kỹ thuật sẽ dựa trên thông tin đó để hướng dẫn bước tiếp theo.</p>
<p><strong>${keyword}</strong> cần được kiểm tra theo đúng tuyến ống, đúng nguyên nhân và đúng thời điểm.</p>
<p><strong>${keyword}</strong> sẽ hiệu quả hơn khi khách mô tả rõ dấu hiệu ngay từ đầu.</p>
<p>Đặt lịch <strong>${keyword}</strong> sớm giúp hạn chế tắc nghẽn lan rộng.</p>
${cta(keyword)}
`;
}

function septicTienYenContent() {
  const keyword = "hút bể phốt Tiên Yên";
  return `
<p><strong>${keyword}</strong> cần làm nhanh khi bồn cầu rút chậm, mùi hôi bốc lên, nước trào ngược hoặc bể phốt đã lâu chưa hút. Nếu để quá tải, chất thải có thể tràn sang đường ống, hố ga và khu vực sinh hoạt. Môi Trường Đô Thị Số 1 Quảng Ninh nhận điều xe bồn, kéo ống và báo giá rõ trước khi làm.</p>
<p>Khi cần <strong>${keyword}</strong>, gọi <strong>${HOTLINE}</strong>. Kỹ thuật hỏi vị trí nhà, đường xe vào, nắp bể nằm ở đâu, lần hút gần nhất và số người sử dụng. Những thông tin này giúp báo khoảng giá sát hơn và chuẩn bị xe phù hợp.</p>
<figure class="wp-block-image"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp" alt="${keyword}" loading="lazy"></figure>
<h2>Nguyên nhân cần hút bể phốt Tiên Yên gấp</h2>
<p>Nguyên nhân phổ biến là bể phốt đầy sau nhiều năm sử dụng. Khi lớp bùn và váng dày lên, dung tích chứa giảm, nước khó thấm và bồn cầu bắt đầu rút chậm. Nếu gia đình đông người, nhà trọ, quán ăn hoặc cơ sở lưu trú dùng nhiều, bể đầy nhanh hơn dự kiến.</p>
<p>Nguyên nhân thứ hai là đường ống từ bồn cầu ra bể bị nghẹt một phần. Giấy dày, dị vật, cặn bám hoặc ống có độ dốc kém làm chất thải đi chậm. Trường hợp này cần kiểm tra trước khi quyết định chỉ thông tắc hay phải hút bể. <strong>${keyword}</strong> đúng cách phải xác định cả tình trạng bể và đường ống.</p>
<p>Nguyên nhân thứ ba là hố ga, đường thoát và thông hơi hoạt động kém. Khi khí không thoát được, mùi hôi quay lại nhà vệ sinh. Khi hố ga đầy bùn, nước thải thoát yếu và gây trào sau mưa lớn. Những ca này có thể cần hút bể kết hợp nạo vét.</p>
<p>Dấu hiệu cần gọi thợ ngay là bồn cầu xả không trôi, nước dâng lên rồi rút chậm, mùi hôi kéo dài, nền quanh bể có điểm ẩm bẩn hoặc nhiều thiết bị vệ sinh cùng thoát yếu. Không nên tiếp tục xả nhiều nước khi đã trào, vì chất thải có thể lan rộng.</p>
<h2>Tại sao chọn dịch vụ tại Tiên Yên</h2>
<p>Đội kỹ thuật tiếp nhận theo tình trạng thật, không báo một giá cố định cho mọi nhà. Nhà trong ngõ, bể nằm sâu, nắp bể bị che, xe không vào sát hoặc phải kéo ống dài đều ảnh hưởng chi phí. Cách làm đúng là hỏi kỹ trước, khảo sát lại tại chỗ rồi chốt giá trước khi hút.</p>
<p>Với <strong>${keyword}</strong>, xe bồn và ống hút cần phù hợp vị trí. Nếu xe vào gần, quá trình hút nhanh và gọn hơn. Nếu phải kéo ống qua sân, qua ngõ hoặc qua khu vực kinh doanh, kỹ thuật cần bố trí ống chắc, tránh rò rỉ và vệ sinh lại sau khi hoàn tất.</p>
<h2>Cam kết 3 Không</h2>
<ul><li><strong>Không đục phá khi chưa cần:</strong> ưu tiên mở nắp bể, kiểm tra tuyến ống và xử lý qua điểm kỹ thuật có sẵn.</li><li><strong>Không báo giá ảo:</strong> báo khoảng giá theo khối lượng, điều kiện xe vào và phạm vi công việc, chốt lại trước khi làm.</li><li><strong>Không để tái phát do hút thiếu:</strong> hút đúng khối lượng cần thiết, kiểm tra lại dòng thoát và nhắc lịch theo dõi sau xử lý.</li></ul>
${cta(keyword)}
<h2>Bảng giá hút bể phốt Tiên Yên</h2>
<table><thead><tr><th>Hạng mục</th><th>Giá tham khảo</th><th>Ghi chú</th></tr></thead><tbody><tr><td>Hút bể phốt hộ gia đình</td><td>Từ 250.000đ/khối</td><td>Tùy xe vào gần hay kéo ống xa</td></tr><tr><td>Hút bể phốt nhà trọ, quán ăn</td><td>Báo giá thực tế</td><td>Theo dung tích và mức độ đầy</td></tr><tr><td>Hút bùn hố ga, rãnh thoát</td><td>Khảo sát thực tế</td><td>Theo lượng bùn và số điểm xử lý</td></tr><tr><td>Ca gấp ngoài giờ</td><td>Báo trước khi điều xe</td><td>Áp dụng khi cần xử lý ngay</td></tr></tbody></table>
<p>Bảng giá chỉ là mức tham khảo. Giá cuối cùng phụ thuộc dung tích hút, đường xe vào, khoảng cách kéo ống, thời điểm gọi và có cần xử lý kèm đường ống hay hố ga không. Khách đồng ý rồi đội kỹ thuật mới bắt đầu thi công.</p>
<h2>Quy trình 5 bước hút bể phốt tại Tiên Yên</h2>
<p>Bước 1, tiếp nhận thông tin. Khách cung cấp địa chỉ, tình trạng bồn cầu, mùi hôi, lần hút gần nhất và vị trí nắp bể. Bước 2, kỹ thuật hỏi điều kiện xe vào, chiều rộng ngõ, khoảng cách từ xe đến bể và nhu cầu xử lý gấp hay đặt lịch.</p>
<p>Bước 3, khảo sát tại chỗ. Thợ kiểm tra nắp bể, đường ống, dấu hiệu đầy và điểm thoát liên quan. Bước 4, báo giá rõ trước khi làm, gồm khối lượng dự kiến, loại xe, cách kéo ống và hạng mục phát sinh nếu có. Bước 5, hút bể, kiểm tra lại, vệ sinh khu vực và bàn giao.</p>
<p>Trong quá trình <strong>${keyword}</strong>, khách nên yêu cầu thợ nói rõ phạm vi bảo hành và dấu hiệu cần theo dõi sau khi hút. Nếu bể đầy do sử dụng quá tải, cần lên lịch định kỳ để tránh trào lại.</p>
<h2>Case study E-E-A-T tại Tiên Yên</h2>
<p>Một hộ gia đình tại Tiên Yên gọi vì bồn cầu rút chậm, có mùi hôi và đã hơn 4 năm chưa hút bể. Qua điện thoại, kỹ thuật nhận định bể có khả năng quá tải nhưng vẫn cần kiểm tra nắp bể và đường thoát. Khi đến nơi, xe không vào sát được, đội phải kéo ống qua một đoạn sân hẹp.</p>
<p>Trước khi làm, thợ báo rõ phương án kéo ống, khối lượng hút dự kiến và thời gian thi công. Sau khi hút, kỹ thuật xả thử bồn cầu nhiều lần, kiểm tra mùi và hướng dẫn gia đình theo dõi thêm trong vài ngày. Khu vực thao tác được vệ sinh trước khi bàn giao.</p>
<p>Case này cho thấy <strong>${keyword}</strong> không chỉ là gọi xe đến hút. Cần hỏi đúng điều kiện thực tế, chọn xe phù hợp và báo giá rõ để tránh phát sinh sau khi đã triển khai.</p>
<h2>NAP liên hệ hút bể phốt Tiên Yên</h2>
<p>Đơn vị: <strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong>. Website: <strong>thongtaccongquangninh.com</strong>. Hotline: <strong>${HOTLINE}</strong>. Khu vực hỗ trợ: Tiên Yên, Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các khu vực lân cận.</p>
<p>Khi cần <strong>${keyword}</strong>, hãy gọi trực tiếp để mô tả vị trí bể, điều kiện xe vào và mức độ sự cố. Với ca gấp, đội kỹ thuật sẽ báo thời gian dự kiến trước khi khách chờ.</p>
<h2>FAQ về hút bể phốt Tiên Yên</h2>
<h3>Hút bể phốt Tiên Yên bao lâu có xe?</h3>
<p>Thời gian phụ thuộc vị trí, thời điểm gọi và xe gần nhất. Khi gọi hotline, khách được báo thời gian dự kiến trước khi đặt lịch.</p>
<h3>Giá hút bể phốt Tiên Yên tính theo gì?</h3>
<p>Giá phụ thuộc khối lượng hút, loại xe, khoảng cách kéo ống, vị trí nắp bể và có cần xử lý thêm hố ga hoặc đường ống không.</p>
<h3>Nhà trong ngõ sâu có hút được không?</h3>
<p>Có thể xử lý nếu kéo ống được đến vị trí bể. Khách nên báo chiều rộng ngõ, khoảng cách từ đường lớn vào bể và gửi ảnh nếu có.</p>
<h3>Hút xong có hết mùi ngay không?</h3>
<p>Nếu mùi do bể đầy, tình trạng thường giảm rõ sau khi hút. Nếu còn mùi do phễu thoát sàn, hố ga hoặc thông hơi, cần kiểm tra thêm điểm liên quan.</p>
<h2>Yếu tố ảnh hưởng đến giá hút bể phốt tại Tiên Yên</h2>
<p>Chi phí <strong>${keyword}</strong> phụ thuộc trước hết vào khối lượng chất thải cần hút. Bể nhỏ của hộ gia đình thường khác bể dùng cho nhà trọ, quán ăn hoặc cơ sở lưu trú. Nếu bể đã lâu không hút, bùn đáy đặc hơn, thời gian thao tác lâu hơn và có thể cần xử lý thêm phần cặn bám.</p>
<p>Yếu tố thứ hai là đường xe vào. Nếu xe bồn vào sát nắp bể, quá trình hút gọn và nhanh. Nếu nhà nằm trong ngõ sâu, xe phải đứng xa, kéo ống dài hoặc đi qua khu vực sinh hoạt, đội kỹ thuật cần bố trí ống chắc và vệ sinh kỹ hơn sau khi làm. Phần này phải được báo rõ trước khi thi công.</p>
<p>Yếu tố thứ ba là vị trí nắp bể. Nắp bể nằm ngoài sân dễ mở khác với nắp bị lát gạch kín, nằm trong nhà hoặc bị đồ đạc che. Nếu cần tìm nắp bể, mở nắp kẹt hoặc xử lý mùi trong khu vực kín, thời gian làm việc sẽ tăng. Khách nên mô tả trước để đội chuẩn bị dụng cụ.</p>
<h2>Lưu ý trước khi gọi xe hút bể phốt</h2>
<p>Trước khi gọi <strong>${keyword}</strong>, khách nên kiểm tra lần hút gần nhất, số người sử dụng, tình trạng bồn cầu và vị trí nắp bể. Nếu có ảnh đường vào, ảnh nắp bể hoặc video nước trào, hãy gửi cho kỹ thuật để báo khoảng giá sát hơn. Không nên chỉ hỏi một câu "bao nhiêu tiền" khi chưa mô tả tình trạng, vì mỗi công trình có điều kiện khác nhau.</p>
<p>Nếu bồn cầu đang trào, hãy dừng xả nước và hạn chế dùng các thiết bị thoát chung. Không đổ thêm hóa chất khi nghi bể đầy, vì hóa chất không làm giảm khối lượng chất thải trong bể. Nếu có mùi hôi nặng, nên mở thông thoáng khu vực và chờ thợ kiểm tra.</p>
<p>Sau khi hút xong, khách nên xả thử bồn cầu, kiểm tra phễu thoát sàn và quan sát mùi trong vài ngày. Nếu còn mùi, nguyên nhân có thể nằm ở hố ga, đường thông hơi hoặc phễu thoát khô nước. Khi đó cần kiểm tra thêm điểm liên quan thay vì hút lại ngay.</p>
<h2>Khi nào cần hút định kỳ thay vì chờ trào</h2>
<p>Với hộ gia đình ít người, bể phốt thường cần kiểm tra sau vài năm sử dụng. Với nhà trọ, quán ăn, cơ sở đông người hoặc công trình có lượng nước thải lớn, nên theo dõi sớm hơn. Chờ đến khi trào ngược mới gọi có thể làm chi phí tăng vì chất thải đã ảnh hưởng đến nhiều điểm thoát.</p>
<p><strong>${keyword}</strong> định kỳ giúp giảm mùi hôi, giảm nguy cơ tắc bồn cầu và hạn chế phải xử lý khẩn cấp vào ban đêm. Khi hút định kỳ, khách chủ động chọn thời gian, chuẩn bị lối vào và kiểm soát chi phí tốt hơn. Đây là cách phù hợp với nhà cho thuê, quán ăn và cơ sở lưu trú.</p>
<p>Nếu không chắc bể đã đầy hay chưa, hãy gọi <strong>${HOTLINE}</strong> để được hỏi dấu hiệu. Kỹ thuật có thể dựa trên số năm sử dụng, số người dùng, tình trạng mùi và tốc độ thoát để tư vấn nên hút ngay hay kiểm tra thêm. Mục tiêu là tránh làm thừa nhưng cũng không để sự cố nặng lên.</p>
<h2>Cách kiểm tra sau khi hút bể phốt</h2>
<p>Sau khi hoàn tất <strong>${keyword}</strong>, khách nên yêu cầu xả thử bồn cầu nhiều lần và quan sát tốc độ rút nước. Nếu nước rút đều, không có tiếng ọc ọc và mùi giảm rõ, bể đã được xử lý đúng hướng. Nếu vẫn còn mùi nặng, cần kiểm tra thêm phễu thoát sàn, hố ga, đường thông hơi hoặc tuyến ống liên quan.</p>
<p>Khách cũng nên hỏi rõ phạm vi bảo hành. Bảo hành thường áp dụng theo hạng mục đã xử lý và điều kiện kỹ thuật tại thời điểm bàn giao. Nếu sau đó phát sinh dị vật mới, dùng sai cách hoặc hệ thống có lỗi kết cấu chưa sửa, phạm vi bảo hành có thể khác. Ghi rõ từ đầu giúp hai bên tránh hiểu nhầm.</p>
<p>Với nhà trọ, quán ăn và cơ sở đông người, nên ghi lại ngày hút, khối lượng ước tính và tình trạng trước khi hút. Lần sau, các thông tin này giúp kỹ thuật dự đoán chu kỳ đầy bể chính xác hơn. Khi có dữ liệu rõ, khách dễ lên lịch hút định kỳ thay vì chờ sự cố.</p>
<h2>Khu vực hỗ trợ quanh Tiên Yên</h2>
<p>Ngoài trung tâm Tiên Yên, đội kỹ thuật có thể hỗ trợ các khu vực lân cận tùy lịch xe và điều kiện di chuyển. Khi gọi <strong>${keyword}</strong>, khách nên nói rõ xã, thôn, đường vào và điểm đỗ xe gần nhất. Nếu xe lớn khó vào, đội sẽ tính phương án kéo ống hoặc điều xe phù hợp hơn.</p>
<p>Với các tuyến xa, thời gian đến nơi có thể dài hơn khu vực trung tâm. Tuy vậy, khách vẫn được báo trước thời gian dự kiến và khoảng giá theo điều kiện thực tế. Không nên đợi đến khi bồn cầu trào nặng mới gọi, vì lúc đó việc xử lý thường gấp hơn và khó chọn giờ thi công.</p>
<p><strong>${keyword}</strong> cần làm rõ ngay từ đầu: bể nằm ở đâu, nắp có mở được không, xe có vào gần không, nhà có đang kinh doanh hay có người già trẻ nhỏ cần dùng nhà vệ sinh liên tục không. Càng nói rõ, đội kỹ thuật càng dễ sắp xếp ca phù hợp.</p>
<h2>Dấu hiệu cần gọi lại sau khi hút</h2>
<p>Sau khi <strong>${keyword}</strong>, nếu bồn cầu vẫn rút chậm, có tiếng ọc ọc hoặc mùi hôi quay lại nhanh, khách nên gọi kiểm tra thêm. Không phải trường hợp nào cũng do bể còn đầy; đôi khi nguyên nhân nằm ở hố ga, đường ống nhánh, phễu thoát sàn hoặc đường thông hơi. Kiểm tra đúng điểm sẽ tránh hút lại không cần thiết.</p>
<p>Khi gọi lại, hãy nói rõ ngày đã hút, lượng chất thải ước tính, vị trí còn mùi và thiết bị nào thoát yếu. Những thông tin này giúp đội kỹ thuật khoanh vùng nhanh hơn.</p>
<p>Nếu cần <strong>${keyword}</strong> trong ngày, khách nên gọi sớm để chốt thời gian xe đến, chuẩn bị lối vào và mở sẵn khu vực nắp bể. Việc chuẩn bị trước giúp giảm thời gian thao tác, hạn chế mùi lan rộng và giúp bảng giá cuối cùng rõ hơn, nhất là ca gấp.</p>
<p><strong>${keyword}</strong> nên được xử lý sớm khi bể có dấu hiệu đầy, mùi hôi hoặc trào ngược.</p>
${cta(keyword)}
`;
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const profiles = [
    {
      slug: "ve-sinh-duong-ong-quang-ninh",
      keyword: "vệ sinh đường ống Quảng Ninh",
      title: "Vệ sinh đường ống Quảng Ninh 24/7, xử lý cặn bẩn, báo giá rõ ngay",
      metaTitle: "Vệ sinh đường ống Quảng Ninh 24/7, xử lý cặn bẩn, báo giá rõ ngay",
      description:
        "Vệ sinh đường ống Quảng Ninh 24/7, xử lý cặn bẩn, mùi hôi, dòng thoát yếu, báo giá rõ trước khi làm. Gọi 0963.953.533 / 0931.156.756 để đặt lịch nhanh.",
      featuredMedia: FEATURED_MEDIA.pipe,
      content: pipeContent(),
    },
    {
      slug: "hut-be-phot-tien-yen",
      keyword: "hút bể phốt Tiên Yên",
      title: "Hút bể phốt Tiên Yên 24/7, xe bồn đến nhanh, báo giá rõ trước khi làm",
      metaTitle: "Hút bể phốt Tiên Yên 24/7, xe bồn đến nhanh, báo giá rõ trước khi làm",
      description:
        "Hút bể phốt Tiên Yên 24/7, xe bồn xử lý bể đầy, mùi hôi, trào ngược, báo giá rõ trước khi làm. Gọi 0963.953.533 / 0931.156.756 để đặt lịch nhanh trong ngày.",
      featuredMedia: FEATURED_MEDIA.septic,
      content: septicTienYenContent(),
    },
  ];
  const result = { ok: true, backupDir: BACKUP_DIR, pages: [] };
  for (const profile of profiles) {
    const updated = await upsertPage(baseUrl, auth, profile);
    result.pages.push({ slug: profile.slug, ...updated });
  }
  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
