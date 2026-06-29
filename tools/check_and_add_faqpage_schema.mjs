/**
 * Kiểm tra page 64 có FAQPage JSON-LD hoặc Yoast FAQ block không.
 * Nếu chưa có → thêm JSON-LD trước author byline.
 * Đồng thời kiểm tra keyword density "chính sách bảo hành".
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const PAGE_ID = 64;

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
let SID = null;
function mcpReq(auth, body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/mcp/wp-mcp-ultimate", method: "POST",
      headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json",
        "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}) },
      rejectUnauthorized: false,
    };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => {
        if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"];
        try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); }
        catch { resolve({ s: resp.statusCode, d }); }
      });
    });
    r.on("error", reject); r.setTimeout(60000, () => r.destroy(new Error("timeout")));
    r.write(b); r.end();
  });
}
function ability(auth, name, params) {
  return mcpReq(auth, { jsonrpc: "2.0", id: Date.now(), method: "tools/call",
    params: { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters: params } } });
}

const FAQ_JSON_LD = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Gọi bảo hành dịch vụ bao lâu thì có thợ đến?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Khu vực trung tâm Quảng Ninh và các điểm gần đội kỹ thuật thường có thể điều thợ nhanh, tùy thời điểm và mật độ ca đang xử lý. Khi gọi 0963.953.533 / 0931.156.756, khách được báo thời gian dự kiến trước khi chờ."
      }
    },
    {
      "@type": "Question",
      "name": "Chính sách bảo hành có cần đục phá không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Phần lớn ca dịch vụ không cần đục phá nếu có thể tiếp cận qua điểm kỹ thuật sẵn có. Chỉ khi có lỗi kết cấu hoặc vị trí bị che kín mới cần bàn phương án tháo lắp."
      }
    },
    {
      "@type": "Question",
      "name": "Giá bảo hành dịch vụ tính thế nào?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Giá phụ thuộc nguyên nhân, vị trí, độ khó, thiết bị cần dùng và thời điểm xử lý. Khách được báo giá trước khi làm để tránh phát sinh không rõ ràng."
      }
    },
    {
      "@type": "Question",
      "name": "Gọi ngoài giờ sinh hoạt có được xử lý không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Có. Hotline 0963.953.533 / 0931.156.756 tiếp nhận 05:00-22:00 hằng ngày. Kỹ thuật sẽ báo thời gian đến và chi phí nếu có trước khi làm."
      }
    }
  ]
}
</script>`;

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME = new Date().toTimeString().slice(0, 5);

  await mcpReq(auth, { jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "faqfix", version: "1" } } });

  // 1. Fetch content
  const fetchR = await ability(auth, "content/get-page", { id: PAGE_ID });
  const fetchTxt = fetchR.d?.result?.content?.[0]?.text ?? "{}";
  let pageData; try { pageData = JSON.parse(fetchTxt); } catch { console.error("Parse fail"); process.exit(1); }
  let content = pageData?.data?.content ?? "";
  console.log(`Content: ${content.length} chars`);

  // 2. Check for actual FAQPage JSON-LD or Yoast FAQ block
  const hasJsonLdFaq = content.includes('"@type": "FAQPage"') || content.includes('"@type":"FAQPage"');
  const hasYoastFaq  = content.includes('wp:yoast/faq-block');
  const hasRankFaq   = content.includes('wp:rank-math/faq-block');
  console.log(`FAQPage JSON-LD: ${hasJsonLdFaq ? "✓ YES" : "✗ NO"}`);
  console.log(`Yoast FAQ block: ${hasYoastFaq ? "✓ YES" : "✗ NO"}`);
  console.log(`RankMath FAQ block: ${hasRankFaq ? "✓ YES" : "✗ NO"}`);

  // 3. Check keyword density "chính sách bảo hành"
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = plain.split(/\s+/).filter(w => w.length > 1).length;
  const KW = "chính sách bảo hành";
  const kwCount = (plain.match(new RegExp(KW, "gi")) ?? []).length;
  // Density theo cách seo_score.py: (kwCount * kwWords) / totalWords
  const kwWords = KW.split(" ").length; // 3
  const density = ((kwCount * kwWords) / words * 100).toFixed(2);
  console.log(`\nKeyword "${KW}": ${kwCount} lần × ${kwWords} words / ${words} total = ${density}%`);

  const needFaq = !hasJsonLdFaq && !hasYoastFaq && !hasRankFaq;
  const needKwFix = parseFloat(density) > 3.0;
  console.log(`\nCần thêm FAQPage JSON-LD: ${needFaq ? "YES" : "NO (đã có)"}`);
  console.log(`Cần fix keyword density: ${needKwFix ? `YES (${density}%)` : `NO (${density}% OK)`}`);

  if (!needFaq && !needKwFix) {
    console.log("\n✓ Trang đã đạt chuẩn. Không cần sửa.");
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},CHECK-CBHKW-${TODAY},seo_audit,/chinh-sach-bao-hanh/ verified: FAQPage+KW OK,https://thongtaccongquangninh.com/chinh-sach-bao-hanh/,,done,medium,,,,,KW density=${density}%; FAQPage already OK,tools/check_and_add_faqpage_schema.mjs,,No action needed,,,,,,`,
      "utf8"
    );
    return;
  }

  let patched = content;

  // Fix keyword density: thay các lần thừa
  if (needKwFix) {
    console.log("\nFix keyword density...");
    // Thay thế các lần không ở vị trí quan trọng
    const EXCESS_REPLACEMENTS = [
      ["Dịch vụ <strong>chính sách bảo hành<\/strong> tập trung", "Chúng tôi tập trung"],
      ["hỗ trợ <strong>chính sách bảo hành<\/strong> khi gặp các dấu hiệu", "liên hệ hỗ trợ khi gặp các dấu hiệu"],
      ["đội <strong>chính sách bảo hành<\/strong> mang đúng thiết bị ngay từ đầu.", "đội kỹ thuật mang đúng thiết bị ngay từ đầu."],
      ["giúp <strong>chính sách bảo hành<\/strong> xử lý nhanh", "giúp xử lý nhanh"],
      ["Khách gọi <strong>chính sách bảo hành<\/strong> thường đang cần", "Khách thường đang cần"],
      ["Cam kết đầu tiên của <strong>chính sách bảo hành<\/strong> là", "Cam kết đầu tiên là"],
      ["đội <strong>chính sách bảo hành<\/strong> ưu tiên thiết bị gọn", "đội kỹ thuật ưu tiên thiết bị gọn"],
      ["Chi phí <strong>chính sách bảo hành<\/strong> phụ thuộc", "Chi phí phụ thuộc"],
      ["Quy trình <strong>chính sách bảo hành<\/strong> được làm rõ", "Quy trình xử lý được làm rõ"],
      ["Đội <strong>chính sách bảo hành<\/strong> thao tác bằng thiết bị phù hợp", "Đội kỹ thuật thao tác bằng thiết bị phù hợp"],
      ["đội <strong>chính sách bảo hành<\/strong> kiểm tra điểm phát sinh", "đội kỹ thuật kiểm tra điểm phát sinh"],
      ["Phần <strong>chính sách bảo hành<\/strong> giúp khách", "Điều khoản này giúp khách"],
      ["Phần lớn ca <strong>chính sách bảo hành<\/strong> không cần", "Phần lớn ca dịch vụ không cần"],
      ["<strong>chính sách bảo hành<\/strong> được ưu tiên xử lý theo vị trí gần nhất.", "ca của bạn được ưu tiên xử lý theo vị trí gần nhất."],
    ];
    let repCount = 0;
    for (const [find, replace] of EXCESS_REPLACEMENTS) {
      if (patched.includes(find)) { patched = patched.replace(find, replace); repCount++; }
    }
    const plainNew = patched.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const kwNew = (plainNew.match(new RegExp(KW, "gi")) ?? []).length;
    const wordsNew = plainNew.split(/\s+/).filter(w => w.length > 1).length;
    const densityNew = ((kwNew * kwWords) / wordsNew * 100).toFixed(2);
    console.log(`  ${repCount} thay thế → KW: ${kwNew} lần, density: ${densityNew}%`);
  }

  // Add FAQPage JSON-LD
  if (needFaq) {
    console.log("\nThêm FAQPage JSON-LD...");
    const bylineMarker = '<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao';
    if (patched.includes(bylineMarker)) {
      patched = patched.replace(bylineMarker, FAQ_JSON_LD + "\n\n" + bylineMarker);
      console.log("  ✓ Inserted before author byline");
    } else {
      patched += "\n" + FAQ_JSON_LD;
      console.log("  ✓ Appended at end");
    }
  }

  // Update page
  console.log("\n=== Update page ===");
  const updateR = await ability(auth, "content/update-page", { id: PAGE_ID, content: patched });
  const updateTxt = updateR.d?.result?.content?.[0]?.text ?? JSON.stringify(updateR.d).slice(0, 300);
  console.log("Result:", updateTxt.slice(0, 200));
  const ok = updateTxt.includes("successfully") || updateTxt.includes("success");

  // Re-count after
  const plainFinal = patched.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const kwFinal = (plainFinal.match(new RegExp(KW, "gi")) ?? []).length;
  const wordsFinal = plainFinal.split(/\s+/).filter(w => w.length > 1).length;
  const densityFinal = ((kwFinal * kwWords) / wordsFinal * 100).toFixed(2);
  console.log(`\nFinal: KW="${KW}" ${kwFinal}×${kwWords}/${wordsFinal} = ${densityFinal}%`);
  console.log(`FAQPage JSON-LD: ${patched.includes('"@type": "FAQPage"') ? "✓ YES" : "✗ NO"}`);

  appendFileSync(CSV_PATH,
    `\n${TODAY},${TIME},FIX-CBHFAQ-${TODAY},seo_fix,/chinh-sach-bao-hanh/ FAQPage JSON-LD added+KW fix,https://thongtaccongquangninh.com/chinh-sach-bao-hanh/,,${ok ? "done" : "fail"},high,,,,,KW ${density}%→${densityFinal}%; FAQPage schema injected,tools/check_and_add_faqpage_schema.mjs,,Verify live via Rich Results Test [VERIFY-LIVE],,,,,,`,
    "utf8"
  );
  console.log(`\n✓ CSV logged.`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
