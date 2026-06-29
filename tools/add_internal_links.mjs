import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { submitIndexingUrl } from "./lib/google_indexing_api.mjs";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const PUSH_CSV = join(PROJECT, "SEO_PUSH_RESULTS_2026-04-29.csv");
const BACKUP_DIR = join(PROJECT, "seo-revisions", "wp-before-internal-links-2026-04-29");
const RESULT_CSV = join(PROJECT, "SEO_INTERNAL_LINKS_RESULTS_2026-04-29.csv");
const LOG_PATH = join(PROJECT, "SEO_INTERNAL_LINKS_LOG_2026-04-29.md");

const MARKER_START = "<!-- codex-internal-links-2026-04-29 -->";
const MARKER_END = "<!-- /codex-internal-links-2026-04-29 -->";
const INTERNAL_RE =
  /<!-- codex-internal-links-2026-04-29 -->[\s\S]*?<!-- \/codex-internal-links-2026-04-29 -->/g;

const ANCHORS = {
  "hut-be-phot-quang-ninh": "hút bể phốt Quảng Ninh",
  "thong-tac-cong-quang-ninh": "thông tắc cống Quảng Ninh",
  "bang-gia": "bảng giá hút bể phốt, thông tắc cống",
  "thong-tac-bon-cau-quang-ninh": "thông tắc bồn cầu Quảng Ninh",
  "nao-vet-ho-ga-quang-ninh": "nạo vét hố ga Quảng Ninh",
  "xu-ly-mui-hoi-quang-ninh": "xử lý mùi hôi Quảng Ninh",
  "hut-be-phot-ha-long": "hút bể phốt Hạ Long",
  "hut-be-phot-cam-pha": "hút bể phốt Cẩm Phả",
  "hut-be-phot-uong-bi": "hút bể phốt Uông Bí",
  "hut-be-phot-mong-cai": "hút bể phốt Móng Cái",
  "hut-be-phot-quang-yen": "hút bể phốt Quảng Yên",
  "hut-be-phot-dong-trieu": "hút bể phốt Đông Triều",
  "hut-be-phot-van-don": "hút bể phốt Vân Đồn",
  "hut-be-phot-bai-chay": "hút bể phốt Bãi Cháy",
  "hut-be-phot-hoanh-bo": "hút bể phốt Hoành Bồ",
  "hut-be-phot-ha-long-xe-hut-24-7": "hút bể phốt Hạ Long xe hút 24/7",
  "thong-tac-cong-ha-long": "thông tắc cống Hạ Long",
  "thong-tac-cong-cam-pha": "thông tắc cống Cẩm Phả",
  "thong-tac-cong-uong-bi": "thông tắc cống Uông Bí",
  "thong-tac-cong-mong-cai": "thông tắc cống Móng Cái",
  "thong-tac-cong-quang-yen": "thông tắc cống Quảng Yên",
  "thong-tac-cong-dong-trieu": "thông tắc cống Đông Triều",
  "thong-tac-cong-van-don": "thông tắc cống Vân Đồn",
  "thong-tac-cong-ngo-nho-ha-long": "thông tắc cống ngõ nhỏ Hạ Long",
  "thong-tac-cong-nha-hang-ha-long": "thông tắc cống nhà hàng Hạ Long",
  "thong-tac-cong-chung-cu-ha-long": "thông tắc cống chung cư Hạ Long",
  "thong-tac-cong-bai-chay": "thông tắc cống Bãi Cháy",
  "thong-tac-cong-cao-xanh": "thông tắc cống Cao Xanh",
  "thong-tac-cong-gieng-day": "thông tắc cống Giếng Đáy",
  "thong-tac-cong-ha-long-ban-dem": "thông tắc cống Hạ Long ban đêm",
  "thong-tac-cong-hong-gai-ha-long": "thông tắc cống Hồng Gai Hạ Long",
  "thong-tac-cong-tuan-chau": "thông tắc cống Tuần Châu",
  "thong-tac-bon-cau-ha-long": "thông tắc bồn cầu Hạ Long",
  "thong-tac-bon-cau-cam-pha": "thông tắc bồn cầu Cẩm Phả",
  "thong-tac-bon-cau-uong-bi": "thông tắc bồn cầu Uông Bí",
  "thong-tac-bon-cau-mong-cai": "thông tắc bồn cầu Móng Cái",
  "thong-tac-bon-cau-dong-trieu": "thông tắc bồn cầu Đông Triều",
  "thong-tac-bon-cau-quang-yen": "thông tắc bồn cầu Quảng Yên",
  "thong-tac-bon-cau-van-don": "thông tắc bồn cầu Vân Đồn",
  "thong-tac-chau-rua-quang-ninh": "thông tắc chậu rửa Quảng Ninh",
  "thong-tac-toilet-quang-ninh": "thông tắc toilet Quảng Ninh",
  "bang-gia-hut-be-phot-quang-ninh-2026": "bảng giá hút bể phốt Quảng Ninh 2026",
  "gia-thong-tac-cong-ha-long": "giá thông tắc cống Hạ Long",
  "dau-hieu-be-phot-can-hut": "dấu hiệu bể phốt cần hút",
  "cach-xu-ly-cong-thoat-nuoc-tac": "cách xử lý cống thoát nước tắc",
  "nguyen-nhan-cong-tac-thuong-xuyen-ha-long": "nguyên nhân cống tắc thường xuyên Hạ Long",
  "gioi-thieu": "giới thiệu",
  "lien-he": "liên hệ",
  "chinh-sach-bao-hanh": "chính sách bảo hành",
  "chinh-sach-bao-mat": "chính sách bảo mật",
};

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value);
  return values;
}

