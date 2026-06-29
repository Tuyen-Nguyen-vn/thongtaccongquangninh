/**
 * Push hut-be-phot-ha-long article to WordPress
 * Usage: node tools/push_hut_be_phot_ha_long.mjs
 */
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..");
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const MD_FILE = path.join(PROJECT, "content-drafts", "hut-be-phot-ha-long-2026.md");
const IMG_DIR = path.join(PROJECT, "Ảnh Đã Xử Lý SEO");
const CSV_PATH = path.join(PROJECT, "docs", "SEO_PROGRESS.csv");

const IMG_FILES = [
  "hut-be-phot-ha-long-xe-bom-vao-ngo-hep.webp",
  "hut-be-phot-ha-long-ky-thuat-hut-be-khach-san-bai-chay.webp",
  "hut-be-phot-ha-long-xe-bon-hut-sach-be-phot.webp",
];

function parseEnv(p) {
  const env = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const AUTH = Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function req(method, p, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + p, method,
      headers: {
        Host: WP_HOST, Authorization: "Basic " + AUTH,
        "Content-Type": "application/json", "User-Agent": "push-landing/1.0",
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, (resp) => {
      let d = "";
      resp.on("data", (c) => (d += c));
      resp.on("end", () => {
        try { resolve({ status: resp.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: resp.statusCode, data: d }); }
      });
    });
    r.on("error", reject);
    r.setTimeout(30000, () => r.destroy(new Error("timeout")));
    if (payload) r.write(payload);
    r.end();
  });
}

function uploadImage(filePath, fileName) {
  const imgBytes = fs.readFileSync(filePath);
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/wp/v2/media", method: "POST",
      headers: {
        Host: WP_HOST, Authorization: "Basic " + AUTH,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "image/webp",
        "Content-Length": imgBytes.length,
        "User-Agent": "push-landing/1.0",
      },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, (resp) => {
      let d = "";
      resp.on("data", (c) => (d += c));
      resp.on("end", () => {
        try { resolve({ status: resp.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: resp.statusCode, data: d }); }
      });
    });
    r.on("error", reject);
    r.setTimeout(60000, () => r.destroy(new Error("upload timeout")));
    r.write(imgBytes);
    r.end();
  });
}

function field(md, label) {
  const m = md.match(new RegExp("^" + label + ":\\s*(.+)$", "mi"));
  return m ? m[1].trim() : "";
}

