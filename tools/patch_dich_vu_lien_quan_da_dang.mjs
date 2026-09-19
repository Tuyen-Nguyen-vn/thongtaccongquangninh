// PATCH 3 bai cam nang DA DANG CONG KHAI (khong phai nhap) de them muc "Dich vu lien quan"
// - muc nay da co san trong cac script publish_cam_nang_*.mjs cho cac bai MOI tao sau nay,
// nhung 3 bai duoi day da dang truoc khi them muc do nen can PATCH truc tiep qua REST API:
//   - cam-nang-hut-be-phot-tai-ha-long
//   - cam-nang-hut-be-phot-tai-cam-pha
//   - cam-nang-hut-be-phot-tai-uong-bi
//
// Script chi noi them dung 1 doan <h2>Dich vu lien quan...</h2><ul>...</ul> ngay TRUOC
// <h2>Lien he</h2> da co san trong bai - KHONG dung vao bat ky phan nao khac cua noi dung
// (Title, Meta, H1, cac H2/H3/FAQ khac giu nguyen 100%).
//
// An toan:
//   - Tu dong bo qua bai da co muc "Dich vu lien quan" roi (chay lai nhieu lan khong bi nhan doi).
//   - Tu backup content.raw cu ra reports/patch-backup-<slug>-<timestamp>.json TRUOC khi ghi de.
//   - --dry van goi GET that (doc, khong ghi) de xem truoc chinh xac se chen vao dau, nhung
//     KHONG goi POST cap nhat.
//
// Cach chay (tren may Windows co D:/.thongtaccongquangninh/.env chua WP_USERNAME + WP_APP_PASSWORD):
//   node tools/patch_dich_vu_lien_quan_da_dang.mjs --dry     # xem truoc, KHONG ghi gi len site
//   node tools/patch_dich_vu_lien_quan_da_dang.mjs           # ghi that len 3 bai da dang

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

