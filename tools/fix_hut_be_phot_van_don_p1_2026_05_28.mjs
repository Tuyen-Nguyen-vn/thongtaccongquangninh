import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const APPLY = process.argv.includes("--apply");
const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "");
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-hut-be-phot-van-don-p1-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `hut-be-phot-van-don-p1-fix-${ts}.json`);

const TARGET = {
  id: 58,
  slug: "hut-be-phot-van-don",
  url: `${BASE_URL}/hut-be-phot-van-don/`,
  title: "Hút bể phốt Vân Đồn 24/7 cho homestay, resort, nhà dân ven biển",
  excerpt:
    "Hút bể phốt Vân Đồn 24/7 cho homestay, resort, nhà dân ven biển. Xe bồn hút sạch, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để đặt lịch xử lý hôm nay.",
  focus: "hút bể phốt Vân Đồn",
};

const CAUSES = `<!-- codex-p1-van-don-2026-05-28 -->
<h2>Nguyên nhân bể phốt đầy tại Vân Đồn</h2>
<p>Vân Đồn có nhiều nhà dân ven biển, homestay, resort nhỏ, nhà hàng hải sản và khu lưu trú hoạt động theo mùa. Khi lượng khách tăng nhanh vào cuối tuần hoặc mùa du lịch, bể tự hoại chịu tải cao hơn thiết kế ban đầu, lớp bùn đáy và váng nổi đầy nhanh hơn nhà ở thông thường.</p>
<p>Nguyên nhân thường gặp đầu tiên là bể lâu năm chưa hút định kỳ. Khi bùn đặc chiếm nhiều thể tích, nước thải không còn đủ thời gian lắng, khí hôi đẩy ngược lên bồn cầu, thoát sàn hoặc hố ga. Nếu chỉ thông miệng bồn cầu, mùi có thể giảm tạm nhưng không xử lý được phần bể đã quá tải.</p>
<p>Nguyên nhân thứ hai là nước mặn, cát mịn và rác sinh hoạt từ khu ven biển lọt vào hệ thống thoát. Một số công trình gần Cái Rồng, Đông Xá, Minh Châu, Quan Lạn có hố ga ngoài sân chịu ảnh hưởng mưa lớn, gió biển hoặc nền đất thấp, làm bùn cát lắng nhanh hơn.</p>
<p>Nguyên nhân thứ ba là thói quen xả khăn ướt, giấy dày, dầu mỡ bếp hoặc thức ăn thừa xuống bồn cầu, cống bếp. Với cơ sở lưu trú, chỉ cần vài phòng xả sai cách trong thời gian cao điểm là bể và đường ống đã có dấu hiệu rút chậm, mùi hôi nặng hoặc trào ngược.</p>
<p>Nguyên nhân thứ tư là bể xây sai kết cấu, ngăn lắng nhỏ, ống thông hơi kém hoặc nắp bể bị che kín sau khi cải tạo sân vườn. Trường hợp này cần kiểm tra cả nắp bể, hố ga, đường ống ra ngoài và vị trí xe có thể đỗ, không nên chỉ báo giá theo cảm tính qua điện thoại.</p>
<table><thead><tr><th>Dấu hiệu</th><th>Nguyên nhân thường gặp</th><th>Hướng xử lý</th></tr></thead><tbody>
<tr><td>Bồn cầu rút chậm, có mùi hôi</td><td>Bùn đáy và váng nổi đã chiếm nhiều dung tích</td><td>Hút bể, xả kiểm tra lại bồn cầu và thoát sàn</td></tr>
<tr><td>Nước trào ở hố ga sau mưa</td><td>Hố ga lắng bùn, tuyến thoát thấp hoặc ảnh hưởng nước mưa</td><td>Hút bể kết hợp kiểm tra hố ga, nạo vét nếu cần</td></tr>
<tr><td>Homestay đông khách hay bị mùi</td><td>Tải sử dụng vượt thiết kế ban đầu</td><td>Đặt lịch hút định kỳ trước mùa cao điểm</td></tr>
<tr><td>Đã hút nhưng nhanh đầy lại</td><td>Bể nhỏ, ống thông hơi kém hoặc xả vật khó phân hủy</td><td>Kiểm tra kết cấu và hướng dẫn sử dụng sau khi hút</td></tr>
</tbody></table>
<h2>Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh tại Vân Đồn</h2>
<p>Địa bàn Vân Đồn cần hỏi kỹ hơn trước khi điều xe. Có công trình xe bồn vào sát nắp bể, nhưng cũng có nhà trong ngõ nhỏ, lối ven biển, khu lưu trú có sân hẹp hoặc điểm đảo cần sắp xếp lịch trước. Đội kỹ thuật hỏi vị trí, loại công trình, lối xe vào và khoảng cách kéo ống để chọn phương án phù hợp.</p>
<p>Với khu Cái Rồng, Đông Xá, Đoàn Kết, Bình Dân hoặc tuyến nhà hàng ven biển, ưu tiên là xử lý gọn, hạn chế mùi và không làm gián đoạn hoạt động. Với Quan Lạn, Minh Châu hoặc điểm xa trung tâm, khách nên báo sớm để đội thợ xác nhận thời gian di chuyển, dụng cụ cần mang và cách tiếp cận mặt bằng.</p>
<p>Khi đến nơi, thợ kiểm tra nắp bể, hố ga, dòng thoát, mùi hôi và dấu hiệu bồn cầu rút yếu. Nếu bể đầy kèm tắc cống, hố ga có bùn hoặc đường ống nghẹt, thợ báo riêng từng hạng mục trước khi làm tiếp để khách nắm đúng nguyên nhân.</p>
<h2>Cam kết 3 Không khi xử lý bể phốt Vân Đồn</h2>
<ul>
<li><strong>Không đục phá khi chưa có căn cứ kỹ thuật:</strong> ưu tiên mở nắp bể, hố ga và điểm kỹ thuật sẵn có; chỉ bàn tháo mở khi nắp bị che kín hoặc đường ống có dấu hiệu lỗi.</li>
<li><strong>Không báo giá ảo:</strong> báo theo vị trí công trình, khối lượng hút, chiều dài ống, thời điểm gọi và có cần xử lý kèm hố ga/cống hay không.</li>
<li><strong>Không làm nửa chừng:</strong> sau khi hút, thợ xả thử bồn cầu, kiểm tra mùi, hố ga liên quan và nhắc khách cách giảm đầy nhanh trong mùa du lịch.</li>
</ul>
<!-- /codex-p1-van-don-2026-05-28 -->`;

