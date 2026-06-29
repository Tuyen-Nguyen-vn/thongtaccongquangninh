import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const OUT_DIR = join(PROJECT, "reports", "keyword-research");
const BASE_URL = "https://thongtaccongquangninh.com";
const HOTLINE = "0963.953.533 / 0931.156.756";

const LOCATIONS = [
  "Quảng Ninh",
  "Hạ Long",
  "Cẩm Phả",
  "Uông Bí",
  "Quảng Yên",
  "Đông Triều",
  "Móng Cái",
  "Vân Đồn",
  "Tiên Yên",
  "Ba Chẽ",
  "Hải Hà",
  "Bình Liêu",
  "Bãi Cháy",
  "Hòn Gai",
  "Cao Xanh",
  "Cao Thắng",
  "Tuần Châu",
  "Hồng Gai",
  "Hồng Hà",
  "Giếng Đáy",
  "Hà Khẩu",
  "Cửa Ông",
  "Cẩm Trung",
  "Cẩm Thành",
  "Cẩm Thủy",
  "Cẩm Bình",
  "Quang Hanh",
  "Mông Dương",
  "Cẩm Sơn",
  "Quang Trung",
  "Trưng Vương",
  "Thanh Sơn",
  "Yên Thanh",
  "Phương Đông",
  "Phương Nam",
  "Nam Khê",
  "Vàng Danh",
  "Yên Tử",
  "Hà An",
  "Đông Mai",
  "Minh Thành",
  "Sông Khoai",
  "Cộng Hòa",
  "Tiền An",
  "Tân An",
  "Hoàng Tân",
];

const SERVICES = [
  {
    name: "hut-be-phot",
    label: "hút bể phốt",
    intent: ["transactional", "local-service"],
    core: ["hút bể phốt", "hút hầm cầu", "xe hút bể phốt", "bể phốt đầy", "mùi hôi bể phốt"],
    modifiers: ["24/7", "báo giá", "xe hút", "không đục phá", "nhanh", "tại nhà"],
  },
  {
    name: "thong-tac-cong",
    label: "thông tắc cống",
    intent: ["transactional", "local-service"],
    core: ["thông tắc cống", "cống tắc", "tắc cống", "thông cống", "thợ thông tắc cống"],
    modifiers: ["24/7", "báo giá", "không đục phá", "nhanh", "tại nhà", "máy lò xo"],
  },
  {
    name: "thong-tac-bon-cau",
    label: "thông tắc bồn cầu",
    intent: ["transactional", "local-service"],
    core: ["thông tắc bồn cầu", "bồn cầu tắc", "toilet tắc", "thông toilet", "xử lý bồn cầu nghẹt"],
    modifiers: ["24/7", "không đục phá", "nhanh", "tại nhà", "báo giá"],
  },
  {
    name: "thong-tac-chau-rua",
    label: "thông tắc chậu rửa",
    intent: ["transactional", "local-service"],
    core: ["thông tắc chậu rửa", "chậu rửa tắc", "lavabo tắc", "bồn rửa tắc", "ống thoát chậu rửa tắc"],
    modifiers: ["24/7", "không đục phá", "nhanh", "báo giá", "tại nhà"],
  },
  {
    name: "nao-vet-ho-ga",
    label: "nạo vét hố ga",
    intent: ["transactional", "local-service"],
    core: ["nạo vét hố ga", "hút bùn hố ga", "hố ga đầy", "hố ga bốc mùi", "nạo vét cống thoát nước"],
    modifiers: ["24/7", "báo giá", "nhanh", "tại nhà", "đúng kỹ thuật"],
  },
  {
    name: "xu-ly-mui-hoi",
    label: "xử lý mùi hôi",
    intent: ["transactional", "local-service", "informational"],
    core: ["xử lý mùi hôi", "khử mùi hôi nhà vệ sinh", "mùi hôi cống", "mùi hôi bể phốt", "mùi hôi hố ga"],
    modifiers: ["24/7", "tại nhà", "báo giá", "nhanh", "an toàn"],
  },
  {
    name: "gia-tham-khao",
    label: "giá / bảng giá",
    intent: ["commercial", "transactional"],
    core: ["bảng giá", "giá hút bể phốt", "giá thông tắc cống", "chi phí nạo vét hố ga", "báo giá dịch vụ"],
    modifiers: ["2026", "tham khảo", "rõ ràng", "trọn gói", "tại Quảng Ninh"],
  },
  {
    name: "tieu-chi-chon-tho",
    label: "tiêu chí chọn thợ / hướng dẫn",
    intent: ["informational"],
    core: ["khi nào cần hút bể phốt", "dấu hiệu bể phốt đầy", "nguyên nhân cống tắc", "cách xử lý cống tắc", "cách giảm mùi hôi nhà vệ sinh"],
    modifiers: ["chi tiết", "dễ hiểu", "an toàn", "đúng nguyên nhân"],
  },
];

