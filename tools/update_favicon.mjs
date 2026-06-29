import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = "D:\\.thongtaccongquangninh";
const BASE_URL = "https://thongtaccongquangninh.com";
const ENV_PATHS = [
  path.join(ROOT, ".env"),
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
];
const IMAGE_PATH = path.join(ROOT, "Favicon", "favicon-thong-tac-cong-quang-ninh-512.png");
const SOURCE_PATH = path.join(ROOT, "Favicon", "favicon-thong-tac-cong-quang-ninh.png");
const REPORT_PATH = path.join(ROOT, "WORDPRESS_UPDATE_FAVICON_2026-05-10.json");
const FILE_NAME = "favicon-thong-tac-cong-quang-ninh-512.png";
const ALT_TEXT = "Favicon Thông Tắc Cống Quảng Ninh";

function readEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = Object.assign({}, ...ENV_PATHS.map(readEnv));
const baseUrl = (env.WP_BASE_URL || BASE_URL).replace(/\/$/, "");

if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD");
}
if (!existsSync(IMAGE_PATH)) {
  throw new Error(`Missing optimized favicon: ${IMAGE_PATH}`);
}

const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(pathname, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${pathname}`, {
    ...options,
    headers: {
      Authorization: auth,
      "User-Agent": "Codex SEO favicon update",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`WP ${response.status} ${pathname}: ${text}`);
  }
  return json;
}

async function main() {
  const before = await wp("/wp/v2/settings");
  let beforeMedia = null;
  if (before.site_icon) {
    try {
      beforeMedia = await wp(`/wp/v2/media/${before.site_icon}`);
    } catch (error) {
      beforeMedia = { error: error.message };
    }
  }

  const media = await wp("/wp/v2/media", {
    method: "POST",
    body: readFileSync(IMAGE_PATH),
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${FILE_NAME}"`,
    },
  });

  await wp(`/wp/v2/media/${media.id}`, {
    method: "POST",
    body: JSON.stringify({
      alt_text: ALT_TEXT,
      caption: ALT_TEXT,
      title: ALT_TEXT,
      description: "Biểu tượng website thongtaccongquangninh.com.",
    }),
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

  await wp("/wp/v2/settings", {
    method: "POST",
    body: JSON.stringify({ site_icon: media.id }),
    headers: { "Content-Type": "application/json" },
  });

  const after = await wp("/wp/v2/settings");
  const homeResponse = await fetch(`${baseUrl}/?codex_favicon_verify=${Date.now()}`, {
    headers: {
      "User-Agent": "Codex SEO favicon verify",
      "Cache-Control": "no-cache",
    },
  });
  const home = await homeResponse.text();
  const iconLinks = [...home.matchAll(/<link[^>]+rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["'][^>]*>/gi)]
    .map((match) => match[0]);

  const report = {
    timestamp: new Date().toISOString(),
    source: SOURCE_PATH,
    optimized: IMAGE_PATH,
    optimizedSizeBytes: statSync(IMAGE_PATH).size,
    before: {
      siteIcon: before.site_icon,
      sourceUrl: beforeMedia?.source_url || null,
      title: beforeMedia?.title?.rendered || null,
      error: beforeMedia?.error || null,
    },
    after: {
      siteIcon: after.site_icon,
      mediaId: media.id,
      sourceUrl: media.source_url,
      altText: ALT_TEXT,
    },
    frontend: {
      status: homeResponse.status,
      iconLinks,
      mentionsUploadedIcon: home.includes(media.source_url),
    },
    ok: Number(after.site_icon) === Number(media.id),
  };

  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
