/**
 * Read-only verify for /hut-be-phot-ha-long/ after page 52 patch.
 */
import https from "node:https";

const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const URL_PATH = "/hut-be-phot-ha-long/?nowprocket=1&codex=20260624-hbp-halong-qg";
const INTERNAL_PATHS = [
  "/hut-be-phot-quang-ninh/",
  "/bang-gia-hut-be-phot-quang-ninh/",
  "/thong-tac-bon-cau-ha-long/",
  "/thong-tac-cong-ha-long/",
  "/hut-be-phot-khach-san-quang-ninh/",
  "/lien-he/",
];
const FAQS = [
  "Bao lâu nên hút bể phốt một lần tại Hạ Long?",
  "Xe hút bể phốt có vào được ngõ nhỏ, đường dốc không?",
  "Hút bể phốt Hạ Long giá bao nhiêu?",
  "Khi nào cần gọi hút bể phốt gấp?",
  "Có cần chuẩn bị gì trước khi thợ đến không?",
  "Sau khi hút bể phốt xong có cần kiểm tra lại không?",
];

function get(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path,
      method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "verify-hbp-halong-links/1.0" },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ path, status: res.statusCode, location: res.headers.location || "", data }));
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function clean(s) {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function attr(html, tagMatch) {
  return (html.match(tagMatch) || [])[1] || "";
}

const page = await get(URL_PATH);
const html = page.data;
const title = clean(attr(html, /<title[^>]*>(.*?)<\/title>/is));
const meta =
  attr(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) ||
  attr(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
const canonical = attr(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
const robots = attr(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i);
const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)].map((m) => clean(m[1]));
const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gis)].map((m) => clean(m[1]));

let faqSchemaCount = 0;
for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
  try {
    const json = JSON.parse(match[1].trim());
    const graph = Array.isArray(json["@graph"]) ? json["@graph"] : [json];
    for (const item of graph) {
      if (item["@type"] === "FAQPage") faqSchemaCount = (item.mainEntity || []).length;
    }
  } catch {
    // Ignore unrelated non-JSON-LD script content.
  }
}

console.log(`page status: ${page.status}`);
console.log(`title: ${title} (${[...title].length})`);
console.log(`meta: ${meta} (${[...meta].length})`);
console.log(`canonical: ${canonical}`);
console.log(`robots: ${robots}`);
console.log(`h1 count: ${h1s.length}`);
console.log(`h1: ${h1s[0] || ""}`);
console.log(`h2 core markers: ${[
  "Nguyên nhân bể phốt tại Hạ Long nhanh đầy hoặc trào ngược",
  "Bảng giá hút bể phốt Hạ Long phụ thuộc yếu tố nào?",
  "Quy trình 5 bước hút bể phốt tại Hạ Long",
  "Khu vực phục vụ hút bể phốt tại Hạ Long",
  "Câu hỏi thường gặp về hút bể phốt Hạ Long",
].filter((h) => h2s.includes(h)).length}/5`);
console.log(`visible FAQs: ${FAQS.filter((q) => html.includes(q)).length}/6`);
console.log(`schema FAQ entities: ${faqSchemaCount}`);
console.log(`4-col table: ${html.includes("Yếu tố khảo sát") && html.includes("Ví dụ thực tế tại Hạ Long")}`);
console.log(`byline after source: ${html.indexOf("Tác giả:") > html.lastIndexOf("Nguồn tham khảo")}`);

for (const path of INTERNAL_PATHS) {
  const result = await get(path);
  console.log(`internal ${path}: ${result.status}${result.location ? ` -> ${result.location}` : ""}`);
}