const CHANNELS = [
  { name: "homepage", label: "trang chủ", priority: "high" },
  { name: "pillar", label: "trụ cột dịch vụ", priority: "high" },
  { name: "city-landing", label: "landing địa phương", priority: "high" },
  { name: "support-content", label: "bài hỗ trợ / blog", priority: "medium" },
  { name: "faq", label: "FAQ / giải đáp", priority: "medium" },
  { name: "pricing", label: "bảng giá", priority: "high" },
];

function slugify(input) {
  return String(input)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tokenize(input) {
  return String(input)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];
}

function scoreKeyword(keyword, service, location) {
  const tokens = tokenize(keyword);
  let score = 0;
  if (tokens.some((token) => service.core.some((core) => tokenize(core).every((t) => tokens.includes(t))))) score += 40;
  if (tokens.includes(slugify(location))) score += 25;
  if (tokens.some((token) => ["24", "7", "ban", "dem", "nhanh", "gia", "bao", "khong", "duc", "pha"].includes(token))) score += 10;
  if (tokens.length <= 6) score += 5;
  if (keyword.toLowerCase().includes(service.label)) score += 15;
  return Math.min(score, 100);
}

function keywordTypes(keyword, service, location) {
  const lower = keyword.toLowerCase();
  const hasLocation = slugify(keyword).includes(slugify(location));
  const hasPrice = /(gi[aá]|b[aả]ng gi[aá]|báo giá|chi phí)/i.test(keyword);
  const hasTime = /(24\/7|ban đêm|ban ngày|ngoài giờ|trong ngày|nhanh)/i.test(keyword);
  const hasProblem = /(tắc|nghẹt|đầy|mùi hôi|trào|nước chậm)/i.test(lower);
  const hasService = service.core.some((core) => lower.includes(core));
  return {
    local: hasLocation,
    price: hasPrice,
    urgency: hasTime,
    problem_solve: hasProblem,
    service_match: hasService,
  };
}

function generateKeywords() {
  const rows = [];
  for (const service of SERVICES) {
    for (const location of LOCATIONS) {
      const base = [
        `${service.label} ${location}`,
        `${service.core[0]} ${location}`,
        `${service.label} 24/7 ${location}`,
        `${service.label} ${location} 24/7`,
        `${service.label} giá ${location}`,
        `dịch vụ ${service.label} ${location}`,
        `${service.label} tại ${location}`,
      ];
      if (service.name === "gia-tham-khao") {
        base.splice(0, base.length, `bảng giá ${service.label} ${location}`, `giá ${service.core[1] ?? service.core[0]} ${location}`, `báo giá ${service.label} ${location}`);
      }
      if (service.name === "tieu-chi-chon-tho") {
        base.splice(0, base.length, `khi nào cần ${service.core[0]}`, service.core[1] ?? service.core[0], `nguyên nhân ${service.core[2] ?? service.core[0]}`);
      }
      for (const keyword of base) {
        const cleaned = keyword.replace(/\s+/g, " ").trim();
        rows.push({
          keyword: cleaned,
          slug: slugify(cleaned),
          service: service.name,
          service_label: service.label,
          location,
          score: scoreKeyword(cleaned, service, location),
          intent: service.intent.join(","),
          type: keywordTypes(cleaned, service, location),
        });
      }
    }
  }
  return rows;
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key];
    acc[value] ??= [];
    acc[value].push(item);
    return acc;
  }, {});
}

