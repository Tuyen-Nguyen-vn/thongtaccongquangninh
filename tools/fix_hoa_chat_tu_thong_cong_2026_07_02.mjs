import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = { id: 2045, collection: "posts", slug: "hoa-chat-tu-thong-cong", url: `${SITE}/hoa-chat-tu-thong-cong/` };
const FOCUS_KEYWORD = "hóa chất tự thông cống";
const TITLE = "Hóa Chất Tự Thông Cống: Hiệu Quả Thực Tế Và Khi Nào Cần Gọi Thợ";
const META_DESC =
  "Hóa chất tự thông cống hiệu quả với cặn dầu mỡ nhẹ, nhưng không xử lý được dị vật cứng. Dùng sai có thể hỏng ống PVC. Cần thợ có kinh nghiệm? Gọi 0963.953.533.";

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-hoa-chat-tu-thong-cong-${stamp}`);
const reportPath = join(ROOT, "reports", `hoa-chat-tu-thong-cong-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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
<h2>Các loại hóa chất thông cống phổ biến trên thị trường</h2>
<p>Trên thị trường Quảng Ninh hiện có bốn nhóm hóa chất thông cống chính, mỗi loại phù hợp với một dạng tắc nghẽn khác nhau. Nhóm kiềm mạnh (NaOH, KOH) dạng hạt hoặc dung dịch đặc, hoạt động bằng cách thủy phân chất béo thành xà phòng hòa tan trong nước, thường dùng cho cống bếp bị tắc do dầu mỡ động vật hoặc thực vật tích tụ lâu ngày. Nhóm axit (axit sulfuric, axit clohydric loãng) có khả năng hòa tan cặn khoáng, cặn canxi bám trong ống nước cứng, nhưng ăn mòn mạnh với kim loại và cần thao tác cẩn thận.</p>
<p>Nhóm enzyme sinh học là lựa chọn an toàn hơn, chứa vi khuẩn hoặc enzyme phân hủy chất hữu cơ (tóc, giấy vệ sinh, thức ăn thừa) theo cơ chế sinh học thay vì phản ứng hóa học mạnh. Loại này không gây ăn mòn ống nhựa hay ống kim loại, nhưng cần thời gian tác dụng lâu hơn, thường từ 6 đến 12 tiếng. Nhóm cuối cùng là hỗn hợp oxy hóa (thường kết hợp oxy già với chất xúc tác), sinh nhiệt và bọt khí giúp đẩy trôi cặn bám mỏng, phù hợp với tắc nhẹ mới phát sinh.</p>
<h2>Cơ chế hóa học khi thông cống bằng hóa chất</h2>
<p>Hiểu cơ chế hoạt động giúp người dùng chọn đúng loại và tránh lãng phí. Với hóa chất kiềm, phản ứng xà phòng hóa (saponification) chuyển hóa triglyceride trong dầu mỡ thành glycerol và muối axit béo tan trong nước; phản ứng này tỏa nhiệt, khiến chai đựng có thể ấm lên khi đổ vào ống. Với axit, cơ chế là phản ứng trung hòa và hòa tan trực tiếp cặn khoáng gốc canxi cacbonat, giải phóng khí CO2 — đây là lý do một số sản phẩm sủi bọt mạnh khi tiếp xúc với cặn vôi.</p>
<p>Enzyme sinh học hoạt động chậm hơn vì dựa vào quá trình phân giải protein và cellulose bằng vi sinh vật, tương tự cơ chế ủ phân hữu cơ nhưng diễn ra trong môi trường ống kín. Vì không có phản ứng hóa học mạnh, enzyme không sinh nhiệt và an toàn với hầu hết vật liệu ống, kể cả ống nhựa PVC đã cũ. Điểm chung của cả bốn nhóm là chúng chỉ tác động lên vật chất có thể hòa tan hoặc phân hủy — hoàn toàn không có tác dụng với dị vật rắn như nhựa, kim loại, vải hoặc đá sỏi lọt vào đường ống.</p>
<h2>Hướng dẫn sử dụng hóa chất thông cống an toàn từng bước</h2>
<p>Bước một, xác định nguồn gốc tắc nghẽn bằng cách quan sát: nước rút chậm dần theo thời gian thường là dấu hiệu tích tụ dầu mỡ hoặc cặn hữu cơ, phù hợp dùng hóa chất; còn nước dừng đột ngột kèm âm thanh lạ thường là dị vật cứng, không nên đổ hóa chất vì sẽ không có tác dụng và gây lãng phí. Bước hai, đeo găng tay cao su và kính bảo hộ trước khi mở nắp chai, vì hầu hết hóa chất thông cống có tính ăn mòn hoặc gây kích ứng da, mắt nếu bắn phải.</p>
<p>Bước ba, đổ đúng liều lượng ghi trên bao bì — thường từ 100 đến 200ml cho một lần xử lý — tuyệt đối không đổ liều gấp đôi để "cho chắc", vì liều quá cao không tăng hiệu quả mà chỉ tăng nguy cơ ăn mòn ống. Bước bốn, để hóa chất tác dụng đúng thời gian khuyến nghị (15-30 phút với kiềm/axit, 6-12 tiếng với enzyme) rồi xả nước nóng hoặc nước thường để kiểm tra. Bước năm, nếu sau hai lần xử lý mà nước vẫn thoát chậm, dừng ngay việc dùng thêm hóa chất và gọi thợ kiểm tra, vì tắc nghẽn khi đó nhiều khả năng do dị vật hoặc hư hỏng đường ống mà hóa chất không xử lý được.</p>
<h2>Tác động của hóa chất thông cống đến đường ống và môi trường</h2>
<p>Sử dụng hóa chất kiềm hoặc axit nhiều lần liên tiếp trên cùng một đoạn ống nhựa PVC có thể làm mềm, giòn hoặc biến dạng thành ống theo thời gian, đặc biệt với ống đã lắp đặt trên 10 năm. Gioăng cao su tại các mối nối cũng dễ bị ăn mòn, dẫn đến rò rỉ âm thầm mà người dùng khó phát hiện ngay. Với ống kim loại (gang, thép mạ kẽm), axit mạnh có thể gây ăn mòn nhanh hơn nhiều so với ống nhựa, rút ngắn tuổi thọ hệ thống thoát nước đáng kể.</p>
<p>Về mặt môi trường, hóa chất kiềm và axit khi xả ra hệ thống thoát nước chung có thể ảnh hưởng đến quá trình xử lý nước thải sinh học ở các trạm xử lý tập trung, vì nồng độ pH quá cao hoặc quá thấp có thể tiêu diệt vi sinh vật có lợi trong bể xử lý. Đây là lý do nhiều đơn vị khuyến cáo ưu tiên enzyme sinh học cho các khu vực có hệ thống xử lý nước thải tại chỗ, hoặc hạn chế tần suất dùng hóa chất mạnh nếu không thật sự cần thiết.</p>
<h2>So sánh chi phí: tự dùng hóa chất và gọi thợ xử lý</h2>
<p>Một chai hóa chất thông cống thông thường có giá 40.000-80.000đ, rẻ hơn nhiều so với chi phí gọi thợ (150.000-300.000đ cho ca thông cống cơ bản). Tuy nhiên, chi phí thực tế cần tính cả rủi ro: nếu dùng sai loại hoặc tắc do dị vật, người dùng có thể tốn 2-3 chai hóa chất (120.000-240.000đ) mà vẫn không xử lý được, sau đó vẫn phải gọi thợ — tổng chi phí khi đó cao hơn gọi thợ ngay từ đầu. Với các ca tắc nhẹ, mới phát sinh và có dấu hiệu rõ là dầu mỡ, dùng hóa chất trước là hợp lý; với ca tắc lâu ngày, tái diễn nhiều lần hoặc nghi có dị vật, gọi thợ kiểm tra ngay sẽ tiết kiệm thời gian và chi phí hơn về lâu dài.</p>
<h2>Bảo quản và xử lý phần dư an toàn</h2>
<p>Chai đựng dung dịch tẩy rửa đường ống nên được cất ở nơi khô ráo, thoáng khí, tránh ánh nắng trực tiếp và xa tầm tay trẻ em. Nắp chai cần đậy kín sau mỗi lần dùng vì hơi bốc lên từ dung dịch kiềm hoặc axit có thể gây kích ứng đường hô hấp nếu hít phải trong không gian kín. Không nên trộn hai loại dung dịch tẩy rửa gốc khác nhau (ví dụ kiềm và axit) vào cùng một thời điểm, vì phản ứng trung hòa đột ngột có thể sinh nhiệt mạnh, bắn tung tóe hoặc tạo khí độc.</p>
<p>Nếu còn dư sau khi dùng, không nên đổ trực tiếp xuống bồn rửa hoặc nguồn nước sinh hoạt; nên pha loãng nhiều lần với nước sạch trước khi xả, hoặc mang đến điểm thu gom chất thải hóa học nếu địa phương có dịch vụ này. Vỏ chai rỗng nên được rửa sạch bằng nước trước khi bỏ vào rác thải sinh hoạt thông thường, tránh để cặn dung dịch còn sót lại gây nguy hiểm cho người thu gom rác.</p>
<h2>Khi nào nên thay ống thay vì tiếp tục xử lý</h2>
<p>Có những trường hợp việc tiếp tục dùng dung dịch tẩy rửa hoặc gọi thợ thông thường không còn là giải pháp bền vững, mà cần cân nhắc thay đoạn ống. Dấu hiệu rõ nhất là tắc nghẽn tái diễn nhiều lần tại cùng một vị trí trong thời gian ngắn (2-3 lần trong vài tháng), cho thấy đoạn ống có thể đã bị lún, nứt hoặc lệch mối nối khiến cặn bẩn dễ tích tụ trở lại dù đã xử lý sạch. Một dấu hiệu khác là ống phát ra mùi hôi liên tục ngay cả khi nước thoát bình thường, thường liên quan đến rò rỉ nhỏ tại mối nối làm khí thoát ngược vào trong nhà.</p>
<p>Với các công trình cũ trên 15-20 năm, đường ống gang hoặc ống nhựa đời đầu thường đã xuống cấp đáng kể; việc liên tục dùng dung dịch tẩy rửa mạnh trong trường hợp này không chỉ kém hiệu quả mà còn đẩy nhanh quá trình ăn mòn, có thể dẫn đến vỡ ống bất ngờ. Khi kiểm tra bằng camera nội soi cho thấy thành ống đã mỏng, có vết nứt dọc hoặc biến dạng rõ, phương án thay thế đoạn ống thường tiết kiệm chi phí hơn về lâu dài so với việc xử lý tạm thời nhiều lần liên tiếp.</p>
<p>Trước khi quyết định thay ống, nên yêu cầu thợ quay video hoặc chụp ảnh kết quả nội soi để đối chiếu, thay vì chỉ nghe mô tả bằng lời. Với đoạn ống ngắn dưới 3 mét và không nằm dưới nền bê tông, phương pháp đào hở thường nhanh và rẻ hơn; với đoạn ống dài hoặc đi qua khu vực khó tiếp cận, phương pháp luồn ống không đào (trenchless) tuy chi phí cao hơn ban đầu nhưng tránh phá dỡ nền nhà, sân vườn hoặc lối đi chung.</p>
`;

function transformContent(raw) {
  let html = raw;
  html = html.replace("\n\n<h2>FAQ", `\n${NEW_SECTION}\n<h2>FAQ`);
  return html;
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: { Authorization: auth, Accept: "application/json", "Content-Type": "application/json", "User-Agent": "TTCQN hoa-chat fix" },
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
  const response = await fetch(url, { headers: { "User-Agent": "TTCQN hoa-chat verifier" }, signal: AbortSignal.timeout(60000) });
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
  const combinedBefore = `${before.title?.raw || ""} ${before.excerpt?.raw || ""} ${raw}`;
  const combinedAfter = `${TITLE} ${META_DESC} ${content}`;

  const stats = {
    before: { wordCount: wordCount(raw), keywordCount: keywordCount(raw, FOCUS_KEYWORD), banned: countMatches(stripText(combinedBefore), /uy tín|chuyên nghiệp|hàng đầu|tận tâm/giu) },
    after: {
      wordCount: wordCount(content),
      keywordCount: keywordCount(content, FOCUS_KEYWORD),
      density: Number(((keywordCount(content, FOCUS_KEYWORD) / wordCount(content)) * 100).toFixed(2)),
      banned: countMatches(stripText(combinedAfter), /uy tín|chuyên nghiệp|hàng đầu|tận tâm/giu),
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
