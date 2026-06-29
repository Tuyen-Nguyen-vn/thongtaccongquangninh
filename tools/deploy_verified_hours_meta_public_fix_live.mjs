import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import { dirname, join, relative } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const MCP_TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const PROJECT_TIMEZONE = "Asia/Bangkok";
const PLUGIN_LOCAL = join(ROOT, "tools", "wp-plugins", "ttcqn-meta-desc-fix", "ttcqn-meta-desc-fix.php");
const PLUGIN_REMOTE = "/public_html/wp-content/plugins/ttcqn-meta-desc-fix/ttcqn-meta-desc-fix.php";
const ENV_PATH = join(ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";

const TARGET_POSTS = [
  {
    id: 992,
    type: "pages",
    slug: "thong-tac-cong-gieng-day",
    replacements: [
      [/"openingHours":"Mo-Su 00:00-23:59"/g, '"openingHours":"Mo-Su 05:00-22:00"'],
      [/Dịch vụ thông tắc cống tại Giếng Đáy, Hạ Long 05:00-22:00\./g, "Dịch vụ thông tắc cống tại Giếng Đáy, Hạ Long."],
    ],
  },
  {
    id: 1483,
    type: "pages",
    slug: "thong-tac-bon-cau-mong-cai",
    replacements: [
      [/Thông tắc bồn cầu Móng Cái 24\/7 —/g, "Thông tắc bồn cầu Móng Cái —"],
    ],
  },
  {
    id: 426,
    type: "pages",
    slug: "thong-tac-cong-mong-cai",
    replacements: [
      [/Thông tắc cống Móng Cái 24\/7 —/g, "Thông tắc cống Móng Cái —"],
      [/"openingHours":"Mo-Su 00:00-23:59"/g, '"openingHours":"Mo-Su 05:00-22:00"'],
      [/Thông tắc cống Móng Cái 05:00-22:00 tại Móng Cái/g, "Thông tắc cống Móng Cái tại Móng Cái"],
    ],
  },
  {
    id: 2439,
    type: "posts",
    slug: "hut-be-phot-24-7-quang-ninh",
    replacements: [
      [/Hút Bể Phốt 05:00-22:00 Là Gì\?/g, "Hút Bể Phốt Khẩn Cấp Quảng Ninh Là Gì?"],
      [/Câu Hỏi Thường Gặp Về Hút Bể Phốt 05:00-22:00 Quảng Ninh/g, "Câu Hỏi Thường Gặp Về Hút Bể Phốt Khẩn Cấp Quảng Ninh"],
      [/Hút bể phốt 05:00-22:00 Quảng Ninh/g, "Hút bể phốt khẩn cấp Quảng Ninh"],
      [/Hút Bể Phốt 05:00-22:00 Quảng Ninh/g, "Hút Bể Phốt Khẩn Cấp Quảng Ninh"],
      [/Hút bể phốt khẩn cấp 05:00-22:00/g, "Hút bể phốt khẩn cấp"],
      [/Hút Bể Phốt Khẩn Cấp Quảng Ninh Quảng Ninh/g, "Hút Bể Phốt Khẩn Cấp Quảng Ninh"],
      [/Bể phốt đầy lúc 11 giờ đêm, mùi hôi xộc lên cả nhà, nhà vệ sinh không dùng được nữa – lúc đó bạn gọi ai\? Đa phần các đơn vị vệ sinh môi trường chỉ làm giờ hành chính, để bạn chờ đến sáng hôm sau\./g, "Bể phốt đầy, mùi hôi xộc lên cả nhà và nhà vệ sinh không dùng được nữa là tình huống cần xử lý sớm ngay trong ngày."],
      [/<strong>Môi Trường Đô Thị Số 1 Quảng Ninh làm khác: gọi hotline 0963\.953\.533 lúc nào cũng có thợ, không phân biệt đêm hay ngày\.<\/strong>/g, "<strong>Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận 05:00-22:00 hằng ngày, điều phối nhanh và báo rõ thời gian có mặt theo khu vực.<\/strong>"],
      [/Xe bồn sẵn sàng xuất phát trong 15 phút sau khi nhận cuộc gọi\. Không thu thêm phụ phí đêm khuya, không báo giá ảo, không để bạn chờ đợi khi bể phốt đã đến giới hạn\./g, "Xe bồn được điều phối nhanh sau khi tiếp nhận. Không báo giá ảo và luôn chốt phương án xử lý trước khi làm khi bể phốt đã đến giới hạn."],
      [/Nguyên nhân bể phốt đầy lúc đêm khuya không thể đợi đến sáng/g, "Nguyên nhân bể phốt đầy cần xử lý sớm"],
      [/<strong>Dấu hiệu bể phốt đầy cần hút ngay trong đêm:<\/strong>/g, "<strong>Dấu hiệu bể phốt đầy cần hút sớm:<\/strong>"],
      [/Đợi đến sáng nghĩa là cả đêm sống trong môi trường có mùi độc hại và nguy cơ nước bẩn trào ngược bất cứ lúc nào\./g, "Để chậm xử lý quá lâu sẽ làm mùi hôi nặng hơn và tăng nguy cơ nước bẩn trào ngược."],
      [/<li>Có thợ trực ca đêm, không chỉ nhận tin nhắn rồi hẹn sáng mai<\/li>/g, "<li>Có tổng đài tiếp nhận và điều phối nhanh trong khung 05:00-22:00 hằng ngày<\/li>"],
      [/Môi Trường Đô Thị Số 1 Quảng Ninh vận hành theo đúng ba điều kiện đó\. Xe bồn hút 5 khối đậu sẵn tại bãi, thợ ca đêm túc trực\. Địa bàn quen thuộc từ Bãi Cháy đến Cẩm Phả, từ các ngõ hẹp khu Giếng Đáy cho đến khu nhà liền kề Hà Khẩu\./g, "Môi Trường Đô Thị Số 1 Quảng Ninh vận hành theo đúng ba điều kiện đó. Xe bồn hút 5 khối sẵn phương án điều phối nhanh, đội kỹ thuật quen địa bàn từ Bãi Cháy đến Cẩm Phả và các ngõ hẹp khu Giếng Đáy đến Hà Khẩu."],
      [/Thiết bị hiện đại cho dịch vụ hút bể phốt 05:00-22:00 Quảng Ninh tại Hạ Long/g, "Thiết bị hiện đại cho dịch vụ hút bể phốt Quảng Ninh tại Hạ Long"],
      [/Phụ phí đêm khuya \(sau 22h – trước 6h\)/g, "Phụ phí ngoài phạm vi triển khai chuẩn"],
      [/Tình huống thường gặp khi hút bể phốt 05:00-22:00 tại Quảng Ninh/g, "Tình huống thường gặp khi hút bể phốt tại Quảng Ninh"],
      [/<strong>Tình huống thường gặp lúc đêm tại Bãi Cháy, Hạ Long<\/strong>/g, "<strong>Tình huống thường gặp tại Bãi Cháy, Hạ Long<\/strong>"],
      [/Chi phí đêm khuya: bằng với giá ban ngày\. Không phụ phí\./g, "Chi phí được báo theo hiện trạng và khối lượng thực tế, chốt trước khi triển khai."],
      [/NAP liên hệ và khu vực phục vụ hút bể phốt 05:00-22:00 tại Quảng Ninh/g, "NAP liên hệ và khu vực phục vụ hút bể phốt tại Quảng Ninh"],
      [/Phục vụ: 05:00-22:00 – không nghỉ lễ, không nghỉ Tết/g, "Tiếp nhận: 05:00-22:00 hằng ngày"],
    ],
  },
  {
    id: 2782,
    type: "posts",
    slug: "thong-tac-cong-24-7-quang-ninh",
    title: "Thông Tắc Cống Quảng Ninh: Gọi Thợ Xử Lý Nhanh Trong Ngày",
    replacements: [
      [/Thông Tắc Cống 05:00-22:00 Là Gì\?/g, "Thông Tắc Cống Khẩn Cấp Quảng Ninh Là Gì?"],
      [/Dấu Hiệu Cần Gọi Thợ Thông Tắc Cống 05:00-22:00 Ngay/g, "Dấu Hiệu Cần Gọi Thợ Thông Tắc Cống Khẩn Cấp Ngay"],
      [/Thông tắc cống 05:00-22:00 Quảng Ninh/g, "Thông tắc cống khẩn cấp Quảng Ninh"],
      [/Thông Tắc Cống 05:00-22:00 Quảng Ninh/g, "Thông Tắc Cống Khẩn Cấp Quảng Ninh"],
      [/Thông tắc cống khẩn cấp 05:00-22:00/g, "Thông tắc cống khẩn cấp"],
      [/Thông Tắc Cống Khẩn Cấp Quảng Ninh Quảng Ninh/g, "Thông Tắc Cống Khẩn Cấp Quảng Ninh"],
      [/Cống tắc lúc 11 giờ đêm\. Nước trào ngược từ sàn nhà tắm, mùi hôi xộc lên toàn nhà\. Không biết gọi ai giờ này\./g, "Cống tắc, nước trào ngược từ sàn nhà tắm và mùi hôi xộc lên toàn nhà là tình huống cần xử lý nhanh ngay trong ngày."],
      [/Gọi ngay <strong>0963\.953\.533<\/strong> — đường dây trực cả đêm lẫn ngày\./g, "Gọi ngay <strong>0963.953.533<\/strong> trong khung 05:00-22:00 để được điều phối nhanh và báo rõ thời gian có mặt."],
      [/Cống không chọn giờ để tắc\. Nhưng có lý do khiến ban đêm vấn đề trở nên rõ ràng hơn\./g, "Cống không chọn thời điểm để tắc. Khi nước trào, mùi hôi bốc mạnh hoặc nhiều điểm nghẹt cùng lúc, vấn đề cần được xử lý sớm."],
      [/<strong>Dịch vụ thông tắc cống 05:00-22:00<\/strong> là đội kỹ thuật trực liên tục cả ngày nghỉ, ngày lễ, nửa đêm — không phân biệt giờ giấc\. Khi nhận cuộc gọi, thợ xuất phát ngay, không phải đặt lịch hẹn sáng hôm sau\./g, "<strong>Dịch vụ thông tắc cống khẩn cấp<\/strong> tại đây tập trung xử lý ca nước trào, mùi hôi và tắc nặng trong khung 05:00-22:00 hằng ngày, ưu tiên điều phối nhanh và báo giá rõ ngay từ đầu."],
      [/Giá niêm yết, không thêm phụ phí đêm khuya hay ngày lễ\./g, "Giá niêm yết, báo rõ trước khi làm và không tự ý cộng thêm chi phí khi chưa thống nhất với khách."],
      [/Thợ Môi Trường Đô Thị Số 1 xử lý thông tắc cống 05:00-22:00 Quảng Ninh tại Quảng Ninh/g, "Thợ Môi Trường Đô Thị Số 1 xử lý thông tắc cống Quảng Ninh tại hiện trường"],
      [/Kết quả thực tế sau khi xử lý thông tắc cống 05:00-22:00 Quảng Ninh – Quảng Ninh 2026/g, "Kết quả thực tế sau khi xử lý thông tắc cống Quảng Ninh năm 2026"],
      [/Máy lò xo xử lý cống nghẹt 05:00-22:00 tại Quảng Ninh, hạn chế đục phá nền nhà\./g, "Máy lò xo xử lý cống nghẹt tại Quảng Ninh, hạn chế đục phá nền nhà."],
      [/<strong>Ca đêm tại khu dân cư Hà Khánh, Hạ Long \(tháng 3\/2026\)<\/strong>/g, "<strong>Ca xử lý tại khu dân cư Hà Khánh, Hạ Long (tháng 3/2026)<\/strong>"],
      [/<strong>Ca khẩn cấp tại nhà hàng hải sản đường Hạ Long, Bãi Cháy \(tháng 4\/2026\)<\/strong>/g, "<strong>Ca xử lý tại nhà hàng hải sản đường Hạ Long, Bãi Cháy (tháng 4/2026)<\/strong>"],
      [/<strong>Cống tắc đêm khuya\? Gọi ngay 0963\.953\.533 — thợ xuất phát trong vài phút\. Hoặc nhắn Zalo 0963\.953\.533 nếu không tiện gọi lớn tiếng\.<\/strong> Không cần đặt lịch, không cần chờ đến sáng\./g, "<strong>Cống tắc cần xử lý gấp?<\/strong> Gọi ngay 0963.953.533 trong khung 05:00-22:00 hoặc nhắn Zalo 0963.953.533 để được điều phối nhanh và chốt phương án xử lý."],
      [/Không phải ca tắc nào cũng cần gọi thợ giữa đêm\./g, "Không phải ca tắc nào cũng cần gọi thợ ngay lập tức."],
      [/<strong>Đêm khuya gọi thông cống có phụ phí không\?<\/strong>/g, "<strong>Gọi thông cống có phụ phí ngoài báo giá không?<\/strong>"],
    ],
  },
];

const PUBLIC_CHECKS = [
  { path: "/thong-tac-cong-gieng-day/", expectNo247: true },
  { path: "/thong-tac-bon-cau-ha-long/", expectNo247: true },
  { path: "/thong-tac-bon-cau-mong-cai/", expectNo247: true },
  { path: "/thong-tac-cong-mong-cai/", expectNo247: true },
  { path: "/hut-be-phot-24-7-quang-ninh/", expectNo247: true, expectNoBrokenHoursHeading: true, expectNoNightCopy: true },
  { path: "/thong-tac-cong-24-7-quang-ninh/", expectNo247: true, expectNoBrokenHoursHeading: true, expectNoNightCopy: true },
];

let sessionId = null;
let messageId = 1;

function getTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const millisecond = String(date.getMilliseconds()).padStart(3, "0");
  return { ...map, millisecond };
}

function formatProjectTimestamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${parts.millisecond}+07:00`;
}

function formatProjectStamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}-${parts.millisecond}+07-00`;
}

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

function parseSse(text) {
  const events = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      events.push(JSON.parse(payload));
    } catch {}
  }
  return events;
}

function normalizeText(text) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
}

function verifyLocalPlugin(filePath) {
  const content = readFileSync(filePath, "utf8");
  const required = [
    "Version: 2026.06.29.1",
    "rank_math/json_ld",
    "05:00-22:00 hằng ngày",
    "ttcqn_meta_desc_fix_verified_hours_v20260628_4",
  ];
  const missing = required.filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    throw new Error(`Local plugin missing expected snippets: ${missing.join(", ")}`);
  }
  return content;
}

function fetchPublic(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: HOST,
        path,
        method: "GET",
        headers: { Host: HOST, "User-Agent": "Codex verified-hours-meta-fix" },
        rejectUnauthorized: false,
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text }));
      },
    );
    req.on("error", (error) => resolve({ status: 0, error: error.message, text: "" }));
    req.setTimeout(45000, () => {
      req.destroy();
      resolve({ status: 0, error: "timeout", text: "" });
    });
    req.end();
  });
}

async function mcpPost(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: messageId++,
      method,
      params: params ?? {},
    });
    const headers = {
      Authorization: `Bearer ${MCP_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Content-Length": Buffer.byteLength(body),
    };
    if (sessionId) {
      headers["Mcp-Session-Id"] = sessionId;
    }

    const req = https.request(
      {
        hostname: MCP_HOST,
        port: MCP_PORT,
        path: MCP_PATH,
        method: "POST",
        headers,
        rejectUnauthorized: false,
      },
      (res) => {
        if (res.headers["mcp-session-id"]) {
          sessionId = res.headers["mcp-session-id"];
        }
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => {
          const contentType = res.headers["content-type"] || "";
          if (contentType.includes("text/event-stream")) {
            resolve({ status: res.statusCode, events: parseSse(text), raw: text });
            return;
          }
          try {
            resolve({ status: res.statusCode, json: JSON.parse(text) });
          } catch {
            resolve({ status: res.statusCode, raw: text });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

function getResult(response) {
  return response.json?.result ?? response.events?.find((event) => event.result !== undefined)?.result;
}

function hostText(response) {
  const result = getResult(response);
  if (!result) {
    return JSON.stringify(response).slice(0, 2000);
  }
  if (result.isError) {
    throw new Error(Array.isArray(result.content) ? result.content.map((item) => item.text || "").join("") : JSON.stringify(result));
  }
  if (Array.isArray(result.content)) {
    return result.content.map((item) => item.text || "").join("");
  }
  return JSON.stringify(result);
}

async function hostTool(tool, args) {
  const response = await mcpPost("tools/call", { name: tool, arguments: args });
  if (response.status !== 200) {
    throw new Error(`${tool} failed HTTP ${response.status}: ${JSON.stringify(response).slice(0, 1000)}`);
  }
  return hostText(response);
}

async function wpFetch(path, auth, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex verified-hours-meta-fix",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: response.status, text, json };
}

function cleanLegacyContent(raw, replacements) {
  let content = raw;
  const generic = [
    [/24\/7 kể cả ngày lễ và đêm muộn/gi, "05:00-22:00 hằng ngày"],
    [/24\/7 kể cả ngày lễ và tết/gi, "05:00-22:00 hằng ngày"],
    [/24\/7, kể cả ngày nghỉ và lễ tết/gi, "05:00-22:00 hằng ngày"],
    [/phục vụ 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/hỗ trợ 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/hoạt động 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/trực 24\/7/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
    [/Hotline 24\/7/gi, "Hotline tiếp nhận"],
    [/\(24\/7\)/g, "(05:00-22:00)"],
    [/00:00-23:59/g, "05:00-22:00"],
    [/"opens":"00:00"/g, '"opens":"05:00"'],
    [/"closes":"23:59"/g, '"closes":"22:00"'],
  ];
  for (const [pattern, replacement] of generic) {
    content = content.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  return content
    .replace(/05:00-22:00 hằng ngày hằng ngày/g, "05:00-22:00 hằng ngày")
    .replace(/Quảng Ninh Quảng Ninh/g, "Quảng Ninh");
}

function inspectPublic(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [null, ""])[1].trim();
  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [null, ""])[1];
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [null, ""])[1].replace(/<[^>]+>/g, "").trim();
  const heroDesc = (html.match(/<p class="ttcqn-seo-hero-description">([\s\S]*?)<\/p>/i) || [null, ""])[1].replace(/<[^>]+>/g, "").trim();
  const headingTexts = Array.from(html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)).map((match) =>
    match[1].replace(/<[^>]+>/g, "").trim(),
  );
  const textSurface = [title, desc, h1, heroDesc, ...headingTexts].join("\n");
  return {
    title,
    desc,
    h1,
    heroDesc,
    has247: /24\/7/i.test(textSurface),
    hasOldHours: /00:00-23:59|opens":"00:00"|closes":"23:59"/i.test(html),
    hasBrokenHoursHeading: headingTexts.some((text) => /Hút Bể Phốt 05:00-22:00|Thông Tắc Cống 05:00-22:00|hút bể phốt 05:00-22:00|thông tắc cống 05:00-22:00/i.test(text)),
    hasNightCopy: /trực đêm|đêm khuya|giữa đêm|cả đêm lẫn ngày|không phân biệt đêm hay ngày|thợ ca đêm|ca đêm|lúc đêm|trong đêm|nửa đêm/i.test(html),
  };
}

const now = new Date();
const stamp = formatProjectStamp(now);
const backupDir = join(ROOT, "backups", `verified-hours-meta-public-live-${stamp}`);
const reportPath = join(ROOT, "reports", `verified-hours-meta-public-live-${stamp}.json`);
mkdirSync(backupDir, { recursive: true });
mkdirSync(dirname(reportPath), { recursive: true });

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
    throw new Error("Missing WP auth in .env");
  }
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const localPlugin = verifyLocalPlugin(PLUGIN_LOCAL);

  const report = {
    generatedAt: formatProjectTimestamp(now),
    timezone: PROJECT_TIMEZONE,
    plugin: {
      local: PLUGIN_LOCAL,
      remote: PLUGIN_REMOTE,
      backupPath: join(backupDir, "ttcqn-meta-desc-fix.remote.php"),
      remoteMatches: false,
    },
    posts: [],
    public: [],
    success: false,
  };

  await mcpPost("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "codex-verified-hours-meta-public-live", version: "1.0" },
  });
  await mcpPost("notifications/initialized", {});

  const remoteBefore = await hostTool("read_file", { path: PLUGIN_REMOTE });
  writeFileSync(report.plugin.backupPath, remoteBefore, "utf8");
  const writeText = await hostTool("write_file", { path: PLUGIN_REMOTE, content: localPlugin });
  const remoteAfter = await hostTool("read_file", { path: PLUGIN_REMOTE });
  report.plugin.writeText = writeText;
  report.plugin.remoteMatches = normalizeText(remoteAfter) === normalizeText(localPlugin);

  for (const target of TARGET_POSTS) {
    const current = await wpFetch(`/wp-json/wp/v2/${target.type}/${target.id}?context=edit`, auth);
    if (current.status !== 200 || !current.json?.content?.raw) {
      report.posts.push({ ...target, ok: false, error: `Fetch failed ${current.status}` });
      continue;
    }

    const backupPath = join(backupDir, `${target.type}-${target.id}-${target.slug}.before.json`);
    writeFileSync(backupPath, JSON.stringify(current.json, null, 2), "utf8");
    const beforeContent = current.json.content.raw;
    const beforeTitle = current.json.title?.raw || "";
    const nextContent = cleanLegacyContent(beforeContent, target.replacements);
    const nextTitle = target.title || beforeTitle;
    const needsUpdate = nextContent !== beforeContent || nextTitle !== beforeTitle;

    let updateStatus = null;
    if (needsUpdate) {
      const payload = {};
      if (nextContent !== beforeContent) {
        payload.content = nextContent;
      }
      if (nextTitle !== beforeTitle) {
        payload.title = nextTitle;
      }
      const update = await wpFetch(
        `/wp-json/wp/v2/${target.type}/${target.id}`,
        auth,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      updateStatus = update.status;
    }

    report.posts.push({
      ...target,
      backupPath,
      needsUpdate,
      updateStatus,
      beforeTitle,
      afterTitle: nextTitle,
      beforeHasBrokenHoursHeading: /Hút Bể Phốt 05:00-22:00|Thông Tắc Cống 05:00-22:00/.test(beforeContent),
      afterHasBrokenHoursHeading: /Hút Bể Phốt 05:00-22:00|Thông Tắc Cống 05:00-22:00/.test(nextContent),
      afterHasOldHours: /00:00-23:59|opens":"00:00"|closes":"23:59"/.test(nextContent),
      ok: !needsUpdate || updateStatus === 200,
    });
  }

  for (const check of PUBLIC_CHECKS) {
    const res = await fetchPublic(`${check.path}?nowprocket=1&codex=${Date.now()}`);
    const parsed = inspectPublic(res.text);
    report.public.push({
      path: check.path,
      status: res.status,
      title: parsed.title,
      desc: parsed.desc,
      h1: parsed.h1,
      has247: parsed.has247,
      hasOldHours: parsed.hasOldHours,
      hasBrokenHoursHeading: parsed.hasBrokenHoursHeading,
      hasNightCopy: parsed.hasNightCopy,
      ok:
        res.status === 200 &&
        (!check.expectNo247 || !parsed.has247) &&
        !parsed.hasOldHours &&
        (!check.expectNoBrokenHoursHeading || !parsed.hasBrokenHoursHeading) &&
        (!check.expectNoNightCopy || !parsed.hasNightCopy),
    });
  }

  report.success =
    report.plugin.remoteMatches &&
    report.posts.every((item) => item.ok) &&
    report.public.every((item) => item.ok);

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  appendFileSync(
    join(ROOT, "docs", "SEO_PROGRESS.csv"),
    `\n${now.toISOString().slice(0, 10)},${new Date().toTimeString().slice(0, 5)},VERIFIED-HOURS-META-PUBLIC-${now.toISOString().slice(0, 10)},seo_fix,cleanup public meta/schema 24-7 copy and fix broken verified-hours posts,https://${HOST}/,,${report.success ? "done" : "needs_review"},high,,,,,backup ${relative(ROOT, backupDir)}; write live plugin file; patch posts 2439+2782; verify sample URLs,tools/deploy_verified_hours_meta_public_fix_live.mjs,,report ${relative(ROOT, reportPath)},,,,,,\n`,
    "utf8",
  );

  console.log(JSON.stringify({ reportPath, backupDir, success: report.success }, null, 2));
  if (!report.success) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const failure = {
    generatedAt: formatProjectTimestamp(now),
    error: error instanceof Error ? error.message : String(error),
  };
  writeFileSync(reportPath, JSON.stringify(failure, null, 2), "utf8");
  console.error(error);
  process.exitCode = 1;
});
