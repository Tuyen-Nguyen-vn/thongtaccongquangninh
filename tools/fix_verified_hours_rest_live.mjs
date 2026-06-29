import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import https from "node:https";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = join(ROOT, ".env");
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const PROJECT_TIMEZONE = "Asia/Bangkok";

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

function formatProjectStamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}-${parts.millisecond}+07-00`;
}

function formatProjectTimestamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${parts.millisecond}+07:00`;
}

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const baseUrl = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wpFetch(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex verified-hours-rest-fix",
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

function fetchPublic(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: HOST,
        path,
        method: "GET",
        headers: { Host: HOST, "User-Agent": "Codex verified-hours-rest-fix" },
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

function buildWidgetContent(raw) {
  let content = raw;
  content = replaceStrict(
    content,
    "Dịch vụ hút bể phốt, thông tắc cống tại Quảng Ninh. Kinh nghiệm 10+ năm, phục vụ 24/7.",
    "Dịch vụ hút bể phốt, thông tắc cống tại Quảng Ninh. Kinh nghiệm 10+ năm, tiếp nhận 05:00-22:00 hằng ngày.",
    "widget about line",
  );
  content = replaceStrict(
    content,
    "⏰ Phục vụ 24/7",
    "⏰ Tiếp nhận 05:00-22:00",
    "widget clock line",
  );
  return content;
}

function buildPage35Title(title) {
  return replaceStrict(
    title,
    "Dịch vụ thông tắc cống Quảng Ninh - Uy tín, chuyên nghiệp 24/7",
    "Dịch vụ thông tắc cống Quảng Ninh - Uy tín, xử lý nhanh",
    "page 35 title",
  );
}

function buildPage35Content(raw) {
  let content = raw;
  const replacements = [
    [
      "<h1 class=\"wp-block-heading\">Dịch vụ thông tắc cống Quảng Ninh - Uy tín, chuyên nghiệp 24/7</h1>",
      "<h1 class=\"wp-block-heading\">Dịch vụ thông tắc cống Quảng Ninh - Uy tín, xử lý nhanh</h1>",
      "page 35 h1",
    ],
    [
      "Hotline hỗ trợ khẩn cấp 24/7:",
      "Hotline tiếp nhận 05:00-22:00 hằng ngày:",
      "page 35 hotline intro",
    ],
    [
      "alt=\"đội thợ thông tắc cống Quảng Ninh sẵn sàng phục vụ 24/7\"",
      "alt=\"đội thợ thông tắc cống Quảng Ninh sẵn sàng tiếp nhận 05:00-22:00 hằng ngày\"",
      "page 35 image alt",
    ],
    [
      "<p><em>đội thợ thông tắc cống Quảng Ninh đúng kỹ thuật, sẵn sàng cơ động phục vụ khách hàng 24/7.</em></p>",
      "<p><em>đội thợ thông tắc cống Quảng Ninh đúng kỹ thuật, sẵn sàng cơ động tiếp nhận khách hàng trong khung 05:00-22:00 hằng ngày.</em></p>",
      "page 35 image caption",
    ],
    [
      "đội thợ kỹ thuật túc trực 24/7 tại các chi nhánh sẽ có mặt tại nhà khách hàng chỉ trong vòng 15 phút sau khi tiếp nhận thông tin.",
      "đội thợ kỹ thuật tiếp nhận 05:00-22:00 hằng ngày tại các chi nhánh và điều phối nhanh để có mặt tại nhà khách hàng chỉ trong vòng 15 phút sau khi tiếp nhận thông tin.",
      "page 35 service speed",
    ],
    [
      "<h2 class=\"wp-block-heading\">Địa Chỉ NAP &amp; Thông Tin Liên Hệ Khẩn Cấp 24/7</h2>",
      "<h2 class=\"wp-block-heading\">Địa Chỉ NAP &amp; Thông Tin Liên Hệ</h2>",
      "page 35 NAP heading",
    ],
    [
      "<li><strong>Hotline 24/7:</strong> <strong>0963.953.533 / 0931.156.756</strong></li>",
      "<li><strong>Hotline tiếp nhận:</strong> <strong>0963.953.533 / 0931.156.756</strong></li>",
      "page 35 hotline list",
    ],
    [
      "<li><strong>Thời gian hoạt động:</strong> Tiếp nhận xử lý sự cố 24/7, kể cả ngày nghỉ và lễ tết.</li>",
      "<li><strong>Thời gian hoạt động:</strong> 05:00-22:00 hằng ngày, bao gồm cả cuối tuần.</li>",
      "page 35 hours list",
    ],
    [
      "Dịch vụ xử lý sự cố toilet 24/7.",
      "Dịch vụ xử lý sự cố toilet trong khung 05:00-22:00 hằng ngày.",
      "page 35 internal link note",
    ],
    [
      "\"headline\": \"Dịch vụ thông tắc cống Quảng Ninh - Uy tín, chuyên nghiệp 24/7\"",
      "\"headline\": \"Dịch vụ thông tắc cống Quảng Ninh - Uy tín, xử lý nhanh\"",
      "page 35 embedded schema headline",
    ],
  ];
  for (const [from, to, label] of replacements) {
    content = replaceStrict(content, from, to, label);
  }
  if (content.includes("24/7")) {
    throw new Error("Page 35 content still contains 24/7 after replacements");
  }
  return content;
}

function buildPost2053Title(title) {
  return replaceStrict(
    title,
    "Thông tắc cống Hồng Gai Hạ Long 24/7 – Ngõ hẹp phố cổ, không đục phá",
    "Thông tắc cống Hồng Gai Hạ Long – Ngõ hẹp phố cổ, không đục phá",
    "post 2053 title",
  );
}

function buildPost2053Content(raw) {
  let content = raw;
  const replacements = [
    [
      "Môi Trường Đô Thị Số 1 Quảng Ninh nhận <strong>thông tắc cống Hồng Gai</strong> 24/7 cho nhà dân, nhà hàng phố cổ, nhà trọ và cơ sở kinh doanh trong ngõ hẹp.",
      "Môi Trường Đô Thị Số 1 Quảng Ninh nhận <strong>thông tắc cống Hồng Gai</strong> trong khung 05:00-22:00 hằng ngày cho nhà dân, nhà hàng phố cổ, nhà trọ và cơ sở kinh doanh trong ngõ hẹp.",
      "post 2053 intro line",
    ],
    [
      "<p><strong>Gọi báo giá miễn phí: 0963.953.533 (24/7)</strong></p>",
      "<p><strong>Gọi báo giá miễn phí: 0963.953.533 (05:00-22:00)</strong></p>",
      "post 2053 price CTA",
    ],
    [
      "<p>Hotline: <strong>0963.953.533 / 0931.156.756</strong> – 24/7, cả ngày lễ và Tết.</p>",
      "<p>Hotline: <strong>0963.953.533 / 0931.156.756</strong> – tiếp nhận 05:00-22:00 hằng ngày.</p>",
      "post 2053 NAP line",
    ],
    [
      "Môi Trường Đô Thị Số 1 Quảng Ninh phục vụ thông tắc cống Hồng Gai 24/7 cho khu phố cổ, nhà ống, ngõ hẹp, chợ Hạ Long 1, trục Lê Thánh Tông và các cơ sở kinh doanh quanh trung tâm cũ.",
      "Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận thông tắc cống Hồng Gai 05:00-22:00 hằng ngày cho khu phố cổ, nhà ống, ngõ hẹp, chợ Hạ Long 1, trục Lê Thánh Tông và các cơ sở kinh doanh quanh trung tâm cũ.",
      "post 2053 nap extra",
    ],
    [
      "\"headline\":\"Thông tắc cống Hồng Gai Hạ Long 24/7 – Ngõ hẹp phố cổ, không đục phá\"",
      "\"headline\":\"Thông tắc cống Hồng Gai Hạ Long – Ngõ hẹp phố cổ, không đục phá\"",
      "post 2053 embedded schema headline",
    ],
    [
      "\"description\":\"Thông tắc cống Hồng Gai Hạ Long 24/7 cho nhà dân ngõ hẹp, nhà ống, cơ sở kinh doanh phố cổ. Không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756.\"",
      "\"description\":\"Thông tắc cống Hồng Gai Hạ Long trong khung 05:00-22:00 cho nhà dân ngõ hẹp, nhà ống, cơ sở kinh doanh phố cổ. Không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756.\"",
      "post 2053 embedded schema description",
    ],
  ];
  for (const [from, to, label] of replacements) {
    content = replaceStrict(content, from, to, label);
  }
  if (content.includes("24/7")) {
    throw new Error("Post 2053 content still contains 24/7 after replacements");
  }
  return content;
}

const now = new Date();
const stamp = formatProjectStamp(now);
const backupDir = join(ROOT, "backups", `verified-hours-rest-live-${stamp}`);
const reportPath = join(ROOT, "reports", `verified-hours-rest-live-${stamp}.json`);
mkdirSync(backupDir, { recursive: true });
mkdirSync(join(ROOT, "reports"), { recursive: true });

async function main() {
  const report = {
    generatedAt: formatProjectTimestamp(now),
    timezone: PROJECT_TIMEZONE,
    backups: {},
    updates: {},
    public: {},
    success: false,
  };

  const widgetBefore = await wpFetch("/wp-json/wp/v2/widgets/custom_html-1?context=edit");
  const page35Before = await wpFetch("/wp-json/wp/v2/pages/35?context=edit");
  const post2053Before = await wpFetch("/wp-json/wp/v2/posts/2053?context=edit");

  if (widgetBefore.status !== 200 || !widgetBefore.json) throw new Error(`Widget fetch failed: ${widgetBefore.status}`);
  if (page35Before.status !== 200 || !page35Before.json) throw new Error(`Page 35 fetch failed: ${page35Before.status}`);
  if (post2053Before.status !== 200 || !post2053Before.json) throw new Error(`Post 2053 fetch failed: ${post2053Before.status}`);

  const widgetBackup = join(backupDir, "widget-custom_html-1.before.json");
  const page35Backup = join(backupDir, "page-35.before.json");
  const post2053Backup = join(backupDir, "post-2053.before.json");
  writeFileSync(widgetBackup, JSON.stringify(widgetBefore.json, null, 2), "utf8");
  writeFileSync(page35Backup, JSON.stringify(page35Before.json, null, 2), "utf8");
  writeFileSync(post2053Backup, JSON.stringify(post2053Before.json, null, 2), "utf8");
  report.backups = { widgetBackup, page35Backup, post2053Backup };

  const widgetRaw = widgetBefore.json.instance?.raw;
  const page35Title = page35Before.json.title?.raw || "";
  const page35Content = page35Before.json.content?.raw || "";
  const post2053Title = post2053Before.json.title?.raw || "";
  const post2053Content = post2053Before.json.content?.raw || "";

  const widgetUpdate = {
    title: widgetRaw.title,
    content: buildWidgetContent(widgetRaw.content),
  };
  const page35Update = {
    title: buildPage35Title(page35Title),
    content: buildPage35Content(page35Content),
  };
  const post2053Update = {
    title: buildPost2053Title(post2053Title),
    content: buildPost2053Content(post2053Content),
  };

  const widgetWrite = await wpFetch("/wp-json/wp/v2/widgets/custom_html-1", {
    method: "POST",
    body: JSON.stringify({ instance: { raw: widgetUpdate } }),
  });
  const page35Write = await wpFetch("/wp-json/wp/v2/pages/35", {
    method: "POST",
    body: JSON.stringify(page35Update),
  });
  const post2053Write = await wpFetch("/wp-json/wp/v2/posts/2053", {
    method: "POST",
    body: JSON.stringify(post2053Update),
  });

  report.updates = {
    widgetStatus: widgetWrite.status,
    page35Status: page35Write.status,
    post2053Status: post2053Write.status,
  };

  if (widgetWrite.status !== 200) throw new Error(`Widget update failed: ${widgetWrite.status} ${widgetWrite.text}`);
  if (page35Write.status !== 200) throw new Error(`Page 35 update failed: ${page35Write.status} ${page35Write.text}`);
  if (post2053Write.status !== 200) throw new Error(`Post 2053 update failed: ${post2053Write.status} ${post2053Write.text}`);

  const home = await fetchPublic(`/?nowprocket=1&codex=${Date.now()}`);
  const qn = await fetchPublic(`/thong-tac-cong-quang-ninh/?nowprocket=1&codex=${Date.now()}`);
  const baiChay = await fetchPublic(`/thong-tac-cong-bai-chay/?nowprocket=1&codex=${Date.now()}`);

  report.public = {
    home: {
      status: home.status,
      hasOldFooter247: home.text.includes("Kinh nghiệm 10+ năm, phục vụ 24/7") || home.text.includes("⏰ Phục vụ 24/7"),
      hasNewFooterHours: home.text.includes("Kinh nghiệm 10+ năm, tiếp nhận 05:00-22:00 hằng ngày") && home.text.includes("⏰ Tiếp nhận 05:00-22:00"),
    },
    qn: {
      status: qn.status,
      has247: /24\/7/.test(qn.text),
      hasNewTitle: qn.text.includes("Dịch vụ thông tắc cống Quảng Ninh - Uy tín, xử lý nhanh"),
      hasNewHours: qn.text.includes("05:00-22:00"),
    },
    baiChay: {
      status: baiChay.status,
      hasOldHongGaiTitle: baiChay.text.includes("Thông tắc cống Hồng Gai Hạ Long 24/7"),
      hasNewHongGaiTitle: baiChay.text.includes("Thông tắc cống Hồng Gai Hạ Long – Ngõ hẹp phố cổ, không đục phá")
        || baiChay.text.includes("Thông tắc cống Hồng Gai Hạ Long &#8211; Ngõ hẹp phố cổ, không đục phá"),
    },
  };

  report.success = Boolean(
    report.public.home.status === 200 &&
    report.public.home.hasNewFooterHours &&
    !report.public.home.hasOldFooter247 &&
    report.public.qn.status === 200 &&
    !report.public.qn.has247 &&
    report.public.qn.hasNewTitle &&
    report.public.qn.hasNewHours &&
    report.public.baiChay.status === 200 &&
    !report.public.baiChay.hasOldHongGaiTitle &&
    report.public.baiChay.hasNewHongGaiTitle
  );

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
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
