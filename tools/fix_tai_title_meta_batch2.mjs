// Batch fix P2 (theo bao-cao-tu-khoa-tai.md, muc 4.10): chen bien the "tai <thanh pho>"
// vao Title (=H1) va Rank Math meta description cho 6 trang Mong Cai / Dong Trieu /
// Van Don - cung cong thuc da dung o batch1 (giu cum goc dau Title, them "Tai X" ve sau).
// Dia danh trong meta lay tu chinh noi dung dang co tren trang (Tra Co - Mong Cai,
// Mao Khe - Dong Trieu), khong bia ten phuong/xa moi.
//
// Cach chay:
//   node tools/fix_tai_title_meta_batch2.mjs --dry      # xem truoc, khong ghi
//   node tools/fix_tai_title_meta_batch2.mjs            # ghi that, tu backup

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

const PAGES = [
  { slug: "hut-be-phot-mong-cai", type: "pages",
    title: "Hút Bể Phốt Móng Cái – Xe Bồn Cửa Khẩu, Có Mặt Tại Móng Cái Nhanh",
    metaDesc: "Hút bể phốt tại Móng Cái — xe bồn phục vụ khu chợ cửa khẩu, nhà nghỉ ven biển Trà Cổ, báo giá trước khi hút, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại móng cái" },
  { slug: "thong-tac-cong-mong-cai", type: "pages",
    title: "Thông Tắc Cống Móng Cái – Thợ Có Mặt Tại Móng Cái Nhanh, Không Đục Phá",
    metaDesc: "Thông tắc cống tại Móng Cái — thợ có mặt nhanh khu chợ cửa khẩu, Trà Cổ, máy lò xo chuyên dụng, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại móng cái" },
  { slug: "hut-be-phot-dong-trieu", type: "pages",
    title: "Hút Bể Phốt Đông Triều – Xe Bồn Có Mặt Tại Đông Triều Nhanh",
    metaDesc: "Hút bể phốt tại Đông Triều — xe bồn vào khu dân cư Mạo Khê và nhà vườn vùng ven, báo giá trước khi hút, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại đông triều" },
  { slug: "thong-tac-cong-dong-trieu", type: "pages",
    title: "Thông Tắc Cống Đông Triều – Thợ Có Mặt Tại Đông Triều Nhanh",
    metaDesc: "Thông tắc cống tại Đông Triều — thợ có mặt nhanh khu Mạo Khê và vùng ven, máy lò xo công nghiệp, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại đông triều" },
  { slug: "hut-be-phot-van-don", type: "pages",
    title: "Hút Bể Phốt Vân Đồn – Xe Bồn Có Mặt Tại Vân Đồn Nhanh",
    metaDesc: "Hút bể phốt tại Vân Đồn — phục vụ cả khu vực đảo và đất liền, homestay, resort ven biển, báo giá trước khi hút. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại vân đồn" },
  { slug: "thong-tac-cong-van-don", type: "pages",
    title: "Thông Tắc Cống Vân Đồn – Thợ Có Mặt Tại Vân Đồn Nhanh",
    metaDesc: "Thông tắc cống tại Vân Đồn — thợ có mặt nhanh khu vực đảo và đất liền, nhà hàng, khách sạn du lịch, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại vân đồn" },
];

async function main() {
  const env = readEnv(ENV_PATH);
  const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/fix-tai-batch2-${stamp}`;
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
    writeFileSync(`${ROOT}/reports/fix-tai-batch2-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
    console.log("Backup dir:", backupDir);
  }
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
