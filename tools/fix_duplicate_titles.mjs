import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\\\.thongtaccongquangninh";
const ENV_PATH = "C:\\\\Users\\\\DELL\\\\Documents\\\\Codex\\\\2026-04-28\\\\chatgpt-apps-plugin-chatgpt-apps-openai\\\\.env";
const REPORT_PATH = join(PROJECT, "WORDPRESS_FIX_DUPLICATE_TITLES_2026-05-09.json");

const targets = [
  {
    id: 64,
    slug: 'chinh-sach-bao-hanh',
    title: 'Chính sách bảo hành dịch vụ thông hút bể phốt',
  },
  {
    id: 282,
    slug: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật thông tin khách hàng',
  },
  {
    id: 429,
    slug: 'thong-tac-bon-cau-dong-trieu',
    title: 'Thông tắc bồn cầu Đông Triều: Xử lý triệt để đồi dốc, khách sạn',
  },
  {
    id: 398,
    slug: 'thong-tac-bon-cau-ha-long',
    title: 'Thông tắc bồn cầu Hạ Long: Chuyên xử lý tắc cho nhà dân, nhà nghỉ',
  },
  {
    id: 430,
    slug: 'thong-tac-bon-cau-mong-cai',
    title: 'Thông tắc bồn cầu Móng Cái: Phục vụ 24/7 khu vực biên giới',
  },
  {
    id: 37,
    slug: 'thong-tac-bon-cau-quang-ninh',
    title: 'Thông tắc bồn cầu Quảng Ninh: Công nghệ hiện đại không đục phá',
  },
  {
    id: 428,
    slug: 'thong-tac-bon-cau-quang-yen',
    title: 'Thông tắc bồn cầu Quảng Yên: Hỗ trợ nhà xưởng, khu công nghiệp',
  },
  {
    id: 431,
    slug: 'thong-tac-bon-cau-van-don',
    title: 'Thông tắc bồn cầu Vân Đồn: Đảm bảo vệ sinh cho khu du lịch',
  }
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

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex fix duplicate titles",
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

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = join(PROJECT, "seo-revisions", `wp-before-fix-duplicate-titles-${stamp}`);
  mkdirSync(backupDir, { recursive: true });

  const result = {
    generatedAt: new Date().toISOString(),
    targets: [],
    backupDir,
  };

  for (const target of targets) {
    // Both pages and posts can be updated with /wp/v2/pages if they are pages. Wait, the list is mixed? 
    // They are all 'pages' except for maybe one. Let's use 'pages' as default, but first fetch 'pages' to see if it exists.
    let current;
    let type = "pages";
    try {
      current = await wp(env.WP_BASE_URL, auth, `/wp/v2/pages/${target.id}?context=edit`);
    } catch (e) {
      current = await wp(env.WP_BASE_URL, auth, `/wp/v2/posts/${target.id}?context=edit`);
      type = "posts";
    }
    
    if (current.slug !== target.slug) {
      throw new Error(`Sai slug cho ID ${target.id}: ${current.slug} != ${target.slug}`);
    }
    
    const backupPath = join(backupDir, `${type}-${target.id}-${target.slug}.json`);
    writeFileSync(backupPath, JSON.stringify(current, null, 2), "utf8");

    const updated = await wp(env.WP_BASE_URL, auth, `/wp/v2/${type}/${target.id}`, {
      method: "POST",
      body: JSON.stringify({ title: target.title }),
    });
    
    const rankMathUpdate = await wp(env.WP_BASE_URL, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: target.id,
        meta: {
          rank_math_title: target.title
        },
      }),
    }).catch(e => {
        console.warn("Rankmath update failed for", target.slug, e.message);
        return { error: e.message };
    });

    result.targets.push({
      id: target.id,
      slug: target.slug,
      link: updated.link,
      newTitle: target.title,
      oldTitle: current.title.raw || current.title.rendered,
      backupPath,
      rankMathUpdate
    });
    console.log(`Updated ${target.slug} -> ${target.title}`);
  }

  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
