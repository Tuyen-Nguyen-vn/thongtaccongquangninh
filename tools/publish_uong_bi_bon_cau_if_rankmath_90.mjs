import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertImageSeoReadyForPublish } from "./image_seo_gate.mjs";
import { submitIndexingUrl } from "./lib/google_indexing_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT = process.env.TTCQN_PROJECT_ROOT || resolve(__dirname, "..");
const ENV_PATH = join(PROJECT, ".env");
const DRAFT_RESULT_PATH = join(PROJECT, "WORDPRESS_DRAFT_UONG_BI_BON_CAU_2026-04-29.json");
const PUBLISH_RESULT_PATH = join(PROJECT, "WORDPRESS_PUBLISH_UONG_BI_BON_CAU_2026-04-29.json");
const PAGE_ID = 531;
const MIN_SCORE = 90;

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex SEO publish gate",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(60000),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? raw : payload;
    throw new Error(`WordPress ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function findRankMathBatchItem(baseUrl, auth, pageId) {
  for (const offset of [0, 25, 50, 75, 100]) {
    const batch = await wp(baseUrl, auth, "/rankmath/v1/toolsAction", {
      method: "POST",
      body: JSON.stringify({
        action: "update_seo_score",
        args: { update_all_scores: true, offset },
      }),
    });
    if (typeof batch === "object" && batch?.[String(pageId)]) {
      return { offset, item: batch[String(pageId)] };
    }
  }
  return null;
}

async function main() {
  const draftResult = JSON.parse(readFileSync(DRAFT_RESULT_PATH, "utf8"));
  const score = Number(draftResult.rankMath?.scoreAfterCreate ?? 0);
  if (score < MIN_SCORE) {
    throw new Error(`Không publish vì scoreAfterCreate=${score} < ${MIN_SCORE}`);
  }
  const slug = draftResult.page?.slug || "thong-tac-bon-cau-uong-bi";
  const imageSeoGate = assertImageSeoReadyForPublish({ slug });

  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const before = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}?context=edit`);
  if (before.status !== "draft" && before.status !== "publish") {
    throw new Error(`Trạng thái Page ${PAGE_ID} không hợp lệ để publish: ${before.status}`);
  }

  const published = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}`, {
    method: "POST",
    body: JSON.stringify({ status: "publish" }),
  });

  const metaTitle = draftResult.rankMath.metaTitle;
  const metaDescription = draftResult.rankMath.metaDescription;
  const focusKeyword = draftResult.rankMath.focusKeyword;
  const updateMeta = await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
    method: "POST",
    body: JSON.stringify({
      objectType: "post",
      objectID: PAGE_ID,
      meta: {
        rank_math_title: metaTitle,
        rank_math_description: metaDescription,
        rank_math_focus_keyword: focusKeyword,
        rank_math_seo_score: String(score),
      },
    }),
  });
  const updateSeoScore = await wp(baseUrl, auth, "/rankmath/v1/updateSeoScore", {
    method: "POST",
    body: JSON.stringify({ postScores: { [PAGE_ID]: score } }),
  });
  const batchItem = await findRankMathBatchItem(baseUrl, auth, PAGE_ID);
  const verified = await wp(baseUrl, auth, `/wp/v2/pages/${PAGE_ID}?context=edit`);

  let indexing = null;
  try {
    indexing = await submitIndexingUrl(PROJECT, verified.link);
  } catch (error) {
    indexing = { ok: false, error: error.message };
  }

  const liveResponse = await fetch(verified.link, {
    headers: { "User-Agent": "Codex SEO publish verify" },
    signal: AbortSignal.timeout(30000),
  });
  const liveHtml = await liveResponse.text();

  const result = {
    ok: true,
    pageId: PAGE_ID,
    beforeStatus: before.status,
    status: verified.status,
    slug: verified.slug,
    imageSeoGate,
    link: verified.link,
    updatedAt: published?.modified ?? null,
    updatedAtGmt: published?.modified_gmt ?? null,
    verifiedAt: verified?.modified ?? null,
    verifiedAtGmt: verified?.modified_gmt ?? null,
    editLink: `${baseUrl}/wp-admin/post.php?post=${PAGE_ID}&action=edit`,
    rankMath: {
      score,
      metaTitle,
      metaDescription,
      focusKeyword,
      updateMetaOk: Boolean(updateMeta),
      updateSeoScore,
      batchContainsPage: Boolean(batchItem),
      batchOffset: batchItem?.offset ?? null,
      batchKeyword: batchItem?.item?.keyword ?? "",
      batchTitle: batchItem?.item?.title ?? "",
    },
    indexing,
    live: {
      ok: liveResponse.ok,
      status: liveResponse.status,
      hasFocusKeyword: liveHtml.toLowerCase().includes(focusKeyword.toLowerCase()),
      hasHotline: liveHtml.includes("0963.953.533") && liveHtml.includes("0931.156.756"),
    },
  };
  writeFileSync(PUBLISH_RESULT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
