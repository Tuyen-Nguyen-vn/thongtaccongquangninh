/**
 * Thêm ~150 từ vào /chinh-sach-bao-mat/ qua content/patch-page.
 * Insert vào cuối section 4 (bảo mật) và section 10 (liên hệ).
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
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
  params: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "patch-baomat", version: "1" } } });

// Patch 1: thêm vào sau đoạn "Tuy nhiên, không có hệ thống..."
const FIND1 = "Tuy nhiên, không có hệ thống nào đảm bảo an toàn tuyệt đối 100%. Nếu phát hiện bất thường liên quan đến thông tin của mình, vui lòng liên hệ ngay với chúng tôi qua hotline <strong>0963.953.533</strong>.";
const REPLACE1 = FIND1 + `\n<p>Trong trường hợp phát hiện sự cố rò rỉ dữ liệu, chúng tôi cam kết thông báo đến khách hàng bị ảnh hưởng trong vòng 72 giờ kể từ khi phát hiện, kèm theo hướng dẫn xử lý cụ thể. Đây là cam kết trách nhiệm của chúng tôi đối với từng khách hàng tại Quảng Ninh đã tin tưởng sử dụng dịch vụ hút bể phốt, thông tắc cống và nạo vét hố ga của Môi Trường Đô Thị Số 1.</p>`;

// Patch 2: thêm vào trước đoạn liên hệ cuối
const FIND2 = "Đội kỹ thuật sẵn sàng tiếp nhận yêu cầu bảo mật thông tin 24/7. Gọi hoặc nhắn Zalo để được xử lý trong ngày.";
const REPLACE2 = FIND2 + `\n<p>Nếu bạn lo ngại về việc dữ liệu cá nhân bị sử dụng sai mục đích hoặc muốn xác minh chính sách bảo mật trước khi đặt lịch, hãy hỏi thẳng nhân viên kỹ thuật khi gọi — chúng tôi sẵn sàng giải thích rõ ràng. Mục tiêu của chính sách này là để mỗi khách hàng tại Hạ Long, Cẩm Phả, Uông Bí và toàn tỉnh Quảng Ninh yên tâm khi chia sẻ thông tin với chúng tôi.</p>`;

console.log("Patch 1...");
const r1 = await ability(auth, "content/patch-page", { id: PAGE_ID, find: FIND1, replace: REPLACE1 });
const t1 = r1.d?.result?.content?.[0]?.text ?? "";
console.log(t1.includes("success") ? "✓" : "✗", t1.slice(0, 100));

console.log("Patch 2...");
const r2 = await ability(auth, "content/patch-page", { id: PAGE_ID, find: FIND2, replace: REPLACE2 });
const t2 = r2.d?.result?.content?.[0]?.text ?? "";
console.log(t2.includes("success") ? "✓" : "✗", t2.slice(0, 100));

// Verify word count
const fetchR = await ability(auth, "content/get-page", { id: PAGE_ID });
const fetchTxt = fetchR.d?.result?.content?.[0]?.text ?? "{}";
const pageData = JSON.parse(fetchTxt);
const content = pageData?.data?.content ?? "";
const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const words = plain.split(/\s+/).filter(w => w.length > 1).length;
const imgs = (content.match(/<img /gi) ?? []).length;
console.log(`\nFinal: ${words} từ | ${imgs} ảnh`);
