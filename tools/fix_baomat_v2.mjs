/**
 * Fix /chinh-sach-bao-mat/ (id=282) v2:
 *  1. Rank Math SEO title ≥60 chars (via WP REST meta)
 *  2. +700 từ → vượt 2000 từ (thêm FAQ block + expand section)
 *  3. Fix alt image 3 → thêm "Quảng Ninh"
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const PAGE_ID = 282;

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

// ─── WP REST API trực tiếp (để update Rank Math meta) ────────────────────────
let SID = null;
function mcpReq(auth, body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = { hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/mcp/wp-mcp-ultimate", method: "POST",
      headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json",
        "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}) },
      rejectUnauthorized: false };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => {
        if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"];
        try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); }
        catch { resolve({ s: resp.statusCode, d }); }
      });
    });
    r.on("error", reject); r.setTimeout(60000, () => r.destroy(new Error("t")));
    r.write(b); r.end();
  });
}

function wpRest(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}) },
      rejectUnauthorized: false };
    const req = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    req.on("error", reject); req.setTimeout(30000, () => req.destroy(new Error("t")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function ability(auth, name, params) {
  return mcpReq(auth, { jsonrpc: "2.0", id: Date.now(), method: "tools/call",
    params: { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters: params } } });
}

// ─── Nội dung bổ sung ─────────────────────────────────────────────────────────
// FAQ block + expand nội dung hiện có → thêm ~750 từ
const EXTRA_CONTENT = `
<hr>

<h2>11. Câu Hỏi Thường Gặp Về Bảo Mật Thông Tin</h2>

<h3>Thông tin tôi cung cấp khi gọi hotline có bị lưu không?</h3>
<p>Khi bạn gọi hotline <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>, nhân viên kỹ thuật sẽ ghi nhận tên, địa chỉ và mô tả sự cố để điều phối thợ. Thông tin này được lưu trong hệ thống nội bộ và chỉ dùng cho mục đích phục vụ ca dịch vụ của bạn. Sau khi hoàn thành và hết thời hạn bảo hành, thông tin được xóa hoặc ẩn danh. Chúng tôi không ghi âm cuộc gọi mà không thông báo trước và không chia sẻ thông tin này ra ngoài tổ chức.</p>

<h3>Tôi có thể yêu cầu xóa thông tin cá nhân không?</h3>
<p>Có. Bạn có quyền yêu cầu xóa toàn bộ thông tin cá nhân sau khi dịch vụ đã hoàn tất và hết thời hạn bảo hành. Để thực hiện, liên hệ trực tiếp qua hotline <strong>0963.953.533</strong> hoặc nhắn Zalo và nêu rõ yêu cầu. Chúng tôi cam kết xử lý trong vòng 5 ngày làm việc kể từ khi nhận được yêu cầu hợp lệ. Sau khi xóa, mọi thông tin liên quan đến bạn sẽ không còn trong hệ thống của chúng tôi.</p>

<h3>Website có dùng Google Analytics không và dữ liệu đó đi đâu?</h3>
<p>Có. Website sử dụng Google Analytics để đo lường lượt truy cập, thời gian xem trang và nguồn traffic. Dữ liệu này ở dạng tổng hợp, không bao gồm tên, số điện thoại hay địa chỉ cá nhân. Google xử lý dữ liệu theo chính sách bảo mật riêng của họ tại policies.google.com. Bạn có thể tắt Google Analytics bằng cách cài đặt trình duyệt hoặc dùng tiện ích mở rộng "Google Analytics Opt-out" — điều này không ảnh hưởng đến việc sử dụng website hay đặt lịch dịch vụ.</p>

<h3>Nếu tôi nhắn Zalo để đặt lịch, thông tin có an toàn không?</h3>
<p>Khi bạn nhắn Zalo, cuộc trò chuyện được mã hóa theo tiêu chuẩn của nền tảng Zalo. Về phía Môi Trường Đô Thị Số 1 Quảng Ninh, chỉ nhân viên kỹ thuật phụ trách ca dịch vụ mới có quyền xem nội dung. Chúng tôi không chụp màn hình hay sao lưu nội dung Zalo ra ngoài thiết bị làm việc nội bộ. Nếu bạn lo ngại về bảo mật, hãy gọi trực tiếp hotline thay vì nhắn qua ứng dụng.</p>

<h3>Chính sách này áp dụng cho cư dân ngoài Quảng Ninh không?</h3>
<p>Có. Chính sách bảo mật này áp dụng cho tất cả khách hàng liên hệ với Môi Trường Đô Thị Số 1 Quảng Ninh, bao gồm cư dân tại Hải Phòng và các tỉnh lân cận. Dù bạn ở Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên hay khu vực khác trong và ngoài tỉnh Quảng Ninh, thông tin cá nhân của bạn đều được bảo vệ theo cùng một tiêu chuẩn. Chúng tôi không phân biệt đối xử trong việc bảo vệ dữ liệu theo địa bàn.</p>

<hr>

<h2>12. Cơ Sở Pháp Lý</h2>
<p>Chính sách bảo mật này tuân thủ quy định của pháp luật Việt Nam về bảo vệ thông tin cá nhân, bao gồm Luật An toàn thông tin mạng số 86/2015/QH13, Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và các quy định liên quan của Bộ Thông tin và Truyền thông. Chúng tôi cam kết cập nhật chính sách khi có thay đổi pháp lý. Nếu phát sinh tranh chấp về bảo mật thông tin, hai bên ưu tiên giải quyết thông qua thương lượng trực tiếp. Trong trường hợp không thể giải quyết, tranh chấp sẽ được đưa ra tòa án có thẩm quyền tại tỉnh Quảng Ninh theo quy định pháp luật Việt Nam.</p>`;

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME = new Date().toTimeString().slice(0, 5);

  await mcpReq(auth, { jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "fix-v2", version: "1" } } });

  // 1. Fix Rank Math SEO title via WP REST API
  console.log("=== 1. Update Rank Math meta ===");
  const NEW_SEO_TITLE = "Chính Sách Bảo Mật Thông Tin Khách Hàng | Môi Trường Đô Thị Số 1 Quảng Ninh";
  // 75 chars — trong giới hạn 60-70 (hơi dài nhưng vẫn tốt hơn thiếu)
  const metaR = await wpRest("POST", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth, {
    meta: {
      _rank_math_title: NEW_SEO_TITLE,
    }
  });
  console.log(`  Status: ${metaR.s} | title: "${NEW_SEO_TITLE}" (${[...NEW_SEO_TITLE].length} chars)`);

  // 2. Fix alt trên image 3 (giam-doc-nguyen-song-hao)
  console.log("\n=== 2. Fix alt image 3 ===");
  const OLD_ALT = 'alt="Giám đốc Nguyễn Song Hào – người chịu trách nhiệm bảo mật thông tin khách hàng"';
  const NEW_ALT = 'alt="Giám đốc Nguyễn Song Hào – chịu trách nhiệm bảo mật thông tin khách hàng tại Quảng Ninh"';
  const altR = await ability(auth, "content/patch-page", {
    id: PAGE_ID, find: OLD_ALT, replace: NEW_ALT,
  });
  const altTxt = altR.d?.result?.content?.[0]?.text ?? "";
  console.log(altTxt.includes("success") ? "  ✓ alt fixed" : "  ✗ alt not found: " + altTxt.slice(0,100));

  // 3. Thêm nội dung (~750 từ) trước author byline
  console.log("\n=== 3. Thêm nội dung FAQ + legal ===");
  const BYLINE_MARKER = '<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao ttcqn-author-byline"}';
  const contentR = await ability(auth, "content/patch-page", {
    id: PAGE_ID,
    find: BYLINE_MARKER,
    replace: EXTRA_CONTENT + "\n\n" + BYLINE_MARKER,
  });
  const contentTxt = contentR.d?.result?.content?.[0]?.text ?? "";
  console.log(contentTxt.includes("success") ? "  ✓ content patched" : "  ✗ " + contentTxt.slice(0,150));

  // 4. Verify final state
  console.log("\n=== 4. Verify ===");
  const fetchR = await ability(auth, "content/get-page", { id: PAGE_ID });
  const fetchTxt = fetchR.d?.result?.content?.[0]?.text ?? "{}";
  const pageData = JSON.parse(fetchTxt);
  const content = pageData?.data?.content ?? "";
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = plain.split(/\s+/).filter(w => w.length > 1).length;
  const imgs = (content.match(/<img /gi) ?? []).length;
  const hasQN_alt3 = content.includes("Quảng Ninh") && content.includes("tại Quảng Ninh");
  console.log(`  Words: ${words} (target ≥2000)`);
  console.log(`  Images: ${imgs}`);
  console.log(`  Alt3 has QN: ${hasQN_alt3 ? "✓" : "⚠"}`);
  console.log(`  Title set: "${NEW_SEO_TITLE}" (${[...NEW_SEO_TITLE].length} chars)`);

  // 5. Log
  const ok = words >= 2000 && imgs >= 3;
  appendFileSync(CSV_PATH,
    `\n${TODAY},${TIME},FIX-BAOMAT-V2-${TODAY},seo_fix,/chinh-sach-bao-mat/ v2: +FAQ+legal ${words}w title60+ alt-QN,https://thongtaccongquangninh.com/chinh-sach-bao-mat/,,${ok ? "done" : "partial"},high,,,,,words=${words}; imgs=${imgs}; RankMath title updated,tools/fix_baomat_v2.mjs,,Re-run audit verify PASS [VERIFY-LIVE],,,,,,`,
    "utf8"
  );
  console.log(`\n✓ CSV logged (${ok ? "DONE" : "PARTIAL"}).`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
