import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Generic fixer for the "thông tắc bồn cầu <khu vực>" template pages.
// Usage: node tools/fix_bon_cau_area_generic.mjs --config=tools/_area_configs/<slug>.json [--apply]

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";

const configArg = process.argv.find((a) => a.startsWith("--config="))?.split("=")[1];
if (!configArg) throw new Error("Usage: node tools/fix_bon_cau_area_generic.mjs --config=<path.json> [--apply]");
const config = JSON.parse(readFileSync(join(ROOT, configArg), "utf8"));
const { id, collection, slug, area, keyword, title, metaDesc, featuredMedia, extraKeywordMentions = 0 } = config;

const TARGET = { id, collection, slug, url: `${SITE}/${slug}/` };
const FOCUS_KEYWORD = keyword;
const TITLE = title;
const META_DESC = metaDesc;

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-${slug}-${stamp}`);
const reportPath = join(ROOT, "reports", `${slug}-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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

function buildNewSection(area, keyword) {
  return `
<h2>Các loại hình cơ sở tại ${area} thường cần ${keyword}</h2>
<p>Khu vực ${area} tập trung nhiều loại hình lưu trú và kinh doanh khác nhau, mỗi loại có đặc điểm hệ thống thoát nước riêng ảnh hưởng đến tần suất cần ${keyword}. Khách sạn và nhà nghỉ có nhiều bồn cầu dùng chung một trục thoát đứng, nên khi một điểm tắc có thể ảnh hưởng dây chuyền đến các phòng khác nếu không xử lý kịp thời. Nhà hàng và quán ăn thường gặp vấn đề ở cống bếp nhiều hơn là bồn cầu, nhưng dầu mỡ tích tụ lâu ngày trong đường ống chung cũng có thể lan sang gây ảnh hưởng đến hệ thống vệ sinh gần đó.</p>
<p>Với nhà dân và hộ kinh doanh nhỏ tại ${area}, nguyên nhân phổ biến nhất vẫn là dị vật rơi vào bồn cầu hoặc cặn tích tụ theo thời gian sử dụng, tương tự các khu dân cư khác trong tỉnh. Điểm khác biệt là nhiều công trình tại khu du lịch được xây dựng hoặc cải tạo trong thời gian ngắn để kịp phục vụ mùa cao điểm, nên đôi khi đường ống thi công chưa đúng độ dốc chuẩn, khiến ${keyword} cần thực hiện thường xuyên hơn so với khu vực dân cư ổn định lâu năm.</p>
<h2>So sánh bảo trì định kỳ và xử lý khi có sự cố</h2>
<p>Với các cơ sở lưu trú và kinh doanh tại ${area}, bảo trì định kỳ (kiểm tra và thông tắc phòng ngừa mỗi 3-6 tháng) thường tiết kiệm chi phí hơn về lâu dài so với việc chỉ gọi thợ khi đã xảy ra sự cố. Lý do là khi tắc nghẽn xảy ra vào đúng mùa cao điểm hoặc giờ khách đông, chi phí xử lý gấp thường cao hơn, đồng thời ảnh hưởng trực tiếp đến trải nghiệm khách hàng và có thể khiến khách để lại đánh giá không tốt nếu sự cố lặp lại nhiều lần.</p>
<p>Ngược lại, với nhà dân sử dụng bình thường không có lượng khách biến động lớn, xử lý khi có dấu hiệu (thay vì bảo trì định kỳ cố định) thường là lựa chọn hợp lý hơn về chi phí, vì tần suất sự cố thấp hơn nhiều so với cơ sở kinh doanh. Dù chọn phương án nào, việc gọi ${keyword} ngay khi thấy dấu hiệu rút chậm ban đầu luôn giúp xử lý đơn giản và tốn ít chi phí hơn so với để tắc nghẽn hoàn toàn rồi mới liên hệ.</p>
<h2>Lưu ý khi thi công tại khu vực đông khách du lịch</h2>
<p>Khi thực hiện ${keyword} tại các cơ sở đang hoạt động kinh doanh, đội thợ ưu tiên chọn khung giờ ít ảnh hưởng đến khách lưu trú, thường là buổi sáng sớm hoặc giữa giờ chiều khi phòng ít người sử dụng nhất. Với các hạng mục cần thời gian xử lý lâu hơn (như hút bể phốt kết hợp thông ống), nên trao đổi trước với thợ để sắp xếp lịch phù hợp, tránh làm gián đoạn giờ nhận phòng hoặc giờ ăn của khách.</p>
<p>Đội thợ cũng lưu ý giữ gìn vệ sinh khu vực làm việc trong suốt quá trình thi công, sử dụng tấm lót bảo vệ sàn và thu dọn dụng cụ ngay sau khi hoàn tất, tránh để lại mùi hôi hoặc dấu vết ảnh hưởng đến hình ảnh cơ sở kinh doanh. Với các tòa nhà có nhiều đơn vị thuê hoặc quản lý chung, nên thông báo trước cho ban quản lý về thời gian thi công nếu cần tắt nước tạm thời ở khu vực liên quan.</p>
<h2>Câu hỏi mở rộng về ${keyword}</h2>
<p>Nhiều khách hàng thắc mắc liệu có thể tự xử lý trước khi gọi ${keyword} hay không. Với tắc nhẹ mới phát sinh, có thể thử búng cao su hoặc đổ nước ấm trong 10-15 phút; nếu không cải thiện, nên dừng lại và gọi thợ thay vì tiếp tục thử nhiều cách khác nhau có thể làm dị vật lọt sâu hơn vào đường ống, khiến việc xử lý sau này tốn thời gian và chi phí hơn.</p>
<p>Một câu hỏi khác thường gặp là mức độ ảnh hưởng đến hoạt động kinh doanh trong lúc thi công. Với đa số ca xử lý qua bệ xả, thời gian thi công chỉ khoảng 30-60 phút và không cần tắt nước toàn bộ khu vực; chỉ những ca phức tạp cần mở hố ga hoặc hút bể phốt mới cần thời gian dài hơn và có thể ảnh hưởng tạm thời đến một vài phòng hoặc khu vực liên quan trực tiếp đến điểm xử lý.</p>
<h2>Thiết bị và kỹ thuật sử dụng khi xử lý tại ${area}</h2>
<p>Đội thợ mang theo đầy đủ thiết bị cho từng mức độ tắc nghẽn khi nhận ca ${keyword}: búng cao su cho tắc nhẹ gần bệ xả, cần lò xo điện dài 1-3 mét cho tắc trung bình sâu trong đường ống, và máy bơm áp lực nước cho các ca cặn bám dày hoặc cần làm sạch triệt để cả đoạn ống dài. Với các cơ sở lớn như khách sạn nhiều tầng, đội thợ có thể mang thêm camera nội soi để xác định chính xác vị trí tắc trước khi chọn phương án, tránh xử lý dò tìm mất thời gian.</p>
<p>Việc lựa chọn đúng thiết bị ngay từ đầu không chỉ rút ngắn thời gian thi công mà còn giảm nguy cơ làm hỏng thiết bị vệ sinh hoặc đường ống trong quá trình xử lý. Đây là lý do đội thợ luôn khảo sát nhanh trước khi quyết định dùng công cụ nào, thay vì áp dụng một cách xử lý duy nhất cho mọi tình huống ${keyword} gặp phải tại hiện trường.</p>
<h2>Kinh nghiệm phòng ngừa tắc nghẽn cho chủ cơ sở kinh doanh</h2>
<p>Chủ khách sạn, nhà hàng và homestay tại ${area} có thể giảm đáng kể tần suất cần gọi thợ bằng vài thói quen đơn giản. Nên nhắc nhở nhân viên dọn phòng kiểm tra và loại bỏ vật dụng lạ trong bồn cầu sau mỗi lượt khách trả phòng, đặc biệt với các loại hình lưu trú có khách du lịch nước ngoài thường quen dùng giấy ướt hoặc vật dụng vệ sinh cá nhân khác với thói quen sử dụng bồn cầu tại địa phương.</p>
<p>Với hệ thống bể phốt phục vụ nhiều phòng, nên lập lịch hút định kỳ trước mùa cao điểm du lịch thay vì chờ đến khi có dấu hiệu đầy hoặc tràn. Chi phí bảo trì phòng ngừa thường thấp hơn nhiều so với chi phí xử lý khẩn cấp khi sự cố xảy ra đúng lúc khách đông, đồng thời tránh được tình huống phải tạm ngừng đón khách hoặc phục vụ để xử lý sự cố gấp giữa mùa kinh doanh cao điểm.</p>
<p>Ngoài ra, nên lưu lại lịch sử các lần xử lý trước đó (ngày, vị trí, nguyên nhân) để đội thợ tham khảo khi có sự cố tái diễn, giúp rút ngắn thời gian khảo sát và xác định phương án phù hợp nhanh hơn trong những lần gọi dịch vụ tiếp theo tại cùng cơ sở.</p>
<h2>Những câu hỏi khách hàng thường đặt ra trước khi gọi thợ</h2>
<p>Trước khi quyết định gọi ${keyword}, nhiều khách hàng muốn biết trước mức giá tham khảo và thời gian xử lý dự kiến để sắp xếp công việc. Đội điều phối luôn cố gắng đưa ra khoảng giá sơ bộ qua điện thoại dựa trên mô tả tình trạng, nhưng giá chính xác chỉ được chốt sau khi thợ khảo sát trực tiếp, vì mức độ tắc nghẽn thực tế đôi khi khác với mô tả ban đầu của khách hàng do khó quan sát từ xa.</p>
<p>Một câu hỏi khác thường gặp là liệu có cần chuẩn bị gì trước khi thợ đến hay không. Với đa số trường hợp, khách hàng chỉ cần đảm bảo lối vào khu vực bồn cầu không bị vật cản, và nếu có thể, nên dọn sẵn khăn hoặc chậu nhỏ để hạn chế nước bắn ra ngoài trong quá trình xử lý. Với các ca liên quan đến bể phốt, nên xác định trước vị trí nắp bể nếu biết, giúp thợ tiếp cận nhanh hơn và rút ngắn tổng thời gian thi công tại hiện trường.</p>
<p>Sau khi hoàn tất, đội thợ luôn xả nước kiểm tra nhiều lần để xác nhận dòng thoát đã ổn định trước khi bàn giao, đồng thời hướng dẫn khách hàng cách quan sát dấu hiệu tái phát sớm nếu có, giúp chủ động liên hệ ${keyword} lại sớm hơn ngay khi tình trạng vừa xuất hiện trở lại thay vì chờ đến khi tắc nghẽn nặng hơn rồi mới xử lý, vừa tốn thời gian vừa tốn thêm chi phí không cần thiết.</p>
`;
}

