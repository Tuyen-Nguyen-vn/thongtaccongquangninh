/**
 * Fix FORBIDDEN_WORD: "uy tín" và "chuyên nghiệp" trên 3 bài P0 FAIL
 * - /hut-be-phot-khu-nha-tro-quang-ninh-2026/   uy tín×2, chuyên nghiệp×1
 * - /hut-be-phot-khach-san-quang-ninh-2026/      uy tín×2, chuyên nghiệp×1
 * - /hoa-chat-tu-thong-cong/                     chuyên nghiệp×3
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

function wpReq(method, path, body) {
  return new Promise((res, rej) => {
    const b = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method,
      headers: {
        Host: WP_HOST, Authorization: auth,
        "Content-Type": "application/json",
        ...(b ? { "Content-Length": b.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, resp => {
      let d = "";
      resp.on("data", c => d += c);
      resp.on("end", () => {
        try { res({ s: resp.statusCode, d: JSON.parse(d) }); }
        catch { res({ s: resp.statusCode, d }); }
      });
    });
    r.on("error", rej);
    r.setTimeout(30000, () => r.destroy(new Error("timeout")));
    if (b) r.write(b);
    r.end();
  });
}

async function getPostBySlug(slug) {
  const r = await wpReq("GET", `/wp-json/wp/v2/posts?slug=${slug}&context=edit&_fields=id,slug,content`);
  if (r.s !== 200 || !r.d[0]) throw new Error(`slug ${slug} not found: ${r.s}`);
  return r.d[0];
}

async function getPageBySlug(slug) {
  const r = await wpReq("GET", `/wp-json/wp/v2/pages?slug=${slug}&context=edit&_fields=id,slug,content`);
  if (r.s !== 200 || !r.d[0]) throw new Error(`page slug ${slug} not found: ${r.s}`);
  return r.d[0];
}

async function updatePostContent(id, rawContent) {
  const r = await wpReq("POST", `/wp-json/wp/v2/posts/${id}`, { content: rawContent });
  return r;
}

// Replacements context-aware cho "uy tín"
// Context: thường xuất hiện trong câu như "đảm bảo uy tín", "uy tín lâu năm", "uy tín và..."
function fixUyTin(html) {
  let count = 0;
  // "uy tín" standalone hoặc trong các cụm thường gặp
  const fixed = html.replace(/uy\s+tín/gi, (match, offset) => {
    count++;
    // Thay bằng "được khách hàng tin dùng" hoặc "có thẩm quyền" tùy ngữ cảnh
    // Đơn giản nhất: thay "uy tín" → "được tin dùng"
    if (match[0] === 'U') return "Được tin dùng";
    return "được tin dùng";
  });
  return { fixed, count };
}

// Replacements cho "chuyên nghiệp"
// Context: cần đọc ngữ cảnh — thường là "dịch vụ chuyên nghiệp", "đội ngũ chuyên nghiệp"
// Thay bằng: "chuyên biệt", "có kinh nghiệm", "lành nghề", "tận tâm"
function fixChuyenNghiep(html) {
  let count = 0;
  // Dùng regex với lookbehind để xử lý context
  const patterns = [
    // "dịch vụ chuyên nghiệp" → "dịch vụ chuyên biệt"
    [/dịch\s+vụ\s+chuyên\s+nghiệp/gi, "dịch vụ chuyên biệt"],
    // "đội ngũ chuyên nghiệp" → "đội ngũ lành nghề"
    [/đội\s+ngũ\s+chuyên\s+nghiệp/gi, "đội ngũ lành nghề"],
    // "nhân viên chuyên nghiệp" → "nhân viên lành nghề"
    [/nhân\s+viên\s+chuyên\s+nghiệp/gi, "nhân viên lành nghề"],
    // "thợ chuyên nghiệp" → "thợ lành nghề"
    [/thợ\s+chuyên\s+nghiệp/gi, "thợ lành nghề"],
    // "tác phong chuyên nghiệp" → "tác phong bài bản"
    [/tác\s+phong\s+chuyên\s+nghiệp/gi, "tác phong bài bản"],
    // fallback: "chuyên nghiệp" còn lại → "bài bản"
    [/chuyên\s+nghiệp/gi, "bài bản"],
  ];
  let result = html;
  for (const [pat, repl] of patterns) {
    const before = result;
    result = result.replace(pat, m => { count++; return repl; });
  }
  return { fixed: result, count };
}

const TARGETS = [
  { type: "post", slug: "hut-be-phot-khu-nha-tro-quang-ninh-2026", fixUyTin: true, fixChuyenNghiep: true },
  { type: "post", slug: "hut-be-phot-khach-san-quang-ninh-2026",    fixUyTin: true, fixChuyenNghiep: true },
  { type: "post", slug: "hoa-chat-tu-thong-cong",                   fixUyTin: false, fixChuyenNghiep: true },
];

for (const target of TARGETS) {
  console.log(`\n=== ${target.slug} ===`);
  try {
    const post = target.type === "page"
      ? await getPageBySlug(target.slug)
      : await getPostBySlug(target.slug);

    console.log(`  id=${post.id}`);
    let raw = post.content.raw;
    let totalFixes = 0;

    if (target.fixUyTin) {
      const { fixed, count } = fixUyTin(raw);
      raw = fixed;
      console.log(`  uy tín fixed: ${count}`);
      totalFixes += count;
    }
    if (target.fixChuyenNghiep) {
      const { fixed, count } = fixChuyenNghiep(raw);
      raw = fixed;
      console.log(`  chuyên nghiệp fixed: ${count}`);
      totalFixes += count;
    }

    if (totalFixes === 0) {
      console.log("  → Không tìm thấy từ cấm, bỏ qua");
      continue;
    }

    const r = await updatePostContent(post.id, raw);
    console.log(`  POST status: ${r.s}`);
    if (r.s !== 200) {
      console.log("  ERROR:", JSON.stringify(r.d).slice(0, 200));
      continue;
    }

    // Verify
    const vr = await (target.type === "page"
      ? wpReq("GET", `/wp-json/wp/v2/pages/${post.id}?context=edit&_fields=content`)
      : wpReq("GET", `/wp-json/wp/v2/posts/${post.id}?context=edit&_fields=content`));
    const verifyRaw = vr.d?.content?.raw ?? "";
    const stillUyTin = (verifyRaw.match(/uy\s+tín/gi) || []).length;
    const stillChuyenNghiep = (verifyRaw.match(/chuyên\s+nghiệp/gi) || []).length;
    console.log(`  Verify — uy tín remaining: ${stillUyTin}, chuyên nghiệp remaining: ${stillChuyenNghiep}`);

    if (stillUyTin === 0 && stillChuyenNghiep === 0) {
      console.log("  ✓ CLEAN");
    } else {
      console.log("  ⚠ still has forbidden words");
    }
  } catch (e) {
    console.error(`  ERROR: ${e.message}`);
  }
}

console.log("\nDone.");
