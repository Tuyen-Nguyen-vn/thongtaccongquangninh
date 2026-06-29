/**
 * Fix P0 audit issues for /gia-thong-tac-cong-quang-ninh-2026/ (post 2787).
 *
 * Usage:
 *   node tools/fix_gia_ttc_2026_p0.mjs          # dry-run
 *   node tools/fix_gia_ttc_2026_p0.mjs --write  # apply live update
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WRITE = process.argv.includes("--write");
const POST_ID = 2787;
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const BACKUP_DIR = "D:\\.thongtaccongquangninh\\backups\\live-audit-fix-2026-06-12";

const NEW_TITLE = "Giá Thông Tắc Cống Quảng Ninh 2026: Từ 200.000đ, Không Phát Sinh";
const NEW_META =
  "Bảng giá thông tắc cống Quảng Ninh 2026 từ 200.000đ, báo rõ trước khi làm, không đục phá khi chưa cần. Gọi 0963.953.533 phục vụ 24/7 toàn tỉnh, hỗ trợ nhanh.";
const FOCUS_KW = "giá thông tắc cống Quảng Ninh 2026";

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + path,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "ttcqn-fix-gia-ttc-2026-p0/1.0",
        ...(bodyBuf
          ? {
              "Content-Type": "application/json",
              "Content-Length": bodyBuf.length,
            }
          : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://${WP_HOST}/gia-thong-tac-cong-quang-ninh-2026/#service`,
    name: "Giá thông tắc cống Quảng Ninh 2026",
    serviceType: "Thông tắc cống",
    provider: {
      "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      telephone: ["0963.953.533", "0931.156.756"],
      url: `https://${WP_HOST}/`,
    },
    areaServed: [
      "Hạ Long",
      "Cẩm Phả",
      "Uông Bí",
      "Quảng Yên",
      "Đông Triều",
      "Móng Cái",
      "Vân Đồn",
      "Quảng Ninh",
    ],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "VND",
      lowPrice: "200000",
      highPrice: "3500000",
      offerCount: "8",
      availability: "https://schema.org/InStock",
      url: `https://${WP_HOST}/gia-thong-tac-cong-quang-ninh-2026/`,
    },
    description:
      "Bảng giá thông tắc cống Quảng Ninh 2026, báo rõ trước khi làm, không đục phá khi chưa cần, phục vụ 24/7.",
  };
}

function patchContent(raw) {
  let content = raw;

  content = content.replace(
    "<h2>Tại Sao Nhiều Người Bị Chặt Chém Khi Thông Tắc Cống?</h2>",
    "<h2>Nguyên Nhân Nhiều Người Bị Chặt Chém Khi Thông Tắc Cống?</h2>",
  );

  const editorialStart = content.indexOf("<p><strong>GỢI Ý ẢNH");
  const authorLine =
    '<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>';
  const authorIndex = content.indexOf(authorLine);
  if (editorialStart !== -1 && authorIndex !== -1 && editorialStart < authorIndex) {
    content = content.slice(0, editorialStart).trimEnd() + "\n" + content.slice(authorIndex);
  }

  content = content
    .replaceAll("uy tín", "rõ thông tin")
    .replaceAll("Uy tín", "Rõ thông tin")
    .replaceAll("chuyên nghiệp", "đúng quy trình")
    .replaceAll("Chuyên nghiệp", "Đúng quy trình")
    .replaceAll("cam kết mang đến", "thực hiện theo đúng");

  const schemaHtml =
    `<script type="application/ld+json">${JSON.stringify(serviceSchema())}</script>\n`;
  if (!content.includes('"#service"') && !content.includes("/gia-thong-tac-cong-quang-ninh-2026/#service")) {
    const idx = content.indexOf(authorLine);
    content = idx === -1 ? content.trimEnd() + "\n" + schemaHtml : content.slice(0, idx) + schemaHtml + content.slice(idx);
  }

  return content;
}

function textFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countNeedle(haystack, needle) {
  return haystack.toLowerCase().split(needle.toLowerCase()).length - 1;
}

async function main() {
  console.log(`=== Fix gia TTC 2026 P0 (${WRITE ? "WRITE" : "DRY-RUN"}) ===`);
  console.log(`Title length: ${[...NEW_TITLE].length}`);
  console.log(`Meta length: ${[...NEW_META].length}`);

  const current = await wpRequest("GET", `/wp/v2/posts/${POST_ID}?context=edit`);
  if (current.status !== 200) throw new Error(`GET post failed: ${current.status}`);

  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(`${BACKUP_DIR}\\post-2787-before-${stamp}.json`, JSON.stringify(current.data, null, 2), "utf8");

  const before = current.data.content?.raw || "";
  const after = patchContent(before);
  const plain = textFromHtml(after);
  const checks = {
    hasNguyenNhanH2: after.includes("<h2>Nguyên Nhân"),
    hasServiceSchema: after.includes("/gia-thong-tac-cong-quang-ninh-2026/#service"),
    forbiddenUyTin: countNeedle(plain, "uy tín"),
    forbiddenChuyenNghiep: countNeedle(plain, "chuyên nghiệp"),
    removedEditorialBlock: !after.includes("GỢI Ý ẢNH") && !after.includes("CHECKLIST RANK MATH"),
    beforeLen: before.length,
    afterLen: after.length,
    approxWords: plain.split(/\s+/).filter(Boolean).length,
  };
  console.log(JSON.stringify(checks, null, 2));

  writeFileSync(`${BACKUP_DIR}\\post-2787-after-preview.html`, after, "utf8");

  if (!WRITE) {
    console.log("[DRY-RUN] Preview written: backups/live-audit-fix-2026-06-12/post-2787-after-preview.html");
    return;
  }

  const updatePost = await wpRequest("POST", `/wp/v2/posts/${POST_ID}`, {
    title: NEW_TITLE,
    content: after,
  });
  if (updatePost.status !== 200) {
    throw new Error(`POST update failed: ${updatePost.status} ${JSON.stringify(updatePost.data).slice(0, 300)}`);
  }
  console.log(`Post updated: ${updatePost.data.link}`);

  const meta = await wpRequest("POST", "/rankmath/v1/updateMeta", {
    objectType: "post",
    objectID: POST_ID,
    meta: {
      rank_math_title: NEW_TITLE,
      rank_math_focus_keyword: FOCUS_KW,
      rank_math_description: NEW_META,
    },
  });
  console.log(`Rank Math update: ${meta.status} ${JSON.stringify(meta.data).slice(0, 180)}`);
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
