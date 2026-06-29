import { readFileSync, writeFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_PATH = "D:\\.thongtaccongquangninh\\WORDPRESS_FAVICON_VERIFY_2026-05-10.json";

function readEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = readEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

const settingsResponse = await fetch(`${baseUrl}/wp-json/wp/v2/settings`, {
  headers: { Authorization: auth, "User-Agent": "Codex favicon verify" },
});
const settings = await settingsResponse.json();
const mediaResponse = await fetch(`${baseUrl}/wp-json/wp/v2/media/${settings.site_icon}`, {
  headers: { Authorization: auth, "User-Agent": "Codex favicon verify" },
});
const media = await mediaResponse.json();
async function verifyPath(pathname) {
  const separator = pathname.includes("?") ? "&" : "?";
  const response = await fetch(`${baseUrl}${pathname}${separator}codex_favicon_verify=${Date.now()}`, {
    headers: { "User-Agent": "Codex favicon verify", "Cache-Control": "no-cache" },
  });
  const html = await response.text();
  const iconLinks = [...html.matchAll(/<link[^>]+rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["'][^>]*>/gi)]
    .map((match) => match[0]);
  return {
    path: pathname,
    status: response.status,
    pluginMarker: html.includes("ttcqn-favicon-override"),
    iconLinks,
    hasNewFavicon: html.includes("favicon-thong-tac-cong-quang-ninh"),
    hasOldFavicon: html.includes("favicon-moi-truong-do-thi-so-1-quang-ninh")
      || html.includes("android-chrome-moi-truong-do-thi-so-1-quang-ninh")
      || html.includes("apple-touch-icon-moi-truong-do-thi-so-1-quang-ninh"),
  };
}

const pages = [];
for (const pathname of ["/", "/bang-gia/", "/lien-he/"]) {
  pages.push(await verifyPath(pathname));
}
const report = {
  timestamp: new Date().toISOString(),
  settingsStatus: settingsResponse.status,
  mediaStatus: mediaResponse.status,
  siteIcon: settings.site_icon,
  mediaSourceUrl: media.source_url,
  pages,
};
report.ok = pages.every((page) => page.status === 200 && page.pluginMarker && page.hasNewFavicon && !page.hasOldFavicon)
  && Number(report.siteIcon) === 1228
  && settingsResponse.status === 200
  && mediaResponse.status === 200;

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
