import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const TODAY = "2026-04-30";

const targets = [
  {
    type: "pages",
    id: 23,
    slug: "trang-chu",
    videoId: "DmiPD6WM9Jg",
    heading: "Video tổng hợp dịch vụ tại Quảng Ninh",
    text: "Video thực tế giúp khách xem nhanh thiết bị, cách tiếp nhận và phạm vi xử lý trước khi gọi.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 62,
    slug: "gioi-thieu",
    videoId: "DmiPD6WM9Jg",
    heading: "Video thực tế về đội dịch vụ",
    text: "Khách có thể xem hình ảnh thực tế trước khi gọi đội kỹ thuật đến kiểm tra tại công trình.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 25,
    slug: "blog",
    videoId: "DmiPD6WM9Jg",
    heading: "Video thực tế tổng hợp dịch vụ",
    text: "Video tổng hợp giúp khách nhận biết thiết bị, quy trình và các nhóm dịch vụ đang được hướng dẫn trong blog.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 26,
    slug: "hut-be-phot-quang-ninh",
    videoId: "DmiPD6WM9Jg",
    heading: "Video thực tế hút bể phốt tại Quảng Ninh",
    text: "Video minh họa cách đội kỹ thuật tiếp nhận, kiểm tra và xử lý sự cố bể phốt tại công trình.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 52,
    slug: "hut-be-phot-ha-long",
    videoId: "y5btv9DD9xY",
    heading: "Video thực tế hút bể phốt Hạ Long",
    text: "Video giúp khách tại Hạ Long xem cách xe và thiết bị được điều đến công trình trước khi thi công.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 53,
    slug: "hut-be-phot-cam-pha",
    videoId: "q04Y8TF5ZX8",
    heading: "Video thực tế hút bể phốt Cẩm Phả",
    text: "Video ghi lại hạng mục hút bể phốt tại Cẩm Phả để khách dễ hình dung thiết bị và cách xử lý.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 35,
    slug: "thong-tac-cong-quang-ninh",
    videoId: "pXSJIOhrO3Q",
    heading: "Video thực tế thông tắc cống Quảng Ninh",
    text: "Video minh họa ca thông tắc cống tại Quảng Ninh, phù hợp để khách xem trước quy trình xử lý.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 296,
    slug: "thong-tac-cong-ha-long",
    videoId: "_xk-SltPTT4",
    heading: "Video thực tế thông tắc cống Hạ Long",
    text: "Video giúp khách xem cách xử lý cống tắc tại Hạ Long bằng thiết bị phù hợp, hạn chế tháo dỡ.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 400,
    slug: "thong-tac-cong-cam-pha",
    videoId: "SAcMEagW9WI",
    heading: "Video thực tế thông tắc cống Cẩm Phả",
    text: "Video ghi lại tình huống xử lý cống tắc tại Cẩm Phả để khách thấy rõ thao tác và thiết bị.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 37,
    slug: "thong-tac-bon-cau-quang-ninh",
    videoId: "3TlOpcPIGXc",
    heading: "Video thực tế thông tắc bồn cầu Quảng Ninh",
    text: "Video minh họa tình huống bồn cầu tắc và cách kỹ thuật kiểm tra trước khi xử lý.",
    after: "## Case study",
  },
  {
    type: "pages",
    id: 398,
    slug: "thong-tac-bon-cau-ha-long",
    videoId: "3TlOpcPIGXc",
    heading: "Video thực tế thông tắc bồn cầu Hạ Long",
    text: "Video giúp khách tại Hạ Long xem cách xử lý bồn cầu tắc trước khi gọi thợ đến nhà.",
    after: "## Case study",
  },
  {
    type: "posts",
    id: 378,
    slug: "hut-be-phot-ha-long-xe-hut-24-7",
    videoId: "y5btv9DD9xY",
    heading: "Video thực tế xe hút bể phốt Hạ Long",
    text: "Video giúp khách xem hình ảnh xe hút và cách xử lý bể phốt tại Hạ Long trước khi đặt lịch.",
    after: "## Case study",
  },
  {
    type: "posts",
    id: 377,
    slug: "thong-tac-cong-ha-long-ban-dem",
    videoId: "_xk-SltPTT4",
    heading: "Video thực tế thông tắc cống Hạ Long",
    text: "Video minh họa cách xử lý cống tắc tại Hạ Long, phù hợp với các ca cần xử lý ngoài giờ.",
    after: "## Case study",
  },
  {
    type: "posts",
    id: 394,
    slug: "thong-tac-cong-hong-gai-ha-long",
    videoId: "_xk-SltPTT4",
    heading: "Video thực tế thông tắc cống Hồng Gai Hạ Long",
    text: "Video giúp khách tại Hồng Gai xem cách kiểm tra và xử lý cống tắc bằng thiết bị phù hợp.",
    after: "## Case study",
  },
];

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
      "User-Agent": "Codex SEO video insert",
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

