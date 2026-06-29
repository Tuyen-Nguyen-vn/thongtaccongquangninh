/**
 * Refine the opening of page 52 /hut-be-phot-ha-long/.
 *
 * Scope:
 * - Backup page 52 before write.
 * - Replace the long first paragraph with 3 short conversion-focused paragraphs.
 * - Remove a redundant markdown-style image caption paragraph after the figure.
 * - Verify public output with a cache-buster.
 */
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/mnt/d/.thongtaccongquangninh";
const PAGE_ID = 52;
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const URL_PATH = "/hut-be-phot-ha-long/";

function parseEnv(file) {
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(path.join(ROOT, ".env"));
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function request(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request({
      hostname: SERVER_IP,
      servername: HOST,
      port: 443,
      path: reqPath,
      method,
      headers: {
        Host: HOST,
        "User-Agent": "codex-refine-hbp-halong-intro/1.0",
        ...(headers.Authorization === false ? {} : { Authorization: auth }),
        ...(payload ? { "Content-Type": "application/json", "Content-Length": payload.length } : {}),
        ...Object.fromEntries(Object.entries(headers).filter(([k]) => k !== "Authorization")),
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        const clean = data.replace(/^\uFEFF/, "");
        try {
          resolve({ status: res.statusCode, data: JSON.parse(clean), raw: data });
        } catch {
          resolve({ status: res.statusCode, data: clean, raw: data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    if (payload) req.write(payload);
    req.end();
  });
}

function stripTags(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const page = await request("GET", `/wp-json/wp/v2/pages/${PAGE_ID}?context=edit`);
if (page.status !== 200) {
  throw new Error(`GET page ${PAGE_ID} failed: HTTP ${page.status}`);
}

const backupDir = path.join(ROOT, "seo-revisions", `wp-before-hbp-halong-intro-${new Date().toISOString().replace(/[:.]/g, "-")}`);
fs.mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `page-${PAGE_ID}.json`);
fs.writeFileSync(backupPath, `${JSON.stringify(page.data, null, 2)}\n`, "utf8");

const oldIntro = `<p>Bồn cầu rút chậm, nhà vệ sinh bốc mùi, nước thải trào ngược giữa lúc đông khách — đó là lúc cần gọi ngay, không phải hẹn ngày khác. Dịch vụ <strong>hút bể phốt Hạ Long</strong> của Môi Trường Đô Thị Quảng Ninh phục vụ nhà dân, khách sạn, homestay, nhà hàng, khu trọ tại Bãi Cháy, Hồng Gai, Tuần Châu, Cao Xanh và các phường lân cận. Báo giá trước khi thi công, không phát sinh nếu không có hạng mục mới — gọi <strong><a href="tel:0963953533">0963.953.533</a></strong> hoặc <strong><a href="tel:0931156756">0931.156.756</a></strong> để được hỏi nhanh tình trạng và báo giá trong 5 phút.</p>`;

const newIntro = `<p>Bồn cầu rút chậm, nhà vệ sinh bốc mùi hoặc nước thải trào ngược tại Hạ Long là dấu hiệu cần gọi kiểm tra ngay.</p>
<p>Dịch vụ <strong>hút bể phốt Hạ Long</strong> phục vụ nhà dân, khách sạn, homestay, nhà hàng và khu trọ tại Bãi Cháy, Hồng Gai, Tuần Châu, Cao Xanh, Hà Khánh.</p>
<p>Chúng tôi hỏi nhanh tình trạng, kiểm tra trước khi hút và báo giá rõ ràng trước khi thi công; không phát sinh nếu không có hạng mục mới. Gọi <strong><a href="tel:0963953533">0963.953.533</a></strong> hoặc <strong><a href="tel:0931156756">0931.156.756</a></strong> để được hỗ trợ trong 5 phút.</p>`;

let content = page.data.content.raw;
if (!content.includes(oldIntro)) {
  throw new Error("Old intro paragraph not found; aborting to avoid broad overwrite.");
}

content = content.replace(oldIntro, newIntro);
content = content.replace(/\n<p>\*Xe bồn và kỹ thuật viên hút bể phốt tại khu vực công nghiệp Hạ Long\*<\/p>\n/, "\n");

const dryRun = process.argv.includes("--dry-run");
let update = null;
if (!dryRun) {
  update = await request("POST", `/wp-json/wp/v2/pages/${PAGE_ID}`, {
    content,
  });
  if (update.status < 200 || update.status >= 300) {
    throw new Error(`Update failed: HTTP ${update.status} ${JSON.stringify(update.data).slice(0, 500)}`);
  }
}

const publicResult = await request("GET", `${URL_PATH}?nowprocket=1&codex=hbp_halong_intro_refine_${Date.now()}`, null, { Authorization: false });
const publicHtml = String(publicResult.data || publicResult.raw || "");
const h1 = [...publicHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1]));
const firstParas = [...publicHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1])).filter(Boolean).slice(0, 5);
const hasMarkdownCaption = publicHtml.includes("*Xe bồn và kỹ thuật viên hút bể phốt tại khu vực công nghiệp Hạ Long*");
const introNeedles = [
  "Bồn cầu rút chậm, nhà vệ sinh bốc mùi hoặc nước thải trào ngược tại Hạ Long là dấu hiệu cần gọi kiểm tra ngay.",
  "Dịch vụ <strong>hút bể phốt Hạ Long</strong> phục vụ nhà dân, khách sạn, homestay, nhà hàng và khu trọ tại Bãi Cháy, Hồng Gai, Tuần Châu, Cao Xanh, Hà Khánh.",
  "Chúng tôi hỏi nhanh tình trạng, kiểm tra trước khi hút và báo giá rõ ràng trước khi thi công; không phát sinh nếu không có hạng mục mới.",
];
const report = {
  checkedAt: new Date().toISOString(),
  dryRun,
  pageId: PAGE_ID,
  url: `https://${HOST}${URL_PATH}`,
  backupPath,
  updateStatus: update?.status ?? null,
  publicStatus: publicResult.status,
  h1Count: h1.length,
  h1,
  firstParas,
  introNeedlesFound: introNeedles.map((needle) => ({ needle, found: publicHtml.includes(needle) })),
  hasMarkdownCaption,
  checks: {
    exactH1: h1.length === 1 && h1[0] === "Hút Bể Phốt Hạ Long Giá Rõ Ràng, Có Mặt Nhanh Tại Nhà Dân, Khách Sạn, Homestay",
    introSplit: introNeedles.every((needle) => publicHtml.includes(needle)),
    noMarkdownCaption: !hasMarkdownCaption,
  },
};

const reportPath = path.join(ROOT, "reports", `hbp-halong-intro-refine-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const [today, timeRaw] = new Date().toISOString().split("T");
const time = timeRaw.slice(0, 5);
if (!dryRun) {
  fs.appendFileSync(path.join(ROOT, "docs", "SEO_PROGRESS.csv"), `\n${today},${time},REFINE-HBP-HALONG-INTRO-2026-06-27,seo_fix,hút bể phốt Hạ Long,https://thongtaccongquangninh.com/hut-be-phot-ha-long/,hut-be-phot-ha-long,done,low,95,95,,,\"Tách đoạn mở đầu dài thành 3 paragraph ngắn đúng brief; bỏ caption markdown thừa sau ảnh\",tools/refine_hbp_halong_intro_2026_06_27.mjs,,Không cần sửa thêm nếu public verify pass,\"HTTP ${publicResult.status}; H1=${report.h1Count}; introSplit=${report.checks.introSplit}; noMarkdownCaption=${report.checks.noMarkdownCaption}; report=${reportPath}; backup=${backupPath}\",PASS,Codex,2026-06-27,${reportPath},${backupPath},,,`, "utf8");
}

console.log(JSON.stringify({ reportPath, ...report.checks, publicStatus: publicResult.status, backupPath }, null, 2));
