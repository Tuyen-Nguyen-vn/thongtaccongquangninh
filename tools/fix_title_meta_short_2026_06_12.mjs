/**
 * Fix remaining TITLE_SHORT/META_SHORT issues from the 2026-06-12 SEO audit.
 *
 * Scope:
 * - 1 homepage title.
 * - 7 meta descriptions rendered too short in public HTML.
 *
 * Usage:
 *   node tools/fix_title_meta_short_2026_06_12.mjs
 *   node tools/fix_title_meta_short_2026_06_12.mjs --write
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { platform } from "node:process";

const WRITE = process.argv.includes("--write");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PROJECT = platform === "linux" ? "/mnt/d/.thongtaccongquangninh" : "D:\\.thongtaccongquangninh";
const SEP = platform === "linux" ? "/" : "\\";
const fromProject = (...parts) => [PROJECT, ...parts].join(SEP);
const ENV_PATH = fromProject(".env");
const BACKUP_DIR = fromProject("backups", "live-audit-fix-2026-06-12");
const PLUGIN_SLUG = "ttcqn-title-meta-short-2026-06-12";
const PLUGIN_DIR = fromProject("tools", "wp-plugins", PLUGIN_SLUG);
const PLUGIN_FILE = [PLUGIN_DIR, `${PLUGIN_SLUG}.php`].join(SEP);
const ZIP_PATH = fromProject("tools", "wp-plugins", `${PLUGIN_SLUG}.zip`);

const FIXES = {
  61: {
    type: "page",
    slug: "bang-gia",
    path: "/bang-gia/",
    title: "Bảng Giá Hút Bể Phốt Thông Tắc Cống Quảng Ninh 2026 Không Ẩn Phí",
    desc:
      "Bảng giá hút bể phốt thông tắc cống Quảng Ninh 2026 rõ từng hạng mục, báo giá trước, không ẩn phí, phục vụ 24/7. Gọi ngay 0963.953.533. Thợ có mặt nhanh.",
    keyword: "bảng giá hút bể phốt thông tắc cống Quảng Ninh",
  },
  25: {
    type: "page",
    slug: "blog",
    path: "/blog/",
    title: "Dịch vụ hút bể phốt Quảng Ninh: blog xử lý cống, bể phốt, mùi hôi",
    desc:
      "Dịch vụ hút bể phốt Quảng Ninh, thông tắc cống và xử lý mùi hôi qua các bài hướng dẫn thực tế, phục vụ 24/7. Cần thợ gọi 0963.953.533. Thợ có mặt nhanh.",
    keyword: "dịch vụ hút bể phốt Quảng Ninh",
  },
  23: {
    type: "page",
    slug: "trang-chu",
    path: "/",
    title: "Thông Tắc Cống Quảng Ninh - Hút Bể Phốt",
    desc:
      "Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh. Hoạt động 05:00-22:00 hằng ngày, có mặt 15 phút, báo giá trước, không đục phá. Gọi ngay 0963.953.533 / 0931.156.756 để xử lý.",
    keyword: "thông tắc cống Quảng Ninh",
  },
  2589: {
    type: "post",
    slug: "dau-hieu-be-phot-bi-day-2026",
    path: "/dau-hieu-be-phot-bi-day-2026/",
    desc:
      "Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng nhiều. Gọi 0963.953.533 hút ngay tại Quảng Ninh, có mặt 15 phút tại nhà. 24/7.",
    keyword: "dấu hiệu bể phốt bị đầy",
  },
  2702: {
    type: "post",
    slug: "hut-be-phot-khach-san-quang-ninh-2026",
    path: "/hut-be-phot-khach-san-quang-ninh-2026/",
    desc:
      "Hút bể phốt khách sạn, nhà nghỉ tại Quảng Ninh 24/7. Có mặt 15 phút, xử lý sạch mùi, báo giá trước, không ảnh hưởng khách lưu trú. Gọi 0963.953.533 để điều xe.",
    keyword: "hút bể phốt khách sạn Quảng Ninh",
  },
  26: {
    type: "page",
    slug: "hut-be-phot-quang-ninh",
    path: "/hut-be-phot-quang-ninh/",
    desc:
      "Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.",
    keyword: "hút bể phốt Quảng Ninh",
  },
  386: {
    type: "page",
    slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
    path: "/nguyen-nhan-cong-tac-thuong-xuyen-ha-long/",
    desc:
      "Tìm nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống sai độ dốc. Gọi 0963.953.533. Có mặt 15 phút, xử lý nhanh ngay tại nhà.",
    keyword: "nguyên nhân cống tắc thường xuyên Hạ Long",
  },
  380: {
    type: "page",
    slug: "thong-tac-cong-chung-cu-ha-long",
    path: "/thong-tac-cong-chung-cu-ha-long/",
    desc:
      "Thông tắc cống chung cư Hạ Long, xử lý trục đứng, tầng hầm, cống bếp và thoát sàn bằng thiết bị phù hợp. Gọi 0963.953.533. Thợ có mặt 15 phút, hỗ trợ tận nơi.",
    keyword: "thông tắc cống chung cư Hạ Long",
  },
  384: {
    type: "page",
    slug: "thong-tac-cong-ngo-nho-ha-long",
    path: "/thong-tac-cong-ngo-nho-ha-long/",
    desc:
      "Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút.",
    keyword: "thông tắc cống ngõ nhỏ Hạ Long",
  },
  35: {
    type: "page",
    slug: "thong-tac-cong-quang-ninh",
    path: "/thong-tac-cong-quang-ninh/",
    title: "Dịch vụ thông tắc cống Quảng Ninh 24/7 | Song Hào xử lý nhanh",
    desc:
      "Thông tắc cống Quảng Ninh tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái. Không đục phá, báo giá trước, bảo hành theo ca. Gọi 0963.953.533 / 0931.156.756.",
    keyword: "thông tắc cống Quảng Ninh",
  },
};

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
let mcpSessionId = null;

function httpsJson(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "ttcqn-title-meta-short-fix/1.0",
        ...(bodyBuf
          ? {
              "Content-Type": "application/json",
              "Content-Length": bodyBuf.length,
            }
          : {}),
        ...(mcpSessionId ? { "Mcp-Session-Id": mcpSessionId } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (!mcpSessionId && res.headers["mcp-session-id"]) mcpSessionId = res.headers["mcp-session-id"];
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function httpsRaw(method, path, bodyBuf = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "ttcqn-title-meta-short-fix/1.0",
        ...(bodyBuf ? { "Content-Length": bodyBuf.length } : {}),
        ...headers,
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusCode, data, raw: data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

async function wpRestJson(method, path, body = null) {
  const res = await httpsRaw(
    method,
    `/wp-json${path}`,
    body ? Buffer.from(JSON.stringify(body), "utf8") : null,
    body ? { "Content-Type": "application/json" } : {}
  );
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`${method} ${path} failed HTTP ${res.status}: ${String(res.raw).slice(0, 500)}`);
  }
  return res.data;
}

async function uploadPluginViaRest(zip) {
  const pluginId = encodeURIComponent(`${PLUGIN_SLUG}/${PLUGIN_SLUG}`);

  const existing = await httpsRaw("GET", `/wp-json/wp/v2/plugins/${pluginId}?context=edit`);
  if (existing.status === 200) {
    const currentStatus = existing.data?.status;
    if (currentStatus === "active") {
      await wpRestJson("PUT", `/wp/v2/plugins/${pluginId}`, { status: "inactive" });
    }
    await wpRestJson("DELETE", `/wp/v2/plugins/${pluginId}`);
  } else if (existing.status !== 404) {
    throw new Error(`Plugin lookup failed HTTP ${existing.status}: ${String(existing.raw).slice(0, 500)}`);
  }

  const boundary = `----ttcqnTitleMetaShort${Date.now()}`;
  const slugPart = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="slug"\r\n\r\n${PLUGIN_SLUG}\r\n`
  );
  const fileHead = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="pluginzip"; filename="${PLUGIN_SLUG}.zip"\r\nContent-Type: application/zip\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const upload = await httpsRaw(
    "POST",
    "/wp-json/wp/v2/plugins",
    Buffer.concat([slugPart, fileHead, zip, tail]),
    { "Content-Type": `multipart/form-data; boundary=${boundary}` }
  );
  if (upload.status !== 201 && upload.status !== 200) {
    throw new Error(`Plugin REST upload failed HTTP ${upload.status}: ${String(upload.raw).slice(0, 800)}`);
  }

  await wpRestJson("PUT", `/wp/v2/plugins/${pluginId}`, { status: "active" });
  return upload;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildZip(entries) {
  const parts = [];
  const cds = [];
  let off = 0;
  for (const [name, data] of entries) {
    const nb = Buffer.from(name, "utf8");
    const db = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const cr = crc32(db);
    const lh = Buffer.alloc(30 + nb.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(0, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(cr, 14);
    lh.writeUInt32LE(db.length, 18);
    lh.writeUInt32LE(db.length, 22);
    lh.writeUInt16LE(nb.length, 26);
    lh.writeUInt16LE(0, 28);
    nb.copy(lh, 30);
    parts.push(lh, db);
    const cd = Buffer.alloc(46 + nb.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(cr, 16);
    cd.writeUInt32LE(db.length, 20);
    cd.writeUInt32LE(db.length, 24);
    cd.writeUInt16LE(nb.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(off, 42);
    nb.copy(cd, 46);
    cds.push(cd);
    off += lh.length + db.length;
  }
  const cdBuf = Buffer.concat(cds);
  const eo = Buffer.alloc(22);
  eo.writeUInt32LE(0x06054b50, 0);
  eo.writeUInt16LE(0, 4);
  eo.writeUInt16LE(0, 6);
  eo.writeUInt16LE(cds.length, 8);
  eo.writeUInt16LE(cds.length, 10);
  eo.writeUInt32LE(cdBuf.length, 12);
  eo.writeUInt32LE(off, 16);
  eo.writeUInt16LE(0, 20);
  return Buffer.concat([...parts, cdBuf, eo]);
}

function phpStr(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function validateFixes() {
  const out = [];
  for (const [id, fix] of Object.entries(FIXES)) {
    const titleLen = fix.title ? [...fix.title].length : null;
    const descLen = [...fix.desc].length;
    const titleOk = titleLen === null || (titleLen >= 60 && titleLen <= 70);
    const descOk = descLen >= 145 && descLen <= 160;
    out.push({ id, slug: fix.slug, titleLen, descLen, titleOk, descOk });
    if (!titleOk || !descOk) throw new Error(`Length validation failed for ${id}: ${JSON.stringify(out.at(-1))}`);
    if (!fix.desc.includes("0963.953.533")) throw new Error(`Missing hotline in desc for ${id}`);
  }
  return out;
}

function buildPluginPhp() {
  let casesDesc = "";
  let casesTitle = "";
  let casesKeyword = "";
  let updateRows = "";
  for (const [id, fix] of Object.entries(FIXES)) {
    casesDesc += `        case ${id}: return '${phpStr(fix.desc)}';\n`;
    casesKeyword += `        case ${id}: return '${phpStr(fix.keyword)}';\n`;
    if (fix.title) casesTitle += `        case ${id}: return '${phpStr(fix.title)}';\n`;
    updateRows += `        ${id} => ['desc' => '${phpStr(fix.desc)}', 'title' => ${fix.title ? `'${phpStr(fix.title)}'` : "null"}, 'keyword' => '${phpStr(fix.keyword)}'],\n`;
  }

  return `<?php
/**
 * Plugin Name: TTCQN Title Meta Short Fix 2026-06-12
 * Description: Fix TITLE_SHORT/META_SHORT for selected TTCQN URLs.
 * Version: 2026.06.27.1
 */
