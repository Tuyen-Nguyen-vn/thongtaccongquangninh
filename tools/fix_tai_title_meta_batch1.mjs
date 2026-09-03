// Batch fix: chèn biến thể "tại <thành phố>" vào Title (= H1 trên theme này) và
// Rank Math meta description cho 9 trang dịch vụ ưu tiên P0/P1 (xem
// bao-cao-tu-khoa-tai.md, Giai đoạn 4). CHỈ đổi `title` + `meta.rank_math_description`
// + `meta.rank_math_focus_keyword` — KHÔNG đụng vào `content` (H2/H3/FAQ/schema bên
// trong body) để tránh phá cấu trúc Elementor/block đã lên top.
//
// Cách chạy (trên máy có D:/.thongtaccongquangninh/.env chứa WP_USERNAME + WP_APP_PASSWORD):
//   node tools/fix_tai_title_meta_batch1.mjs --dry      # xem trước, không ghi
//   node tools/fix_tai_title_meta_batch1.mjs            # ghi thật, tự backup title/content cũ
//
// Sau khi chạy thật: đối chiếu reports/fix-tai-batch1-<timestamp>.json và
// backups/fix-tai-batch1-<timestamp>/ để rollback thủ công nếu cần (PUT lại title/content cũ).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import https from "node:https";

const ENV_PATH = "D:/.thongtaccongquangninh/.env";
const HOST = "thongtaccongquangninh.com";
const ROOT = "D:/.thongtaccongquangninh";
const DRY = process.argv.includes("--dry");

function readEnv(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return values;
}