function videoBlock(target) {
  const marker = `codex-video-${target.videoId}`;
  return `<!-- wp:html -->
<div class="seo-video-proof" data-codex-video-id="${target.videoId}">
  <h3>${target.heading}</h3>
  <p>${target.text} Gọi <strong>0963.953.533 / 0931.156.756</strong> nếu cần thợ kiểm tra nhanh.</p>
  <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;">
    <iframe src="https://www.youtube.com/embed/${target.videoId}" title="${target.heading}" loading="lazy" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
</div>
<!-- ${marker} -->
<!-- /wp:html -->`;
}

function insertAfterHeading(content, target) {
  const marker = `codex-video-${target.videoId}`;
  if (content.includes(marker) || content.includes(`youtube.com/embed/${target.videoId}`)) {
    return { content, changed: false, reason: "already-present" };
  }
  const block = videoBlock(target);
  const h2s = [...content.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)];
  const wanted = (target.after ?? "").replace(/^##\s*/, "").toLowerCase();
  const hit = h2s.find((match) => match[0].toLowerCase().includes(wanted));
  if (hit) {
    const pos = hit.index + hit[0].length;
    return {
      content: `${content.slice(0, pos)}\n${block}\n${content.slice(pos)}`,
      changed: true,
      reason: "after-heading",
    };
  }
  return { content: `${content}\n${block}`, changed: true, reason: "append" };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const baseUrl = env.WP_BASE_URL;
  const backupDir = join(PROJECT, "seo-revisions", `wp-before-youtube-video-insert-${TODAY}`);
  mkdirSync(backupDir, { recursive: true });
  const rows = [];

  for (const target of targets) {
    const before = await wp(baseUrl, auth, `/wp/v2/${target.type}/${target.id}?context=edit`);
    writeFileSync(
      join(backupDir, `${target.type}-${target.id}-${target.slug}.json`),
      JSON.stringify(before, null, 2),
      "utf8"
    );
    const rawContent = before.content?.raw || before.content?.rendered || "";
    const inserted = insertAfterHeading(rawContent, target);
    if (inserted.changed) {
      await wp(baseUrl, auth, `/wp/v2/${target.type}/${target.id}`, {
        method: "POST",
        body: JSON.stringify({ content: inserted.content }),
      });
    }
    const after = await wp(baseUrl, auth, `/wp/v2/${target.type}/${target.id}?context=edit`);
    rows.push({
      slug: target.slug,
      id: target.id,
      type: target.type,
      videoId: target.videoId,
      changed: inserted.changed,
      reason: inserted.reason,
      link: after.link,
      hasEmbed: (after.content?.raw || after.content?.rendered || "").includes(
        `youtube.com/embed/${target.videoId}`
      ),
    });
  }

  writeFileSync(
    join(PROJECT, `WORDPRESS_INSERT_YOUTUBE_VIDEOS_${TODAY}.json`),
    JSON.stringify({ ok: true, backupDir, rows }, null, 2),
    "utf8"
  );
  console.log(JSON.stringify({ ok: true, backupDir, rows }, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
