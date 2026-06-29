import https from "node:https";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PROJECT = process.cwd();
const ENV_PATH = path.join(PROJECT, ".env");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 52;
const META_TITLE = "Hút Bể Phốt Hạ Long Giá Rõ Ràng, Phục Vụ Nhanh Tại Bãi Cháy, Hồng Gai";
const META_DESCRIPTION = "Hút bể phốt Hạ Long cho nhà dân, khách sạn, homestay, nhà hàng tại Bãi Cháy, Hồng Gai, Tuần Châu. Báo giá rõ trước khi làm, xe đến nhanh. Gọi 0963.953.533.";
const FOCUS_KEYWORD = "hút bể phốt Hạ Long";

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpRequest(method, wpPath, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: `/wp-json${wpPath}`,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "Content-Type": "application/json",
        "User-Agent": "Codex page52 table repair/2026-06-27",
        ...(payload ? { "Content-Length": payload.length } : {}),
      },
      rejectUnauthorized: false,
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8").replace(/^\uFEFF/, "");
        let data = text;
        try { data = text ? JSON.parse(text) : {}; } catch {}
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error(`timeout ${wpPath}`)));
    if (payload) req.write(payload);
    req.end();
  });
}

function htmlEntityDecode(value) {
  return String(value)
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#8220;", "“")
    .replaceAll("&#8221;", "”")
    .replaceAll("&#8211;", "–")
    .replaceAll("&#8212;", "—")
    .replaceAll("&amp;", "&");
}

function repairEscapedTable(content) {
  const pattern = /<p>(&lt;table&gt;[\s\S]*?&lt;\/table&gt;)<\/p>/i;
  const match = content.match(pattern);
  if (!match) return { content, repaired: false };

  const table = htmlEntityDecode(match[1]).replace(/\s+/g, " ").trim();
  const block = [
    '<!-- wp:table {"hasFixedLayout":false} -->',
    `<figure class="wp-block-table">${table}</figure>`,
    "<!-- /wp:table -->",
  ].join("\n");

  return { content: content.replace(pattern, block), repaired: true };
}

function repairMarkdownLinks(content) {
  return content.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+|tel:[^)]+)\)/g, '<a href="$2">$1</a>');
}

function count(pattern, text) {
  return (String(text).match(pattern) || []).length;
}

async function fetchLiveHtml() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: `/hut-be-phot-ha-long/?nowprocket=1&codex=page52-table-repair-${Date.now()}`,
      method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "Codex page52 verifier/2026-06-27" },
      rejectUnauthorized: false,
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, html: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("error", (error) => resolve({ status: 0, html: "", error: error.message }));
    req.setTimeout(45000, () => req.destroy(new Error("timeout live verify")));
    req.end();
  });
}

async function main() {
  const doWrite = process.argv.includes("--write");
  const me = await wpRequest("GET", "/wp/v2/users/me");
  if (me.status !== 200) throw new Error(`Auth failed: HTTP ${me.status}`);

  const page = await wpRequest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`);
  if (page.status !== 200) throw new Error(`Cannot fetch page ${PAGE_ID}: HTTP ${page.status}`);

  const backupDir = path.join(PROJECT, "backups");
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `page-52-before-table-meta-repair-${stamp}.json`);
  writeFileSync(backupPath, JSON.stringify(page.data, null, 2), "utf8");

  const rawContent = page.data.content.raw || page.data.content.rendered || "";
  const before = {
    escapedTable: rawContent.includes("&lt;table&gt;"),
    tableCount: count(/<table\b/gi, rawContent),
    markdownLinks: count(/\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]+|tel:[^)]+)\)/g, rawContent),
  };

  const tableRepair = repairEscapedTable(rawContent);
  const nextContent = repairMarkdownLinks(tableRepair.content);
  const after = {
    escapedTable: nextContent.includes("&lt;table&gt;"),
    tableCount: count(/<table\b/gi, nextContent),
    markdownLinks: count(/\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]+|tel:[^)]+)\)/g, nextContent),
  };

  const report = {
    mode: doWrite ? "write" : "dry-run",
    generatedAt: new Date().toISOString(),
    user: me.data.name,
    pageId: PAGE_ID,
    backupPath,
    before,
    after,
    tableRepaired: tableRepair.repaired,
    metaTitle: META_TITLE,
    metaDescription: META_DESCRIPTION,
    metaDescriptionLength: [...META_DESCRIPTION].length,
  };

  if (!doWrite) {
    const previewPath = path.join(PROJECT, "reports", `page52-table-meta-repair-preview-${stamp}.html`);
    writeFileSync(previewPath, nextContent, "utf8");
    report.previewPath = previewPath;
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const update = await wpRequest("POST", `/wp/v2/pages/${PAGE_ID}`, {
    content: nextContent,
    excerpt: META_DESCRIPTION,
    status: "publish",
  });
  if (update.status !== 200) throw new Error(`Page update failed: HTTP ${update.status} ${JSON.stringify(update.data).slice(0, 500)}`);

  const rankMath = await wpRequest("POST", "/rankmath/v1/updateMeta", {
    objectType: "post",
    objectID: PAGE_ID,
    meta: {
      rank_math_title: META_TITLE,
      rank_math_description: META_DESCRIPTION,
      rank_math_focus_keyword: FOCUS_KEYWORD,
    },
  });

  const live = await fetchLiveHtml();
  const h1Count = count(/<h1\b/gi, live.html);
  const liveTableCount = count(/<table\b/gi, live.html);
  const liveEscapedTable = live.html.includes("&lt;table&gt;");
  const liveMarkdownLinks = count(/\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]+|tel:[^)]+)\)/g, live.html);
  const liveMeta = live.html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || "";

  const finalReport = {
    ...report,
    updateStatus: update.status,
    rankMathStatus: rankMath.status,
    rankMathOk: rankMath.status === 200,
    live: {
      status: live.status,
      h1Count,
      tableCount: liveTableCount,
      escapedTable: liveEscapedTable,
      markdownLinks: liveMarkdownLinks,
      hasPriceHeading: live.html.includes("Bảng giá hút bể phốt Hạ Long phụ thuộc những yếu tố nào"),
      hasFaq: live.html.includes("Bao lâu nên hút bể phốt một lần tại Hạ Long"),
      metaDescription: liveMeta,
      metaDescriptionLength: [...liveMeta].length,
    },
  };

  const reportPath = path.join(PROJECT, "reports", `page52-table-meta-repair-${stamp}.json`);
  writeFileSync(reportPath, JSON.stringify(finalReport, null, 2), "utf8");

  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 5);
  appendFileSync(
    path.join(PROJECT, "docs", "SEO_PROGRESS.csv"),
    `\n${today},${time},FIX-HBP-HALONG-TABLE-META-${today},seo_fix,hút bể phốt Hạ Long,https://thongtaccongquangninh.com/hut-be-phot-ha-long/,hut-be-phot-ha-long,completed,easy,,,,,"Sửa bảng giá bị escape thành Gutenberg table block; chuyển markdown link còn sót; cập nhật excerpt và Rank Math meta description","tools/repair_page52_table_meta_2026_06_27.mjs",,,,"HTTP ${live.status}; h1=${h1Count}; table=${liveTableCount}; escapedTable=${liveEscapedTable}; markdownLinks=${liveMarkdownLinks}; metaLen=${[...liveMeta].length}",NOT_REQUIRED,,,,,,`,
    "utf8",
  );

  console.log(JSON.stringify(finalReport, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
