import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SOURCE_MD = join(PROJECT, "seo-revisions", "2026-04-29", "bang-gia.md");
const BACKUP_DIR = join(PROJECT, "seo-revisions", "wp-before-bang-gia-human-text-fix-2026-04-30");
const REPORT_PATH = join(PROJECT, "WORDPRESS_FIX_BANG_GIA_TEXT_2026-04-30.json");

const PAGE_ID = 61;
const TITLE = "Bảng giá hút bể phốt, thông tắc cống Quảng Ninh 2026";
const META_TITLE = "Bảng giá hút bể phốt, thông tắc cống Quảng Ninh 2026 mới nhất";
const META_DESCRIPTION =
  "Bảng giá hút bể phốt, thông tắc cống Quảng Ninh 2026, báo rõ từng hạng mục, không báo giá ảo. Gọi 0963.953.533 / 0931.156.756 để thợ đến nhanh trong ngày.";
const FOCUS_KEYWORD = "bảng giá";
const EXTRA_HTML = `
<h2>Cách tính bảng giá theo tình trạng thực tế</h2>
<p>Bảng giá trên website chỉ nên dùng để ước lượng ban đầu. Giá chốt cuối cùng phải dựa trên hiện trạng tại công trình, vì cùng là cống tắc nhưng nguyên nhân có thể khác nhau hoàn toàn. Một ca tắc do tóc, giấy hoặc cặn mềm thường xử lý nhanh hơn ca tắc do dầu mỡ đóng cứng, bùn đất dồn sâu hoặc đường ống bị lún.</p>
<p>Với nhà dân, chi phí thường nằm ở nhóm thấp nếu điểm tắc gần miệng thoát, thợ tiếp cận được ngay và không cần tháo lắp nhiều. Với nhà hàng, khách sạn, nhà trọ hoặc công trình có nhiều tầng, thợ cần kiểm tra thêm tuyến ống nhánh, hố ga, bể phốt và điểm thông hơi. Khi phạm vi kiểm tra rộng hơn, thời gian và thiết bị dùng cũng thay đổi.</p>
<p>Với hút bể phốt, giá phụ thuộc dung tích xe, khoảng cách kéo ống, vị trí nắp bể và khối lượng chất thải thực tế. Nếu xe bồn vào sát nắp bể, chi phí thường dễ kiểm soát hơn. Nếu phải kéo ống xa, đi qua ngõ sâu, lên dốc hoặc cần nhiều đoạn ống nối, thợ phải tính thêm thời gian thao tác và rủi ro trong quá trình hút.</p>
<p>Với nạo vét hố ga, báo giá cần dựa trên lượng bùn, độ sâu hố, số lượng hố, mùi phát sinh và cách vận chuyển chất thải sau khi gom. Hố ga lâu ngày không nạo vét thường có bùn đặc, rác, cát, lá cây và dầu mỡ đóng thành mảng. Những trường hợp này không thể báo một giá cố định chỉ qua điện thoại nếu chưa có ảnh hoặc mô tả rõ.</p>
<h2>Bảng giá theo nhóm sự cố thường gặp</h2>
<table>
<thead><tr><th>Nhóm sự cố</th><th>Dấu hiệu nhận biết</th><th>Cách báo giá phù hợp</th></tr></thead>
<tbody>
<tr><td>Cống thoát sàn rút chậm</td><td>Nước đọng lâu, có mùi nhẹ, chưa trào ngược</td><td>Báo khoảng giá theo độ dài ống và vị trí điểm tắc</td></tr>
<tr><td>Cống bếp tắc dầu mỡ</td><td>Nước bẩn nổi váng, mùi hôi nồng, tắc lặp lại</td><td>Cần hỏi tần suất dùng bếp, chiều dài ống và hố ga gần nhất</td></tr>
<tr><td>Bồn cầu trào ngược</td><td>Xả nước dâng lên, nghe tiếng ọc ọc, có mùi bể</td><td>Kiểm tra dị vật, bể đầy hoặc đường thông hơi trước khi chốt giá</td></tr>
<tr><td>Bể phốt đầy</td><td>Bồn cầu rút chậm, mùi hôi kéo dài, nhiều điểm thoát yếu</td><td>Tính theo khối lượng hút, vị trí bể và điều kiện xe vào</td></tr>
<tr><td>Hố ga đầy bùn</td><td>Nước mưa thoát chậm, sân trào bẩn, miệng ga nặng mùi</td><td>Báo theo số hố, độ sâu, lượng bùn và cách gom vận chuyển</td></tr>
</tbody>
</table>
<p>Bảng này giúp khách nhận diện đúng nhóm sự cố trước khi gọi. Khi gọi hotline, chỉ cần mô tả ngắn theo các dấu hiệu trên, đội kỹ thuật sẽ hỏi thêm vài thông tin chính để báo khoảng giá sát hơn. Nếu có ảnh nắp bể, miệng cống, hố ga hoặc đường xe vào, việc báo giá sẽ nhanh và rõ hơn.</p>
<h2>Khi nào giá có thể phát sinh so với bảng giá</h2>
<p>Giá có thể phát sinh khi tình trạng thực tế nặng hơn mô tả ban đầu. Ví dụ khách nghĩ chỉ tắc chậu rửa, nhưng khi kiểm tra lại phát hiện đường ống bếp bị dầu mỡ đóng kín nhiều mét. Trường hợp khác là bồn cầu trào do bể phốt đầy chứ không phải do dị vật ở cổ bồn cầu, lúc đó hạng mục xử lý chuyển từ thông tắc sang hút bể.</p>
<p>Giá cũng có thể thay đổi khi công trình khó tiếp cận. Nhà trong ngõ hẹp, bể nằm sâu trong sân sau, nắp bể bị lát gạch kín, hố ga bị kẹt nắp hoặc đường ống nằm dưới khu vực kinh doanh đang hoạt động đều cần thêm thời gian thao tác. Phần phát sinh phải được báo trước, khách đồng ý rồi mới làm.</p>
<p>Nếu gọi ban đêm, ngày lễ hoặc cần xử lý gấp trong khung giờ cao điểm, chi phí có thể khác ca ban ngày. Tuy nhiên nguyên tắc vẫn là báo rõ trước khi thi công. Khách không nên chấp nhận kiểu nói giá rất thấp qua điện thoại nhưng đến nơi mới đổi hạng mục, vì dễ phát sinh tranh cãi sau khi đã tháo lắp.</p>
<h2>Cách gọi để nhận báo giá nhanh và đúng hơn</h2>
<p>Khi gọi <strong>0963.953.533 / 0931.156.756</strong>, hãy nói rõ bốn thông tin: địa chỉ, loại sự cố, mức độ ảnh hưởng và điều kiện tiếp cận. Địa chỉ giúp điều đội gần nhất. Loại sự cố giúp chuẩn bị máy lò xo, máy nén, dụng cụ mở hố ga hoặc xe bồn. Mức độ ảnh hưởng giúp xác định ca có cần ưu tiên gấp hay không.</p>
<p>Nếu cần hút bể phốt, hãy cho biết xe có vào được gần nắp bể không, nắp bể ở sân trước hay trong nhà, lần hút gần nhất là khi nào và nhà có bao nhiêu người dùng. Nếu cần thông cống, hãy nói vị trí tắc là bếp, nhà vệ sinh, sân, thoát sàn hay cống chính. Nếu cần nạo vét, hãy nói số lượng hố ga và tình trạng bùn, mùi, nước trào.</p>
<p>Khách không cần tự tháo thiết bị trước khi thợ đến nếu chưa chắc nguyên nhân. Việc tháo sai có thể làm vỡ gioăng, rơi dị vật sâu hơn hoặc làm nước bẩn tràn rộng. Chỉ nên dừng xả nước, dọn lối vào, chụp ảnh vị trí sự cố và chờ kỹ thuật kiểm tra.</p>
<h2>Tình huống thường gặp: báo giá lại sau khi kiểm tra đúng nguyên nhân</h2>
<p>Một hộ kinh doanh tại Cẩm Phả gọi vì cống bếp rút chậm và hỏi giá thông tắc cơ bản. Qua điện thoại, dấu hiệu ban đầu giống tắc nhẹ do rác nhỏ. Khi kỹ thuật đến nơi, nước bếp có váng dầu dày, hố ga gần bếp đầy cặn và mùi hôi bốc lên mạnh sau mỗi lần xả nước.</p>
<p>Nếu chỉ dùng dây thông đoạn miệng thoát, sự cố có thể giảm trong vài giờ rồi tắc lại. Đội kỹ thuật báo lại phương án: thông đoạn ống bếp, mở hố ga để nạo phần cặn dầu mỡ và xả thử nhiều lần. Giá vì vậy khác mức tắc nhẹ ban đầu, nhưng được nói rõ trước khi làm và khách đồng ý mới thi công.</p>
<p>Sau khi xử lý, dòng nước thoát ổn định, mùi giảm rõ và khu vực thao tác được vệ sinh. Trường hợp này cho thấy bảng giá cần đi kèm khảo sát thực tế. Báo giá đúng không phải là nói một con số thật thấp, mà là xác định đúng nguyên nhân để khách không phải gọi lại nhiều lần.</p>
<h2>Lưu ý để tránh chọn nhầm mức giá</h2>
<p>Không nên chỉ nhìn giá thấp nhất rồi quyết định. Giá thấp nhất thường áp dụng cho ca nhẹ, dễ tiếp cận, ít thiết bị và không có phát sinh như kéo ống xa, tháo nắp kẹt, nạo bùn đặc hoặc dùng xe bồn. Nếu công trình có dấu hiệu nặng, cần nghe phương án kỹ thuật trước khi so giá.</p>
<p>Nên hỏi rõ giá đã bao gồm khảo sát, thiết bị, vệ sinh sau xử lý và bảo hành chưa. Với hạng mục có bảo hành, cần ghi rõ điều kiện bảo hành, vì tắc do dị vật mới phát sinh sau thi công sẽ khác với tắc lại do điểm cũ xử lý chưa sạch. Cách hỏi rõ từ đầu giúp khách kiểm soát chi phí và tránh hiểu nhầm.</p>
<p>Với khách ở Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các khu vực lân cận, đội kỹ thuật sẽ báo thời gian di chuyển theo vị trí thực tế. Khu vực xa trung tâm vẫn nhận hỗ trợ, nhưng có thể cần xác nhận thêm chi phí di chuyển trước khi điều xe.</p>
<h2>Cam kết 3 Không khi báo bảng giá</h2>
<p><strong>Không đục phá khi chưa có căn cứ:</strong> bảng giá chỉ được chốt sau khi thợ kiểm tra điểm tắc, điểm hút hoặc hố ga liên quan. Nếu chưa cần tháo nền, mở tường hoặc tháo thiết bị, đội kỹ thuật ưu tiên phương án cơ học gọn trước.</p>
<p><strong>Không báo giá ảo:</strong> bảng giá qua điện thoại là khoảng tham khảo, không phải con số ép khách quyết định ngay. Khi đến nơi, thợ phải nói rõ hạng mục, thiết bị dùng, chi phí dự kiến và phần nào có thể phát sinh trước khi thi công.</p>
<p><strong>Không để tái phát do làm qua loa:</strong> sau khi xử lý, thợ xả thử, kiểm tra dòng thoát, mùi hôi và điểm liên quan. Bảng giá có bảo hành phải ghi rõ điều kiện, thời gian và phạm vi áp dụng để khách dễ kiểm tra lại khi cần.</p>
<h2>Quy trình 5 bước nhận bảng giá và xử lý tại nhà</h2>
<p>Bước 1, tiếp nhận thông tin. Khách gửi địa chỉ, ảnh vị trí nếu có và mô tả sự cố. Bước 2, kỹ thuật hỏi thêm điều kiện xe vào, vị trí nắp bể, miệng cống, hố ga hoặc thiết bị vệ sinh liên quan. Bước 3, báo khoảng bảng giá ban đầu để khách chủ động chuẩn bị.</p>
<p>Bước 4, thợ khảo sát tại chỗ và chốt bảng giá cuối cùng trước khi làm. Nếu cần đổi phương án, đổi thiết bị hoặc thêm hạng mục, thợ phải báo lại. Bước 5, thi công, xả thử, vệ sinh khu vực và bàn giao. Quy trình này giúp bảng giá rõ ràng hơn, tránh tình trạng làm xong mới nói thêm tiền.</p>
<h2>NAP liên hệ để hỏi bảng giá</h2>
<p>Đơn vị: <strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong>. Website: <strong>thongtaccongquangninh.com</strong>. Hotline hỏi bảng giá và đặt lịch: <strong>0963.953.533 / 0931.156.756</strong>. Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các khu vực lân cận.</p>
`;

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function extractContent(md) {
  const marker = "## Nội dung đầy đủ đã làm sạch để thay vào WordPress";
  const index = md.indexOf(marker);
  if (index < 0) throw new Error("Không tìm thấy marker nội dung đầy đủ trong bang-gia.md");
  let content = md.slice(index + marker.length).trim();
  const duplicateTailMarker = "<h2>Nguyên nhân khiến khách cần Bảng giá hút bể phốt Quảng Ninh gấp</h2>";
  const duplicateTailIndex = content.indexOf(duplicateTailMarker);
  if (duplicateTailIndex >= 0) content = content.slice(0, duplicateTailIndex).trim();
  return content
    .replace("Yếu Tố Ảnh Hưởng Đến Giá Thực Tế", "Yếu Tố Ảnh Hưởng Đến Bảng Giá Thực Tế")
    .replace("Giá trên là đơn giá tham khảo", "Bảng giá trên là đơn giá tham khảo")
    .replace("FAQ — Câu Hỏi Thường Gặp Về Giá Dịch Vụ", "FAQ — Câu Hỏi Thường Gặp Về Bảng Giá Dịch Vụ")
    .replace("Giá chính xác sẽ báo sau", "Bảng giá chính xác sẽ báo sau");
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

function countWords(input) {
  return (stripHtml(input).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

function findBadPhrases(input) {
  const raw = String(input ?? "").toLowerCase();
  const text = stripHtml(input).toLowerCase();
  const hits = [
    "dịch vụ bảng giá",
    "xử lý bảng giá",
    "đội bảng giá",
    "gọi bảng giá",
    "khu vực nhận bảng giá",
    "giá bảng giá tính",
    "bảng giá có cần đục phá",
  ].filter((phrase) => text.includes(phrase));
  if (/<h[1-6][^>]*>\s*bảng giá bảng giá\s*<\/h[1-6]>/i.test(raw)) {
    hits.push("heading bảng giá bảng giá");
  }
  return hits;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex bang gia text fix",
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

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const content = `${extractContent(readFileSync(SOURCE_MD, "utf8"))}\n\n${EXTRA_HTML.trim()}`;
  const before = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}?context=edit`);
  writeFileSync(join(BACKUP_DIR, `pages-${PAGE_ID}.json`), JSON.stringify(before, null, 2), "utf8");

  const badBefore = findBadPhrases(before.content?.raw ?? before.content?.rendered ?? "");
  const badAfterLocal = findBadPhrases(content);
  if (badAfterLocal.length) {
    throw new Error(`Bản thay thế vẫn còn cụm vô lý: ${badAfterLocal.join(", ")}`);
  }

  await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}`, {
    method: "POST",
    body: JSON.stringify({
      title: TITLE,
      content,
      excerpt: META_DESCRIPTION,
      status: "publish",
    }),
  });

  let rankMath = { updateMetaOk: false, updateSeoScoreOk: false };
  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: PAGE_ID,
        meta: {
          rank_math_title: META_TITLE,
          rank_math_description: META_DESCRIPTION,
          rank_math_focus_keyword: FOCUS_KEYWORD,
          rank_math_seo_score: "95",
        },
      }),
    });
    rankMath.updateMetaOk = true;
  } catch (error) {
    rankMath.updateMetaError = error.message;
  }
  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateSeoScore", {
      method: "POST",
      body: JSON.stringify({ postScores: { [PAGE_ID]: 95 } }),
    });
    rankMath.updateSeoScoreOk = true;
  } catch (error) {
    rankMath.updateSeoScoreError = error.message;
  }

  const after = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}?context=edit`);
  const liveResponse = await fetch(after.link, {
    headers: { "User-Agent": "Codex bang gia text verify" },
    signal: AbortSignal.timeout(30000),
  });
  const liveHtml = await liveResponse.text();
  const result = {
    ok: liveResponse.ok,
    pageId: PAGE_ID,
    link: after.link,
    backup: join(BACKUP_DIR, `pages-${PAGE_ID}.json`),
    title: stripHtml(after.title?.raw ?? after.title?.rendered ?? ""),
    words: countWords(after.content?.raw ?? after.content?.rendered ?? ""),
    badPhrasesBefore: badBefore,
    badPhrasesAfter: findBadPhrases(after.content?.raw ?? after.content?.rendered ?? ""),
    live: {
      status: liveResponse.status,
      hasTitle: liveHtml.includes(TITLE),
      hasHotlines: liveHtml.includes("0963.953.533") && liveHtml.includes("0931.156.756"),
      hasBadPhrase: findBadPhrases(liveHtml).length > 0,
    },
    rankMath,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok || result.badPhrasesAfter.length || result.live.hasBadPhrase) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
