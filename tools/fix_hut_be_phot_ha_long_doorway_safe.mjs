import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const PAGE_ID = 52;
const SLUG = "hut-be-phot-ha-long";
const BASE = "https://thongtaccongquangninh.com";
const DRY_RUN = process.argv.includes("--dry-run");

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

function escapeJsonLdText(input) {
  return stripHtml(input).replace(/\s+/g, " ").trim();
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex doorway-safe Ha Long fix",
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

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Gọi hút bể phốt Hạ Long bao lâu thì có xe đến?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Khu vực trung tâm Hạ Long và các điểm gần đội xe thường có thể điều xe nhanh, tùy thời điểm và mật độ ca đang xử lý. Khi gọi 0963.953.533 / 0931.156.756, khách được báo thời gian dự kiến trước khi chờ.",
        },
      },
      {
        "@type": "Question",
        name: "Hút bể phốt Hạ Long có làm bẩn nhà không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Đội xe kéo ống theo lối phù hợp, mở nắp đúng vị trí và vệ sinh khu vực thao tác sau khi hút. Khách nên dọn sẵn lối vào để việc hút bể phốt diễn ra gọn hơn.",
        },
      },
      {
        "@type": "Question",
        name: "Bể phốt đầy kèm cống tắc thì xử lý thế nào?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Thợ cần hút bể trước nếu bể quá tải, sau đó kiểm tra cống nhánh, hố ga và bồn cầu. Nếu đường ống còn nghẹt, đội kỹ thuật sẽ báo phương án thông tắc riêng trước khi làm.",
        },
      },
      {
        "@type": "Question",
        name: "Giá hút bể phốt Hạ Long ban đêm có cao hơn không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ca ban đêm, ngày lễ hoặc vị trí xa có thể có chi phí điều xe khác ban ngày. Khách được báo giá trước khi làm, không tự phát sinh khi chưa đồng ý.",
        },
      },
    ].map((item) => ({
      ...item,
      name: escapeJsonLdText(item.name),
      acceptedAnswer: {
        ...item.acceptedAnswer,
        text: escapeJsonLdText(item.acceptedAnswer.text),
      },
    })),
  };
}

function addRelatedLinks(content) {
  if (content.includes("data-codex=\"ha-long-related-links\"")) return content;
  const block = `<p data-codex="ha-long-related-links"><strong>Liên kết liên quan tại Hạ Long:</strong> khách cần xử lý tổng thể có thể xem <a href="${BASE}/hut-be-phot/">dịch vụ hút bể phốt</a>, đặt lịch <a href="${BASE}/thong-tac-cong-ha-long/">thông tắc cống Hạ Long</a>, gọi thợ <a href="${BASE}/thong-tac-bon-cau-ha-long/">thông tắc bồn cầu Hạ Long</a>, đọc <a href="${BASE}/cau-hoi-thuong-gap-thong-tac-cong/">câu hỏi thường gặp</a> hoặc <a href="${BASE}/lien-he/">liên hệ</a> để gửi vị trí cần xe đến.</p>`;
  const marker = "<h2>Case study E-E-A-T:";
  if (content.includes(marker)) return content.replace(marker, `${block}\n${marker}`);
  return `${content}\n${block}`;
}

function addFaqSchema(content) {
  if (content.includes('"@type":"FAQPage"') || content.includes('"@type": "FAQPage"')) return content;
  const json = JSON.stringify(buildFaqSchema());
  const block = `\n<!-- wp:html -->\n<script type="application/ld+json" data-codex="faq-hut-be-phot-ha-long">${json}</script>\n<!-- /wp:html -->\n`;
  return `${content.trim()}\n${block}`;
}

function patchContent(rawContent) {
  let content = rawContent;
  content = content.replace(
    "Bãi Cháy, Hòn Gai, Cao Xanh, Hà Khẩu, Tuần Châu, Việt Hưng, Cao Thắng.",
    "Bãi Cháy, Hòn Gai, Cao Xanh, Hà Khẩu, Tuần Châu, Việt Hưng, Cao Thắng, Hồng Hải, Hồng Hà, Giếng Đáy."
  );
  content = content.replace(
    "Khu vực phục vụ: Hạ Long, Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn",
    "Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn"
  );
  content = addRelatedLinks(content);
  content = addFaqSchema(content);
  return content;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const page = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}?context=edit`);
  if (page.slug !== SLUG) throw new Error(`Sai page: expected ${SLUG}, got ${page.slug}`);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = join(PROJECT, "seo-revisions", `wp-before-doorway-safe-${SLUG}-${stamp}`);
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(backupDir, `pages-${PAGE_ID}-${SLUG}.json`);
  writeFileSync(backupPath, JSON.stringify(page, null, 2), "utf8");

  const before = page.content.raw;
  const after = patchContent(before);
  const changed = before !== after;
  const status = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    pageId: PAGE_ID,
    slug: SLUG,
    backupPath,
    changed,
    contentCharsBefore: before.length,
    contentCharsAfter: after.length,
    updated: false,
  };

  if (changed && !DRY_RUN) {
    const updated = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}`, {
      method: "POST",
      body: JSON.stringify({ content: after }),
    });
    status.updated = true;
    status.link = updated.link;
    status.modified = updated.modified;
  }

  const statusPath = join(PROJECT, `WORDPRESS_UPDATE_HUT_BE_PHOT_HA_LONG_DOORWAY_SAFE_2026-05-05.json`);
  writeFileSync(statusPath, JSON.stringify(status, null, 2), "utf8");
  console.log(JSON.stringify(status, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
