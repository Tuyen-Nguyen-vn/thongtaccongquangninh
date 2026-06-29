import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const IMAGE_DIR = "C:\\Users\\DELL\\Desktop\\anh-seo-local-dot-2-toi-uu";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BASE_URL = "https://thongtaccongquangninh.com";
const DRY_RUN = process.argv.includes("--dry-run");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-image-seo-dot2-${STAMP}`);
const REPORT_PATH = join(PROJECT, `WORDPRESS_IMAGE_SEO_DOT2_${STAMP}.json`);

const TARGETS = [
  {
    path: "/hut-be-phot-ha-long/",
    file: "hut-be-phot/hut-be-phot-nha-dan-ha-long-xe-bon.webp",
    alt: "Xe hút bể phốt nhà dân tại Hạ Long Quảng Ninh",
    caption: "Ảnh minh họa xe bồn hút bể phốt tại khu dân cư Hạ Long, Quảng Ninh.",
  },
  {
    path: "/hut-be-phot-quang-ninh/",
    file: "hut-be-phot/hut-be-phot-nha-dan-quang-ninh-mo-nap-be.webp",
    alt: "Thợ mở nắp bể phốt nhà dân tại Quảng Ninh",
    caption: "Ảnh minh họa quá trình mở nắp bể phốt, chuẩn bị hút bể tại nhà dân Quảng Ninh.",
  },
  {
    path: "/hut-be-phot-uong-bi/",
    file: "hut-be-phot/hut-be-phot-nha-dan-quang-ninh-mo-nap-be.webp",
    alt: "Thợ mở nắp bể phốt nhà dân tại Uông Bí Quảng Ninh",
    caption: "Ảnh minh họa thao tác mở nắp bể phốt, chuẩn bị hút bể tại khu dân cư Uông Bí.",
  },
  {
    path: "/thong-tac-bon-cau-ha-long/",
    file: "thong-tac-bon-cau/thong-tac-bon-cau-ha-long-bang-may-lo-xo.webp",
    alt: "Thông tắc bồn cầu Hạ Long bằng máy lò xo",
    caption: "Ảnh minh họa quy trình thông tắc bồn cầu trong nhà vệ sinh tại Hạ Long.",
  },
  {
    path: "/thong-tac-bon-cau-ha-long/",
    file: "thong-tac-bon-cau/thong-tac-bon-cau-quang-ninh-nha-ve-sinh.webp",
    alt: "Thợ xử lý bồn cầu nghẹt trong nhà vệ sinh tại Hạ Long",
    caption: "Ảnh minh họa thao tác đưa dây lò xo xử lý bồn cầu nghẹt tại Hạ Long.",
  },
  {
    path: "/thong-tac-bon-cau-quang-ninh/",
    file: "thong-tac-bon-cau/thong-tac-bon-cau-quang-ninh-nha-ve-sinh.webp",
    alt: "Thợ thông tắc bồn cầu tại Quảng Ninh bằng máy chuyên dụng",
    caption: "Ảnh minh họa thao tác đưa dây lò xo xử lý bồn cầu nghẹt tại Quảng Ninh.",
  },
  {
    path: "/thong-tac-cong-cam-pha/",
    file: "thong-tac-cong/thong-tac-cong-ap-luc-cao-ha-long-quang-ninh.webp",
    alt: "Đội thợ thông tắc cống áp lực cao tại Cẩm Phả Quảng Ninh",
    caption: "Ảnh minh họa đội thợ chuẩn bị thiết bị xử lý cống nghẹt tại Cẩm Phả.",
  },
  {
    path: "/thong-tac-cong-quang-ninh/",
    file: "thong-tac-cong/thong-tac-cong-ap-luc-cao-ha-long-quang-ninh.webp",
    alt: "Đội thợ thông tắc cống áp lực cao tại Quảng Ninh",
    caption: "Ảnh minh họa đội thợ chuẩn bị thiết bị xử lý cống nghẹt tại Quảng Ninh.",
  },
  {
    path: "/thong-tac-cong-uong-bi/",
    file: "thong-tac-cong/thong-tac-cong-ngoai-troi-ha-long-quang-ninh.webp",
    alt: "Thợ thông tắc cống ngoài trời tại Uông Bí Quảng Ninh",
    caption: "Ảnh minh họa thợ xử lý cống nghẹt ngoài trời bằng máy lò xo tại Uông Bí.",
  },
  {
    path: "/thong-tac-cong-quang-yen/",
    file: "thong-tac-cong/thong-tac-cong-ngoai-troi-ha-long-quang-ninh.webp",
    alt: "Thợ thông tắc cống ngoài trời tại Quảng Yên Quảng Ninh",
    caption: "Ảnh minh họa thợ xử lý cống nghẹt ngoài trời bằng máy lò xo tại Quảng Yên.",
  },
  {
    path: "/thong-tac-chau-rua-quang-ninh/",
    file: "thong-tac-bon-cau/thong-tac-bon-cau-quang-ninh-nha-ve-sinh.webp",
    alt: "Thợ xử lý đường thoát chậu rửa và nhà vệ sinh tại Quảng Ninh",
    caption: "Ảnh minh họa thao tác xử lý đường thoát nước trong khu vệ sinh tại Quảng Ninh.",
  },
  {
    path: "/thong-tac-cong-nha-hang-ha-long/",
    file: "thong-tac-cong/thong-tac-cong-ap-luc-cao-ha-long-quang-ninh.webp",
    alt: "Đội thợ thông tắc cống nhà hàng tại Hạ Long Quảng Ninh",
    caption: "Ảnh minh họa đội thợ chuẩn bị thiết bị xử lý cống nghẹt cho công trình tại Hạ Long.",
  },
];

function env(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function slug(pathname) {
  return pathname.replace(/^\/|\/$/g, "");
}

function esc(input) {
  return String(input).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function countImgs(html) {
  return (String(html || "").match(/<img\b/giu) || []).length;
}

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: { Authorization: auth, "User-Agent": "Codex Image SEO dot2", ...(init.headers || {}) },
  });
  const raw = await res.text();
  let data = raw;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!res.ok) throw new Error(`WordPress ${res.status} ${path}: ${typeof data === "object" ? data.message || raw : raw}`);
  return data;
}

async function findPost(baseUrl, auth, path) {
  const s = slug(path);
  for (const type of ["pages", "posts"]) {
    const rows = await wp(baseUrl, auth, `/wp/v2/${type}?slug=${encodeURIComponent(s)}&status=publish,draft,pending,private,future&context=edit`);
    if (Array.isArray(rows) && rows[0]) return { type, item: rows[0] };
  }
  return null;
}

async function media(baseUrl, auth, target) {
  const filePath = join(IMAGE_DIR, target.file);
  const fileName = basename(target.file);
  const base = basename(fileName, extname(fileName));
  const found = await wp(baseUrl, auth, `/wp/v2/media?search=${encodeURIComponent(base)}&per_page=20`);
  const hit = Array.isArray(found) ? found.find((m) => String(m.source_url || "").includes(fileName)) : null;
  if (hit) return { item: hit, uploaded: false };
  if (DRY_RUN) return { item: { id: 0, source_url: `DRY_RUN/${fileName}` }, uploaded: false };
  const item = await wp(baseUrl, auth, "/wp/v2/media", {
    method: "POST",
    headers: { "Content-Type": "image/webp", "Content-Disposition": `attachment; filename="${fileName}"` },
    body: createReadStream(filePath),
    duplex: "half",
  });
  await wp(baseUrl, auth, `/wp/v2/media/${item.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alt_text: target.alt, caption: target.caption, title: base.replaceAll("-", " ") }),
  });
  return { item, uploaded: true };
}