const NAP = `<!-- codex-p1-van-don-nap-2026-05-28 -->
<h2>NAP liên hệ hút bể phốt tại Vân Đồn</h2>
<p>Nên gọi thợ ngay khi bồn cầu rút chậm, nhà vệ sinh có mùi hôi nặng, hố ga nổi váng, nước thải trào ngược hoặc công trình sắp bước vào mùa đông khách. Với homestay, resort và nhà hàng hải sản, chờ thêm thường làm mùi lan rộng và ảnh hưởng trải nghiệm khách lưu trú.</p>
<p>Trước khi đội xe đến, khách nên xác định vị trí nắp bể, mở lối vào hố ga nếu biết, dọn bớt đồ che nắp và báo rõ xe có vào sát được không. Nếu nhà nằm trong ngõ sâu, gần bờ biển hoặc khu lưu trú có sân hẹp, hãy gửi ảnh lối vào để kỹ thuật chuẩn bị chiều dài ống phù hợp.</p>
<p>Với công trình tại Quan Lạn, Minh Châu hoặc điểm cần di chuyển xa hơn trung tâm, nên gọi sớm để chốt thời gian, điểm tập kết thiết bị và người trực tại chỗ. Việc đặt lịch trước giúp giảm chờ đợi, nhất là cuối tuần, ngày lễ hoặc trước mùa cao điểm du lịch.</p>
<p>Sau khi xử lý, khách nên theo dõi trong 24-48 giờ đầu: lực xả bồn cầu, mùi tại thoát sàn, mực nước hố ga và hiện tượng trào khi nhiều phòng dùng nước cùng lúc. Nếu mùi quay lại nhanh, nguyên nhân có thể nằm ở ống thông hơi, hố ga đầy bùn hoặc đường thoát bị nghẹt chứ không chỉ do bể.</p>
<p><strong>Tên đơn vị:</strong> Môi Trường Đô Thị Số 1 Quảng Ninh.</p>
<p><strong>Website:</strong> https://thongtaccongquangninh.com</p>
<p><strong>Hotline:</strong> <strong>0963.953.533 / 0931.156.756</strong></p>
<p><strong>Dịch vụ tại Vân Đồn:</strong> hút bể tự hoại, hút hầm cầu, kiểm tra bồn cầu trào ngược, nạo vét hố ga, xử lý mùi hôi nhà vệ sinh và kiểm tra đường thoát sau khi hút.</p>
<p><strong>Khu vực hỗ trợ:</strong> Cái Rồng, Đông Xá, Hạ Long, Đoàn Kết, Bình Dân, Đài Xuyên, Quan Lạn, Minh Châu, Ngọc Vừng và các khu dân cư, homestay, resort, nhà hàng ven biển lân cận.</p>
<p>Gọi <strong>0963.953.533 / 0931.156.756</strong> để mô tả tình trạng bể đầy, mùi hôi hoặc trào ngược. Kỹ thuật sẽ hỏi nhanh vị trí, loại công trình, lối xe vào và báo hướng xử lý trước khi điều xe.</p>
<!-- /codex-p1-van-don-nap-2026-05-28 -->`;

