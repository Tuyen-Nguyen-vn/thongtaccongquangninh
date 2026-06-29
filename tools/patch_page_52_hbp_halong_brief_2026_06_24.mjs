/**
 * Incremental patch for PAGE id=52 /hut-be-phot-ha-long/ from the latest SEO brief.
 *
 * Dry-run:
 *   node tools/patch_page_52_hbp_halong_brief_2026_06_24.mjs
 *
 * Apply:
 *   node tools/patch_page_52_hbp_halong_brief_2026_06_24.mjs --write
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ENV_PATH = "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 52;
const URL_PATH = "/hut-be-phot-ha-long/";
const CSV_PATH = "docs/SEO_PROGRESS.csv";

const SEO_TITLE = "Hút bể phốt Hạ Long giá minh bạch, có mặt nhanh tại Bãi Cháy, Hồng Gai";
const NEW_H1 = "Hút bể phốt Hạ Long giá minh bạch, hỗ trợ nhanh tại nhà dân và cơ sở kinh doanh";
const META_DESCRIPTION = "Dịch vụ hút bể phốt Hạ Long hỗ trợ nhanh tại Bãi Cháy, Hồng Gai, Tuần Châu, Cao Xanh, Hà Khánh. Báo giá theo vị trí, quy trình rõ, gọi là được hướng dẫn.";
const FOCUS_KEYWORD = "hút bể phốt Hạ Long";

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpRest(method, wpPath, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + wpPath,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "patch-hbp-halong-brief/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function liveGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: pathname,
      method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "verify-hbp-halong-brief/1.0" },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, location: res.headers.location || "", data }));
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function cleanText(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function replaceBetween(source, start, end, replacement, label) {
  const startAt = source.indexOf(start);
  if (startAt === -1) throw new Error(`Missing start: ${label}`);
  const endAt = source.indexOf(end, startAt);
  if (endAt === -1) throw new Error(`Missing end: ${label}`);
  return source.slice(0, startAt) + replacement + source.slice(endAt);
}

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`Missing block: ${label}`);
  return source.replace(from, to);
}

const intro = `<p><strong>Hút bể phốt Hạ Long</strong> hỗ trợ nhà dân, khách sạn, homestay, nhà hàng, khu trọ và cơ sở kinh doanh tại Bãi Cháy, Hồng Gai, Tuần Châu, Cao Xanh, Hà Khánh. Khi bồn cầu rút chậm, nhà vệ sinh bốc mùi, hố ga đầy hoặc nước thải bắt đầu trào ngược, anh/chị nên gọi kiểm tra sớm để tránh tràn bẩn và phát sinh thêm chi phí.</p>

<p>Mỗi địa chỉ có lối xe vào, độ dốc, vị trí nắp bể và khoảng kéo ống khác nhau nên giá cần báo theo thực tế. Gọi <strong>0963.953.533 / 0931.156.756</strong> để được hỏi nhanh tình trạng, hướng dẫn chuẩn bị trước khi xe đến và báo giá rõ ràng trước khi thi công.</p>`;

const urgentSection = `<h2>Hút bể phốt Hạ Long khi nào cần gọi ngay?</h2>

<p>Anh/chị nên gọi kiểm tra ngay khi sự cố ảnh hưởng sinh hoạt, khu kinh doanh hoặc khu lưu trú có khách. Các dấu hiệu bể phốt đầy, trào ngược, bốc mùi thường không tự hết nếu nguyên nhân nằm ở bể, hố ga hoặc đường ống chính.</p>

<ul>
<li>Bồn cầu rút chậm, nước xoáy yếu hoặc phát tiếng sùng sục sau khi xả.</li>
<li>Nhà vệ sinh, thoát sàn hoặc hố ga ngoài sân có mùi hôi kéo dài.</li>
<li>Nước trào ngược ở bồn cầu, chậu rửa, thoát sàn hoặc nhiều điểm cùng lúc.</li>
<li>Hố ga có mực nước cao bất thường, có váng bẩn hoặc bùn nổi.</li>
<li>Bể đã 3-5 năm chưa hút, hoặc số người sử dụng tăng mạnh trong thời gian gần đây.</li>
<li>Nhà hàng, khách sạn, homestay, khu trọ bắt đầu xuất hiện mùi trong giờ cao điểm.</li>
</ul>

<p>Nếu chỉ một bồn cầu bị nghẹt do giấy hoặc dị vật, có thể là tắc cục bộ. Nếu nhiều điểm thoát cùng chậm, khả năng cao liên quan đến bể phốt, hố ga hoặc đường ống chính. Khi chưa chắc nguyên nhân, anh/chị nên gọi để được hỏi nhanh theo từng dấu hiệu.</p>
`;

const faq = `<h2>Câu hỏi thường gặp về hút bể phốt Hạ Long</h2>

<h3>Hút bể phốt Hạ Long có báo giá trước khi làm không?</h3>
<p>Có. Kỹ thuật sẽ hỏi nhanh địa chỉ, lối xe vào, vị trí nắp bể và tình trạng hiện tại để báo giá rõ ràng trước khi thi công. Nếu đến nơi phát sinh hạng mục khác, thợ phải nói lại phương án và chi phí trước khi làm.</p>

<h3>Nhà trong ngõ nhỏ hoặc đường dốc ở Hạ Long có làm được không?</h3>
<p>Có thể làm được, nhưng cần biết trước điểm xe đỗ và khoảng cách kéo ống để chuẩn bị phương án phù hợp. Anh/chị nên gửi ảnh cổng nhà, lối vào và vị trí nghi là nắp bể trước khi xe đến.</p>

<h3>Bao lâu nên hút bể phốt một lần?</h3>
<p>Thông thường khoảng 3-5 năm, tuy nhiên nhà trọ, khách sạn, nhà hàng hoặc nơi đông người có thể cần kiểm tra sớm hơn. Theo cấu tạo của <a href="https://vi.wikipedia.org/wiki/B%E1%BB%83_t%E1%BB%B1_ho%E1%BA%A1i">bể tự hoại</a>, lớp bùn tích tụ đáy bể quyết định chu kỳ hút.</p>

<h3>Dấu hiệu nào cho thấy cần gọi hút bể phốt ngay?</h3>
<p>Bồn cầu rút chậm, mùi hôi kéo dài, nước trào ngược, hố ga đầy hoặc nhiều điểm thoát nước cùng chậm là các dấu hiệu cần kiểm tra sớm. Nếu tiếp tục xả nước, nước bẩn có thể tràn rộng và làm chi phí xử lý tăng.</p>

<h3>Có phục vụ ngoài giờ hoặc cuối tuần không?</h3>
<p>Có thể sắp lịch ngoài giờ hoặc cuối tuần, nhưng nên gọi trước nếu công trình nằm trong khu lưu trú đông khách, nhà hàng đang giờ phục vụ hoặc đường vào cần điều phối xe. Việc báo trước giúp chọn khung giờ ít ảnh hưởng nhất.</p>

<h3>Nếu chưa xác định được nắp bể thì có xử lý được không?</h3>
<p>Được, nhưng nên gửi trước ảnh sân, nhà vệ sinh, hố ga hoặc bản vẽ nếu còn để kỹ thuật khoanh vùng nhanh hơn. Nếu nắp bể bị lát kín, thợ sẽ tư vấn điểm tiếp cận phù hợp để hạn chế mở nền không cần thiết.</p>`;

const schema = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://thongtaccongquangninh.com/#localbusiness",
      "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
      "telephone": "+84963953533",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Quảng Ninh",
        "addressCountry": "VN"
      },
      "areaServed": "Hạ Long",
      "url": "https://thongtaccongquangninh.com/"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Trang chủ",
          "item": "https://thongtaccongquangninh.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Hút bể phốt Hạ Long",
          "item": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/#service",
      "name": "Hút bể phốt Hạ Long",
      "serviceType": "Hút bể phốt",
      "provider": {
        "@id": "https://thongtaccongquangninh.com/#localbusiness"
      },
      "areaServed": [
        "Hạ Long",
        "Bãi Cháy",
        "Hồng Gai",
        "Tuần Châu",
        "Cao Xanh",
        "Hà Khánh",
        "Hà Khẩu",
        "Giếng Đáy",
        "Việt Hưng"
      ],
      "url": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/",
      "description": "Hút bể phốt Hạ Long hỗ trợ nhanh tại Bãi Cháy, Hồng Gai, Tuần Châu, Cao Xanh, Hà Khánh. Báo giá theo vị trí thực tế và quy trình rõ ràng."
    },
    {
      "@type": "FAQPage",
      "@id": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Hút bể phốt Hạ Long có báo giá trước khi làm không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Có. Kỹ thuật sẽ hỏi nhanh địa chỉ, lối xe vào, vị trí nắp bể và tình trạng hiện tại để báo giá rõ ràng trước khi thi công."
          }
        },
        {
          "@type": "Question",
          "name": "Nhà trong ngõ nhỏ hoặc đường dốc ở Hạ Long có làm được không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Có thể làm được, nhưng cần biết trước điểm xe đỗ và khoảng cách kéo ống để chuẩn bị phương án phù hợp."
          }
        },
        {
          "@type": "Question",
          "name": "Bao lâu nên hút bể phốt một lần?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Thông thường khoảng 3-5 năm, tuy nhiên nhà trọ, khách sạn, nhà hàng hoặc nơi đông người có thể cần kiểm tra sớm hơn."
          }
        },
        {
          "@type": "Question",
          "name": "Dấu hiệu nào cho thấy cần gọi hút bể phốt ngay?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bồn cầu rút chậm, mùi hôi kéo dài, nước trào ngược, hố ga đầy hoặc nhiều điểm thoát nước cùng chậm là các dấu hiệu cần kiểm tra sớm."
          }
        },
        {
          "@type": "Question",
          "name": "Có phục vụ ngoài giờ hoặc cuối tuần không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Có thể sắp lịch ngoài giờ hoặc cuối tuần, nhưng nên gọi trước nếu công trình nằm trong khu lưu trú đông khách hoặc nhà hàng đang giờ phục vụ."
          }
        },
        {
          "@type": "Question",
          "name": "Nếu chưa xác định được nắp bể thì có xử lý được không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Được, nhưng nên gửi trước ảnh sân, nhà vệ sinh, hố ga hoặc bản vẽ nếu còn để kỹ thuật khoanh vùng nhanh hơn."
          }
        }
      ]
    }
  ]
}
</script>`;

const ctaAndLinks = `<!-- wp:paragraph -->
<p>Cần hút bể phốt Hạ Long cho nhà dân, khách sạn, homestay, nhà hàng hoặc khu trọ? Gọi <strong>0963.953.533 / 0931.156.756</strong> để được hỏi nhanh tình trạng, hướng dẫn chuẩn bị trước khi xe đến và báo giá rõ ràng theo địa chỉ thực tế.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<ul>
<li>Tham khảo chi phí: <a href="https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh/">bảng giá hút bể phốt Quảng Ninh</a></li>
<li>Nếu bồn cầu nghẹt: <a href="https://thongtaccongquangninh.com/thong-tac-bon-cau-ha-long/">thông tắc bồn cầu Hạ Long</a></li>
<li>Dịch vụ tổng: <a href="https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a></li>
<li>Nếu cống thoát chậm: <a href="https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/">thông tắc cống Quảng Ninh</a></li>
<li>Cho cơ sở lưu trú: <a href="https://thongtaccongquangninh.com/hut-be-phot-khach-san-quang-ninh/">hút bể phốt khách sạn, nhà hàng</a></li>
<li>Xử lý mùi: <a href="https://thongtaccongquangninh.com/xu-ly-mui-hoi-quang-ninh/">xử lý mùi hôi nhà vệ sinh và hố ga</a></li>
<li>Đặt lịch khảo sát: <a href="https://thongtaccongquangninh.com/lien-he/">liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh</a></li>
</ul>
<!-- /wp:html -->

<!-- wp:paragraph -->
<p>Nguồn tham khảo: <a href="https://vi.wikipedia.org/wiki/B%E1%BB%83_t%E1%BB%B1_ho%E1%BA%A1i" target="_blank" rel="noopener">Bể tự hoại - Wikipedia tiếng Việt</a> - cơ chế hoạt động và tiêu chuẩn dung tích bể phốt theo quy chuẩn xây dựng.</p>
<!-- /wp:paragraph -->`;

function patchContent(raw) {
  let next = raw;
  const introEnd = next.indexOf('<figure class="wp-block-image size-large">');
  if (introEnd === -1) throw new Error("Missing first figure after intro");
  next = intro + "\n\n" + next.slice(introEnd);

  next = next.replace(
    "<h2>Nguyên nhân bể phốt tại Hạ Long nhanh đầy hoặc trào ngược</h2>",
    "<h2>Nguyên nhân bể phốt tại Hạ Long nhanh đầy theo từng loại công trình</h2>"
  );

  next = replaceBetween(
    next,
    "<h2>Dấu hiệu cần gọi xe hút bể phốt Hạ Long sớm</h2>",
    "<h2>Bảng giá hút bể phốt Hạ Long phụ thuộc yếu tố nào?</h2>",
    urgentSection,
    "urgent signs section"
  );

  next = replaceBetween(
    next,
    '<h2>Câu hỏi thường gặp về hút bể phốt Hạ Long</h2>',
    '<!-- wp:paragraph -->\n<p>Cần hút bể phốt Hạ Long',
    faq + "\n\n" + schema + "\n\n",
    "faq+schema"
  );

  next = replaceBetween(
    next,
    '<!-- wp:paragraph -->\n<p>Cần hút bể phốt Hạ Long',
    '<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao ttcqn-author-byline"} -->',
    ctaAndLinks + "\n",
    "cta+links"
  );

  return next;
}

function countVisibleFaqs(html) {
  return [
    "Hút bể phốt Hạ Long có báo giá trước khi làm không?",
    "Nhà trong ngõ nhỏ hoặc đường dốc ở Hạ Long có làm được không?",
    "Bao lâu nên hút bể phốt một lần?",
    "Dấu hiệu nào cho thấy cần gọi hút bể phốt ngay?",
    "Có phục vụ ngoài giờ hoặc cuối tuần không?",
    "Nếu chưa xác định được nắp bể thì có xử lý được không?",
  ].filter((q) => html.includes(q)).length;
}

async function checkInternalLinks(paths) {
  const out = [];
  for (const p of paths) {
    const r = await liveGet(p);
    out.push({ path: p, status: r.status, location: r.location });
  }
  return out;
}

const page = await wpRest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`);
if (page.status !== 200) {
  console.error("GET page failed:", page.status, JSON.stringify(page.data).slice(0, 300));
  process.exit(1);
}

const rawContent = page.data?.content?.raw ?? "";
const patchedContent = patchContent(rawContent);
const backupDir = path.join("backups", "wp-page-52-hbp-halong-2026-06-24");
mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `page-52-before-brief-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(backupPath, JSON.stringify(page.data, null, 2), "utf8");

console.log(`Mode: ${WRITE ? "WRITE" : "DRY-RUN"}`);
console.log(`Backup: ${backupPath}`);
console.log(`Old chars: ${rawContent.length}`);
console.log(`New chars: ${patchedContent.length}`);
console.log(`Delta: ${patchedContent.length - rawContent.length}`);
console.log(`SEO title length: ${[...SEO_TITLE].length}`);
console.log(`H1 length: ${[...NEW_H1].length}`);
console.log(`Meta description length: ${[...META_DESCRIPTION].length}`);
console.log(`Raw H1 count after patch: ${(patchedContent.match(/<h1\b/gi) || []).length}`);
console.log(`Visible FAQ count after patch: ${countVisibleFaqs(patchedContent)}/6`);

if (!WRITE) {
  console.log("Dry-run only. Add --write to update WordPress.");
  process.exit(0);
}

const update = await wpRest("POST", `/wp/v2/pages/${PAGE_ID}`, {
  title: NEW_H1,
  content: patchedContent,
  excerpt: META_DESCRIPTION,
});
if (update.status !== 200) {
  console.error("Update page failed:", update.status, JSON.stringify(update.data).slice(0, 500));
  process.exit(1);
}
console.log(`Updated page ${PAGE_ID}: ${update.data.link}`);

const rm = await wpRest("POST", "/rankmath/v1/updateMeta", {
  objectType: "post",
  objectID: PAGE_ID,
  meta: {
    rank_math_focus_keyword: FOCUS_KEYWORD,
    rank_math_title: SEO_TITLE,
    rank_math_description: META_DESCRIPTION,
  },
});
const rmOk = rm.status === 200 && rm.data?.slug === true;
console.log(`Rank Math update: ${rmOk ? "OK" : `FAIL ${rm.status}`}`);

const live = await liveGet(`${URL_PATH}?nowprocket=1&codex=20260624-hbp-halong-brief`);
const h1s = [...live.data.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)].map((m) => cleanText(m[1]));
const jsonLdMatches = [...live.data.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
let faqSchemaCount = 0;
for (const match of jsonLdMatches) {
  try {
    const parsed = JSON.parse(match[1].trim());
    const graph = Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
    for (const item of graph) if (item["@type"] === "FAQPage") faqSchemaCount = (item.mainEntity || []).length;
  } catch {}
}
const linkPaths = [
  "/bang-gia-hut-be-phot-quang-ninh/",
  "/thong-tac-bon-cau-ha-long/",
  "/hut-be-phot-quang-ninh/",
  "/thong-tac-cong-quang-ninh/",
  "/hut-be-phot-khach-san-quang-ninh/",
  "/xu-ly-mui-hoi-quang-ninh/",
  "/lien-he/",
];
const links = await checkInternalLinks(linkPaths);

console.log(`Live HTTP: ${live.status}`);
console.log(`Live H1 count: ${h1s.length}`);
console.log(`Live H1: ${h1s[0] || ""}`);
console.log(`Live visible FAQ: ${countVisibleFaqs(live.data)}/6`);
console.log(`Live schema FAQ entities: ${faqSchemaCount}`);
console.log(`Live 4-col table: ${live.data.includes("Yếu tố khảo sát") && live.data.includes("Ví dụ thực tế tại Hạ Long")}`);
console.log(`Live internal links 200: ${links.filter((x) => x.status === 200).length}/${links.length}`);
for (const link of links) console.log(`  ${link.path}: ${link.status}${link.location ? ` -> ${link.location}` : ""}`);

const today = new Date().toISOString().slice(0, 10);
const time = new Date().toTimeString().slice(0, 5);
appendFileSync(CSV_PATH, `\n${today},${time},FIX-HBP-HALONG-52-BRIEF-${today},seo_fix,hút bể phốt Hạ Long,https://thongtaccongquangninh.com/hut-be-phot-ha-long/,hut-be-phot-ha-long,done,medium,,,,,"Cập nhật PAGE id=52 theo brief mới: title/H1/meta, intro, H2 dấu hiệu, FAQ 6 câu + schema FAQ, CTA và 7 internal links.",tools/patch_page_52_hbp_halong_brief_2026_06_24.mjs,,Mở WP editor xem điểm Rank Math thật,"Live verify: HTTP ${live.status}; H1=${h1s.length}; FAQ=${countVisibleFaqs(live.data)}/6; schemaFAQ=${faqSchemaCount}; internalLinks200=${links.filter((x) => x.status === 200).length}/${links.length}; RM=${rmOk ? "ok" : "fail"}",NOT_REQUIRED,,,,,,`, "utf8");
console.log("Logged SEO_PROGRESS.csv");
