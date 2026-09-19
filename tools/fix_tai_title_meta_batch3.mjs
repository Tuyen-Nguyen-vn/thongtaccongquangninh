// Batch fix 3: chèn biến thể "tại <thành phố>" vào Title (= H1 trên theme này) và Rank Math
// meta description cho 13 trang CÒN LẠI được phân loại "B — nhắm yếu" trong lần crawl+phân
// tích thật ngày 2026-09-19 (reports/tai-keyword-crawl-2026-09-19T21-27-46.json +
// reports/phan-tich-tai-2026-09-19T21-29-07.md) — sau khi batch1 (10 trang) và batch2 (6 trang)
// đã đưa 12/25 cụm "tại X" lên PASS. Cùng cơ chế an toàn với batch1/2: CHỈ đổi `title` +
// `meta.rank_math_description` + `meta.rank_math_focus_keyword` — KHÔNG đụng vào `content`
// (H2/H3/FAQ/schema bên trong body) để tránh phá cấu trúc đã lên top.
//
// Khác với batch1: script này backup CẢ meta cũ (rank_math_description/focus_keyword), không
// chỉ title/content — batch1/2 không backup meta nên nếu cần rollback meta phải tự nhớ lại.
//
// Cách chạy (trên máy có D:/.thongtaccongquangninh/.env chứa WP_USERNAME + WP_APP_PASSWORD):
//   node tools/fix_tai_title_meta_batch3.mjs --dry      # xem trước, không ghi
//   node tools/fix_tai_title_meta_batch3.mjs            # ghi thật, tự backup title/content/meta cũ
//
// Sau khi chạy thật: đối chiếu reports/fix-tai-batch3-<timestamp>.json và
// backups/fix-tai-batch3-<timestamp>/ để rollback thủ công nếu cần (PUT lại title/content/meta cũ).

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

