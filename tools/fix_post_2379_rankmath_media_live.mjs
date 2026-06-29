import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = join(ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const PROJECT_TIMEZONE = "Asia/Bangkok";
const POST_ID = 2379;
const MEDIA_ID = 2380;
const POST_SLUG = "thong-tac-bon-cau-ban-dem-quang-ninh";

const TITLE = "Thông tắc bồn cầu Quảng Ninh: thợ xử lý nhanh tận nơi";
const DESCRIPTION = "Thông tắc bồn cầu Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nghẹt, trào ngược và xử lý tận nơi. Gọi 0963.953.533.";
const FOCUS_KEYWORD = "thông tắc bồn cầu Quảng Ninh";

const MEDIA_ALT = "Thợ thông tắc bồn cầu tại nhà dân Hạ Long Quảng Ninh";
const MEDIA_TITLE = "Thông tắc bồn cầu Hạ Long - Môi Trường Đô Thị Số 1";
const MEDIA_CAPTION = "Thợ có mặt trong 15 phút, xử lý tắc bồn cầu tại Hạ Long";
const MEDIA_DESCRIPTION = "Ảnh thi công thực tế dùng cho bài thông tắc bồn cầu Quảng Ninh.";

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

function getTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const millisecond = String(date.getMilliseconds()).padStart(3, "0");
  return { ...map, millisecond };
}

function formatProjectStamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}-${parts.millisecond}+07-00`;
}

async function wp(path, auth, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex fix-post-2379-rankmath-media-live",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  if (!response.ok) {
    throw new Error(`${path} failed ${response.status}: ${text.slice(0, 500)}`);
  }
  return { status: response.status, text, json };
}

function pickPublicSignals(html) {
  return {
    hasCaptionNight: /caption":"Thợ thông tắc bồn cầu ban đêm/i.test(html),
    hasKeywordNight: /keywords":"thông tắc bồn cầu ban đêm Quảng Ninh"/i.test(html),
    hasNightCopy: /thợ trực đêm|nửa đêm|ban đêm/i.test(html),
  };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
    throw new Error("Missing WP auth in .env");
  }

  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const stamp = formatProjectStamp(new Date());
  const backupDir = join(ROOT, "backups", `fix-post-2379-rankmath-media-live-${stamp}`);
  const reportPath = join(ROOT, "reports", `fix-post-2379-rankmath-media-live-${stamp}.json`);
  mkdirSync(backupDir, { recursive: true });
  mkdirSync(dirname(reportPath), { recursive: true });

  const report = {
    generatedAt: new Date().toISOString(),
    postId: POST_ID,
    mediaId: MEDIA_ID,
    backupDir,
    reportPath,
    success: false,
  };

  const postBefore = await wp(`/wp-json/wp/v2/posts/${POST_ID}?context=edit`, auth);
  const mediaBefore = await wp(`/wp-json/wp/v2/media/${MEDIA_ID}?context=edit`, auth);
  writeFileSync(join(backupDir, `post-${POST_ID}.before.json`), JSON.stringify(postBefore.json, null, 2), "utf8");
  writeFileSync(join(backupDir, `media-${MEDIA_ID}.before.json`), JSON.stringify(mediaBefore.json, null, 2), "utf8");

  const rmUpdate = await wp(`/wp-json/rankmath/v1/updateMeta`, auth, {
    method: "POST",
    body: JSON.stringify({
      objectType: "post",
      objectID: POST_ID,
      meta: {
        rank_math_title: TITLE,
        rank_math_description: DESCRIPTION,
        rank_math_focus_keyword: FOCUS_KEYWORD,
      },
    }),
  });

  const mediaUpdate = await wp(`/wp-json/wp/v2/media/${MEDIA_ID}`, auth, {
    method: "POST",
    body: JSON.stringify({
      alt_text: MEDIA_ALT,
      title: MEDIA_TITLE,
      caption: MEDIA_CAPTION,
      description: MEDIA_DESCRIPTION,
    }),
  });

  const publicUrl = `${BASE_URL}/${POST_SLUG}/?nowprocket=1&codex=${stamp}`;
  const publicRes = await fetch(publicUrl, { headers: { "User-Agent": "Codex fix-post-2379-rankmath-media-live" } });
  const publicHtml = await publicRes.text();
  const publicSignals = pickPublicSignals(publicHtml);

  report.rankMathUpdate = rmUpdate.json ?? rmUpdate.text;
  report.mediaUpdate = {
    id: mediaUpdate.json?.id,
    alt_text: mediaUpdate.json?.alt_text,
    title: mediaUpdate.json?.title?.raw ?? mediaUpdate.json?.title?.rendered,
    caption: mediaUpdate.json?.caption?.raw ?? mediaUpdate.json?.caption?.rendered,
  };
  report.public = {
    url: publicUrl,
    status: publicRes.status,
    ...publicSignals,
  };
  report.success = publicRes.ok && !publicSignals.hasCaptionNight && !publicSignals.hasKeywordNight && !publicSignals.hasNightCopy;

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ reportPath, backupDir, success: report.success }, null, 2));

  if (!report.success) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
