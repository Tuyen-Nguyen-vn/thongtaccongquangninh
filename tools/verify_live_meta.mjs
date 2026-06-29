/**
 * Verify live: robots meta (noindex) + meta description trên các trang quan trọng.
 * Dùng IP bypass (DNS bị block trong môi trường này).
 *
 * Usage: node tools/verify_live_meta.mjs
 */
import https from "node:https";
import { appendFileSync } from "node:fs";

const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const CSV_PATH  = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

const CHECKS = [
  // 1. Post 2554 — phải có noindex
  { url: "/xe-hut-be-phot-quang-ninh-2026/", label: "Post 2554 noindex", expectNoindex: true },
  // 2. Landing chính — không được noindex
  { url: "/hut-be-phot-quang-ninh/",         label: "HBP landing",      expectNoindex: false },
  { url: "/thong-tac-cong-quang-ninh/",      label: "TTC landing",      expectNoindex: false },
  { url: "/thong-tac-bon-cau-quang-ninh/",   label: "BC landing",       expectNoindex: false },
  // 3. Bài mới có meta description
  { url: "/thong-tac-bon-cau-khan-cap-quang-ninh/", label: "BC khẩn cấp",    expectNoindex: false },
  { url: "/hut-be-phot-24-7-quang-ninh-2026/",      label: "HBP 24/7",       expectNoindex: false },
  { url: "/chi-phi-hut-be-phot-quang-ninh/",        label: "Chi phí HBP",    expectNoindex: false },
  // 4. Bài huyện
  { url: "/hut-be-phot-ba-che/",             label: "HBP Ba Chẽ",      expectNoindex: false },
  { url: "/hut-be-phot-co-to/",              label: "HBP Cô Tô",       expectNoindex: false },
];

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "Mozilla/5.0 (compatible; verify-bot/1.0)" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", c => { if (d.length < 30000) d += c; }); // giới hạn 30KB
      res.on("end", () => resolve({ status: res.statusCode, html: d }));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function extractRobotsMeta(html) {
  const m = html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']+)["']/i)
         || html.match(/<meta\s+content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  return m ? m[1] : "(not found)";
}

function extractDescription(html) {
  const m = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']{0,200})["']/i)
         || html.match(/<meta\s+content=["']([^"']{0,200})["'][^>]*name=["']description["']/i);
  return m ? m[1].trim() : "(not found)";
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]{0,120})<\/title>/i);
  return m ? m[1].trim() : "(not found)";
}

async function main() {
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log("=== Verify Live Meta — robots + description ===\n");

  const results = [];
  let allPass = true;

  for (const c of CHECKS) {
    process.stdout.write(`${c.label.padEnd(22)} ${c.url.padEnd(50)} `);
    try {
      const { status, html } = await fetchPage(c.url);
      if (status !== 200) {
        console.log(`HTTP ${status} ✗`);
        results.push({ ...c, status, pass: false });
        allPass = false;
        continue;
      }

      const robots = extractRobotsMeta(html);
      const desc   = extractDescription(html);
      const title  = extractTitle(html);

      const hasNoindex = robots.toLowerCase().includes("noindex");
      const robotsOk = c.expectNoindex ? hasNoindex : !hasNoindex;
      const hasDesc  = desc !== "(not found)" && desc.length > 20;

      const pass = robotsOk && (c.expectNoindex || hasDesc);
      if (!pass) allPass = false;

      const robotsIcon = robotsOk ? "✓" : "✗";
      const descIcon   = hasDesc ? "✓" : "⚠";
      console.log(`${status} | robots: ${robotsIcon} [${robots}] | desc: ${descIcon} (${desc.length} chars)`);

      if (!robotsOk)  console.log(`    ⚠ robots: expected ${c.expectNoindex ? "noindex" : "index"}, got "${robots}"`);
      if (!hasDesc)   console.log(`    ⚠ desc: "${desc}"`);
      if (hasDesc && desc.length < 100) console.log(`    ⚠ desc ngắn: "${desc.slice(0,80)}"`);

      results.push({ ...c, status, robots, desc: desc.slice(0,80), pass });
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      results.push({ ...c, pass: false, error: e.message });
      allPass = false;
    }
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n=== KẾT QUẢ ===`);
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks PASS ${allPass ? "✓" : "— có vấn đề cần xem lại"}`);

  // Kiểm đặc biệt post 2554
  const r2554 = results.find(r => r.label.includes("2554"));
  if (r2554) {
    if (r2554.robots?.toLowerCase().includes("noindex"))
      console.log(`\n✓ Post 2554 xác nhận NOINDEX live — GSC sẽ chuyển Excluded trong 7 ngày kể từ 2026-06-08.`);
    else
      console.log(`\n✗ Post 2554 CHƯA có noindex live — cần kiểm lại Rank Math setting!`);
  }

  // Log vào CSV
  const status = allPass ? "done" : "partial";
  appendFileSync(CSV_PATH,
    `\n${TODAY},${TIME},VERIFY-LIVE-META-${TODAY},verify,verify live robots+description ${passed}/${results.length} pages,https://thongtaccongquangninh.com,,${status},low,,,,,Post 2554 noindex=${r2554?.robots ?? "?"}; ${passed}/${results.length} checks pass,tools/verify_live_meta.mjs,,Re-check GSC Coverage 2026-06-15,,,,,,`,
    "utf8"
  );
  console.log(`\nLogged to SEO_PROGRESS.csv`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
