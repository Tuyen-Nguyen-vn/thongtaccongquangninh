/**
 * Check Rank Math backend score/meta for PAGE 52 /hut-be-phot-ha-long/.
 */
import https from "node:https";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

const ROOT = "/mnt/d/.thongtaccongquangninh";
const ENV_PATH = path.join(ROOT, ".env");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 52;

function parseEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wp(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + apiPath,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "codex-rankmath-page52/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data.replace(/^\uFEFF/, "")) });
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

const page = await wp("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`);
if (page.status !== 200) {
  console.error(`GET page failed: ${page.status}`);
  process.exit(1);
}

let rankMathBatch = null;
for (const offset of [0, 25, 50, 75, 100, 125, 150, 175, 200]) {
  const batch = await wp("POST", "/rankmath/v1/toolsAction", {
    action: "update_seo_score",
    args: { update_all_scores: true, offset },
  });
  if (batch.status === 200 && batch.data && typeof batch.data === "object" && batch.data[String(PAGE_ID)]) {
    rankMathBatch = { offset, item: batch.data[String(PAGE_ID)] };
    break;
  }
}

const objectSeo = await wp("GET", `/rankmath/v1/getObjectSeo?objectType=post&objectID=${PAGE_ID}`);
const meta = page.data?.meta ?? {};
const contentRaw = page.data?.content?.raw ?? "";
const title = meta.rank_math_title || "";
const description = meta.rank_math_description || "";
const focusKeyword = meta.rank_math_focus_keyword || "";
const analyzerItem = rankMathBatch?.item ?? null;
const analyzerTitle = analyzerItem?.title || "";
const analyzerDescription = analyzerItem?.description || "";
const analyzerKeyword = analyzerItem?.keyword || "";
const storedScore = meta.rank_math_seo_score || meta.rank_math_score || null;
const batchScore = analyzerItem && Object.hasOwn(analyzerItem, "score") ? Number(analyzerItem.score) : null;

const report = {
  checkedAt: new Date().toISOString(),
  pageId: PAGE_ID,
  url: "https://thongtaccongquangninh.com/hut-be-phot-ha-long/",
  postTitle: page.data?.title?.raw || page.data?.title?.rendered || "",
  status: page.data?.status,
  rankMath: {
    storedScore,
    batchScore,
    scoreExposed: batchScore !== null || storedScore !== null,
    batchOffset: rankMathBatch?.offset ?? null,
    batchItemKeys: analyzerItem ? Object.keys(analyzerItem) : [],
    objectSeoStatus: objectSeo.status,
    objectSeoKeys: objectSeo.data && typeof objectSeo.data === "object" ? Object.keys(objectSeo.data).slice(0, 20) : [],
    focusKeyword: focusKeyword || analyzerKeyword,
    title: title || analyzerTitle,
    titleLength: [...(title || analyzerTitle)].length,
    description: description || analyzerDescription,
    descriptionLength: [...(description || analyzerDescription)].length,
  },
  contentChecks: {
    hasOneRawH1: (contentRaw.match(/<h1\b/gi) || []).length <= 1,
    hasPriceTable: contentRaw.includes("Yếu tố khảo sát") && contentRaw.includes("Khách hàng cần chuẩn bị thông tin gì"),
    hasFaqHeading: contentRaw.includes("Câu hỏi thường gặp về hút bể phốt Hạ Long"),
    hasAuthorLink: contentRaw.includes("https://thongtaccongquangninh.com/author/nguyensonghao/"),
  },
};

const reportPath = path.join(ROOT, "reports", `rankmath-page52-check-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const today = new Date().toISOString().slice(0, 10);
const time = new Date().toTimeString().slice(0, 5);
appendFileSync(path.join(ROOT, "docs", "SEO_PROGRESS.csv"), `\n${today},${time},CHECK-RANKMATH-PAGE52-2026-06-27,seo_verify,hút bể phốt Hạ Long,https://thongtaccongquangninh.com/hut-be-phot-ha-long/,hut-be-phot-ha-long,done,low,95,95,${storedScore ?? ""},${batchScore ?? ""},"Kiểm Rank Math backend page 52 qua toolsAction update_seo_score + REST meta",tools/check_rankmath_page52_2026_06_27.mjs,,Mở WP editor nếu cần xem điểm UI màu xanh/đỏ vì API không expose score cho page này,"scoreExposed=${report.rankMath.scoreExposed}; batchOffset=${report.rankMath.batchOffset}; titleLen=${report.rankMath.titleLength}; descLen=${report.rankMath.descriptionLength}; focus=${report.rankMath.focusKeyword}; report=${reportPath}",NOT_REQUIRED,Codex,2026-06-27,${reportPath},${reportPath},,,`, "utf8");

console.log(JSON.stringify({
  report: reportPath,
  storedScore,
  batchScore,
  scoreExposed: report.rankMath.scoreExposed,
  focusKeyword: report.rankMath.focusKeyword,
  titleLength: report.rankMath.titleLength,
  descriptionLength: report.rankMath.descriptionLength,
  objectSeoStatus: objectSeo.status,
}, null, 2));