function h2(t) { return `<h2>${t}</h2>`; }
function ul(items) { return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`; }

const INSERT_MARKER = "<h2>Liên hệ</h2>";
const ALREADY_PATCHED_MARKER = "Dịch vụ liên quan";

const PATCHES = [
  {
    slug: "cam-nang-hut-be-phot-tai-ha-long",
    heading: "Dịch vụ liên quan tại Hạ Long",
    items: [
      `<a href="https://thongtaccongquangninh.com/hut-be-phot-ha-long/">Trang dịch vụ hút bể phốt Hạ Long đầy đủ</a> — bảng giá, khu vực phục vụ, đặt lịch nhanh`,
      `<a href="https://thongtaccongquangninh.com/thong-tac-bon-cau-ha-long/">Thông tắc bồn cầu tại Hạ Long</a> — nếu chỉ tắc bồn cầu, không cần hút cả bể`,
      `<a href="https://thongtaccongquangninh.com/hut-ham-cau-quang-ninh/">Hút hầm cầu tại Quảng Ninh</a> — cho nhà có hầm cầu kiểu cũ thay vì bể tự hoại`,
    ],
  },
  {
    slug: "cam-nang-hut-be-phot-tai-cam-pha",
    heading: "Dịch vụ liên quan tại Cẩm Phả",
    items: [
      `<a href="https://thongtaccongquangninh.com/hut-be-phot-cam-pha/">Trang dịch vụ hút bể phốt Cẩm Phả đầy đủ</a> — bảng giá, khu vực phục vụ, đặt lịch nhanh`,
      `<a href="https://thongtaccongquangninh.com/thong-tac-bon-cau-cam-pha/">Thông tắc bồn cầu tại Cẩm Phả</a> — nếu chỉ tắc bồn cầu, không cần hút cả bể`,
      `<a href="https://thongtaccongquangninh.com/hut-ham-cau-quang-ninh/">Hút hầm cầu tại Quảng Ninh</a> — cho nhà có hầm cầu kiểu cũ thay vì bể tự hoại`,
    ],
  },
  {
    slug: "cam-nang-hut-be-phot-tai-uong-bi",
    heading: "Dịch vụ liên quan tại Uông Bí",
    items: [
      `<a href="https://thongtaccongquangninh.com/hut-be-phot-uong-bi/">Trang dịch vụ hút bể phốt Uông Bí đầy đủ</a> — bảng giá, khu vực phục vụ, đặt lịch nhanh`,
      `<a href="https://thongtaccongquangninh.com/thong-tac-bon-cau-uong-bi/">Thông tắc bồn cầu tại Uông Bí</a> — nếu chỉ tắc bồn cầu, không cần hút cả bể`,
      `<a href="https://thongtaccongquangninh.com/hut-ham-cau-quang-ninh/">Hút hầm cầu tại Quảng Ninh</a> — cho nhà có hầm cầu kiểu cũ thay vì bể tự hoại`,
    ],
  },
];

async function findPostBySlug(auth, slug) {
  // context=edit tra ve content.raw (noi dung goc, chua qua filter wpautop/shortcode) - bat buoc
  // phai dung raw de chen dung vi tri, khong dung content.rendered vi da bi WordPress bien doi.
  const res = await request(
    "GET",
    `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&status=publish,draft,private,future&context=edit`,
    auth,
  );
  if (res.status !== 200) return { error: `GET that bai (status ${res.status}): ${res.text.slice(0, 300)}` };
  let list;
  try { list = JSON.parse(res.text); } catch { return { error: "Khong doc duoc JSON tra ve." }; }
  if (!list.length) return { error: "Khong tim thay bai voi slug nay tren site." };
  return { post: list[0] };
}

async function main() {
  const env = readEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
    console.error("[FATAL] Thieu WP_USERNAME hoac WP_APP_PASSWORD trong", ENV_PATH);
    process.exit(1);
  }
  const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

  for (const patch of PATCHES) {
    console.log(`\n=== ${patch.slug} ===`);
    const { post, error } = await findPostBySlug(auth, patch.slug);
    if (error) { console.error("LOI:", error); continue; }

    const raw = post.content?.raw;
    if (typeof raw !== "string") {
      console.error("LOI: khong doc duoc content.raw (co the tai khoan thieu quyen edit_posts).");
      continue;
    }

    if (raw.includes(ALREADY_PATCHED_MARKER)) {
      console.log(`Bai id=${post.id} (status=${post.status}) DA co muc "Dich vu lien quan" roi - bo qua, khong ghi de.`);
      continue;
    }

    if (!raw.includes(INSERT_MARKER)) {
      console.error(`LOI: khong tim thay "${INSERT_MARKER}" trong noi dung bai id=${post.id} - can kiem tra tay, khong tu chen.`);
      continue;
    }

    const block = h2(patch.heading) + "\n" + ul(patch.items) + "\n\n";
    const newRaw = raw.replace(INSERT_MARKER, block + INSERT_MARKER);

    console.log(`Bai id=${post.id} (status=${post.status}), link: ${post.link}`);
    console.log(`Se chen truoc "${INSERT_MARKER}":`);
    console.log(block.trim());

    if (DRY) { console.log("--dry: chua ghi gi len WordPress."); continue; }

    mkdirSync(`${ROOT}/reports`, { recursive: true });
    writeFileSync(
      `${ROOT}/reports/patch-backup-${patch.slug}-${Date.now()}.json`,
      JSON.stringify({ id: post.id, slug: patch.slug, link: post.link, contentRawBeforePatch: raw }, null, 2),
      "utf8",
    );

    const res = await request("POST", `/wp-json/wp/v2/posts/${post.id}`, auth, { content: newRaw });
    if (res.status !== 200) {
      console.error(`PATCH THAT BAI (status ${res.status}):`, res.text.slice(0, 500));
      continue;
    }
    console.log(`DA PATCH THANH CONG: ${post.link}`);
  }

  if (DRY) console.log("\n--dry: khong bai nao bi ghi. Bo --dry de patch that.");
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