const EXTRA = `<!-- codex-p1-van-don-extra-2026-05-28 -->
<h2>Lưu ý cho homestay, resort và nhà hàng ven biển</h2>
<p>Cơ sở lưu trú ở Vân Đồn nên kiểm tra bể trước mùa cao điểm, đặc biệt khi phòng kín lịch, bếp phục vụ liên tục hoặc có nhiều khách dùng nước cùng lúc. Nếu đợi đến khi bồn cầu trào mới gọi, công trình có thể phải dừng phòng, dọn vệ sinh rộng hơn và xử lý mùi lâu hơn.</p>
<p>Nhà hàng hải sản cần tách dầu mỡ, thức ăn thừa và rác bếp khỏi đường thoát. Bể tự hoại không được thiết kế để nhận lượng lớn dầu mỡ, vỏ hải sản hoặc rác khó phân hủy. Nếu để các chất này vào bể, lớp váng nổi dày nhanh và mùi hôi nặng hơn.</p>
<p>Với nhà dân ven biển hoặc công trình gần khu nền thấp, hố ga nên được kiểm tra sau mưa lớn. Khi hố ga có bùn đen, rác nổi hoặc nước rút chậm, cần xử lý sớm để tránh hiểu nhầm là chỉ bể đầy trong khi tuyến thoát ngoài sân cũng đang nghẹt.</p>
<p>Khách quản lý nhiều phòng nên ghi lại thời điểm phòng nào xuất hiện mùi trước, phòng nào rút nước chậm và sự cố xảy ra sau mưa hay sau ngày đông khách. Thông tin này giúp thợ phân biệt bể quá tải, tắc ống nhánh hay lỗi từ hố ga chung.</p>
<p>Nếu cần làm ngoài giờ, hãy báo trước khu vực cần giữ yên tĩnh, điểm đặt xe, lối kéo ống và người phụ trách mở nắp bể. Đội thợ sẽ chọn cách thao tác gọn, kiểm tra đủ điểm thoát và bàn giao mặt bằng sạch để công trình tiếp tục hoạt động.</p>
<p>Với công trình mới thuê lại hoặc vừa cải tạo, nên hỏi chủ cũ về lần hút gần nhất, vị trí nắp bể và đường ống thoát chính. Nếu không có thông tin này, thợ sẽ kiểm tra từ hố ga, bồn cầu và khu vực sân để tránh mở sai điểm.</p>
<!-- /codex-p1-van-don-extra-2026-05-28 -->`;

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
      "User-Agent": "Codex TTCQN P1 hut be phot Van Don fix",
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
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function metrics(html) {
  const text = ascii(stripTags(html));
  const words = text.match(/[a-z0-9]+/g) ?? [];
  const focus = "hut be phot van don";
  const keywordCount = (text.match(new RegExp(focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
  return {
    wordCount: words.length,
    keywordCount,
    keywordDensity: words.length ? Number(((keywordCount * 5 * 100) / words.length).toFixed(2)) : 0,
    imgCount: (String(html).match(/<img\b/giu) ?? []).length,
    hasCauseH2: /<h2[^>]*>[^<]*Nguyên nhân/iu.test(html),
    hasWhyH2: /<h2[^>]*>[^<]*(Tại sao chọn|Cam kết 3 Không)/iu.test(html),
    hasNapH2: /<h2[^>]*>[^<]*(NAP|liên hệ)/iu.test(html),
    forbidden: /(chuyên nghiệp|uy tín|hàng đầu|tận tâm)/iu.test(stripTags(html)),
  };
}

function limitExactKeyword(html, keep = 5) {
  let seen = 0;
  return html.replace(/hút bể phốt Vân Đồn/giu, (match) => {
    seen += 1;
    return seen <= keep ? match : "hút bể tại Vân Đồn";
  });
}

function patchContent(raw) {
  let html = String(raw ?? "");
  html = html
    .replace(/<!-- codex-p1-van-don-2026-05-28 -->[\s\S]*?<!-- \/codex-p1-van-don-2026-05-28 -->\n?/gu, "")
    .replace(/<!-- codex-p1-van-don-nap-2026-05-28 -->[\s\S]*?<!-- \/codex-p1-van-don-nap-2026-05-28 -->\n?/gu, "")
    .replace(/<!-- codex-p1-van-don-extra-2026-05-28 -->[\s\S]*?<!-- \/codex-p1-van-don-extra-2026-05-28 -->\n?/gu, "");

  html = html.replace(/<h2>Nguyên nhân bể phốt đầy tại Vân Đồn<\/h2>[\s\S]*?(?=<h2>)/u, "");
  html = html.replace(/<h2>Cam kết chất lượng dịch vụ<\/h2>\s*<ul>[\s\S]*?<\/ul>/u, CAUSES);
  if (!/<h2[^>]*>[^<]*Nguyên nhân bể phốt đầy tại Vân Đồn/iu.test(html)) {
    html = html.replace(/<h2>Bảng giá tham khảo dịch vụ<\/h2>/u, `${CAUSES}\n<h2>Bảng giá tham khảo dịch vụ</h2>`);
  }

  if (!/<h2[^>]*>[^<]*NAP liên hệ/iu.test(html)) {
    html = html.replace(/<h2>FAQ/iu, `${NAP}\n<h2>FAQ`);
  }

  if (!/<h2[^>]*>[^<]*Lưu ý cho homestay/iu.test(html)) {
    html = html.replace(/<p><!-- codex-internal-links-2026-04-29 -->/u, `${EXTRA}\n<p><!-- codex-internal-links-2026-04-29 -->`);
  }

  return limitExactKeyword(html).replace(/\n{3,}/g, "\n\n").trim();
}

async function liveCheck(url) {
  const res = await fetch(`${url}?nowprocket=1&codex=p1-hbp-vd-${Date.now()}`, { redirect: "manual" });
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
    hasCauseH2: /<h2[^>]*>[^<]*Nguyên nhân/iu.test(html),
    hasWhyH2: /<h2[^>]*>[^<]*(Tại sao chọn|Cam kết 3 Không)/iu.test(html),
    hasNapH2: /<h2[^>]*>[^<]*(NAP|liên hệ)/iu.test(html),
  };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Thiếu WP_USERNAME/WP_APP_PASSWORD trong .env");
  const baseUrl = (env.WP_BASE_URL || BASE_URL).replace(/\/$/, "");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const existing = await wp(baseUrl, auth, `/wp/v2/pages/${TARGET.id}?context=edit`);
  const beforeContent = existing.content?.raw ?? existing.content?.rendered ?? "";
  const afterContent = patchContent(beforeContent);
  const before = metrics(beforeContent);
  const after = metrics(afterContent);
  const result = {
    id: TARGET.id,
    slug: TARGET.slug,
    url: `${baseUrl}/${TARGET.slug}/`,
    before,
    after,
    oldTitle: existing.title?.raw ?? "",
    newTitle: TARGET.title,
    pass:
      after.wordCount >= 2400 &&
      after.keywordDensity <= 1.6 &&
      after.imgCount >= 3 &&
      after.hasCauseH2 &&
      after.hasWhyH2 &&
      after.hasNapH2 &&
      !after.forbidden,
  };

  if (APPLY) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const pageBackupPath = path.join(BACKUP_DIR, `pages-${TARGET.id}-${TARGET.slug}.json`);
    writeFileSync(pageBackupPath, JSON.stringify(existing, null, 2), "utf8");
    const pushed = await wp(baseUrl, auth, `/wp/v2/pages/${TARGET.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: TARGET.title,
        excerpt: TARGET.excerpt,
        content: afterContent,
        status: "publish",
      }),
    });
    const rankMathUpdate = await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectType: "post",
        objectID: TARGET.id,
        meta: {
          rank_math_title: TARGET.title,
          rank_math_description: TARGET.excerpt,
          rank_math_focus_keyword: TARGET.focus,
        },
      }),
    }).catch((error) => ({ error: error.message }));
    result.backupDir = BACKUP_DIR;
    result.pageBackupPath = pageBackupPath;
    result.pushed = { id: pushed.id, status: pushed.status, link: pushed.link };
    result.rankMathUpdate = rankMathUpdate;
    result.live = await liveCheck(result.url);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    reportPath: REPORT_PATH,
    backupDir: APPLY ? BACKUP_DIR : null,
    result,
    ok: result.pass,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
