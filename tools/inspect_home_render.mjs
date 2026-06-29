import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const ENV_PATH_WSL =
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env";
const REPORT_PATH = join(PROJECT, "WORDPRESS_HOME_RENDER_INSPECT_2026-05-06.json");

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wp(baseUrl, auth, path) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    headers: {
      Authorization: auth,
      "User-Agent": "Codex inspect home render",
    },
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    throw new Error(`WordPress ${response.status} ${path}: ${typeof payload === "object" ? payload.message ?? raw : raw}`);
  }
  return payload;
}

async function main() {
  const env = parseEnv(existsSync(ENV_PATH) ? ENV_PATH : ENV_PATH_WSL);
  const baseUrl = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const settings = await wp(baseUrl, auth, "/wp/v2/settings");
  const pageId = Number(settings.page_on_front);
  const page = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}?context=edit`);
  const raw = page.content?.raw ?? page.content?.rendered ?? "";
  const liveResponse = await fetch(baseUrl + "/", {
    headers: { "User-Agent": "Codex inspect home live" },
  });
  const html = await liveResponse.text();
  const expectedFiles = [
    "doi-xe-hut-be-phot-ha-long-quang-ninh.webp",
    "hut-be-phot-nha-dan-ha-long-xe-bon.webp",
    "hut-be-phot-nha-dan-quang-ninh-mo-nap-be.webp",
  ];
  const result = {
    ok: true,
    generatedAt: new Date().toISOString(),
    page_on_front: pageId,
    title: page.title?.raw ?? page.title?.rendered ?? "",
    template: page.template ?? "",
    rawLength: raw.length,
    rawImgCount: (raw.match(/<img\b/giu) ?? []).length,
    rawExpectedFiles: expectedFiles.filter((file) => raw.includes(file)),
    liveStatus: liveResponse.status,
    liveLength: html.length,
    liveImgCount: (html.match(/<img\b/giu) ?? []).length,
    liveExpectedFiles: expectedFiles.filter((file) => html.includes(file)),
    liveHasRendererMarker: html.includes("ttcqn-doorway-safe-renderer"),
    liveHasPageHomeHint: /page-home|home-template|front-page|template-home/iu.test(html),
    liveTitleSnippet: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu) ?? [null, ""])[1].trim(),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
