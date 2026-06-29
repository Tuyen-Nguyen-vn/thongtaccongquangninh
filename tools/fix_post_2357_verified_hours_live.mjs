import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import https from "node:https";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = join(ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const PROJECT_TIMEZONE = "Asia/Bangkok";
const POST_ID = 2357;
const SLUG = "gia-thong-tac-bon-cau-quang-ninh";

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

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

async function wp(path, auth, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex fix-post-2357-verified-hours",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  if (!response.ok) {
    throw new Error(`${path} failed ${response.status}: ${text.slice(0, 500)}`);
  }
  return { status: response.status, text, json };
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
        headers: { Host: HOST, "User-Agent": "Codex fix-post-2357-verified-hours" },
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

function replaceStrict(text, from, to, label) {
  if (!text.includes(from)) {
    throw new Error(`Missing expected snippet for ${label}`);
  }
  return text.replace(from, to);
}

function replaceIdempotent(text, from, to, label) {
  if (text.includes(from)) {
    return text.replace(from, to);
  }
  if (text.includes(to)) {
    return text;
  }
  throw new Error(`Missing expected snippet for ${label}`);
}

function buildContent(raw) {
  let next = raw;
  next = replaceIdempotent(
    next,
    "<p>Bồn cầu tắc lúc đêm khuya, xả nước không trôi, mùi hôi bốc lên – tình huống đó không ai muốn gặp. Khó chịu nhất không phải là tắc, mà là gọi thợ đến rồi bị báo giá &#8220;hú họa&#8221; hoặc bị tính thêm tiền lúc đã làm xong. Nếu bạn đang tìm <strong>giá thông tắc bồn cầu Quảng Ninh</strong> thật sự minh bạch, bài này sẽ cho bạn đúng thứ cần – bảng giá cụ thể, quy trình rõ ràng, không có con số mơ hồ. Gọi ngay <strong><strong>0963.953.533</strong></strong> nếu đang cần xử lý gấp.</p>",
    "<p>Bồn cầu tắc, xả nước không trôi và mùi hôi bốc lên là tình huống không ai muốn gặp. Khó chịu nhất không phải là tắc, mà là gọi thợ đến rồi bị báo giá &#8220;hú họa&#8221; hoặc bị tính thêm tiền lúc đã làm xong. Nếu bạn đang tìm <strong>giá thông tắc bồn cầu Quảng Ninh</strong> thật sự minh bạch, bài này sẽ cho bạn đúng thứ cần – bảng giá cụ thể, quy trình rõ ràng, không có con số mơ hồ. Gọi ngay <strong><strong>0963.953.533</strong></strong> nếu đang cần xử lý gấp.</p>",
    "intro",
  );
  next = replaceIdempotent(
    next,
    "<td>Thông tắc khẩn cấp ban đêm (22h–6h)</td>",
    "<td>Ca xử lý gấp ngoài lịch tiêu chuẩn</td>",
    "table row label",
  );
  next = replaceIdempotent(
    next,
    "<p><strong>3. Gọi thợ lúc ban đêm có tính thêm tiền không?</strong></p>",
    "<p><strong>3. Gọi thợ xử lý gấp có phát sinh chi phí ngoài báo giá không?</strong></p>",
    "faq question",
  );
  next = replaceIdempotent(
    next,
    "<p>Có – ca đêm từ 22h đến 6h sáng có phụ phí <strong>100.000–200.000 đồng</strong> tùy giờ. Thợ sẽ nói rõ phụ phí này trước khi xác nhận đến. Không có khoản nào bị giấu.</p>",
    "<p>Chi phí được chốt theo hiện trạng, vị trí tắc và phương án xử lý trước khi làm. Nếu có khoản phát sinh do điều kiện thi công đặc biệt, thợ phải báo rõ trước khi khách đồng ý.</p>",
    "faq answer",
  );
  next = replaceIdempotent(
    next,
    '"description":"Giá thông tắc bồn cầu Quảng Ninh 2026 rõ từng ca, báo trước khi làm. Tắc nhẹ, vật cứng, khách sạn, ban đêm gọi 0963.953.533 / 0931.156.756 xử lý 05:00-22:00."',
    '"description":"Giá thông tắc bồn cầu Quảng Ninh 2026 rõ từng ca, báo trước khi làm. Tắc nhẹ, vật cứng, khách sạn và công trình cần xử lý sớm đều được khảo sát, chốt giá rõ trước khi triển khai."',
    "inline jsonld description",
  );
  if (/ban đêm|đêm khuya|ngoài giờ hành chính/i.test(next)) {
    throw new Error("Content still contains forbidden verified-hours wording");
  }
  return next;
}

function buildExcerpt(raw) {
  let next = raw;
  next = replaceIdempotent(
    next,
    "Giá thông tắc bồn cầu Quảng Ninh 2026 rõ từng ca, báo trước khi làm. Tắc nhẹ, vật cứng, khách sạn, ban đêm gọi 0963.953.533 / 0931.156.756 xử lý 24/7.",
    "Giá thông tắc bồn cầu Quảng Ninh 2026 rõ từng ca, báo trước khi làm. Tắc nhẹ, vật cứng, khách sạn và công trình cần xử lý sớm đều được khảo sát, chốt giá rõ trước khi triển khai.",
    "excerpt",
  );
  return next;
}

function inspectPublic(html) {
  const hasNightCopy = /ban đêm|đêm khuya|ngoài giờ hành chính|trực đêm|nửa đêm/i.test(html);
  const has247 = /24\/7/i.test(html);
  return { hasNightCopy, has247 };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
    throw new Error("Missing WP auth in .env");
  }
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const stamp = formatProjectStamp(new Date());
  const backupDir = join(ROOT, "backups", `fix-post-2357-verified-hours-live-${stamp}`);
  const reportPath = join(ROOT, "reports", `fix-post-2357-verified-hours-live-${stamp}.json`);
  mkdirSync(backupDir, { recursive: true });
  mkdirSync(dirname(reportPath), { recursive: true });

  const current = await wp(`/wp-json/wp/v2/posts/${POST_ID}?context=edit`, auth);
  const backupPath = join(backupDir, `post-${POST_ID}-${SLUG}.before.json`);
  writeFileSync(backupPath, JSON.stringify(current.json, null, 2), "utf8");

  const nextContent = buildContent(current.json?.content?.raw || "");
  const nextExcerpt = buildExcerpt(current.json?.excerpt?.raw || "");

  const update = await wp(`/wp-json/wp/v2/posts/${POST_ID}`, auth, {
    method: "POST",
    body: JSON.stringify({
      content: nextContent,
      excerpt: nextExcerpt,
    }),
  });

  const marker = `fix-post-2357-${Date.now()}`;
  const publicPage = await fetchPublic(`/gia-thong-tac-bon-cau-quang-ninh/?nowprocket=1&codex=${marker}`);
  const publicCheck = inspectPublic(publicPage.text);

  const report = {
    generatedAt: formatProjectTimestamp(new Date()),
    backupDir,
    backupPath,
    updateStatus: update.status,
    public: {
      status: publicPage.status,
      ...publicCheck,
    },
    success: update.status === 200 && publicPage.status === 200 && !publicCheck.hasNightCopy,
  };

  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ success: report.success, reportPath, backupDir, publicStatus: publicPage.status }, null, 2));
  if (!report.success) {
    process.exitCode = 1;
  }
}

await main();
