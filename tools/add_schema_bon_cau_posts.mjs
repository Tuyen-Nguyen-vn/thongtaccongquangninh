/**
 * Thêm Service + LocalBusiness JSON-LD schema vào post 2407 và 2412.
 * Chạy 1 lần, idempotent: kiểm tra nếu đã có schema thì bỏ qua.
 */
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

function readEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = readEnv(ENV_PATH);
const WP_BASE_URL = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const endpoint = `${WP_BASE_URL}/wp-json/mcp/wp-mcp-ultimate`;

let SESSION_ID = null;

async function rpc(method, params, id) {
  const headers = { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" };
  if (SESSION_ID) headers["Mcp-Session-Id"] = SESSION_ID;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  if (!SESSION_ID) SESSION_ID = res.headers.get("mcp-session-id");
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function ability(name, parameters) {
  return rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters } }, Date.now());
}

async function getPostContent(id) {
  const res = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/posts/${id}?_fields=id,content`, { headers: { Authorization: auth } });
  const d = await res.json();
  return d.content?.raw || d.content?.rendered || "";
}

function buildSchema(postId, title, url, description, serviceType) {
  return `
<!-- Schema: Service + LocalBusiness -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "${title}",
  "description": "${description}",
  "serviceType": "${serviceType}",
  "areaServed": {
    "@type": "State",
    "name": "Quảng Ninh"
  },
  "url": "${url}",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
    "url": "https://thongtaccongquangninh.com",
    "telephone": "+84963953533",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+84963953533",
        "contactType": "customer service",
        "availableLanguage": "Vietnamese",
        "contactOption": "TollFree",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      },
      {
        "@type": "ContactPoint",
        "telephone": "+84931156756",
        "contactType": "customer service",
        "availableLanguage": "Vietnamese"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hạ Long",
      "addressRegion": "Quảng Ninh",
      "addressCountry": "VN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "20.9509",
      "longitude": "107.0845"
    },
    "openingHours": "Mo-Su 05:00-22:00",
    "priceRange": "₫₫",
    "sameAs": [
      "https://thongtaccongquangninh.com"
    ]
  }
}
</script>`;
}

const POSTS = [
  {
    id: 2407,
    title: "Thông tắc bồn cầu nhà dân Quảng Ninh",
    url: "https://thongtaccongquangninh.com/thong-tac-bon-cau-nha-dan-quang-ninh-2026/",
    description: "Dịch vụ thông tắc bồn cầu nhà dân tại Quảng Ninh tiếp nhận 05:00-22:00. Xử lý bằng máy lò xo, không đục phá, báo giá rõ. Hotline: 0963.953.533.",
    serviceType: "Thông tắc bồn cầu nhà dân",
  },
  {
    id: 2412,
    title: "Thông tắc bồn cầu nhà hàng Quảng Ninh",
    url: "https://thongtaccongquangninh.com/thong-tac-bon-cau-nha-hang-quang-ninh-2026/",
    description: "Dịch vụ thông tắc bồn cầu nhà hàng tại Quảng Ninh tiếp nhận 05:00-22:00. Xử lý nhanh, không đục phá, hạn chế gián đoạn giờ bán. Hotline: 0963.953.533.",
    serviceType: "Thông tắc bồn cầu nhà hàng",
  },
];

(async () => {
  // Khởi tạo session MCP
  await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "schema-bon-cau", version: "1" } }, 1);

  for (const post of POSTS) {
    console.log(`\n--- Post ${post.id}: ${post.title} ---`);

    const content = await getPostContent(post.id);
    if (content.includes("application/ld+json") && content.includes('"Service"')) {
      console.log(`  ⏭ Đã có Service schema, bỏ qua.`);
      appendLog(post.id, "skip", "schema đã tồn tại");
      continue;
    }

    const schema = buildSchema(post.id, post.title, post.url, post.description, post.serviceType);
    const newContent = content + "\n" + schema;

    const result = await ability("content/update-post", {
      id: post.id,
      content: newContent,
    });

    const ok = result?.result?.structuredContent?.success
      || JSON.stringify(result).includes('"success":true')
      || JSON.stringify(result).includes(String(post.id));

    if (ok) {
      console.log(`  ✅ Đã thêm schema thành công.`);
      appendLog(post.id, "done", "Service+LocalBusiness schema thêm thành công");
    } else {
      console.log(`  ❌ Lỗi:`, JSON.stringify(result).slice(0, 300));
      appendLog(post.id, "error", "thêm schema thất bại");
    }
  }

  console.log("\nHoàn thành.");
})().catch(e => { console.error(e.message); process.exitCode = 1; });

function appendLog(postId, status, note) {
  const date = new Date().toISOString().slice(0, 10);
  const line = `\n${date},post_${postId}_schema,add_service_localbusiness_schema,${status},"${note}",manual_verify_rankmath`;
  try { appendFileSync(CSV_PATH, line, "utf8"); } catch {}
}