// Tất cả 13 trang đều là type "pages" (xác nhận qua GET /wp-json/wp/v2/pages?slug=...
// ngày 2026-09-19, tất cả trả về "type":"page").
const PAGES = [
  { slug: "hut-be-phot-ha-long", type: "pages",
    title: "Hút Bể Phốt Tại Hạ Long: Khảo Sát Lối Xe, Báo Giá Trước Thi Công",
    metaDesc: "Hút bể phốt tại Hạ Long — xe bồn khảo sát trước, báo giá rõ trước khi thi công, vào ngõ sâu Bãi Cháy, Hồng Gai, Hà Khẩu. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại hạ long" },
  { slug: "hut-be-phot-cam-pha", type: "pages",
    title: "Hút bể phốt tại Cẩm Phả: dấu hiệu và thông tin cần xác nhận",
    metaDesc: "Hút bể phốt tại Cẩm Phả — nhận diện đúng dấu hiệu bể đầy, xe bồn vào khu Cẩm Trung, Cửa Ông, Mông Dương, báo giá trước khi hút. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại cẩm phả" },
  { slug: "hut-be-phot-uong-bi", type: "pages",
    title: "Hút bể phốt tại Uông Bí: dấu hiệu và thông tin cần xác nhận",
    metaDesc: "Hút bể phốt tại Uông Bí — nhận diện dấu hiệu bể đầy, xe bồn điều phối khu Vàng Danh, Yên Thanh, Quang Trung, báo giá trước khi hút. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại uông bí" },
  { slug: "thong-tac-cong-ha-long", type: "pages",
    title: "Thông tắc cống tại Hạ Long: kiểm tra nguyên nhân và xử lý an toàn",
    metaDesc: "Thông tắc cống tại Hạ Long — kiểm tra đúng nguyên nhân trước khi xử lý, thợ có mặt khu Bãi Cháy, Hồng Gai, Hà Khẩu, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại hạ long" },
  { slug: "thong-tac-cong-uong-bi", type: "pages",
    title: "Thông tắc cống tại Uông Bí cho hệ ống cũ, nhà trọ đông dân nhanh",
    metaDesc: "Thông tắc cống tại Uông Bí — xử lý hệ ống cũ, nhà trọ đông dân khu Vàng Danh, Yên Thanh, máy lò xo chuyên dụng. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại uông bí" },
  { slug: "thong-tac-bon-cau-ha-long", type: "pages",
    title: "Thông tắc bồn cầu tại Hạ Long cho khách sạn, nhà hàng và nhà dân",
    metaDesc: "Thông tắc bồn cầu tại Hạ Long — xử lý cho khách sạn, nhà hàng, nhà dân khu Bãi Cháy, Hồng Gai, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc bồn cầu tại hạ long" },
  { slug: "thong-tac-bon-cau-cam-pha", type: "pages",
    title: "Thông tắc bồn cầu tại Cẩm Phả cho nhà dân, nhà trọ và khu mỏ",
    metaDesc: "Thông tắc bồn cầu tại Cẩm Phả — xử lý cho nhà dân, nhà trọ khu mỏ Cẩm Trung, Cẩm Thủy, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc bồn cầu tại cẩm phả" },
  { slug: "thong-tac-bon-cau-uong-bi", type: "pages",
    title: "Thông tắc bồn cầu tại Uông Bí cho nhà trọ, dân cư và công trình ống cũ",
    metaDesc: "Thông tắc bồn cầu tại Uông Bí — xử lý cho nhà trọ, dân cư, công trình ống cũ khu Vàng Danh, Yên Thanh. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc bồn cầu tại uông bí" },
  { slug: "thong-tac-bon-cau-mong-cai", type: "pages",
    title: "Thông tắc bồn cầu tại Móng Cái cho nhà phố, cửa hàng và nhà nghỉ",
    metaDesc: "Thông tắc bồn cầu tại Móng Cái — xử lý cho nhà phố, cửa hàng, nhà nghỉ khu chợ cửa khẩu, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc bồn cầu tại móng cái" },
  { slug: "thong-tac-bon-cau-quang-yen", type: "pages",
    title: "Thông tắc bồn cầu tại Quảng Yên cho nhà nền thấp, ven sông, khu trọ",
    metaDesc: "Thông tắc bồn cầu tại Quảng Yên — xử lý cho nhà nền thấp, ven sông, khu trọ, khu công nghiệp Đông Mai. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc bồn cầu tại quảng yên" },
  { slug: "thong-tac-bon-cau-dong-trieu", type: "pages",
    title: "Thông tắc bồn cầu tại Đông Triều cho nhà trong ngõ, khu trọ và cửa hàng",
    metaDesc: "Thông tắc bồn cầu tại Đông Triều — xử lý cho nhà trong ngõ, khu trọ Mạo Khê, cửa hàng ven quốc lộ. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc bồn cầu tại đông triều" },
  { slug: "thong-tac-bon-cau-van-don", type: "pages",
    title: "Thông tắc bồn cầu tại Vân Đồn cho homestay, resort và nhà dân ven biển",
    metaDesc: "Thông tắc bồn cầu tại Vân Đồn — xử lý cho homestay, resort, nhà dân ven biển, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc bồn cầu tại vân đồn" },
  { slug: "thong-tac-bon-cau-quang-ninh", type: "pages",
    title: "Thông tắc bồn cầu tại Quảng Ninh cho nhà dân, nhà hàng, khách sạn",
    metaDesc: "Thông tắc bồn cầu tại Quảng Ninh — xử lý cho nhà dân, nhà hàng, khách sạn khắp Hạ Long, Cẩm Phả, Uông Bí. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc bồn cầu tại quảng ninh" },
];

async function main() {
  const env = readEnv(ENV_PATH);
  const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/fix-tai-batch3-${stamp}`;
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
    if (!old.title.raw.trim()) console.warn(`[${page.slug}] CANH BAO: khong doc duoc title cu (co the thieu quyen context=edit)`);

    console.log(`[${id}] ${page.slug}`);
    console.log(`  title cu : ${old.title.raw}`);
    console.log(`  title moi: ${page.title}`);
    console.log(`  meta cu  : ${old.meta?.rank_math_description || "(rong/khong doc duoc)"}`);

    if (DRY) {
      results.push({ id, slug: page.slug, dry: true, oldTitle: old.title.raw, newTitle: page.title });
      continue;
    }

    writeFileSync(`${backupDir}/${id}.json`, JSON.stringify({
      id, slug: page.slug, link: old.link,
      title: old.title.raw, content: old.content.raw,
      metaOld: {
        rank_math_description: old.meta?.rank_math_description ?? null,
        rank_math_focus_keyword: old.meta?.rank_math_focus_keyword ?? null,
      },
    }, null, 2), "utf8");

    const putRes = await request("POST", `/wp-json/wp/v2/${page.type}/${id}`, auth, {
      title: page.title,
      meta: { rank_math_description: page.metaDesc, rank_math_focus_keyword: page.focusKeyword },
    });
    console.log(`  status: ${putRes.status}`);
    results.push({ id, slug: page.slug, status: putRes.status, oldTitle: old.title.raw, newTitle: page.title, resText: putRes.text.slice(0, 250) });
  }

  if (!DRY) {
    writeFileSync(`${ROOT}/reports/fix-tai-batch3-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
    console.log("Backup dir:", backupDir);
  }
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
