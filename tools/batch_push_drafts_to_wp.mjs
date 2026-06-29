import { readdirSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT = process.env.TTCQN_PROJECT_ROOT || resolve(__dirname, "..");
const draftsDir = join(PROJECT, "content-drafts");
const ENV_PATH = join(PROJECT, ".env");

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, label) {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "m");
  const match = md.match(re);
  return match ? match[1].trim() : "";
}

import { markdownToHtml } from "./lib/markdown_to_html.mjs";

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: { Authorization: auth, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  let payload = text;
  try { payload = JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(`WordPress ${res.status} ${path}: ${typeof payload === "object" ? payload.message || text : text}`);
  return payload;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  
  const files = readdirSync(draftsDir).filter(f => f.endsWith(".md"));
  console.log(`Bắt đầu đẩy ${files.length} bản draft lên WordPress (dưới dạng Bản Nháp - Draft)...`);
  
  let success = 0;
  for (const file of files) {
    const md = readFileSync(join(draftsDir, file), "utf8");
    const metaTitle = field(md, "Meta Title");
    const metaDesc = field(md, "Meta Description");
    const keyword = field(md, "Focus Keyword");
    let slug = field(md, "Slug");
    
    if (!slug) {
        slug = (keyword || metaTitle).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    if (!metaTitle) continue;
    
    const htmlContent = markdownToHtml(md);
    
    try {
        // Kiểm tra xem đã có page này chưa
        const existing = await wp(baseUrl, auth, `/wp/v2/pages?slug=${slug}&status=any`);
        let pageId;
        
        if (existing && existing.length > 0) {
            // Update
            pageId = existing[0].id;
            await wp(baseUrl, auth, `/wp/v2/pages/${pageId}`, {
                method: "POST",
                body: JSON.stringify({ title: metaTitle, content: htmlContent, excerpt: metaDesc, status: "draft" })
            });
            console.log(`[UPDATE] ${slug} (ID: ${pageId})`);
        } else {
            // Create
            const created = await wp(baseUrl, auth, "/wp/v2/pages", {
                method: "POST",
                body: JSON.stringify({ title: metaTitle, slug, content: htmlContent, excerpt: metaDesc, status: "draft" })
            });
            pageId = created.id;
            console.log(`[CREATE] ${slug} (ID: ${pageId})`);
        }
        
        // Cập nhật Rank Math Meta
        try {
            await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
                method: "POST",
                body: JSON.stringify({
                    objectType: "post",
                    objectID: pageId,
                    meta: { rank_math_title: metaTitle, rank_math_description: metaDesc, rank_math_focus_keyword: keyword }
                })
            });
        } catch (e) { }
        
        success++;
    } catch(err) {
        console.error(`[ERROR] ${file}: ${err.message}`);
    }
  }
  
  console.log(`\nHoàn tất! Đã đẩy thành công ${success}/${files.length} bản draft vào WordPress CMS.`);
}

main().catch(console.error);