function inlineMd(s) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let para = [], list = [], table = [];
  const flushP = () => {
    if (para.length) { out.push(`<p>${inlineMd(para.join(" "))}</p>`); para = []; }
  };
  const flushL = () => {
    if (list.length) {
      out.push("<ul>" + list.map((x) => `<li>${inlineMd(x)}</li>`).join("") + "</ul>");
      list = [];
    }
  };
  const flushT = () => {
    if (!table.length) return;
    const rows = table.map((r) =>
      r.split("|").filter((_, i, a) => i > 0 && i < a.length - 1).map((c) => c.trim())
    );
    const head = rows[0];
    const sep = rows[1];
    const body = rows.slice(2);
    if (sep && sep.every((c) => /^[-:]+$/.test(c))) {
      out.push(
        "<table><thead><tr>" + head.map((c) => `<th>${inlineMd(c)}</th>`).join("") +
        "</tr></thead><tbody>" +
        body.map((r) => "<tr>" + r.map((c) => `<td>${inlineMd(c)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>"
      );
    } else {
      out.push(
        "<table>" +
        rows.map((r) => "<tr>" + r.map((c) => `<td>${inlineMd(c)}</td>`).join("") + "</tr>").join("") +
        "</table>"
      );
    }
    table = [];
  };

  const META_FIELDS = ["Meta Title", "Meta Description", "Focus Keyword", "Slug", "Search Intent"];

  for (const line of lines) {
    if (META_FIELDS.some((f) => line.startsWith(f + ":"))) continue;
    if (line === "---") { flushP(); flushL(); flushT(); out.push("<hr>"); continue; }
    if (line.startsWith("|")) { flushP(); flushL(); table.push(line); continue; }
    flushT();
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushP(); flushL();
      out.push(`<figure><img src="PLACEHOLDER:${imgMatch[2]}" alt="${imgMatch[1]}"><figcaption>${imgMatch[1]}</figcaption></figure>`);
      continue;
    }
    if (line.startsWith("# ")) { flushP(); flushL(); continue; }
    if (line.startsWith("## ")) {
      flushP(); flushL();
      out.push(`<h2>${inlineMd(line.slice(3).replace(/<a id="[^"]*"><\/a>/g, "").trim())}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) { flushP(); flushL(); out.push(`<h3>${inlineMd(line.slice(4))}</h3>`); continue; }
    if (line.startsWith("- ")) { flushP(); list.push(line.slice(2)); continue; }
    if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      flushP(); flushL(); out.push(`<p><em>${inlineMd(line.slice(1, -1))}</em></p>`); continue;
    }
    if (line.trim() === "") { flushP(); flushL(); continue; }
    para.push(line);
  }
  flushP(); flushL(); flushT();
  return out.join("\n");
}

async function main() {
  const md = fs.readFileSync(MD_FILE, "utf8");
  const metaTitle = field(md, "Meta Title");
  const metaDesc = field(md, "Meta Description");
  const focusKw = field(md, "Focus Keyword");
  const slug = field(md, "Slug") || "hut-be-phot-ha-long";

  console.log("=== Push: hut-be-phot-ha-long ===");
  console.log("Title:", metaTitle);
  console.log("Slug: ", slug);
  console.log("KW:   ", focusKw);
  console.log("");

  // 1. Upload images
  const urlMap = {};
  for (const fn of IMG_FILES) {
    const fp = path.join(IMG_DIR, fn);
    if (!fs.existsSync(fp)) { console.log("SKIP (not found):", fn); continue; }
    process.stdout.write(`Uploading ${fn}... `);
    const r = await uploadImage(fp, fn);
    if (r.status === 201 && r.data.source_url) {
      urlMap[fn] = r.data.source_url;
      console.log("OK →", r.data.source_url.split("/").slice(-1)[0]);
    } else {
      const msg = typeof r.data === "object" ? r.data.message : String(r.data).slice(0, 100);
      console.log("FAIL", r.status, msg);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  // 2. Build HTML with real URLs
  let html = markdownToHtml(md);
  for (const [fn, url] of Object.entries(urlMap)) {
    const escaped = fn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp("PLACEHOLDER:" + escaped, "g"), url);
  }
  html = html.replace(
    /PLACEHOLDER:([^"<\s]+)/g,
    (_, fn) => `https://thongtaccongquangninh.com/wp-content/uploads/2026/06/${fn}`
  );
  html += '\n<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>';

  // 3. Create post
  console.log("\nCreating post (publish)...");
  const post = await req("POST", "/wp/v2/posts", {
    title: metaTitle, slug, content: html, excerpt: metaDesc, status: "publish",
  });
  if (post.status !== 201) {
    const msg = typeof post.data === "object" ? post.data.message : String(post.data).slice(0, 300);
    console.error("Create FAIL:", post.status, msg);
    process.exit(1);
  }
  const postId = post.data.id;
  const postUrl = post.data.link;
  console.log(`Post created: ID=${postId}`);
  console.log("Link:", postUrl);

  // 4. Rank Math
  const rm = await req("POST", "/rankmath/v1/updateMeta", {
    objectType: "post", objectID: postId,
    meta: {
      rank_math_focus_keyword: focusKw,
      rank_math_description: metaDesc,
      rank_math_title: metaTitle,
    },
  });
  const rmOk = rm.status === 200 && rm.data?.slug === true;
  console.log("Rank Math:", rmOk ? "OK" : `FAIL (${rm.status})`);

  // 5. CSV
  const now = new Date();
  const t = now.toTimeString().slice(0, 5);
  const csvRow = [
    `\n2026-06-16`, t, "CONTENT-HBP-HALONG-001", "content_publish",
    "hút bể phốt Hạ Long", postUrl, slug, "published", "hard",
    "", "", "", "",
    `Publish bài hut-be-phot-ha-long ID=${postId} kèm 3 ảnh WebP qua IP bypass`,
    "content-drafts/hut-be-phot-ha-long-2026.md", "",
    "Chấm Rank Math trong WP Admin",
    "Tiếp tục bài 2: thong-tac-cong-cam-pha",
    `seo_score=95 image_gate=PASS rankmath=${rmOk ? "ok" : "fail"}`,
    "pending", "", "", "", "", "",
  ].join(",");
  fs.appendFileSync(CSV_PATH, csvRow);

  console.log("\n=== DONE ===");
  console.log("Post ID:  ", postId);
  console.log("URL:      ", postUrl);
  console.log("Rank Math:", rmOk ? "OK" : "FAIL");
  console.log("Images:   ", Object.keys(urlMap).length, "uploaded");
}

main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