if (!defined('ABSPATH')) exit;

function ttcqn_20260612_desc($post_id) {
    switch ((int) $post_id) {
${casesDesc}        default: return null;
    }
}

function ttcqn_20260612_title($post_id) {
    switch ((int) $post_id) {
${casesTitle}        default: return null;
    }
}

function ttcqn_20260612_keyword($post_id) {
    switch ((int) $post_id) {
${casesKeyword}        default: return null;
    }
}

add_filter('rank_math/frontend/description', function($desc) {
    $fixed = ttcqn_20260612_desc(get_queried_object_id());
    return $fixed !== null ? $fixed : $desc;
}, 9999);

add_filter('rank_math/frontend/title', function($title) {
    $fixed = ttcqn_20260612_title(get_queried_object_id());
    return $fixed !== null ? $fixed : $title;
}, 9999);

add_filter('pre_get_document_title', function($title) {
    $fixed = ttcqn_20260612_title(get_queried_object_id());
    return $fixed !== null ? $fixed : $title;
}, 9999);

add_filter('document_title_parts', function($parts) {
    $fixed = ttcqn_20260612_title(get_queried_object_id());
    if ($fixed !== null) {
        $parts['title'] = $fixed;
        unset($parts['site'], $parts['tagline']);
    }
    return $parts;
}, 9999);

