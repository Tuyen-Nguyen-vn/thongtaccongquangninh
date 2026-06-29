/**
 * Fix MULTI_H1 v2: Đảo ngược lỗi v1
 * v1 đã giữ <h1>Thông Tin SEO</h1> và chuyển real title → H2
 * v2 sẽ: chuyển <h2>Hút...Quảng Ninh...</h2> → H1, xóa <h1>Thông Tin SEO</h1>
 *
 * Bài: nha-hang (id=2687) và hut-ham-cau (id=2559)
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

const POSTS = [
  { id: 2687, slug: "hut-be-phot-nha-hang-quang-ninh-2026",
    rogueH1Pattern: /Thông Tin SEO/i,
    realH2Pattern: /Hút Bể Phốt Nhà Hàng Quảng Ninh/i,
  },
  { id: 2559, slug: "hut-ham-cau-quang-ninh-2026",
    rogueH1Pattern: /Thông Tin SEO/i,
    realH2Pattern: /Hút Hầm Cầu Quảng Ninh/i,
  },
];

for (const p of POSTS) {
  console.log(`\n=== ${p.slug} (id=${p.id}) ===`);

  // Get current content
  const r = await wpReq("GET", `/wp-json/wp/v2/posts/${p.id}?context=edit&_fields=content`);
  if (r.s !== 200) { console.log(`  GET error: ${r.s}`); continue; }
  let raw = r.d.content.raw;

  // Show current H1/H2
  const h1s = [...raw.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g,'').slice(0,80));
  const h2s = [...raw.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g,'').slice(0,80));
  console.log(`  Current H1s (${h1s.length}):`, h1s);
  console.log(`  First 5 H2s:`, h2s.slice(0,5));

  let fixed = raw;

  // Step 1: Xóa block "Thông Tin SEO" (có thể là <h1> hoặc <h2> tùy lần fix)
  // Tìm chính xác block chứa "Thông Tin SEO" dưới mọi dạng heading
  fixed = fixed.replace(/<h[12]([^>]*)>\s*Thông Tin SEO\s*<\/h[12]>/gi, (m) => {
    console.log(`  Removed rogue heading: "${m.slice(0,60)}"`);
    // Xóa cả dòng trống sau nó (nếu có)
    return '';
  });

  // Step 2: Chuyển H2 page title thật → H1 (nếu đã bị chuyển thành H2 bởi v1)
  // Chỉ làm nếu hiện tại H1 = 0 và H2 chứa real title
  const h1Count = [...fixed.matchAll(/<h1[\s>]/gi)].length;
  const hasRealH2 = p.realH2Pattern.test(fixed);
  console.log(`  After rogue removal: H1 count = ${h1Count}, real title in H2 = ${hasRealH2}`);

  if (h1Count === 0 && hasRealH2) {
    // Chuyển H2 real title → H1 (chỉ lần đầu xuất hiện)
    let converted = false;
    fixed = fixed.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (m, attrs, content) => {
      if (!converted && p.realH2Pattern.test(content)) {
        converted = true;
        console.log(`  Converted H2→H1: "${content.replace(/<[^>]+>/g,'').slice(0,80)}"`);
        return `<h1${attrs}>${content}</h1>`;
      }
      return m;
    });
  }

  // Final check
  const finalH1s = [...fixed.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g,'').slice(0,80));
  console.log(`  Final H1s (${finalH1s.length}):`, finalH1s);

  if (finalH1s.length === 1) {
    const pr = await wpReq("POST", `/wp-json/wp/v2/posts/${p.id}`, { content: fixed });
    console.log(`  POST status: ${pr.s}`);
    if (pr.s === 200) {
      // Verify
      const vr = await wpReq("GET", `/wp-json/wp/v2/posts/${p.id}?context=edit&_fields=content`);
      const vRaw = vr.d?.content?.raw ?? "";
      const vH1 = [...vRaw.matchAll(/<h1[^>]*>[\s\S]*?<\/h1>/gi)].length;
      console.log(`  Verify H1 count: ${vH1} → ${vH1 === 1 ? '✓ FIXED' : '⚠ still wrong'}`);
    } else {
      console.log("  ERROR:", JSON.stringify(pr.d).slice(0, 200));
    }
  } else if (finalH1s.length === 0) {
    console.log("  ⚠ No H1 left — không push, cần kiểm tra thủ công");
  } else {
    console.log("  ⚠ Still multiple H1 — không push");
  }
}

console.log("\nDone.");