function figure(mediaItem, target) {
  return `<!-- wp:image {"id":${mediaItem.id},"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${mediaItem.source_url}" alt="${esc(target.alt)}" class="wp-image-${mediaItem.id}"/><figcaption class="wp-element-caption">${esc(target.caption)}</figcaption></figure>\n<!-- /wp:image -->`;
}

function insert(content, block) {
  const process = content.search(/<h2[^>]*>[\s\S]*?(quy trình|xử lý|thi công|case|tình huống)[\s\S]*?<\/h2>/iu);
  if (process >= 0) return `${content.slice(0, process)}\n\n${block}\n\n${content.slice(process)}`;
  const firstP = content.match(/<\/p>/i);
  if (firstP) {
    const i = firstP.index + firstP[0].length;
    return `${content.slice(0, i)}\n\n${block}\n\n${content.slice(i)}`;
  }
  return `${content}\n\n${block}`;
}

async function live(baseUrl, path, fileName) {
  const res = await fetch(new URL(path, baseUrl), { headers: { "User-Agent": "Codex Image SEO dot2 verify" } });
  const html = await res.text();
  return { status: res.status, imgCount: countImgs(html), hasFile: html.includes(fileName) };
}

async function main() {
  const e = env(ENV_PATH);
  const baseUrl = e.WP_BASE_URL || BASE_URL;
  const auth = `Basic ${Buffer.from(`${e.WP_USERNAME}:${e.WP_APP_PASSWORD}`).toString("base64")}`;
  mkdirSync(BACKUP_DIR, { recursive: true });
  const inserted = [];
  const skipped = [];
  const verified = [];

  for (const target of TARGETS) {
    const found = await findPost(baseUrl, auth, target.path);
    if (!found) {
      skipped.push({ path: target.path, reason: "not_found" });
      continue;
    }
    const raw = found.item.content?.raw || found.item.content?.rendered || "";
    const before = countImgs(raw);
    const fileName = basename(target.file);
    if (before >= 3) {
      const check = await live(baseUrl, target.path, fileName);
      skipped.push({ path: target.path, id: found.item.id, before, reason: "already_has_3_images" });
      verified.push({ path: target.path, id: found.item.id, restImages: before, fileName, ...check });
      continue;
    }
    if (raw.includes(fileName)) {
      skipped.push({ path: target.path, id: found.item.id, before, reason: "target_image_already_in_content" });
      continue;
    }
    const { item: mediaItem, uploaded } = await media(baseUrl, auth, target);
    const next = insert(raw, figure(mediaItem, target));
    const after = countImgs(next);
    if (!DRY_RUN) {
      writeFileSync(join(BACKUP_DIR, `${found.type}-${found.item.id}-${slug(target.path)}.json`), JSON.stringify(found.item, null, 2), "utf8");
      await wp(baseUrl, auth, `/wp/v2/${found.type}/${found.item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
    }
    const check = await live(baseUrl, target.path, fileName);
    inserted.push({ path: target.path, id: found.item.id, before, after, mediaId: mediaItem.id, fileName, uploaded, alt: target.alt, caption: target.caption });
    verified.push({ path: target.path, id: found.item.id, restImages: after, fileName, ...check });
  }

  const finalUnder3 = verified.filter((x) => x.restImages < 3);
  const missingLive = verified.filter((x) => x.status !== 200 || !x.hasFile);
  const result = {
    ok: finalUnder3.length === 0 && missingLive.length === 0,
    dryRun: DRY_RUN,
    generatedAt: new Date().toISOString(),
    imageDir: IMAGE_DIR,
    backupDir: BACKUP_DIR,
    inserted,
    skipped,
    verified,
    finalUnder3,
    missingLive,
    note: "Không xử lý trang chủ / trong batch này vì trạng thái cũ ghi live template page-home.php không render ảnh mới từ REST content.",
  };
  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(2);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
