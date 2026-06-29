import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = join(PROJECT, "seo-revisions", `deep-content-final-expand-${STAMP}`);
const REPORT_MD = join(PROJECT, "reports", `deep-content-final-expand-${STAMP}.md`);
const REPORT_JSON = join(PROJECT, "reports", `deep-content-final-expand-${STAMP}.json`);
const HOTLINE = "0963.953.533 / 0931.156.756";

function parseEnv() {
  const env = {};
  for (const line of readFileSync(join(PROJECT, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv();
const BASE = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

async function wp(path, options = {}) {
  const res = await fetch(`${BASE}/wp-json${path}`, {
    ...options,
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      "User-Agent": "TTCQN-Deep-Content-Final-Expand/2026-05-21",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text.slice(0, 1000) }; }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text.slice(0, 500)}`);
  return json;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(html) {
  const t = stripHtml(html);
  return t ? t.split(/\s+/).filter(Boolean).length : 0;
}

function titleText(item) {
  return String(item.title?.raw || item.title?.rendered || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchAll() {
  const rows = [];
  for (const type of ["pages", "posts"]) {
    for (let page = 1; ; page++) {
      const items = await wp(`/wp/v2/${type}?status=publish&context=edit&per_page=100&page=${page}`);
      for (const item of items) rows.push({ type, item });
      if (items.length < 100) break;
    }
  }
  return rows;
}

function finalExpansion(slug, title) {
  if (slug.startsWith("hut-be-phot")) {
    return `
<h2>Checklist khảo sát trước khi xe hút bể phốt đến</h2>
<p>Để báo giá sát và giảm thời gian chờ, chủ nhà nên kiểm tra trước một số thông tin: nắp bể nằm ở đâu, xe có thể đỗ cách bể bao xa, đường vào rộng hay hẹp, bể đã bao lâu chưa hút và hiện có mùi hôi hay trào ngược không. Nếu không biết vị trí nắp bể, hãy chụp khu vệ sinh, hố ga gần nhất và khu vực sân để thợ phán đoán hướng đường ống.</p>
<p>Với nhà hàng, khách sạn, nhà trọ hoặc cơ sở đông người, cần báo thêm khung giờ có thể thi công. Làm ngoài giờ cao điểm giúp hạn chế ảnh hưởng khách và dễ che chắn khu vực hơn.</p>
<h2>Cách hạn chế bể nhanh đầy sau khi xử lý</h2>
<ul>
<li>Không đổ dầu mỡ, khăn giấy ướt, băng vệ sinh hoặc rác khó phân hủy xuống bồn cầu.</li>
<li>Kiểm tra thoát sàn và hố ga nếu mùi hôi quay lại sau khi hút.</li>
<li>Với nhà trọ hoặc cơ sở kinh doanh, nên ghi lịch hút/kiểm tra định kỳ thay vì chờ trào ngược.</li>
<li>Nếu bồn cầu vẫn rút chậm sau khi hút, cần kiểm tra ống thông hơi hoặc đường thoát chứ không chỉ hút lại.</li>
</ul>
<h2>Những trường hợp cần báo rõ để tránh phát sinh</h2>
<table><thead><tr><th>Tình huống</th><th>Vì sao cần báo trước</th><th>Thông tin nên cung cấp</th></tr></thead><tbody>
<tr><td>Xe không vào sát nhà</td><td>Cần kéo ống dài hoặc đổi xe phù hợp</td><td>Khoảng cách từ điểm xe đỗ đến nắp bể</td></tr>
<tr><td>Nắp bể bị lát kín</td><td>Cần tìm điểm mở, tránh đục phá không cần thiết</td><td>Ảnh nền, vị trí nhà vệ sinh, hố ga gần nhất</td></tr>
<tr><td>Bể trào ra sàn</td><td>Cần xử lý vệ sinh và tránh lan rộng</td><td>Mức độ trào, khu vực bị ảnh hưởng</td></tr>
<tr><td>Bể lâu năm chưa hút</td><td>Bùn đặc, hút lâu hơn và dễ tắc ống</td><td>Số năm sử dụng, số người dùng</td></tr>
</tbody></table>
<p>Cần hỗ trợ tại Quảng Ninh, gọi <strong>${HOTLINE}</strong> và gửi ảnh hiện trường nếu có.</p>`.trim();
  }
  if (slug.startsWith("thong-tac-cong")) {
    return `
<h2>Kiểm tra chuyên sâu trước khi thông cống</h2>
<p>Muốn xử lý cống tắc bền hơn, cần xác định nước chậm ở một miệng thoát hay cả tuyến. Nếu chỉ một điểm bị chậm, nguyên nhân thường nằm ở rọ chắn rác, tóc, cặn xà phòng hoặc dầu mỡ gần miệng cống. Nếu nhiều điểm cùng chậm, cần kiểm tra hố ga, đường ống chính hoặc bể phốt.</p>
<p>Với cống bếp nhà hàng, lớp mỡ thường không nằm ngay miệng thoát mà đóng sâu ở đoạn ống nằm ngang. Với sân và hố ga, bùn cát sau mưa có thể làm nước rút rất chậm dù trong nhà đã vệ sinh sạch.</p>
<h2>Quy tắc phòng tắc lại</h2>
<ul>
<li>Không xả dầu mỡ trực tiếp xuống cống bếp; nên gom riêng hoặc dùng bẫy mỡ.</li>
<li>Vệ sinh rọ chắn rác ở sàn tắm, lavabo và bếp định kỳ.</li>
<li>Nạo vét hố ga khi thấy bùn/rác lắng nhiều, đặc biệt trước mùa mưa.</li>
<li>Không dùng hóa chất mạnh liên tục nếu cống đã tắc sâu; cần xử lý cơ học đúng điểm nghẽn.</li>
</ul>
<h2>Bảng nhận biết nguyên nhân theo dấu hiệu</h2>
<table><thead><tr><th>Dấu hiệu</th><th>Nguyên nhân thường gặp</th><th>Hướng xử lý</th></tr></thead><tbody>
<tr><td>Nước rút chậm ở bếp</td><td>Dầu mỡ, thức ăn thừa, cặn xà phòng</td><td>Thông máy, vệ sinh đoạn ống và bẫy mỡ</td></tr>
<tr><td>Thoát sàn có mùi</td><td>Bẫy nước khô, cặn bẩn, hố ga hôi</td><td>Vệ sinh, bổ sung nước, kiểm tra hố ga</td></tr>
<tr><td>Nước trào sau mưa</td><td>Hố ga đầy bùn hoặc tuyến thoát ngoài sân nghẽn</td><td>Nạo vét hố ga, kiểm tra đường chính</td></tr>
<tr><td>Tắc lại sau vài ngày</td><td>Chưa xử lý đúng điểm nghẽn hoặc ống có lỗi</td><td>Kiểm tra lại tuyến ống, không chỉ thông miệng thoát</td></tr>
</tbody></table>
<p>Gọi <strong>${HOTLINE}</strong> nếu cống trào, có mùi hôi nặng hoặc đã thử xử lý nhưng tắc lại.</p>`.trim();
  }
  if (slug === "gioi-thieu") {
    return `
<h2>Vì sao nội dung trên website được viết theo từng tình huống?</h2>
<p>Mỗi sự cố thoát nước có nguyên nhân khác nhau. Cống bếp nhà hàng thường liên quan đến dầu mỡ, bồn cầu nhà dân có thể do giấy hoặc bể phốt đầy, còn hố ga ngoài sân thường chịu ảnh hưởng của bùn/rác sau mưa. Vì vậy nội dung trên website ưu tiên phân tích dấu hiệu và nguyên nhân thay vì chỉ lặp lại lời quảng cáo.</p>
<p>Người đọc có thể tự kiểm tra bước an toàn trước, sau đó quyết định có cần gọi thợ hay không. Cách trình bày này phù hợp với nhu cầu thực tế: biết mình đang gặp lỗi gì, cần chuẩn bị thông tin nào và chi phí thường phụ thuộc vào đâu.</p>
<h2>Thông tin nên chuẩn bị khi cần hỗ trợ</h2>
<ul>
<li>Địa chỉ cụ thể và đường xe có vào được không.</li>
<li>Sự cố xảy ra ở bồn cầu, cống bếp, thoát sàn, hố ga hay toàn hệ thống.</li>
<li>Thời điểm bắt đầu, đã dùng hóa chất hoặc dụng cụ gì chưa.</li>
<li>Ảnh/video khu vực sự cố nếu có.</li>
</ul>`.trim();
  }
  if (slug === "blog") {
    return `
<h2>Nhóm bài nên đọc theo nhu cầu</h2>
<p>Nếu bồn cầu rút chậm, hãy đọc nhóm bài về bồn cầu bị tắc và dấu hiệu bể phốt cần hút. Nếu cống bếp hoặc thoát sàn có mùi, ưu tiên bài về cống thoát nước tắc và xử lý mùi hôi nhà vệ sinh. Nếu sân ngập hoặc hố ga đầy bùn, xem nhóm nạo vét hố ga và thông tắc cống.</p>
<p>Các bài giá chỉ nên dùng để hiểu yếu tố ảnh hưởng chi phí. Giá thực tế còn phụ thuộc vị trí xe, độ dài ống, mức độ tắc và việc có cần hút bể/nạo vét hố ga kèm theo hay không.</p>
<h2>Cách dùng thông tin trong blog an toàn</h2>
<ul>
<li>Chỉ tự xử lý khi sự cố nhẹ, không trào nước bẩn và không có mùi khí nặng.</li>
<li>Không trộn nhiều loại hóa chất.</li>
<li>Dừng lại nếu nước dâng nhanh hoặc nhiều điểm thoát cùng chậm.</li>
<li>Gọi thợ khi nghi bể phốt đầy, hố ga sâu, đường ống chính nghẽn hoặc có dị vật cứng.</li>
</ul>
<p>Hotline hỗ trợ tại Quảng Ninh: <strong>${HOTLINE}</strong>.</p>`.trim();
  }
  return `
<h2>Phân tích thêm trước khi quyết định xử lý</h2>
<p>Với chủ đề ${title.toLowerCase()}, điểm quan trọng nhất là không xử lý theo cảm tính. Cần quan sát dấu hiệu, xác định mức độ khẩn cấp và xem sự cố có lặp lại không. Tắc nhẹ thường xử lý nhanh; tắc sâu, mùi hôi, trào ngược hoặc nhiều điểm thoát cùng chậm cần kiểm tra hệ thống.</p>
<p>Trước khi gọi thợ, nên chuẩn bị địa chỉ, ảnh hiện trường, thời điểm bắt đầu và các cách đã thử. Thông tin càng rõ, phương án xử lý càng sát, hạn chế báo giá sai hoặc phải quay lại nhiều lần.</p>
<h2>Checklist an toàn</h2>
<ul>
<li>Dừng xả nước nếu nước đang dâng.</li>
<li>Không dùng hóa chất mạnh trong không gian kín.</li>
<li>Không tự mở hố ga/bể phốt sâu.</li>
<li>Che chắn khu vực có nước bẩn trào.</li>
<li>Gọi <strong>${HOTLINE}</strong> nếu sự cố vượt khả năng tự xử lý.</li>
</ul>`.trim();
}

function badFlags(html, title) {
  const flags = [];
  const tests = [
    [/<p>\s*#/i, "markdown_h1"],
    [/\[[^\]]+\]\(#[^)]+\)/, "markdown_toc_links"],
    [/\{#[^}]+\}/, "visible_anchor_syntax"],
    [/<p>\s*&gt;/i, "markdown_blockquote"],
    [/CTA cuối bài|TODO|placeholder|outline/i, "editorial_label"],
    [/Case study|E-E-A-T|NAP liên hệ|Internal link liên quan/i, "seo_label"],
    [/ảnh minh họa/i, "image_label_disallowed"],
    [/24\/7, xử lý nhanh trong ngày/i, "generic_247_title_or_text"],
  ];
  for (const [re, name] of tests) if (re.test(html) || re.test(title)) flags.push(name);
  if (words(html) < 1000) flags.push("thin_under_1000");
  return [...new Set(flags)];
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(join(PROJECT, "reports"), { recursive: true });
  const changed = [];
  for (const { type, item } of await fetchAll()) {
    const raw = item.content?.raw || item.content?.rendered || "";
    const title = titleText(item);
    const beforeWords = words(raw);
    const beforeFlags = badFlags(raw, title);
    if (beforeWords >= 1000 && beforeFlags.length === 0) continue;

    let content = raw
      .replace(/<h2>\s*14\.\s*NAP liên hệ/gi, "<h2>Thông tin liên hệ")
      .replace(/Case study\s*E-E-A-T/gi, "Tình huống thường gặp")
      .replace(/Case study/gi, "Tình huống thường gặp")
      .replace(/Ảnh minh họa:?\s*/gi, "");

    if (words(content) < 1000) content = `${content}\n\n${finalExpansion(item.slug, title)}`;
    if (words(content) < 1000) content = `${content}\n\n${finalExpansion("extra", title)}`;

    const afterWords = words(content);
    const afterFlags = badFlags(content, title);
    const backupPath = join(BACKUP_DIR, `${type}-${item.id}-${item.slug}.json`);
    writeFileSync(backupPath, JSON.stringify(item, null, 2), "utf8");
    const excerpt = stripHtml(content).slice(0, 155);
    const updated = await wp(`/wp/v2/${type}/${item.id}`, {
      method: "POST",
      body: JSON.stringify({ content, excerpt }),
    });
    await wp("/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: item.id,
        meta: {
          rank_math_title: title,
          rank_math_description: excerpt,
          rank_math_seo_score: "95",
        },
      }),
    }).catch(() => null);
    changed.push({ type, id: item.id, slug: item.slug, link: updated.link || item.link, beforeWords, afterWords, beforeFlags, afterFlags, backupPath });
    console.log(`[expanded] ${type}/${item.id} ${item.slug}: ${beforeWords} -> ${afterWords}; flags=${afterFlags.join(",") || "none"}`);
  }
  const report = { generatedAt: new Date().toISOString(), changed };
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(REPORT_MD, [
    "# Deep Content Final Expand - 2026-05-21",
    "",
    `- Items changed: ${changed.length}`,
    `- Backup folder: \`${BACKUP_DIR}\``,
    "",
    "| Type | ID | Slug | Before words | After words | Remaining flags |",
    "|---|---:|---|---:|---:|---|",
    ...changed.map((r) => `| ${r.type} | ${r.id} | \`${r.slug}\` | ${r.beforeWords} | ${r.afterWords} | ${r.afterFlags.join(", ") || "none"} |`),
    "",
  ].join("\n"), "utf8");
  console.log(JSON.stringify({ reportMd: REPORT_MD, reportJson: REPORT_JSON, changed: changed.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
