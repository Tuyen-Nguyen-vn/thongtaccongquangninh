import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const APPLY = process.argv.includes("--apply");
const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "");
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-ha-long-p1-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `ha-long-p1-fix-${ts}.json`);

const TARGET = {
  id: 296,
  slug: "thong-tac-cong-ha-long",
  area: "Hạ Long",
  url: `${BASE_URL}/thong-tac-cong-ha-long/`,
  title: "Thông tắc cống Hạ Long 24/7 cho nhà hàng, khách sạn, nhà dân",
  excerpt:
    "Thông tắc cống Hạ Long 24/7 cho nhà hàng, khách sạn, nhà dân; không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 khi cống trào, mùi hôi, nước rút chậm.",
  optionNames: ["ttcqn_doorway_safe_page_296_content", "ttcqn_doorway_safe_page_296_content_v2"],
  why: `<h2>Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh tại Hạ Long</h2>
<p>Hạ Long không giống các địa bàn thuần nhà ở. Cùng một tuyến đường có thể có nhà dân, khách sạn, homestay, quán ăn, căn hộ cho thuê và công trình nằm trên dốc. Khi cống nghẹt, thợ cần hỏi đúng loại công trình trước khi chọn cách xử lý.</p>
<p>Khu Bãi Cháy, Tuần Châu thường phát sinh sự cố ở bếp nhà hàng, khu rửa, thoát sàn phòng nghỉ hoặc hố ga phục vụ nhiều khách cùng lúc. Nếu chỉ đẩy rác ở miệng thoát, dầu mỡ và cặn thức ăn trong ống ngang vẫn có thể giữ lại, làm nước rút tạm rồi tắc lại vào giờ đông khách.</p>
<p>Khu Hòn Gai, Cao Xanh, Cao Thắng, Hồng Hải, Hồng Hà có nhiều nhà cải tạo, nhà trong ngõ, mặt bằng thấp hoặc đường ống nối thêm qua nhiều lần sửa chữa. Với nhóm này, thợ phải kiểm tra hố ga, đoạn cua, độ dốc và điểm thoát chính trước khi kết luận nguyên nhân.</p>
<p>Giếng Đáy, Hà Khẩu, Việt Hưng có nhà trọ, kho xưởng nhỏ và khu dân cư mới xen lẫn công trình cũ. Một số ca tắc xảy ra sau mưa hoặc sau khi nâng sân, lát nền, đổi thiết bị vệ sinh. Thông tin về lối vào, nắp hố ga và vị trí nước trào giúp đội kỹ thuật chuẩn bị máy gọn, dây thông phù hợp và hạn chế tháo mở không cần thiết.</p>
<p>Khi tiếp nhận ca <strong>thông tắc cống Hạ Long</strong>, đội kỹ thuật hỏi rõ nước trào ở bếp, thoát sàn, sân hay hố ga; có bao nhiêu điểm cùng rút chậm; đã dùng hóa chất, nước nóng hay dây tay chưa. Sau đó thợ mới chọn xử lý qua miệng thoát, hố ga, ống nhánh hay tuyến chính.</p>
<h2>Cam kết 3 Không khi thông tắc cống Hạ Long</h2>
<ul>
<li><strong>Không đục phá khi chưa có căn cứ kỹ thuật:</strong> ưu tiên kiểm tra qua miệng thoát, hố ga, điểm kỹ thuật sẵn có và dấu hiệu dòng chảy trước khi bàn tháo lắp.</li>
<li><strong>Không báo giá ảo:</strong> chi phí được nói rõ theo vị trí tắc, mức độ nghẹt, thời điểm gọi, đường vào công trình và thiết bị cần dùng.</li>
<li><strong>Không xử lý nửa chừng:</strong> sau khi thông, thợ xả thử nhiều điểm, kiểm tra mùi, tốc độ rút nước và nhắc phần dễ tái phát như dầu mỡ bếp, hố ga đầy bùn hoặc tuyến ống thấp.</li>
</ul>
<h2>Tình huống thường gặp tại Hạ Long</h2>
<p>Với nhà hàng ở Bãi Cháy, lỗi hay nằm ở đường ống bếp và hố ga có váng mỡ. Cần xử lý đúng đoạn giữ mỡ, không chỉ dùng hóa chất đổ từ miệng thoát. Nếu công trình đang có khách, thợ phải thao tác gọn, che chắn khu vực bếp và xả thử đủ lâu trước khi bàn giao.</p>
<p>Với khách sạn, homestay hoặc căn hộ cho thuê, nhiều phòng dùng nước cùng lúc làm dấu hiệu tắc khó nhận biết. Nếu một phòng chậm nước, có thể là ống nhánh. Nếu nhiều phòng cùng có mùi hoặc thoát sàn ọc nước, cần kiểm tra tuyến gom chung và hố ga.</p>
<p>Với nhà dân trong ngõ dốc, xe hoặc thiết bị lớn không phải lúc nào cũng vào sát điểm thao tác. Khách nên gửi ảnh lối vào, nắp hố ga và khu vực nước trào. Nhờ vậy thợ chuẩn bị dây, máy, dụng cụ mở nắp và phương án kéo thiết bị phù hợp.</p>
<p>Với cống tắc sau mưa, nguyên nhân có thể là bùn cát, hố ga quá tải hoặc tuyến thoát thấp. Trường hợp này cần quan sát mực nước trong hố ga và dòng thoát ngoài sân. Nếu chỉ thông trong nhà, nước có thể rút tạm nhưng sự cố sẽ quay lại khi mưa lớn.</p>`,
  nap: `<h2>NAP liên hệ thông tắc cống Hạ Long</h2>
<p>Nên gọi thợ ngay khi nước thải trào lên sàn, cống bếp bốc mùi nặng, thoát sàn ọc nước hoặc nhiều thiết bị cùng rút chậm. Đây là dấu hiệu điểm nghẽn có thể nằm sâu hơn miệng thoát, liên quan đến ống nhánh, hố ga hoặc tuyến thoát chính.</p>
<p>Trước khi thợ đến, nên ngừng xả thêm nước, tách khu vực có nước bẩn, mở lối vào hố ga nếu biết vị trí và báo rõ đã dùng hóa chất hay chưa. Nếu có ảnh lối vào, ảnh nắp hố ga hoặc ảnh khu vực nước trào, hãy gửi trước để đội kỹ thuật chọn thiết bị phù hợp.</p>
<p>Với nhà hàng, khách sạn, homestay hoặc cơ sở đông khách, nên nói rõ khung giờ có thể thi công và khu vực cần hạn chế ảnh hưởng. Thợ sẽ ưu tiên thao tác gọn, kiểm tra dòng chảy sau khi thông và bàn giao lại mặt bằng sạch để công trình hoạt động tiếp.</p>
<p>Khi mô tả sự cố, cần nói rõ cống tắc ở bếp, nhà vệ sinh, sân hay hố ga; nước trào sau mưa hay trào khi xả; một điểm hay nhiều điểm cùng chậm. Nếu công trình nằm ở Bãi Cháy, Hòn Gai, Cao Xanh, Cao Thắng, Tuần Châu, Hồng Hải, Hồng Hà, Giếng Đáy, Hà Khẩu hoặc Việt Hưng, hãy đọc rõ khu vực để đội thợ định tuyến nhanh hơn.</p>
<p>Sau khi xử lý, khách nên theo dõi trong 24-48 giờ đầu: tốc độ nước rút, mùi hôi, tiếng ọc nước và mực nước trong hố ga. Nếu cống chậm lại nhanh, nguyên nhân có thể là hố ga đầy bùn, bẫy mỡ quá tải, bể phốt liên quan hoặc đoạn ống có độ dốc yếu.</p>
<p>Với khu bếp nhà hàng, nên gom dầu mỡ riêng, vệ sinh rọ chắn rác cuối ngày và kiểm tra bẫy mỡ theo tần suất sử dụng. Với nhà nghỉ, homestay hoặc dãy phòng cho thuê, nên nhắc người dùng không xả khăn ướt, tóc, giấy dày, thức ăn thừa xuống thoát sàn. Các việc nhỏ này giúp giảm áp lực cho tuyến ống chung, nhất là vào cuối tuần hoặc mùa du lịch.</p>
<p>Với nhà dân trong ngõ dốc hoặc khu thường ngập sau mưa, nên mở nắp hố ga kiểm tra khi thấy nước ngoài sân dâng chậm. Nếu hố ga có bùn đen, rác nổi hoặc mùi nặng, cần xử lý sớm trước khi nước thải trào ngược vào bếp và nhà vệ sinh. Không nên chờ đến lúc nhiều điểm cùng tắc vì khi đó phạm vi vệ sinh và thời gian xử lý sẽ lớn hơn.</p>
<p>Nếu công trình từng tắc nhiều lần trong một tháng, nên ghi lại ngày xảy ra sự cố, điểm trào đầu tiên và cách đã xử lý. Nhật ký ngắn này giúp thợ nhận biết lỗi lặp do thói quen xả thải, hố ga đầy hay đoạn ống có vấn đề kỹ thuật.</p>
<p>Trường hợp cần xử lý ngoài giờ, khách nên báo trước công trình có người trực tại chỗ hay không, khu vực để xe hoặc đặt máy ở đâu và có cần hạn chế tiếng ồn tại khu lưu trú hay không. Với khách sạn, homestay, nhà hàng hoặc căn hộ cho thuê, thông tin này giúp đội thợ chọn cách thao tác gọn hơn, tránh ảnh hưởng phòng đang có khách và vẫn kiểm tra đủ các điểm thoát sau khi thông.</p>
<p><strong>Tên đơn vị:</strong> Môi Trường Đô Thị Số 1 Quảng Ninh.</p>
<p><strong>Website:</strong> https://thongtaccongquangninh.com</p>
<p><strong>Hotline:</strong> <strong>0963.953.533 / 0931.156.756</strong></p>
<p><strong>Dịch vụ tại Hạ Long:</strong> thông tắc cống, xử lý cống bếp dầu mỡ, thông thoát sàn, kiểm tra hố ga, nạo vét hố ga, xử lý mùi hôi nhà vệ sinh và tư vấn khi đường ống tắc lặp lại.</p>
<p><strong>Khu vực hỗ trợ:</strong> Bãi Cháy, Hòn Gai, Cao Xanh, Cao Thắng, Tuần Châu, Hồng Hải, Hồng Hà, Giếng Đáy, Hà Khẩu, Việt Hưng và các khu dân cư, nhà hàng, khách sạn lân cận trong Hạ Long.</p>`,
};

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
      "User-Agent": "Codex TTCQN P1 Ha Long fix",
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

