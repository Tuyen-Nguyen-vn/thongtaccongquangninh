import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = { id: 2043, collection: "posts", slug: "bon-cau-rut-cham-nguyen-nhan", url: `${SITE}/bon-cau-rut-cham-nguyen-nhan/` };
const FOCUS_KEYWORD = "bồn cầu rút chậm nguyên nhân";
const TITLE = "Bồn Cầu Rút Chậm Nguyên Nhân Là Gì Và Cách Xử Lý Dứt Điểm Tại Nhà";
const META_DESC =
  "Bồn cầu rút chậm nguyên nhân từ cặn canxi, dị vật, xi phông kém. Thợ Quảng Ninh xử lý 15-30 phút, báo giá trước khi làm. Gọi 0963.953.533 / 0931.156.756.";

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-bon-cau-rut-cham-${stamp}`);
const reportPath = join(ROOT, "reports", `bon-cau-rut-cham-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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
<h2>Các loại cặn và dị vật thường gặp trong bồn cầu</h2>
<p>Cặn canxi hình thành do nước cứng chứa nhiều ion canxi và magiê, khi tiếp xúc lâu với không khí và nhiệt độ trong đường ống sẽ kết tủa thành lớp vảy trắng bám chặt vào thành ống sứ và ống nhựa. Lớp cặn này dày dần theo từng năm, ban đầu chỉ vài milimét nhưng có thể dày tới 4-5mm sau 4-5 năm không vệ sinh sâu, làm thu hẹp đáng kể tiết diện đường thoát nước dù bề ngoài bồn cầu vẫn trông sạch sẽ.</p>
<p>Dị vật rơi vào bồn cầu thường gặp gồm giấy ướt loại không tan trong nước (khác với giấy vệ sinh chuyên dụng), tăm bông, băng vệ sinh, đồ chơi nhỏ của trẻ em, hoặc nắp chai. Những vật này thường mắc kẹt tại đoạn cong hình chữ P hoặc chữ S ngay dưới bệ xả — vị trí có thiết kế giữ nước để ngăn mùi hôi, đồng thời cũng là nơi dễ giữ lại dị vật nhất trong toàn bộ hệ thống thoát nước của bồn cầu.</p>
<h2>Cách tự kiểm tra nguyên nhân tại nhà trước khi gọi thợ</h2>
<p>Trước khi quyết định tự xử lý hay gọi thợ, có thể thực hiện vài bước kiểm tra đơn giản. Đầu tiên, quan sát tốc độ nước xoáy khi xả: nếu nước xoáy yếu và rút từ từ đều đặn, khả năng cao là cặn bám lâu ngày; nếu nước xoáy bình thường nhưng đột ngột dừng lại giữa chừng, khả năng cao là dị vật mắc kẹt cục bộ. Thứ hai, thử đổ khoảng 2-3 lít nước ấm (không sôi, tránh làm nứt sứ) trực tiếp vào lòng bồn từ độ cao khoảng 30cm để tạo áp lực tự nhiên, quan sát xem tốc độ thoát có cải thiện không.</p>
<p>Thứ ba, kiểm tra các bồn cầu hoặc thiết bị thoát nước khác trong nhà (bồn rửa, thoát sàn) xem có cùng bị chậm không; nếu chỉ riêng bồn cầu bị ảnh hưởng thì nguyên nhân thường nằm ngay tại đường ống riêng của bồn, còn nếu nhiều thiết bị cùng chậm thì khả năng cao liên quan đến đường ống chính hoặc hố ga chung, cần thợ có thiết bị chuyên dụng để kiểm tra sâu hơn.</p>
<h2>So sánh các phương pháp xử lý bồn cầu rút chậm</h2>
<p>Búng cao su (plunger) là phương pháp đơn giản nhất, dùng lực hút-đẩy để làm lỏng dị vật hoặc cặn mềm ở đoạn cong gần bệ xả; hiệu quả với tắc nhẹ mới phát sinh nhưng gần như vô dụng với cặn canxi đã cứng hóa. Cần thông lò xo (plumbing snake) có thể luồn sâu 1-3 mét vào đường ống, vừa phá vỡ cặn cứng vừa móc được dị vật mắc kẹt, phù hợp với đa số ca tắc trung bình đến nặng mà không cần tháo bồn cầu.</p>
<p>Máy áp lực nước dùng vòi phun tia nước công suất cao (100-250 bar) để xé rách cặn bám và đẩy trôi dị vật nhỏ theo dòng nước, phù hợp với đường ống dài hoặc khi cần làm sạch triệt để cả đoạn ống chứ không chỉ điểm tắc cục bộ. Với trường hợp cặn canxi bám quá dày hoặc dị vật lớn kẹt sâu, có thể cần tháo bồn cầu ra khỏi bệ để tiếp cận trực tiếp đường cong bên trong — đây là phương án cuối cùng, chỉ áp dụng khi các cách trên không hiệu quả.</p>
<h2>Cách phòng ngừa bồn cầu rút chậm tái phát</h2>
<p>Để hạn chế cặn canxi tích tụ nhanh, nên vệ sinh bồn cầu định kỳ 2-3 tuần một lần bằng bàn chải chuyên dụng kết hợp dung dịch tẩy nhẹ, tập trung vào vùng ngay dưới vành bệ và đoạn ống có thể quan sát được. Với khu vực có nước cứng như nhiều nơi tại Quảng Ninh, có thể cân nhắc lắp thêm thiết bị làm mềm nước tại đầu nguồn để giảm tốc độ hình thành cặn khoáng trong toàn bộ hệ thống ống nước, không chỉ riêng bồn cầu.</p>
<p>Về thói quen sử dụng, chỉ nên xả giấy vệ sinh chuyên dụng có khả năng tan trong nước; các loại giấy ướt, khăn giấy lau mặt, băng vệ sinh nên bỏ vào thùng rác riêng thay vì xả trực tiếp. Với gia đình có trẻ nhỏ, nên nhắc nhở và giám sát để tránh tình trạng đồ chơi hoặc vật dụng nhỏ rơi vào bồn cầu — nguyên nhân phổ biến gây tắc nghẽn đột ngột và khó xử lý hơn cặn bám thông thường rất nhiều.</p>
<h2>Bồn cầu rút chậm nguyên nhân theo từng loại nhà ở</h2>
<p>Với nhà ống liền kề tại các khu dân cư cũ ở Hạ Long hoặc Cẩm Phả, bồn cầu rút chậm nguyên nhân thường liên quan đến đường ống nằm ngang dài, độ dốc không đủ do thi công từ nhiều năm trước, khiến cặn dễ lắng đọng dọc đường ống thay vì trôi hết ra hố ga. Với chung cư cao tầng, bồn cầu rút chậm nguyên nhân phổ biến hơn lại là do trục thoát đứng chung của cả tòa nhà bị ảnh hưởng bởi rác hoặc dầu mỡ từ các căn hộ khác, khiến áp suất thoát nước toàn hệ thống giảm chứ không chỉ riêng một căn.</p>
<p>Với biệt thự hoặc nhà có sân vườn riêng, bồn cầu rút chậm nguyên nhân đôi khi đến từ bể phốt đã gần đầy nhưng chưa có dấu hiệu tràn rõ rệt, khiến nước thoát chậm dần đều ở tất cả các thiết bị vệ sinh trong nhà chứ không riêng bồn cầu. Trường hợp này cần kiểm tra mực nước trong bể phốt trước khi kết luận nguyên nhân nằm ở đường ống hay ở bể chứa, vì hai hướng xử lý hoàn toàn khác nhau về chi phí và thời gian.</p>
<h2>Những sai lầm thường gặp khi tự xử lý bồn cầu rút chậm</h2>
<p>Sai lầm phổ biến nhất là đổ liên tục nhiều loại hóa chất tẩy rửa khác nhau vào cùng một lần, với suy nghĩ "càng nhiều càng hiệu quả". Thực tế, trộn lẫn hóa chất gốc axit và gốc kiềm có thể sinh phản ứng hóa học không kiểm soát, tạo khí có mùi khó chịu hoặc ăn mòn nhanh hơn cả hai loại dùng riêng lẻ. Ngoài ra, việc dùng dụng cụ kim loại cứng như móc áo hoặc que sắt để chọc thông có thể làm trầy xước hoặc nứt men sứ bên trong lòng bồn, tạo ra các khe nhỏ khiến cặn bám nhanh hơn về sau dù đã xử lý xong lần tắc hiện tại.</p>
<p>Một sai lầm khác là bỏ qua giai đoạn quan sát ban đầu và vội vàng dùng lực mạnh với búng cao su ngay khi chưa xác định rõ bồn cầu rút chậm nguyên nhân do đâu, dẫn đến đẩy dị vật vào sâu hơn thay vì kéo ra ngoài, khiến việc xử lý sau này khó khăn hơn nhiều. Với các ca tắc nhẹ mới xuất hiện, nên thử phương án đơn giản trước (nước ấm, búng cao su đúng kỹ thuật) trong khoảng 10-15 phút; nếu không cải thiện, dừng lại và gọi thợ thay vì tiếp tục thử nhiều cách khác nhau có thể gây hư hại thêm cho thiết bị vệ sinh.</p>
<h2>Chi phí thực tế theo mức độ bồn cầu rút chậm</h2>
<p>Chi phí xử lý bồn cầu rút chậm nguyên nhân dao động khá lớn tùy mức độ nghiêm trọng. Với tắc nhẹ do cặn xà phòng hoặc dị vật mềm gần bệ xả, chi phí thường ở mức thấp nhất trong bảng giá vì chỉ cần dụng cụ đơn giản và thời gian xử lý ngắn. Với cặn canxi dày tích tụ nhiều năm, chi phí tăng do cần thiết bị chuyên dụng như máy áp lực nước hoặc cần lò xo dài, đồng thời thời gian xử lý cũng kéo dài hơn để đảm bảo làm sạch triệt để thay vì chỉ thông tạm thời.</p>
<p>Trường hợp phức tạp nhất là khi bồn cầu rút chậm nguyên nhân liên quan đến ống thông hơi tắc hoặc trục thoát đứng chung cư, vì cần kiểm tra và xử lý ở phạm vi rộng hơn một thiết bị đơn lẻ, đôi khi phải phối hợp với ban quản lý tòa nhà hoặc các hộ liền kề để xác định điểm tắc chính xác. Trong mọi trường hợp, nên yêu cầu thợ khảo sát và báo giá cụ thể trước khi đồng ý thi công, tránh tình trạng phát sinh chi phí ngoài dự kiến sau khi công việc đã bắt đầu.</p>
`;

function transformContent(raw) {
  let html = raw;

  html = html.replace(
    "Với cặn canxi hoặc dị vật cứng – nguyên nhân bồn cầu rút chậm phổ biến hơn – cần dụng cụ chuyên nghiệp.",
    "Với cặn canxi hoặc dị vật cứng – nguyên nhân bồn cầu rút chậm phổ biến hơn – cần dụng cụ chuyên dụng.",
  );

  html = html.replace("<h2>FAQ – Câu Hỏi", `${NEW_SECTION}\n<h2>FAQ – Câu Hỏi`);

  const inject = [
    [
      "Trước khi quyết định tự xử lý hay gọi thợ, có thể thực hiện vài bước kiểm tra đơn giản.",
      "Trước khi quyết định tự xử lý hay gọi thợ để xác định bồn cầu rút chậm nguyên nhân, có thể thực hiện vài bước kiểm tra đơn giản.",
    ],
    [
      "Búng cao su (plunger) là phương pháp đơn giản nhất, dùng lực hút-đẩy để làm lỏng dị vật hoặc cặn mềm ở đoạn cong gần bệ xả;",
      "Khi đã xác định được bồn cầu rút chậm nguyên nhân, búng cao su (plunger) là phương pháp đơn giản nhất, dùng lực hút-đẩy để làm lỏng dị vật hoặc cặn mềm ở đoạn cong gần bệ xả;",
    ],
    [
      "Để hạn chế cặn canxi tích tụ nhanh, nên vệ sinh bồn cầu định kỳ 2-3 tuần một lần",
      "Để hạn chế cặn canxi tích tụ nhanh — một trong những bồn cầu rút chậm nguyên nhân phổ biến nhất — nên vệ sinh bồn cầu định kỳ 2-3 tuần một lần",
    ],
  ];
  for (const [from, to] of inject) {
    if (!html.includes(from)) throw new Error(`Inject anchor not found: ${from.slice(0, 40)}...`);
    html = html.replace(from, to);
  }

  return html;
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: { Authorization: auth, Accept: "application/json", "Content-Type": "application/json", "User-Agent": "TTCQN bon-cau-rut-cham fix" },
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
  const response = await fetch(url, { headers: { "User-Agent": "TTCQN bon-cau-rut-cham verifier" }, signal: AbortSignal.timeout(60000) });
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

  const stats = {
    before: { wordCount: wordCount(raw), keywordCount: keywordCount(raw, FOCUS_KEYWORD) },
    after: {
      wordCount: wordCount(content),
      keywordCount: keywordCount(content, FOCUS_KEYWORD),
      density: Number(((keywordCount(content, FOCUS_KEYWORD) / wordCount(content)) * 100).toFixed(2)),
      banned: countMatches(stripText(content), /uy tín|chuyên nghiệp|hàng đầu|tận tâm/giu),
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