add_action('init', function() {
    if (get_option('ttcqn_title_meta_short_20260627_v1')) return;
    $fixes = [
${updateRows}    ];
    foreach ($fixes as $post_id => $data) {
        update_post_meta($post_id, 'rank_math_description', $data['desc']);
        if (!empty($data['title'])) update_post_meta($post_id, 'rank_math_title', $data['title']);
        if (!empty($data['keyword'])) update_post_meta($post_id, 'rank_math_focus_keyword', $data['keyword']);
        wp_cache_delete($post_id, 'post_meta');
        clean_post_cache($post_id);
    }
    update_option('ttcqn_title_meta_short_20260627_v1', 1);
}, 1);
`;
}

async function backupTargets(stamp) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const backups = [];
  for (const [id, fix] of Object.entries(FIXES)) {
    const res = await httpsJson("GET", `/wp-json/wp/v2/${fix.type}s/${id}?context=edit`);
    if (res.status !== 200) throw new Error(`Backup GET failed for ${id}: ${res.status}`);
    const path = [BACKUP_DIR, `${fix.type}-${id}-before-title-meta-${stamp}.json`].join(SEP);
    writeFileSync(path, JSON.stringify(res.data, null, 2), "utf8");
    backups.push(path);
  }
  return backups;
}

async function mcpCall(method, params) {
  return httpsJson("POST", "/wp-json/mcp/mcp-adapter-default-server", {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  });
}

async function ability(name, params) {
  return mcpCall("tools/call", {
    name: "mcp-adapter-execute-ability",
    arguments: { ability_name: name, parameters: params },
  });
}

async function main() {
  console.log(`=== Fix title/meta short (${WRITE ? "WRITE" : "DRY-RUN"}) ===`);
  const validation = validateFixes();
  console.log(JSON.stringify(validation, null, 2));

  const php = buildPluginPhp();
  mkdirSync(PLUGIN_DIR, { recursive: true });
  writeFileSync(PLUGIN_FILE, php, "utf8");
  const zip = buildZip([[`${PLUGIN_SLUG}/${PLUGIN_SLUG}.php`, Buffer.from(php, "utf8")]]);
  writeFileSync(ZIP_PATH, zip);
  console.log(`Plugin PHP: ${PLUGIN_FILE}`);
  console.log(`Plugin ZIP: ${ZIP_PATH} (${zip.length} bytes)`);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backups = await backupTargets(stamp);
  console.log(`Backups: ${backups.length}`);

  if (!WRITE) {
    console.log("[DRY-RUN] Plugin package built and backups written. No live deploy.");
    return;
  }

  const init = await mcpCall("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
    clientInfo: { name: "title-meta-short-fix", version: "1" },
  });
  if (init.status !== 200) throw new Error(`MCP initialize failed: ${init.status}`);

  const upload = await ability("plugins/upload-base64", {
    content_base64: zip.toString("base64"),
    filename: `${PLUGIN_SLUG}.zip`,
    activate: true,
    overwrite: true,
  });
  const uploadText = JSON.stringify(upload.data);
  console.log(`Upload status: ${upload.status}`);
  console.log(uploadText.slice(0, 500));
  if (upload.status !== 200 || !/success|activated|Plugin installed successfully/i.test(uploadText)) {
    console.log("MCP ability upload failed; falling back to WordPress REST plugin replace.");
    const restUpload = await uploadPluginViaRest(zip);
    console.log(`REST plugin upload status: ${restUpload.status}`);
  }
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