function dedupe(rows) {
  const seen = new Map();
  for (const row of rows) {
    const key = row.keyword.toLowerCase();
    if (!seen.has(key) || seen.get(key).score < row.score) seen.set(key, row);
  }
  return [...seen.values()].sort((a, b) => b.score - a.score || a.keyword.localeCompare(b.keyword, "vi"));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(rows) {
  const headers = ["keyword", "slug", "service", "service_label", "location", "score", "intent", "local", "price", "urgency", "problem_solve", "service_match"];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.keyword,
        row.slug,
        row.service,
        row.service_label,
        row.location,
        row.score,
        row.intent,
        row.type.local,
        row.type.price,
        row.type.urgency,
        row.type.problem_solve,
        row.type.service_match,
      ].map(csvEscape).join(",")
    );
  }
  return lines.join("\n");
}

function mdSummary(rows) {
  const byService = groupBy(rows, "service");
  const lines = [];
  lines.push("# Báo cáo nghiên cứu từ khóa SEO Quảng Ninh");
  lines.push("");
  lines.push(`- Generated at: ${new Date().toISOString()}`);
  lines.push(`- Base URL: ${BASE_URL}`);
  lines.push(`- Hotline: ${HOTLINE}`);
  lines.push("");
  lines.push("## Nhóm ưu tiên triển khai");
  for (const channel of CHANNELS) {
    lines.push(`- ${channel.label} (${channel.priority})`);
  }
  lines.push("");
  for (const [service, items] of Object.entries(byService)) {
    const top = items.slice(0, 10);
    lines.push(`## ${service}`);
    lines.push("");
    top.forEach((item, index) => {
      lines.push(`${index + 1}. **${item.keyword}** — score ${item.score} — ${item.location}`);
    });
    lines.push("");
  }
  lines.push("## Gợi ý ưu tiên nội dung");
  lines.push("- Từ khóa có địa danh + dịch vụ + 24/7 ưu tiên cao nhất.");
  lines.push("- Từ khóa giá / báo giá dùng cho landing pricing và post hỗ trợ.");
  lines.push("- Từ khóa informational dùng cho FAQ/blog để kéo traffic đầu phễu.");
  lines.push("");
  return lines.join("\n");
}

function quickPlan(rows) {
  const byService = groupBy(rows, "service");
  const plan = [];
  for (const [service, items] of Object.entries(byService)) {
    const top = items.slice(0, 8).map((item) => item.keyword);
    plan.push({ service, topKeywords: top });
  }
  return plan;
}

function main() {
  const outputDir = join(OUT_DIR, new Date().toISOString().slice(0, 10));
  mkdirSync(outputDir, { recursive: true });

  const rows = dedupe(generateKeywords());
  const csv = toCsv(rows);
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    hotline: HOTLINE,
    counts: {
      total: rows.length,
      services: SERVICES.length,
      locations: LOCATIONS.length,
      channels: CHANNELS.length,
    },
    channels: CHANNELS,
    services: SERVICES.map((service) => ({
      name: service.name,
      label: service.label,
      intent: service.intent,
      core: service.core,
      modifiers: service.modifiers,
    })),
    topKeywords: rows.slice(0, 100),
    quickPlan: quickPlan(rows),
  };

  writeFileSync(join(outputDir, "keyword-research.csv"), csv, "utf8");
  writeFileSync(join(outputDir, "keyword-research.json"), JSON.stringify(report, null, 2), "utf8");
  writeFileSync(join(outputDir, "keyword-research.md"), mdSummary(rows), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        outputDir,
        totalKeywords: rows.length,
        topKeywords: rows.slice(0, 20).map((row) => ({ keyword: row.keyword, score: row.score, location: row.location, service: row.service })),
      },
      null,
      2
    )
  );
}

main();