function transformContent(raw, area, keyword) {
  let html = raw;
  const section = buildNewSection(area, keyword);
  const marker = html.includes("<h2>Case Study") ? "<h2>Case Study" : html.includes("Case Study E-E-A-T") ? null : null;
  if (html.includes("<h2>Case Study")) {
    html = html.replace("<h2>Case Study", `${section}\n<h2>Case Study`);
  } else {
    throw new Error("Could not find insertion marker '<h2>Case Study' in content");
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
    headers: { Authorization: auth, Accept: "application/json", "Content-Type": "application/json", "User-Agent": `TTCQN ${slug} fix` },
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
  const response = await fetch(url, { headers: { "User-Agent": `TTCQN ${slug} verifier` }, signal: AbortSignal.timeout(60000) });
  const html = await response.text();
  const metaDesc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/iu)?.[1] || "").trim();
  return { status: response.status, length: html.length, metaDescLen: [...metaDesc].length, hasFocusKeyword: html.includes(FOCUS_KEYWORD) };
}

async function main() {
  mkdirSync(dirname(reportPath), { recursive: true });

  const before = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
  if (before.slug !== TARGET.slug || before.status !== "publish") throw new Error(`Unexpected target state: ${before.slug}/${before.status}`);

  const raw = before.content?.raw || "";
  const content = transformContent(raw, area, keyword);

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

    const body = { title: TITLE, excerpt: META_DESC, content };
    if (featuredMedia) body.featured_media = featuredMedia;
    await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}`, { method: "POST", body });

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
