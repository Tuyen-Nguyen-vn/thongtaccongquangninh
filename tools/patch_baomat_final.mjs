/**
 * Patch cuối cho /chinh-sach-bao-mat/ (id=282): thêm ~250 từ để vượt 2000.
 * Thêm vào cuối section 12 (trước byline), bổ sung cam kết cụ thể và khu vực.
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 282;

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
let SID = null;
function req(auth, body) {
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
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("t")));
    r.write(b); r.end();
  });
}
function ability(auth, name, params) {
  return req(auth, { jsonrpc: "2.0", id: Date.now(), method: "tools/call",
    params: { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters: params } } });
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await req(auth, { jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "patch-baomat-final", version: "1" } } });

// Tìm đoạn kết section 12 và thêm vào sau
const FIND = "Trong trường hợp không thể giải quyết, tranh chấp sẽ được đưa ra tòa án có thẩm quyền tại tỉnh Quảng Ninh theo quy định pháp luật Việt Nam.</p>";
const APPEND = `

<h2>13. Cam Kết Với Từng Khu Vực Tại Quảng Ninh</h2>
<p>Môi Trường Đô Thị Số 1 Quảng Ninh hiện phục vụ hút bể phốt, thông tắc cống và nạo vét hố ga tại toàn bộ các địa bàn trọng yếu của tỉnh: <strong>Hạ Long</strong> (Bãi Cháy, Hà Khánh, Hà Lầm, Hà Phong, Hà Tu, Cao Xanh, Giếng Đáy, Đại Yên, Tuần Châu, Hùng Thắng), <strong>Cẩm Phả</strong>, <strong>Uông Bí</strong>, <strong>Móng Cái</strong>, <strong>Quảng Yên</strong>, <strong>Đông Triều</strong>, <strong>Vân Đồn</strong> và <strong>Tiên Yên</strong>.</p>
<p>Tại mỗi khu vực, chúng tôi cam kết bảo mật thông tin khách hàng theo cùng một tiêu chuẩn thống nhất — từ tên, địa chỉ, số điện thoại đến lịch sử dịch vụ. Không có sự phân biệt địa bàn trong việc bảo vệ dữ liệu. Đội kỹ thuật tại mỗi khu vực chỉ được phép truy cập thông tin của ca dịch vụ họ đang phụ trách, không có quyền xem thông tin của khách ở khu vực khác hay của ca khác.</p>
<p>Nếu bạn có bất kỳ câu hỏi nào liên quan đến bảo mật thông tin hoặc muốn kiểm tra dữ liệu của mình đang được lưu trữ như thế nào, hãy gọi hotline <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong> — đội ngũ hỗ trợ sẵn sàng giải đáp 24/7, kể cả ngày lễ và cuối tuần.</p>`;

const REPLACE = FIND + APPEND;

console.log("Patching section 13...");
const r1 = await ability(auth, "content/patch-page", { id: PAGE_ID, find: FIND, replace: REPLACE });
const t1 = r1.d?.result?.content?.[0]?.text ?? "";
console.log(t1.includes("success") ? "✓ patched" : "✗ " + t1.slice(0, 120));

// Verify
const fetchR = await ability(auth, "content/get-page", { id: PAGE_ID });
const fetchTxt = fetchR.d?.result?.content?.[0]?.text ?? "{}";
const pageData = JSON.parse(fetchTxt);
const content = pageData?.data?.content ?? "";
const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const words = plain.split(/\s+/).filter(w => w.length > 1).length;
const imgs = (content.match(/<img /gi) ?? []).length;
console.log(`\nFinal: ${words} từ | ${imgs} ảnh`);
