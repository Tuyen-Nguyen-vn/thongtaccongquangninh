/**
 * Fix only the visible H1/post title for PAGE 52 /hut-be-phot-ha-long/.
 *
 * The body content already matches the latest brief. The GeneratePress page H1
 * is rendered from post_title, while Rank Math can keep a shorter SEO title.
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ROOT = "/mnt/d/.thongtaccongquangninh";
const ENV_PATH = path.join(ROOT, ".env");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 52;
const URL_PATH = "/hut-be-phot-ha-long/";
const TARGET_H1 = "Hút Bể Phốt Hạ Long Giá Rõ Ràng, Có Mặt Nhanh Tại Nhà Dân, Khách Sạn, Homestay";
const SEO_TITLE = "Hút Bể Phốt Hạ Long Giá Rõ Ràng, Phục Vụ Nhanh Tại Bãi Cháy, Hồng Gai";
const FOCUS_KEYWORD = "hút bể phốt Hạ Long";

function parseEnv(file) {
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpRest(method, wpPath, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + wpPath,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "codex-fix-hbp-halong-h1/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function liveGet(urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: urlPath,
      method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "codex-verify-hbp-halong-h1/1.0" },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function clean(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractH1s(html) {
  return [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => clean(m[1]));
}

function countFaqSchema(html) {
  let count = 0;
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(match[1].trim());
      const items = Array.isArray(json) ? json : Array.isArray(json["@graph"]) ? json["@graph"] : [json];
      for (const item of items) {
        if (item["@type"] === "FAQPage") count += item.mainEntity?.length || 0;
      }
    } catch {
      // Ignore non-JSON or malformed legacy blocks.
    }
  }
  return count;
}

const page = await wpRest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`);
if (page.status !== 200) {
  console.error(`GET page failed: ${page.status}`);
  process.exit(1);
}

const backupDir = path.join(ROOT, "seo-revisions", `wp-before-hbp-halong-h1-${new Date().toISOString().slice(0, 10)}`);
mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `page-52-before-h1-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(backupPath, JSON.stringify(page.data, null, 2), "utf8");

console.log(`Mode: ${WRITE ? "WRITE" : "DRY-RUN"}`);
console.log(`Backup: ${backupPath}`);
console.log(`Current title: ${clean(page.data?.title?.raw || page.data?.title?.rendered || "")}`);
console.log(`Target H1: ${TARGET_H1}`);

if (!WRITE) {
  console.log("Dry-run only. Add --write to update WordPress.");
  process.exit(0);
}

const update = await wpRest("POST", `/wp/v2/pages/${PAGE_ID}`, {
  title: TARGET_H1,
  status: "publish",
});
if (update.status !== 200) {
  console.error(`Update title failed: ${update.status}`);
  console.error(JSON.stringify(update.data).slice(0, 500));
  process.exit(1);
}

const rankMath = await wpRest("POST", "/rankmath/v1/updateMeta", {
  objectType: "post",
  objectID: PAGE_ID,
  meta: {
    rank_math_title: SEO_TITLE,
    rank_math_focus_keyword: FOCUS_KEYWORD,
  },
});

const live = await liveGet(`${URL_PATH}?nowprocket=1&codex=20260627-hbp-halong-h1`);
const h1s = extractH1s(live.data || "");
const tableOk = live.data.includes("Yếu tố khảo sát") && live.data.includes("Ví dụ thực tế tại Hạ Long");
const linksOk = [
  "/bang-gia-hut-be-phot-quang-ninh/",
  "/thong-tac-cong-ha-long/",
  "/hut-ham-cau-quang-ninh/",
  "/xu-ly-mui-hoi-nha-ve-sinh/",
].every((href) => live.data.includes(href));
const verify = {
  status: live.status,
  h1Count: h1s.length,
  h1: h1s[0] || "",
  h1Ok: h1s.length === 1 && h1s[0] === TARGET_H1,
  tableOk,
  faqSchemaEntities: countFaqSchema(live.data || ""),
  linksOk,
  rankMathOk: rankMath.status === 200,
};
console.log(JSON.stringify(verify, null, 2));

const reportPath = path.join(ROOT, "reports", `hbp-halong-h1-fix-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(reportPath, JSON.stringify({
  updatedAt: new Date().toISOString(),
  pageId: PAGE_ID,
  url: `https://${WP_HOST}${URL_PATH}`,
  targetH1: TARGET_H1,
  seoTitle: SEO_TITLE,
  backupPath,
  verify,
}, null, 2), "utf8");

const today = new Date().toISOString().slice(0, 10);
const time = new Date().toTimeString().slice(0, 5);
appendFileSync(path.join(ROOT, "docs", "SEO_PROGRESS.csv"), `\n${today},${time},FIX-HBP-HALONG-H1-2026-06-27,seo_fix,hút bể phốt Hạ Long,https://thongtaccongquangninh.com/hut-be-phot-ha-long/,hut-be-phot-ha-long,done,low,,,,,"Sửa đúng H1/page title theo brief AI; giữ SEO title ngắn trong Rank Math; không đụng thân bài vì H2 bảng FAQ link đã đạt",tools/fix_hbp_halong_h1_brief_2026_06_27.mjs,,Theo dõi cache và mở WP editor xem điểm Rank Math thật,"Live verify: HTTP ${verify.status}; H1=${verify.h1Ok ? "ok" : "fail"}; table=${verify.tableOk}; FAQ schema entities=${verify.faqSchemaEntities}; links=${verify.linksOk}; RM=${verify.rankMathOk ? "ok" : "fail"}",NOT_REQUIRED,Codex,2026-06-27,${reportPath},${reportPath},,,`, "utf8");
console.log(`Report: ${reportPath}`);
