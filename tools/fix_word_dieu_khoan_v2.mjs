/**
 * Thêm ~80 từ vào trang dieu-khoan-dich-vu (id=2445) để đạt 2000+ words
 * Dùng WP REST API PATCH
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

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

function restReq(method, path, body) {
  return new Promise((res, rej) => {
    const b = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const r = https.request(
      { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method,
        headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "WP-Agent/1.0", ...(b ? { "Content-Type": "application/json", "Content-Length": b.length } : {}) },
        rejectUnauthorized: false },
      resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { try { res({ s: resp.statusCode, d: JSON.parse(d) }); } catch { res({ s: resp.statusCode, d }); } }); }
    );
    r.on("error", rej); r.setTimeout(30000, () => r.destroy()); if (b) r.write(b); r.end();
  });
}

const PAGE_ID = 2445;

// Fetch current content
const current = await restReq("GET", `/wp-json/wp/v2/pages/${PAGE_ID}?context=edit`, null);
if (current.s !== 200) { console.error("Fetch failed:", current.s, JSON.stringify(current.d).slice(0,200)); process.exit(1); }

let html = current.d.content?.raw ?? current.d.content?.rendered ?? "";
console.log("Current content length:", html.length, "chars");

// The extra section to add (~85 words) — insert before closing </div> of main content or before last H2
// Using a simple approach: append before the JSON-LD script if present, else before last </div>
const extraSection = `
<h2>Cam Kết Bảo Mật và Quyền Riêng Tư</h2>
<p>Mọi thông tin cá nhân, địa chỉ, số điện thoại và tình trạng bể phốt, cống thoát mà khách hàng cung cấp khi đặt lịch hút bể phốt hoặc thông tắc cống tại Quảng Ninh đều được chúng tôi bảo mật tuyệt đối. Thông tin chỉ được sử dụng để thực hiện dịch vụ và không chia sẻ cho bên thứ ba nếu không có sự đồng ý bằng văn bản. Khách hàng có quyền yêu cầu xóa dữ liệu cá nhân bất kỳ lúc nào bằng cách liên hệ hotline 0963.953.533. Chúng tôi cam kết tuân thủ các quy định về bảo vệ dữ liệu cá nhân theo pháp luật Việt Nam hiện hành.</p>
`;

// Insert before first <script type="application/ld+json"> or at end
const insertBefore = '<script type="application/ld+json">';
if (html.includes(insertBefore)) {
  const idx = html.indexOf(insertBefore);
  html = html.slice(0, idx) + extraSection + "\n" + html.slice(idx);
} else {
  html = html + extraSection;
}

// Update
const update = await restReq("POST", `/wp-json/wp/v2/pages/${PAGE_ID}`, {
  content: html,
  status: "publish",
});
if (update.s === 200) {
  console.log("✓ Updated successfully");
  // Quick word count estimate
  const stripped = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = stripped.split(" ").filter(w => w.trim().length > 0);
  console.log("Estimated word count:", words.length, "(includes HTML text)");
} else {
  console.error("Update failed:", update.s, JSON.stringify(update.d).slice(0,300));
}
