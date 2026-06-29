/**
 * Cập nhật Rank Math SEO title cho trang bảo hành (page 64).
 * Title cũ 45 chars → mới 63 chars để đạt 60-70.
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";

const NEW_SEO_TITLE = "Chính Sách Bảo Hành Dịch Vụ Hút Bể Phốt & Thông Tắc Cống Quảng Ninh";
// 68 chars — trong ngưỡng 60-70

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function request(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

(async () => {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log(`Cập nhật Rank Math SEO title cho page 64 (chinh-sach-bao-hanh)`);
  console.log(`  Title mới (${NEW_SEO_TITLE.length} chars): "${NEW_SEO_TITLE}"`);

  const r = await request("POST", "/rankmath/v1/updateMeta", auth, {
    objectType: "post",
    objectID: 64,
    meta: {
      rank_math_title: NEW_SEO_TITLE,
    },
  });

  const ok = r.data?.slug === true || r.status === 200;
  console.log(`  Status: ${r.status} | slug===true: ${r.data?.slug} → ${ok ? "✓ OK" : "✗ Lỗi"}`);
  if (!ok) console.log("  Response:", JSON.stringify(r.data).slice(0, 200));
})().catch(e => console.error(e.stack ?? e.message));
