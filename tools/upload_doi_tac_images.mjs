/**
 * Upload 7 ảnh đối tác (WebP 4:3) lên WP Media Library.
 * Trả về danh sách {slug, url, alt} để hardcode vào slider.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const OUT_DIR  = "D:\\.thongtaccongquangninh\\Ảnh Đã Xử Lý SEO\\doi-tac-thong-tac-cong-quang-ninh-2026-05-16";
const MANIFEST = JSON.parse(readFileSync(`${OUT_DIR}\\manifest.json`, "utf8"));

const fileEnv = {};
try {
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) fileEnv[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
} catch {}

const base = (fileEnv.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const auth = `Basic ${Buffer.from(`${fileEnv.WP_USERNAME}:${fileEnv.WP_APP_PASSWORD}`).toString("base64")}`;

async function uploadMedia(webpPath, slug, alt, title) {
  const data = readFileSync(webpPath);
  const filename = `${slug}.webp`;
  const res = await fetch(`${base}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "image/webp",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
    body: data,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed ${res.status}: ${text.substring(0, 300)}`);
  }
  const json = await res.json();
  // Update alt + title via PATCH
  if (alt || title) {
    await fetch(`${base}/wp-json/wp/v2/media/${json.id}`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ alt_text: alt, title: { raw: title } }),
    });
  }
  return json.source_url;
}

const results = [];
for (const item of MANIFEST.items) {
  console.log(`Uploading ${item.slug}...`);
  try {
    const url = await uploadMedia(
      item.webp.replace(/\//g, "\\"),
      item.slug,
      item.alt,
      item.title
    );
    results.push({ slug: item.slug, url, alt: item.alt, title: item.title });
    console.log(`  OK: ${url}`);
  } catch (e) {
    console.error(`  FAIL: ${e.message}`);
    results.push({ slug: item.slug, url: null, error: e.message });
  }
}

const reportPath = "D:\\.thongtaccongquangninh\\UPLOAD_DOI_TAC_IMAGES_2026-05-16.json";
writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2) + "\n", "utf8");
console.log("\n=== SLIDER PHP CODE ===");
console.log("$slider_images = [");
for (const r of results) {
  if (r.url) {
    console.log(`  ['src' => '${r.url}', 'alt' => '${r.alt}'],`);
  }
}
console.log("];");
