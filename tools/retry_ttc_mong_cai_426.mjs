/**
 * Retry fix cho TTC Móng Cái page 426 (bị 502 lúc trước).
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const BASE      = "https://thongtaccongquangninh.com";
const LANDING   = "thong-tac-cong-quang-ninh";
const MARKER    = "ttcqn-author-nguyen-song-hao";
const AUTHOR_URL  = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const AUTHOR_NAME = "Nguyễn Song Hào";

const CTA = `<!-- wp:paragraph -->\n<p>Cần thông tắc cống tại Móng Cái? Đội <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> phục vụ khu cửa khẩu, nhà phố, khách sạn 24/7 — thợ có mặt trong ngày. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->`;

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

  console.log("Retry: page 426 TTC Móng Cái");
  const r = await request("GET", "/wp/v2/pages/426?context=edit", auth);
  console.log("GET:", r.status);
  if (r.status !== 200) { console.log("ERROR fetch:", r.data); return; }

  let content = r.data?.content?.raw ?? "";
  const hasLink   = content.includes(`/${LANDING}/`);
  const hasByline = content.includes(MARKER);
  console.log(`hasLink: ${hasLink} | hasByline: ${hasByline}`);

  if (hasLink && hasByline) { console.log("Không cần fix."); return; }

  if (!hasLink) {
    const idx = content.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
    const ins  = "\n" + CTA + "\n";
    content = idx !== -1 ? content.slice(0, idx) + ins + content.slice(idx) : content + ins;
  }
  if (!hasByline) {
    const modified = r.data?.modified ?? new Date().toISOString();
    const d = new Date(modified);
    const dateStr = `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
    content += [
      `\n<!-- wp:paragraph {"className":"${MARKER} ttcqn-author-byline"} -->`,
      `<p class="${MARKER} ttcqn-author-byline"><strong>Tác giả:</strong> <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a> · <strong>Cập nhật:</strong> ${dateStr}</p>`,
      `<!-- /wp:paragraph -->`,
    ].join("\n");
  }

  const w = await request("POST", "/wp/v2/pages/426", auth, { content });
  console.log(`POST: ${w.status === 200 ? "✓ 200" : `✗ ${w.status}`}`);
})().catch(e => console.error(e.stack ?? e.message));
