import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
}

const BASE_URL = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const WRITE = process.argv.includes("--write");

const targets = [
  {
    type: "pages",
    id: 61,
    slug: "bang-gia",
    focus: "bảng giá hút bể phốt thông tắc cống Quảng Ninh",
    title: "Bảng giá hút bể phốt thông tắc cống Quảng Ninh 2026",
  },
  {
    type: "pages",
    id: 25,
    slug: "blog",
    focus: "dịch vụ hút bể phốt Quảng Ninh",
    title: "Dịch vụ hút bể phốt Quảng Ninh: blog xử lý cống, bể phốt, mùi hôi",
  },
  {
    type: "pages",
    id: 296,
    slug: "thong-tac-cong-ha-long",
    focus: "thông tắc cống Hạ Long",
    title: "Thông tắc cống Hạ Long 24/7 cho nhà hàng, khách sạn, nhà dân",
  },
  {
    type: "posts",
    id: 2332,
    slug: "cam-nang-thong-tac-cong-tai-ha-long",
    focus: "thông tắc cống Hạ Long",
    title: "Thông tắc cống Hạ Long: cẩm nang xử lý nhanh theo từng khu",
  },
  {
    type: "posts",
    id: 2046,
    slug: "mui-hoi-cong-nguyen-nhan-xu-ly",
    focus: "mùi hôi cống nguyên nhân xử lý",
    title: "Mùi hôi cống nguyên nhân xử lý tại nhà, gọi thợ khi cần",
  },
  {
    type: "posts",
    id: 2045,
    slug: "hoa-chat-tu-thong-cong",
    focus: "hóa chất tự thông cống",
    title: "Hóa chất tự thông cống: loại an toàn và loại gây hại",
  },
  {
    type: "posts",
    id: 2043,
    slug: "bon-cau-rut-cham-nguyen-nhan",
    focus: "bồn cầu rút chậm nguyên nhân",
    title: "Bồn cầu rút chậm nguyên nhân và cách xử lý tại nhà",
  },
  {
    type: "pages",
    id: 386,
    slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
    focus: "nguyên nhân cống tắc thường xuyên Hạ Long",
    title: "Nguyên nhân cống tắc thường xuyên Hạ Long và cách xử lý",
  },
  {
    type: "pages",
    id: 2022,
    slug: "he-thong-lien-ket-doi-tac",
    focus: "đối tác bể phốt Quảng Ninh",
    title: "Đối tác bể phốt Quảng Ninh và hệ thống truyền thông",
  },
  {
    type: "pages",
    id: 62,
    slug: "gioi-thieu",
    focus: "dịch vụ thông tắc Quảng Ninh",
    title: "Dịch vụ thông tắc Quảng Ninh - Hồ sơ Môi Trường Đô Thị Số 1",
  },
  {
    type: "pages",
    id: 53,
    slug: "hut-be-phot-cam-pha",
    focus: "hút bể phốt Cẩm Phả",
    title: "Hút bể phốt Cẩm Phả: xe bồn vào ngõ, xử lý bể đầy lâu năm",
  },
  {
    type: "pages",
    id: 54,
    slug: "hut-be-phot-uong-bi",
    focus: "hút bể phốt Uông Bí",
    title: "Hút bể phốt Uông Bí cho nhà trọ, khu dân cư, cơ sở kinh doanh",
  },
  {
    type: "pages",
    id: 63,
    slug: "lien-he",
    focus: "liên hệ thông tắc cống Quảng Ninh",
    title: "Liên hệ thông tắc cống Quảng Ninh, hút bể phốt 24/7",
  },
  {
    type: "pages",
    id: 2356,
    slug: "nguyen-song-hao",
    focus: "Nguyễn Song Hào chuyên gia vệ sinh môi trường",
    title: "Nguyễn Song Hào chuyên gia vệ sinh môi trường Quảng Ninh",
  },
];

function normalize(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFC")
    .replace(/[–—|:,.!?()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertTarget(target) {
  const normalizedTitle = normalize(target.title);
  const normalizedFocus = normalize(target.focus);
  if (!normalizedTitle.includes(normalizedFocus)) {
    throw new Error(`Title does not contain focus keyword: ${target.slug}`);
  }
  const length = [...target.title].length;
  if (length < 45 || length > 75) {
    throw new Error(`Title length outside 45-75 chars for ${target.slug}: ${length}`);
  }
}

async function requestJson(method, path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Codex Rank Math title focus keyword fix",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  if (!response.ok) {
    throw new Error(`${method} ${path} failed HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  return parsed;
}

const results = [];
for (const target of targets) {
  assertTarget(target);
  const before = await requestJson(
    "GET",
    `/wp-json/wp/v2/${target.type}/${target.id}?context=edit&_fields=id,slug,title,link,status`
  );

  if (!WRITE) {
    results.push({
      id: target.id,
      slug: target.slug,
      mode: "dry-run",
      beforeTitle: before.title?.raw || before.title?.rendered,
      newTitle: target.title,
      focus: target.focus,
    });
    continue;
  }

  const updated = await requestJson("POST", `/wp-json/wp/v2/${target.type}/${target.id}`, {
    title: target.title,
  });

  const rankMath = await requestJson("POST", "/wp-json/rankmath/v1/updateMeta", {
    objectID: target.id,
    objectType: "post",
    meta: {
      rank_math_focus_keyword: target.focus,
      rank_math_title: target.title,
    },
  });

  results.push({
    id: target.id,
    slug: target.slug,
    link: updated.link,
    oldTitle: before.title?.raw || before.title?.rendered,
    newTitle: updated.title?.raw || updated.title?.rendered,
    focus: target.focus,
    rankMath,
  });
}

if (WRITE) {
  const now = new Date();
  appendFileSync(
    "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv",
    `\n${now.toISOString().slice(0, 10)},${now.toTimeString().slice(0, 5)},FIX-RANKMATH-TITLE-FOCUS-2026-06-17,seo_fix,Fix Rank Math post titles missing focus keywords,https://thongtaccongquangninh.com/,,done,medium,,,,,Update title + rank_math_title + focus keyword for ${targets.length} posts/pages,tools/fix_rankmath_title_focus_keywords_2026_06_17.mjs,,Refresh Rank Math SEO Analysis trong WP Admin,Verify REST title contains focus keyword,,,,,,`,
    "utf8"
  );
}

console.log(JSON.stringify({ write: WRITE, count: results.length, results }, null, 2));
