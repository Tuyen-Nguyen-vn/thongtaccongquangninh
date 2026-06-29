/**
 * Fix MULTI_H1 trên 2 bài:
 * - /hut-be-phot-nha-hang-quang-ninh-2026/
 * - /hut-ham-cau-quang-ninh-2026/
 *
 * Strategy: Giữ H1 đầu tiên (page heading thật), chuyển các H1 còn lại → H2
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

/**
 * Trong Gutenberg raw content, H1 có dạng:
 * <!-- wp:heading {"level":1} -->
 * <h1 class="wp-block-heading">...</h1>
 * <!-- /wp:heading -->
 *
 * Chiến lược: tìm tất cả block H1 trong content,
 * nếu có >1 thì chuyển từ block thứ 2 trở đi → H2
 */
function fixMultiH1(raw) {
  // Match tất cả Gutenberg heading block level 1
  const h1BlockRegex = /(<!-- wp:heading \{"level":1\}[^>]* -->[\s\S]*?<!-- \/wp:heading -->)/g;
  const matches = [...raw.matchAll(h1BlockRegex)];

  console.log(`  Found ${matches.length} H1 block(s) in Gutenberg`);

  if (matches.length <= 1) {
    // Có thể H1 extra không phải Gutenberg block — check <h1> raw
    const rawH1 = raw.match(/<h1[\s>]/gi) || [];
    console.log(`  Raw <h1> tags: ${rawH1.length}`);

    if (rawH1.length <= 1) {
      console.log("  → Không tìm thấy MULTI_H1, có thể audit đọc từ rendered HTML");
      return { fixed: raw, count: 0 };
    }
  }

  if (matches.length === 0) {
    // Thử tìm H1 không có level explicit (default heading có thể là H2)
    // Hoặc tìm <h1> trong raw HTML
    return { fixed: raw, count: 0 };
  }

  // Giữ H1 đầu tiên, chuyển các H1 còn lại → H2
  let fixed = raw;
  let fixCount = 0;

  for (let i = 1; i < matches.length; i++) {
    const original = matches[i][0];
    // Thay {"level":1} → {"level":2} trong comment mở
    // Thay <h1 → <h2 và </h1> → </h2> trong HTML
    let replacement = original
      .replace(/<!-- wp:heading (\{[^}]*)"level":1([^}]*\}) -->/, '<!-- wp:heading $1"level":2$2 -->')
      .replace(/<h1(\s[^>]*)?>/, m => m.replace(/^<h1/, '<h2'))
      .replace(/<\/h1>/, '</h2>');

    // Nếu thay đổi thành công
    if (replacement !== original) {
      fixed = fixed.replace(original, replacement);
      fixCount++;
      console.log(`  H1→H2: "${original.match(/<h1[^>]*>([^<]+)/)?.[1]?.slice(0,60)}..."`);
    }
  }

  return { fixed, count: fixCount };
}

const SLUGS = [
  "hut-be-phot-nha-hang-quang-ninh-2026",
  "hut-ham-cau-quang-ninh-2026",
];

for (const slug of SLUGS) {
  console.log(`\n=== ${slug} ===`);
  try {
    const r = await wpReq("GET", `/wp-json/wp/v2/posts?slug=${slug}&context=edit&_fields=id,slug,content`);
    if (r.s !== 200 || !r.d[0]) throw new Error(`slug not found: ${r.s}`);
    const post = r.d[0];
    console.log(`  id=${post.id}`);

    const raw = post.content.raw;

    // Show H1s found
    const h1blocks = [...raw.matchAll(/(<!-- wp:heading \{"level":1\}[^>]* -->)([\s\S]*?)(<!-- \/wp:heading -->)/g)];
    const rawH1s = [...raw.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)];
    console.log(`  Gutenberg H1 blocks: ${h1blocks.length}`);
    console.log(`  Raw <h1> tags: ${rawH1s.length}`);

    for (const m of rawH1s) {
      console.log(`    <h1>: "${m[1].slice(0, 80)}"`);
    }

    const { fixed, count } = fixMultiH1(raw);

    if (count === 0) {
      console.log("  → Không fix được bằng block match, thử raw H1 replace...");

      // Nếu có nhiều <h1> raw (không qua Gutenberg block), thay từ thứ 2
      let fixedRaw = raw;
      let rawCount = 0;
      let firstFound = false;
      const rawFixed = fixedRaw.replace(/<h1(\b[^>]*)>([\s\S]*?)<\/h1>/gi, (m, attrs, content) => {
        if (!firstFound) { firstFound = true; return m; } // giữ cái đầu tiên
        rawCount++;
        return `<h2${attrs}>${content}</h2>`;
      });

      if (rawCount > 0) {
        const pr = await wpReq("POST", `/wp-json/wp/v2/posts/${post.id}`, { content: rawFixed });
        console.log(`  Raw fix applied, POST status: ${pr.s}`);
      } else {
        console.log("  ⚠ Không tìm thấy H1 nào để fix — cần kiểm tra thủ công");
      }
      continue;
    }

    const pr = await wpReq("POST", `/wp-json/wp/v2/posts/${post.id}`, { content: fixed });
    console.log(`  POST status: ${pr.s}`);
    if (pr.s !== 200) {
      console.log("  ERROR:", JSON.stringify(pr.d).slice(0, 200));
      continue;
    }

    // Verify
    const vr = await wpReq("GET", `/wp-json/wp/v2/posts/${post.id}?context=edit&_fields=content`);
    const verifyRaw = vr.d?.content?.raw ?? "";
    const h1sAfter = [...verifyRaw.matchAll(/<h1[\s>]/gi)].length;
    console.log(`  Verify — <h1> tags after: ${h1sAfter}`);
    console.log(h1sAfter <= 1 ? "  ✓ FIXED" : "  ⚠ Still has multiple H1");
  } catch (e) {
    console.error(`  ERROR: ${e.message}`);
  }
}

console.log("\nDone.");
