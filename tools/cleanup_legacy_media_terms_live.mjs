import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = join(ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const PROJECT_TIMEZONE = "Asia/Bangkok";

const MEDIA_UPDATES = [
  {
    id: 2370,
    alt_text: "Biển hiệu cổng Công ty Môi Trường Đô Thị Số 1 Quảng Ninh tại Hạ Long",
    title: "Biển hiệu Công ty Môi Trường Đô Thị Số 1 Quảng Ninh",
    caption: "Trụ sở Công ty Môi Trường Đô Thị Số 1 Quảng Ninh tại Hạ Long",
  },
  {
    id: 2371,
    alt_text: "Đội ngũ kỹ thuật viên hút bể phốt và thông tắc cống tại Hạ Long Quảng Ninh",
    title: "Đội ngũ kỹ thuật viên môi trường Hạ Long",
    caption: "12 kỹ thuật viên Môi Trường Đô Thị Số 1 sẵn sàng điều phối nhanh tại Hạ Long",
  },
  {
    id: 2372,
    alt_text: "Đội ngũ kỹ thuật viên hút bể phốt và thông tắc cống tại Hạ Long Quảng Ninh",
    title: "Đội ngũ kỹ thuật viên môi trường Hạ Long",
    caption: "12 kỹ thuật viên Môi Trường Đô Thị Số 1 sẵn sàng điều phối nhanh tại Hạ Long",
  },
  {
    id: 2375,
    alt_text: "Đội ngũ kỹ thuật Môi Trường Đô Thị Số 1 Quảng Ninh sẵn sàng điều phối nhanh",
    title: "Đội ngũ kỹ thuật Môi Trường Đô Thị Số 1 Quảng Ninh",
    caption: "Đội kỹ thuật chuyên nghiệp, điều phối nhanh dịch vụ thông tắc cống và hút bể phốt Quảng Ninh",
  },
  {
    id: 2376,
    alt_text: "Xe hút bể phốt Isuzu chuyên dụng Công ty Môi Trường Đô Thị Số 1 Quảng Ninh",
    title: "Xe hút bể phốt Isuzu chuyên dụng Quảng Ninh",
    caption: "Xe hút bể phốt Isuzu biển số 14C-352.11 sẵn sàng điều phối tại Hạ Long, Quảng Ninh",
  },
  {
    id: 2381,
    alt_text: "Máy lò xo Tornado thông tắc bồn cầu tại khách sạn Bãi Cháy Quảng Ninh",
    title: "Máy lò xo thông bồn cầu không đục phá - Quảng Ninh",
    caption: "Máy lò xo Tornado D200 xử lý tắc bồn cầu tại Quảng Ninh, không đục phá gạch",
  },
  {
    id: 2382,
    alt_text: "Bảng giá thông tắc bồn cầu xử lý nhanh Quảng Ninh 2026",
    title: "Bảng giá thông tắc bồn cầu xử lý nhanh tại Quảng Ninh 2026",
    caption: "Bảng giá thông tắc bồn cầu xử lý nhanh tại Quảng Ninh 2026 - minh bạch, báo trước khi làm",
  },
  {
    id: 2440,
    alt_text: "Hút bể phốt Quảng Ninh tại hiện trường - thợ kỹ thuật xử lý thực tế",
    title: "Hút bể phốt Quảng Ninh - xe bồn xử lý thực tế",
    caption: "Thợ Môi Trường Đô Thị Số 1 xử lý hút bể phốt Quảng Ninh tại hiện trường",
  },
  {
    id: 2441,
    alt_text: "Máy chuyên dụng hỗ trợ hút bể phốt Quảng Ninh tại Hạ Long, Cẩm Phả",
    title: "Thiết bị hút bể phốt Quảng Ninh",
    caption: "Thiết bị hiện đại cho dịch vụ hút bể phốt Quảng Ninh tại Hạ Long",
  },
  {
    id: 2442,
    alt_text: "Kết quả xử lý hút bể phốt Quảng Ninh - sạch hoàn toàn",
    title: "Kết quả hút bể phốt Quảng Ninh",
    caption: "Kết quả thực tế sau khi xử lý hút bể phốt Quảng Ninh năm 2026",
  },
  {
    id: 2569,
    alt_text: "Thông tắc cống Bãi Cháy bằng máy lò xo – Môi Trường Đô Thị Số 1 Quảng Ninh",
    title: "Thông tắc cống Bãi Cháy",
    caption: "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh trong khung giờ hoạt động. Hotline: 0963.953.533",
  },
  {
    id: 2573,
    alt_text: "Thông tắc cống Bãi Cháy bằng máy lò xo – Môi Trường Đô Thị Số 1 Quảng Ninh",
    title: "Thông tắc cống Bãi Cháy",
    caption: "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh trong khung giờ hoạt động. Hotline: 0963.953.533",
  },
  {
    id: 2594,
    alt_text: "Thông tắc cống Bãi Cháy bằng máy lò xo – Môi Trường Đô Thị Số 1 Quảng Ninh",
    title: "Thông tắc cống Bãi Cháy",
    caption: "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh trong khung giờ hoạt động. Hotline: 0963.953.533",
  },
  {
    id: 2783,
    alt_text: "Thông tắc cống Quảng Ninh tại hiện trường - thợ kỹ thuật xử lý thực tế",
    title: "Thông tắc cống Quảng Ninh - thi công thực tế",
    caption: "Thợ Môi Trường Đô Thị Số 1 xử lý thông tắc cống Quảng Ninh tại hiện trường",
  },
  {
    id: 2784,
    alt_text: "Máy thông tắc chuyên dụng phục vụ thông tắc cống Quảng Ninh tại Hạ Long, Cẩm Phả",
    title: "Thiết bị thông tắc cống Quảng Ninh",
    caption: "Thiết bị hiện đại cho dịch vụ thông tắc cống Quảng Ninh tại Hạ Long",
  },
  {
    id: 2785,
    alt_text: "Kết quả xử lý thông tắc cống Quảng Ninh - sạch hoàn toàn",
    title: "Kết quả thông tắc cống Quảng Ninh",
    caption: "Kết quả thực tế sau khi xử lý thông tắc cống Quảng Ninh năm 2026",
  },
  {
    id: 2894,
    alt_text: "Thông tắc cống Bãi Cháy bằng máy lò xo – Môi Trường Đô Thị Số 1 Quảng Ninh",
    title: "Thông tắc cống Bãi Cháy",
    caption: "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh trong khung giờ hoạt động. Hotline: 0963.953.533",
  },
  {
    id: 2989,
    alt_text: "Đội ngũ thợ thông tắc cống Quảng Ninh sẵn sàng điều phối nhanh",
    title: "Đội ngũ thợ thông tắc cống Quảng Ninh",
    caption: "Kỹ thuật viên và xe bồn chuyên dụng sẵn sàng điều phối nhanh trên nhiều địa bàn",
  },
  {
    id: 3037,
    alt_text: "Thông tắc cống Bãi Cháy bằng máy lò xo – Môi Trường Đô Thị Số 1 Quảng Ninh",
    title: "Thông tắc cống Bãi Cháy",
    caption: "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh trong khung giờ hoạt động. Hotline: 0963.953.533",
  },
  {
    id: 3040,
    alt_text: "Thông tắc cống Bãi Cháy bằng máy lò xo – Môi Trường Đô Thị Số 1 Quảng Ninh",
    title: "Thông tắc cống Bãi Cháy",
    caption: "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh trong khung giờ hoạt động. Hotline: 0963.953.533",
  },
  {
    id: 3044,
    alt_text: "Thông tắc cống Bãi Cháy bằng máy lò xo – Môi Trường Đô Thị Số 1 Quảng Ninh",
    title: "Thông tắc cống Bãi Cháy",
    caption: "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh trong khung giờ hoạt động. Hotline: 0963.953.533",
  },
  {
    id: 3082,
    alt_text: "Ảnh minh họa xe hút bể phốt chuyên dụng phục vụ khách sạn tại Quảng Ninh",
    title: "Xe hút bể phốt khách sạn Quảng Ninh",
    caption: "Xe hút bể phốt chuyên dụng của Môi Trường Đô Thị Số 1 phục vụ khách sạn tại Quảng Ninh",
  },
];

const PUBLIC_CHECKS = [
  {
    path: "/thong-tac-bon-cau-ban-dem-quang-ninh/",
    forbidden: [
      "Bảng giá thông tắc bồn cầu ban đêm tại Quảng Ninh 2026",
      "Máy lò xo Tornado D200 xử lý tắc bồn cầu ban đêm",
      "Thợ thông tắc bồn cầu ban đêm tại nhà dân Hạ Long Quảng Ninh",
    ],
  },
  {
    path: "/hut-be-phot-24-7-quang-ninh/",
    forbidden: [
      "Hút Bể Phốt 24/7 Quảng Ninh tại Quảng Ninh",
      "Thiết bị hiện đại cho dịch vụ hút bể phốt 24/7 Quảng Ninh tại Hạ Long",
      "Kết quả thực tế sau khi xử lý hút bể phốt 24/7 Quảng Ninh – Quảng Ninh 2026",
    ],
  },
  {
    path: "/thong-tac-cong-24-7-quang-ninh/",
    forbidden: [
      "Thiết bị hiện đại cho dịch vụ thông tắc cống 24/7 Quảng Ninh tại Hạ Long",
      "Kết quả thực tế sau khi xử lý thông tắc cống 24/7 Quảng Ninh – Quảng Ninh 2026",
    ],
  },
  {
    path: "/hut-be-phot-khach-san-quang-ninh/",
    forbidden: [
      "phục vụ khách sạn tại Quảng Ninh 24/7",
    ],
  },
  {
    path: "/thong-tac-cong-bai-chay/",
    forbidden: [
      "Dịch vụ thông tắc cống Bãi Cháy 24/7",
    ],
  },
];

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
      "User-Agent": "Codex cleanup-legacy-media-terms-live",
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

function containsLegacyTerms(text) {
  return /24\/7|ban đêm|ban-dem/i.test(text);
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
    throw new Error("Missing WP auth in .env");
  }
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const stamp = formatProjectStamp(new Date());
  const backupDir = join(ROOT, "backups", `cleanup-legacy-media-terms-live-${stamp}`);
  const reportPath = join(ROOT, "reports", `cleanup-legacy-media-terms-live-${stamp}.json`);
  mkdirSync(backupDir, { recursive: true });
  mkdirSync(dirname(reportPath), { recursive: true });

  const report = {
    generatedAt: formatProjectTimestamp(new Date()),
    backupDir,
    reportPath,
    items: [],
    public: [],
    success: false,
  };

  for (const item of MEDIA_UPDATES) {
    const before = await wp(`/wp-json/wp/v2/media/${item.id}?context=edit`, auth);
    const backupPath = join(backupDir, `media-${item.id}.before.json`);
    writeFileSync(backupPath, JSON.stringify(before.json, null, 2), "utf8");
    const payload = {
      alt_text: item.alt_text,
      title: item.title,
      caption: item.caption,
    };
    const update = await wp(`/wp-json/wp/v2/media/${item.id}`, auth, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const after = await wp(`/wp-json/wp/v2/media/${item.id}?context=edit`, auth);
    const joined = [after.json?.alt_text, after.json?.title?.raw || after.json?.title?.rendered, after.json?.caption?.raw || after.json?.caption?.rendered]
      .filter(Boolean)
      .join(" ");
    report.items.push({
      id: item.id,
      backupPath,
      ok: !containsLegacyTerms(joined),
      alt_text: after.json?.alt_text || "",
      title: after.json?.title?.raw || after.json?.title?.rendered || "",
      caption: after.json?.caption?.raw || after.json?.caption?.rendered || "",
      updateStatus: update.status,
    });
  }

  for (const check of PUBLIC_CHECKS) {
    const url = `${BASE_URL}${check.path}?nowprocket=1&codex=${stamp}`;
    const response = await fetch(url, { headers: { "User-Agent": "Codex cleanup-legacy-media-terms-live" } });
    const html = await response.text();
    const hits = check.forbidden.filter((needle) => html.includes(needle));
    report.public.push({
      path: check.path,
      status: response.status,
      ok: response.ok && hits.length === 0,
      hits,
    });
  }

  report.success =
    report.items.every((item) => item.ok && item.updateStatus === 200) &&
    report.public.every((item) => item.ok);

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ reportPath, backupDir, success: report.success }, null, 2));
  if (!report.success) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