function request(method, urlPath, auth, payload) {
  return new Promise((resolve, reject) => {
    const body = payload === undefined ? null : Buffer.from(JSON.stringify(payload), "utf8");
    const req = https.request(
      { hostname: HOST, port: 443, path: urlPath, method,
        headers: { Authorization: auth, Accept: "application/json",
          ...(body ? { "Content-Type": "application/json", "Content-Length": body.length } : {}) } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (body) req.write(body);
    req.end();
  });
}

// type: "pages" hoặc "posts" theo cột "Type" trong seo-full-audit-2026-07-31.json
const PAGES = [
  { slug: "thong-tac-cong-quang-ninh", type: "pages",
    title: "Thông Tắc Cống Quảng Ninh – Thợ Có Mặt Tại Quảng Ninh Nhanh",
    metaDesc: "Thông tắc cống tại Quảng Ninh — thợ có mặt tại Quảng Ninh trong 20-30 phút, máy lò xo chuyên dụng, báo giá trước khi làm, không đục phá. Gọi 0963.953.533.",
    focusKeyword: "thông tắc cống tại quảng ninh" },
  { slug: "hut-be-phot-ha-long", type: "pages",
    title: "Hút Bể Phốt Hạ Long – Xe Bồn Có Mặt Tại Hạ Long Trong 30 Phút",
    metaDesc: "Hút bể phốt tại Hạ Long — xe bồn có mặt sau 20-30 phút, vào ngõ sâu Bãi Cháy, Hồng Gai, Hà Khẩu, báo giá trước khi hút. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại hạ long" },
  { slug: "hut-be-phot-cam-pha", type: "pages",
    title: "Hút Bể Phốt Cẩm Phả – Xe Bồn Lớn, Điều Phối Tại Cẩm Phả Nhanh",
    metaDesc: "Hút bể phốt tại Cẩm Phả — xe bồn lớn vào ngõ nhỏ Cửa Ông, Mông Dương, báo giá trước khi làm, không phát sinh phụ phí. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại cẩm phả" },
  { slug: "thong-tac-cong-ha-long", type: "pages",
    title: "Thông Tắc Cống Hạ Long – Thợ Điều Phối Có Mặt Tại Hạ Long Nhanh",
    metaDesc: "Thông tắc cống tại Hạ Long — thợ điều phối có mặt sau 20-30 phút khu Bãi Cháy, Hòn Gai, Hà Khẩu, máy lò xo công nghiệp, không đục phá. Gọi 0963.953.533.",
    focusKeyword: "thông tắc cống tại hạ long" },
  { slug: "thong-tac-cong-cam-pha", type: "pages",
    title: "Thông Tắc Cống Cẩm Phả – Không Đục Phá, Đến Tận Nơi Tại Cẩm Phả",
    metaDesc: "Thông tắc cống tại Cẩm Phả — thợ đến tận nơi khu Cửa Ông, Mông Dương, Cẩm Thủy, xử lý nước trào và mùi hôi, báo giá rõ. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại cẩm phả" },
  { slug: "hut-be-phot-quang-ninh", type: "pages",
    title: "Hút Bể Phốt Quảng Ninh – Xe Bồn Có Mặt Tại Quảng Ninh 30 Phút",
    metaDesc: "Hút bể phốt tại Quảng Ninh — xe bồn lớn có mặt trong 30 phút khắp Hạ Long, Cẩm Phả, Uông Bí, báo giá trước khi hút. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại quảng ninh" },
  { slug: "hut-be-phot-uong-bi", type: "pages",
    title: "Hút Bể Phốt Uông Bí – Xe Bồn Có Mặt Tại Uông Bí Trong 30 Phút",
    metaDesc: "Hút bể phốt tại Uông Bí — xe bồn điều phối theo khu vực Vàng Danh, Quang Trung, Yên Thanh, báo giá trước khi làm. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại uông bí" },
  { slug: "hut-be-phot-quang-yen", type: "pages",
    title: "Hút Bể Phốt Quảng Yên – Xe Bồn Lớn, Có Mặt Tại Quảng Yên Nhanh",
    metaDesc: "Hút bể phốt tại Quảng Yên — xe bồn vào khu ven sông, khu công nghiệp Đông Mai, báo giá trước khi làm, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại quảng yên" },
  { slug: "thong-tac-cong-quang-yen", type: "pages",
    title: "Thông Tắc Cống Quảng Yên – Điều Phối Thợ Có Mặt Tại Quảng Yên",
    metaDesc: "Thông tắc cống tại Quảng Yên — thợ điều phối nhanh khu Hà An, Tiền An, Đông Mai, xử lý bùn cặn và nước trào. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại quảng yên" },
];

async function main() {
  const env = readEnv(ENV_PATH);
  const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/fix-tai-batch1-${stamp}`;
  if (!DRY) mkdirSync(backupDir, { recursive: true });

  const results = [];
  for (const page of PAGES) {
    const findRes = await request("GET", `/wp-json/wp/v2/${page.type}?slug=${page.slug}&context=edit`, auth);
    if (findRes.status !== 200) { console.error(`[${page.slug}] GET slug lookup failed`, findRes.status, findRes.text.slice(0, 200)); continue; }
    const found = JSON.parse(findRes.text);
    if (!found.length) { console.error(`[${page.slug}] khong tim thay trang`); continue; }
    const old = found[0];
    const id = old.id;

    if (page.title.length < 30 || page.title.length > 75) console.warn(`[${page.slug}] CANH BAO: title dai ${page.title.length} ky tu`);
    if (page.metaDesc.length < 120 || page.metaDesc.length > 165) console.warn(`[${page.slug}] CANH BAO: meta dai ${page.metaDesc.length} ky tu`);
    if (!page.title.includes("0963.953.533") && !page.metaDesc.includes("0963.953.533")) console.warn(`[${page.slug}] CANH BAO: thieu hotline trong meta`);

    console.log(`[${id}] ${page.slug}`);
    console.log(`  title cu : ${old.title.raw}`);
    console.log(`  title moi: ${page.title}`);

    if (DRY) {
      results.push({ id, slug: page.slug, dry: true, oldTitle: old.title.raw, newTitle: page.title });
      continue;
    }

    writeFileSync(`${backupDir}/${id}.json`,
      JSON.stringify({ id, slug: page.slug, title: old.title.raw, content: old.content.raw, link: old.link }, null, 2), "utf8");

    const putRes = await request("POST", `/wp-json/wp/v2/${page.type}/${id}`, auth, {
      title: page.title,
      meta: { rank_math_description: page.metaDesc, rank_math_focus_keyword: page.focusKeyword },
    });
    console.log(`  status: ${putRes.status}`);
    results.push({ id, slug: page.slug, status: putRes.status, oldTitle: old.title.raw, newTitle: page.title, resText: putRes.text.slice(0, 250) });
  }

  if (!DRY) {
    writeFileSync(`${ROOT}/reports/fix-tai-batch1-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
    console.log("Backup dir:", backupDir);
  }
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