function csvRows(path) {
  const lines = readFileSync(path, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ""]));
  });
}

function family(slug) {
  if (slug.includes("hut-be-phot")) return "hut";
  if (slug.includes("bon-cau") || slug.includes("toilet")) return "bon-cau";
  if (slug.includes("nao-vet")) return "nao-vet";
  if (slug.includes("mui-hoi")) return "mui-hoi";
  if (slug.includes("bang-gia")) return "gia";
  if (slug.includes("dau-hieu") || slug.includes("nguyen-nhan") || slug.includes("cach-xu-ly")) return "info";
  return "cong";
}

function location(slug) {
  const pairs = [
    ["ha-long", "ha-long"],
    ["cam-pha", "cam-pha"],
    ["uong-bi", "uong-bi"],
    ["mong-cai", "mong-cai"],
    ["quang-yen", "quang-yen"],
    ["dong-trieu", "dong-trieu"],
    ["van-don", "van-don"],
    ["bai-chay", "ha-long"],
  ];
  return pairs.find(([key]) => slug.includes(key))?.[1] ?? "quang-ninh";
}

function escapeHtml(text) {
  return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function candidateSlugs(slug, available) {
  const fam = family(slug);
  const loc = location(slug);
  const priority = [];
  const add = (...slugs) => {
    for (const item of slugs) {
      if (item !== slug && available.has(item) && !priority.includes(item)) priority.push(item);
    }
  };

  add("hut-be-phot-quang-ninh", "thong-tac-cong-quang-ninh", "bang-gia");

  if (fam === "hut") {
    add(`thong-tac-cong-${loc}`, `thong-tac-bon-cau-${loc}`, "nao-vet-ho-ga-quang-ninh");
    add("hut-be-phot-ha-long", "hut-be-phot-cam-pha", "hut-be-phot-uong-bi", "hut-be-phot-mong-cai");
  } else if (fam === "cong") {
    add(`hut-be-phot-${loc}`, `thong-tac-bon-cau-${loc}`, "thong-tac-cong-ha-long");
    add("thong-tac-cong-cam-pha", "thong-tac-cong-uong-bi", "thong-tac-cong-mong-cai");
  } else if (fam === "bon-cau") {
    add("thong-tac-bon-cau-quang-ninh", `thong-tac-cong-${loc}`, `hut-be-phot-${loc}`);
    add("thong-tac-toilet-quang-ninh", "thong-tac-chau-rua-quang-ninh");
  } else if (fam === "info" || fam === "gia") {
    add("hut-be-phot-ha-long", "thong-tac-cong-ha-long", "thong-tac-bon-cau-quang-ninh");
    add("xu-ly-mui-hoi-quang-ninh", "nao-vet-ho-ga-quang-ninh");
  } else {
    add("thong-tac-cong-quang-ninh", "hut-be-phot-quang-ninh", "bang-gia");
  }

  return priority.slice(0, 7);
}

function buildBlock(row, rowsBySlug) {
  const links = candidateSlugs(row.slug, rowsBySlug)
    .map((slug) => rowsBySlug.get(slug))
    .filter(Boolean);
  const items = links
    .map((target) => {
      const anchor = ANCHORS[target.slug] ?? target.slug.replaceAll("-", " ");
      return `<li><a href="${target.link}">${escapeHtml(anchor)}</a></li>`;
    })
    .join("\n");
  return `${MARKER_START}
<h2>Dịch vụ liên quan cần xem</h2>
<p>Nếu tình trạng tắc nghẽn, mùi hôi hoặc bể phốt đầy liên quan nhiều hạng mục, hãy xem thêm các trang dưới đây để chọn đúng dịch vụ và khu vực xử lý.</p>
<ul>
${items}
</ul>
<p>Cần thợ kiểm tra nhanh, gọi <strong>0963.953.533 / 0931.156.756</strong> để được hướng dẫn trước khi điều người tới.</p>
${MARKER_END}`;
}

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex internal link updater",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`WordPress ${res.status} ${path}: ${payload.message ?? text}`);
  return payload;
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const allRows = csvRows(PUSH_CSV).filter(
    (row) => row.slug && row.id && row.finalStatus === "publish" && Number(row.finalScore) >= 90
  );
  const rowsBySlug = new Map(allRows.map((row) => [row.slug, row]));
  const results = [];

  for (const row of allRows) {
    const current = await wp(env.WP_BASE_URL, auth, `/wp/v2/${row.type}/${row.id}?context=edit`);
    writeFileSync(
      join(BACKUP_DIR, `${row.slug}.json`),
      JSON.stringify(current, null, 2),
      "utf8"
    );
    const raw = current.content?.raw ?? current.content?.rendered ?? "";
    const cleaned = raw.replace(INTERNAL_RE, "").trim();
    const block = buildBlock(row, rowsBySlug);
    const content = `${cleaned}\n\n${block}`;
    const linkCount = (block.match(/<a\s+href=/g) ?? []).length;
    const updated = await wp(env.WP_BASE_URL, auth, `/wp/v2/${row.type}/${row.id}`, {
      method: "POST",
      body: JSON.stringify({ content, status: "publish" }),
    });
    const verify = await wp(env.WP_BASE_URL, auth, `/wp/v2/${row.type}/${row.id}?context=edit`);
    const verifyContent = verify.content?.raw ?? verify.content?.rendered ?? "";
    results.push({
      slug: row.slug,
      type: row.type,
      id: row.id,
      status: updated.status,
      linkCount,
      hasMarker: verifyContent.includes(MARKER_START),
      finalScoreBeforeLinks: row.finalScore,
      link: row.link,
    });
    console.log(`${row.slug} links=${linkCount} status=${updated.status}`);
  }

  const headers = [
    "slug",
    "type",
    "id",
    "status",
    "linkCount",
    "hasMarker",
    "finalScoreBeforeLinks",
    "link",
  ];
  const csv = [
    headers.join(","),
    ...results.map((row) =>
      headers.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(",")
    ),
  ].join("\n");
  writeFileSync(RESULT_CSV, "\uFEFF" + csv, "utf8");

  const urls = results.map((row) => row.link);
  const indexingResults = [];
  for (const url of urls) {
    try {
      indexingResults.push(await submitIndexingUrl(PROJECT, url));
    } catch (error) {
      indexingResults.push({ ok: false, status: 0, error: error.message, url });
    }
  }
  const indexing = {
    ok: indexingResults.every((item) => item.ok),
    status: indexingResults.every((item) => item.ok) ? 200 : 207,
    response: JSON.stringify({
      successCount: indexingResults.filter((item) => item.ok).length,
      failCount: indexingResults.filter((item) => !item.ok).length,
      sample: indexingResults.slice(0, 2),
    }).slice(0, 1000),
  };

  const log = `# Log internal link SEO - 2026-04-29

## Kết quả

- URL đã thêm/cập nhật block internal link: **${results.length}**
- Tổng link thêm: **${results.reduce((sum, row) => sum + row.linkCount, 0)}**
- Tất cả URL vẫn ở trạng thái publish: **${results.every((row) => row.status === "publish") ? "Có" : "Không"}**
- Tất cả URL có marker kiểm soát: **${results.every((row) => row.hasMarker) ? "Có" : "Không"}**
- Backup trước khi thêm link: \`seo-revisions/wp-before-internal-links-2026-04-29\`
- Bảng kết quả: \`SEO_INTERNAL_LINKS_RESULTS_2026-04-29.csv\`

## Instant Indexing

- Submit lại sau khi thêm link: **${indexing.ok ? "OK" : "Lỗi"}**
- HTTP status: **${indexing.status}**
- Response: \`${indexing.response.replaceAll("`", "'")}\`
`;
  writeFileSync(LOG_PATH, log, "utf8");
  console.log(`DONE rows=${results.length} indexing=${indexing.ok}`);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