async function rpc(endpoint, auth, method, params, id, sessionId = null) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
      "User-Agent": "Codex TTCQN P1 Ha Long MCP",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) throw new Error(`MCP ${response.status}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
  return { payload, sessionId: response.headers.get("mcp-session-id") };
}

async function initMcp(baseUrl, auth) {
  const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;
  const init = await rpc(
    endpoint,
    auth,
    "initialize",
    { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "codex-ha-long-p1", version: "1.0.0" } },
    1,
  );
  if (!init.sessionId) throw new Error("Không lấy được Mcp-Session-Id");
  return { endpoint, sessionId: init.sessionId };
}

async function optionGet(endpoint, auth, sessionId, name, id) {
  const res = await rpc(
    endpoint,
    auth,
    "tools/call",
    {
      name: "wp-mcp-ultimate-execute-ability",
      arguments: { ability_name: "options/get", parameters: { name } },
    },
    id,
    sessionId,
  );
  const text = res.payload?.result?.content?.[0]?.text ?? "";
  try {
    const parsed = JSON.parse(text);
    return parsed.data?.value ?? parsed.data ?? parsed.value ?? "";
  } catch {
    return "";
  }
}

async function optionUpdate(endpoint, auth, sessionId, name, value, id) {
  const res = await rpc(
    endpoint,
    auth,
    "tools/call",
    {
      name: "wp-mcp-ultimate-execute-ability",
      arguments: { ability_name: "options/update", parameters: { name, value } },
    },
    id,
    sessionId,
  );
  return res.payload;
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

function metrics(html) {
  const text = ascii(stripTags(html));
  const words = text.match(/[a-z0-9]+/g) ?? [];
  const focus = "thong tac cong ha long";
  const keywordCount = (text.match(new RegExp(focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
  return {
    wordCount: words.length,
    keywordCount,
    keywordDensity: words.length ? Number(((keywordCount * 5 * 100) / words.length).toFixed(2)) : 0,
    imgCount: (String(html).match(/<img\b/giu) ?? []).length,
    hasWhyH2: /<h2[^>]*>[^<]*(Tại sao chọn|Cam kết 3 Không)/iu.test(html),
    hasNapH2: /<h2[^>]*>[^<]*(NAP|liên hệ)/iu.test(html),
    forbidden: /(chuyên nghiệp|uy tín|hàng đầu|tận tâm)/iu.test(stripTags(html)),
  };
}

function patchContent(raw) {
  let html = String(raw ?? "");
  html = html.replace(/<h2>Tại sao chọn[^<]*<\/h2>[\s\S]*?(?=<h2>Quy trình thợ xử lý<\/h2>)/u, "");
  html = html.replace(/<h2>NAP liên hệ[^<]*<\/h2>[\s\S]*?(?=<h2>Câu hỏi thường gặp<\/h2>)/u, "");
  html = html.replace(new RegExp(`\\n?${TARGET.why.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n?`, "u"), "\n");
  html = html.replace(new RegExp(`\\n?${TARGET.nap.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n?`, "u"), "\n");

  if (!/<h2[^>]*>[^<]*(Tại sao chọn|Cam kết 3 Không)/iu.test(html)) {
    html = html.replace(/<h2>Quy trình thợ xử lý<\/h2>/u, `${TARGET.why}\n<h2>Quy trình thợ xử lý</h2>`);
  }
  if (!/<h2[^>]*>[^<]*(NAP|liên hệ)/iu.test(html)) {
    html = html.replace(/<h2>Câu hỏi thường gặp<\/h2>/u, `${TARGET.nap}\n<h2>Câu hỏi thường gặp</h2>`);
  }
  return html.replace(/\n{3,}/g, "\n\n").trim();
}

async function liveCheck(url) {
  const res = await fetch(`${url}?nowprocket=1&codex=p1-ha-long-${Date.now()}`, { redirect: "manual" });
  const html = await res.text();
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/iu) ?? [])[1] ?? "";
  return {
    status: res.status,
    title,
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
  const { endpoint, sessionId } = await initMcp(baseUrl, auth);

  const existing = await wp(baseUrl, auth, `/wp/v2/pages/${TARGET.id}?context=edit`);
  const beforeContent = existing.content?.raw ?? existing.content?.rendered ?? "";
  const afterContent = patchContent(beforeContent);
  const optionBackups = [];

  for (const [index, name] of TARGET.optionNames.entries()) {
    const value = await optionGet(endpoint, auth, sessionId, name, 10 + index);
    optionBackups.push({ name, value, before: metrics(value), after: metrics(patchContent(value)) });
  }

  const before = metrics(beforeContent);
  const after = metrics(afterContent);
  const result = {
    id: TARGET.id,
    slug: TARGET.slug,
    url: `${baseUrl}/${TARGET.slug}/`,
    before,
    after,
    optionBackups: optionBackups.map((item) => ({ name: item.name, before: item.before, after: item.after })),
    oldTitle: existing.title?.raw ?? "",
    newTitle: TARGET.title,
    pass: after.wordCount >= 2200 && after.keywordDensity <= 1.6 && after.imgCount >= 3 && after.hasWhyH2 && after.hasNapH2 && !after.forbidden,
  };

  if (APPLY) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const pageBackupPath = path.join(BACKUP_DIR, `pages-${TARGET.id}-${TARGET.slug}.json`);
    writeFileSync(pageBackupPath, JSON.stringify(existing, null, 2), "utf8");
    for (const item of optionBackups) {
      writeFileSync(path.join(BACKUP_DIR, `option-${item.name}.json`), JSON.stringify({ name: item.name, value: item.value }, null, 2), "utf8");
    }

    const pushed = await wp(baseUrl, auth, `/wp/v2/pages/${TARGET.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: TARGET.title, excerpt: TARGET.excerpt, content: afterContent, status: "publish" }),
    });
    const optionUpdates = [];
    for (const [index, name] of TARGET.optionNames.entries()) {
      optionUpdates.push({ name, result: await optionUpdate(endpoint, auth, sessionId, name, afterContent, 30 + index) });
    }
    const rankMathUpdate = await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectType: "post",
        objectID: TARGET.id,
        meta: {
          rank_math_title: TARGET.title,
          rank_math_description: TARGET.excerpt,
          rank_math_focus_keyword: "thông tắc cống Hạ Long",
        },
      }),
    }).catch((error) => ({ error: error.message }));
    result.backupDir = BACKUP_DIR;
    result.pageBackupPath = pageBackupPath;
    result.pushed = { id: pushed.id, status: pushed.status, link: pushed.link };
    result.optionUpdates = optionUpdates;
    result.rankMathUpdate = rankMathUpdate;
    result.live = await liveCheck(result.url);
  }

  const report = { generatedAt: new Date().toISOString(), mode: APPLY ? "apply" : "dry-run", reportPath: REPORT_PATH, backupDir: APPLY ? BACKUP_DIR : null, result, ok: result.pass };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
