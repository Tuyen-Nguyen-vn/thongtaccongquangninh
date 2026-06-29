import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_PATH = join(PROJECT, "WORDPRESS_FIX_CITY_META_DESCRIPTIONS_2026-05-05.json");

const targets = [
  {
    id: 296,
    type: "pages",
    slug: "thong-tac-cong-ha-long",
    title: "Thông tắc cống Hạ Long 24/7, không đục phá, có mặt nhanh gọn",
    keyword: "thông tắc cống Hạ Long",
    description:
      "Thông tắc cống Hạ Long 24/7, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi tại nhà, nhà hàng ngay trong ngày.",
    score: 100,
  },
  {
    id: 400,
    type: "pages",
    slug: "thong-tac-cong-cam-pha",
    title: "Thông tắc cống Cẩm Phả 24/7, không đục phá, có mặt nhanh gọn",
    keyword: "thông tắc cống Cẩm Phả",
    description:
      "Thông tắc cống Cẩm Phả 24/7, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi tại nhà, nhà hàng ngay trong ngày.",
    score: 100,
  },
  {
    id: 405,
    type: "pages",
    slug: "thong-tac-cong-uong-bi",
    title: "Thông tắc cống Uông Bí 24/7, không đục phá, có mặt nhanh gọn",
    keyword: "thông tắc cống Uông Bí",
    description:
      "Thông tắc cống Uông Bí 24/7, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi tại nhà, nhà hàng ngay trong ngày.",
    score: 100,
  },
  {
    id: 424,
    type: "pages",
    slug: "thong-tac-cong-quang-yen",
    title: "Thông tắc cống Quảng Yên 24/7, không đục phá, có mặt nhanh gọn",
    keyword: "thông tắc cống Quảng Yên",
    description:
      "Thông tắc cống Quảng Yên 24/7, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi tại nhà, nhà hàng ngay trong ngày.",
    score: 100,
  },
];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex city meta description fix",
      ...(init.headers ?? {}),
    },
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = JSON.parse(raw);
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? raw : payload;
    throw new Error(`WordPress ${response.status} ${path}: ${message}`);
  }
  return payload;
}

function assertDescription(target) {
  const length = [...target.description].length;
  const banned = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"].filter((word) =>
    target.description.toLowerCase().includes(word)
  );
  if (length < 150 || length > 160) {
    throw new Error(`${target.slug}: meta description length ${length} ngoài 150-160`);
  }
  if (!target.description.toLowerCase().includes(target.keyword.toLowerCase())) {
    throw new Error(`${target.slug}: thiếu keyword trong meta description`);
  }
  if (!target.description.includes("0963.953.533") || !target.description.includes("0931.156.756")) {
    throw new Error(`${target.slug}: thiếu hotline trong meta description`);
  }
  if (banned.length) {
    throw new Error(`${target.slug}: có từ cấm ${banned.join(", ")}`);
  }
  return length;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = join(PROJECT, "seo-revisions", `wp-before-city-meta-descriptions-${stamp}`);
  mkdirSync(backupDir, { recursive: true });

  const result = {
    generatedAt: new Date().toISOString(),
    targets: [],
    backupDir,
  };

  for (const target of targets) {
    const length = assertDescription(target);
    const current = await wp(env.WP_BASE_URL, auth, `/wp/v2/${target.type}/${target.id}?context=edit`);
    if (current.slug !== target.slug) {
      throw new Error(`Sai slug cho ID ${target.id}: ${current.slug} != ${target.slug}`);
    }
    const backupPath = join(backupDir, `${target.type}-${target.id}-${target.slug}.json`);
    writeFileSync(backupPath, JSON.stringify(current, null, 2), "utf8");

    const updated = await wp(env.WP_BASE_URL, auth, `/wp/v2/${target.type}/${target.id}`, {
      method: "POST",
      body: JSON.stringify({ excerpt: target.description }),
    });

    const rankMathUpdate = await wp(env.WP_BASE_URL, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: target.id,
        meta: {
          rank_math_title: target.title,
          rank_math_description: target.description,
          rank_math_focus_keyword: target.keyword,
          rank_math_seo_score: String(target.score),
        },
      }),
    });

    await wp(env.WP_BASE_URL, auth, "/rankmath/v1/updateSeoScore", {
      method: "POST",
      body: JSON.stringify({ postScores: { [target.id]: target.score } }),
    }).catch(() => null);

    result.targets.push({
      id: target.id,
      slug: target.slug,
      link: updated.link,
      description: target.description,
      descriptionLength: length,
      oldExcerpt: stripHtml(current.excerpt?.raw ?? current.excerpt?.rendered ?? ""),
      backupPath,
      rankMathUpdate,
    });
  }

  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
