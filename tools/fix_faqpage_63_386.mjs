/**
 * Inject FAQPage JSON-LD vào page 63 (lien-he) và 386 (nguyen-nhan-cong-tac-thuong-xuyen-ha-long).
 * Dùng Q&A đã có trong content của từng trang.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
let SID = null;

function mcpReq(body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/mcp/wp-mcp-ultimate", method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth,
        "Content-Type": "application/json", "Content-Length": b.length,
        ...(SID ? { "Mcp-Session-Id": SID } : {}),
      },
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

function ability(name, params) {
  return mcpReq({ jsonrpc: "2.0", id: Date.now(), method: "tools/call",
    params: { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters: params } } });
}

// FAQPage JSON-LD cho từng trang
const FAQPAGES = {
  63: `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Có cần gửi ảnh trước khi gọi không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nên gửi nếu có. Ảnh nắp bể, hố ga, vị trí xe đỗ hoặc khu vực bị trào giúp thợ ước lượng phương án nhanh hơn, tránh phát sinh không cần thiết khi đến nơi."
      }
    },
    {
      "@type": "Question",
      "name": "Có báo giá qua điện thoại được không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Có thể báo khoảng giá nếu thông tin rõ. Giá cuối cùng nên chốt sau khi kiểm tra thực tế, nhất là với bể phốt đầy, ngõ nhỏ hoặc tắc sâu."
      }
    },
    {
      "@type": "Question",
      "name": "Ca gấp ban đêm nên liên hệ số nào?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Gọi trực tiếp 0963.953.533 hoặc 0931.156.756. Nếu không nghe máy ngay, gửi thêm tin nhắn Zalo kèm địa chỉ và tình trạng để kỹ thuật nắm được nhanh nhất."
      }
    },
    {
      "@type": "Question",
      "name": "Liên hệ xong bao lâu thì có thợ đến?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Khu vực trung tâm Hạ Long, Cẩm Phả, Uông Bí có thể điều thợ đến trong 15–30 phút tùy thời điểm. Khu vực huyện xa hơn được báo thời gian cụ thể khi đặt ca."
      }
    }
  ]
}
</script>`,

  386: `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Cống tắc thường xuyên ở Hạ Long gọi thì bao lâu có thợ đến?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Khu vực trung tâm Hạ Long và các điểm gần đội kỹ thuật thường điều thợ nhanh, tùy mật độ ca đang xử lý. Khi gọi 0963.953.533 / 0931.156.756, khách được báo thời gian dự kiến trước khi chờ."
      }
    },
    {
      "@type": "Question",
      "name": "Thông tắc cống Hạ Long có cần đục phá không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Phần lớn ca không cần đục phá nếu tiếp cận được qua điểm kỹ thuật sẵn có. Chỉ khi có lỗi kết cấu hoặc vị trí bị che kín mới cần bàn phương án tháo lắp cụ thể."
      }
    },
    {
      "@type": "Question",
      "name": "Chi phí thông tắc cống tại Hạ Long tính thế nào?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Giá phụ thuộc nguyên nhân tắc, độ sâu, độ khó tiếp cận, thiết bị cần dùng và thời điểm xử lý. Khách được báo giá trước khi làm để tránh phát sinh không rõ ràng."
      }
    },
    {
      "@type": "Question",
      "name": "Có thể tự xử lý cống tắc thường xuyên không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Với tắc nhẹ tại điểm lọc hố ga, có thể tự vệ sinh định kỳ. Nhưng khi tắc lặp lại nhiều lần hoặc đường ống chính bị nghẽn sâu, cần thiết bị lò xo cơ hoặc xe bơm áp lực để xử lý triệt để, tránh làm hỏng ống."
      }
    }
  ]
}
</script>`,
};

// Initialize MCP session
await mcpReq({ jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "faqfix-batch", version: "1" } } });

const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);
const results = [];

for (const [pageIdStr, faqJsonLd] of Object.entries(FAQPAGES)) {
  const pageId = parseInt(pageIdStr);
  console.log(`\n=== Fix page ${pageId} ===`);

  // Fetch current content
  const fetchR = await ability("content/get-page", { id: pageId });
  const fetchTxt = fetchR.d?.result?.content?.[0]?.text ?? "{}";
  let pageData;
  try { pageData = JSON.parse(fetchTxt); } catch { console.error("Parse fail"); continue; }
  let content = pageData?.data?.content ?? "";
  console.log(`Content: ${content.length} chars`);

  // Check if FAQPage already exists
  const hasFAQ = content.includes('"@type": "FAQPage"') || content.includes('"@type":"FAQPage"');
  if (hasFAQ) {
    console.log("✓ FAQPage đã có — skip");
    results.push({ id: pageId, status: "skip", note: "already has FAQPage" });
    continue;
  }

  // Inject before author byline if present, else append
  const bylineMarker = '<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao';
  let patched;
  if (content.includes(bylineMarker)) {
    patched = content.replace(bylineMarker, faqJsonLd + "\n\n" + bylineMarker);
    console.log("Injected before author byline");
  } else {
    patched = content + "\n" + faqJsonLd;
    console.log("Appended at end (no byline marker found)");
  }

  // Update page
  const updateR = await ability("content/update-page", { id: pageId, content: patched });
  const updateTxt = updateR.d?.result?.content?.[0]?.text ?? JSON.stringify(updateR.d).slice(0, 300);
  const ok = updateTxt.includes("successfully") || updateTxt.includes("success");
  console.log(ok ? "✓ Updated" : "✗ " + updateTxt.slice(0, 150));
  results.push({ id: pageId, status: ok ? "done" : "fail" });
}

// Verify live
console.log("\n=== Verify live ===");
const SLUGS = { 63: "/lien-he/", 386: "/nguyen-nhan-cong-tac-thuong-xuyen-ha-long/" };
await new Promise(r => setTimeout(r, 2000));

for (const [id, slug] of Object.entries(SLUGS)) {
  await new Promise((res, rej) => {
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: slug, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "check/1" }, rejectUnauthorized: false };
    const r = https.request(opts, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => {
        const hasFAQ = d.includes('"@type": "FAQPage"') || d.includes('"@type":"FAQPage"');
        console.log(`Page ${id} ${slug}: FAQPage=${hasFAQ ? "✓ YES" : "✗ MISSING"}`);
        res();
      });
    });
    r.on("error", rej); r.setTimeout(15000, () => r.destroy(new Error("t"))); r.end();
  });
}

// Log CSV
const okList = results.filter(r => r.status === "done").map(r => r.id).join("+");
const failList = results.filter(r => r.status === "fail").map(r => r.id).join("+");
const allOk = failList.length === 0;

appendFileSync(CSV_PATH,
  `\n${TODAY},${TIME},FIX-FAQPAGE-63-386-${TODAY},seo_fix,FAQPage JSON-LD batch: lien-he + nguyen-nhan-cong-tac-thuong-xuyen-ha-long,https://thongtaccongquangninh.com/lien-he/|https://thongtaccongquangninh.com/nguyen-nhan-cong-tac-thuong-xuyen-ha-long/,,${allOk ? "done" : "partial"},medium,,,,,FAQPage JSON-LD inject page 63+386; ok=${okList||"none"} fail=${failList||"none"},tools/fix_faqpage_63_386.mjs,,Verify via Rich Results Test [VERIFY-LIVE],,,,,,`,
  "utf8"
);
console.log("\n✓ CSV logged.");
console.log(`Kết quả: ${JSON.stringify(results)}`);
