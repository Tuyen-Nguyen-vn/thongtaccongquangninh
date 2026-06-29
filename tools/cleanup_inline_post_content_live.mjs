import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = join(ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const PROJECT_TIMEZONE = "Asia/Bangkok";

const TARGETS = [
  {
    id: 2379,
    slug: "thong-tac-bon-cau-ban-dem-quang-ninh",
    replacements: [
      [
        /<p>Bồn cầu tắc lúc 11 giờ đêm, nước trào ra nền nhà, cả gia đình không vệ sinh được – đó là tình huống không ai muốn nhưng xảy ra thường xuyên hơn bạn nghĩ\. <strong>Gọi ngay 0963\.953\.533<\/strong>, thợ Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận 05:00-22:00, có mặt trong 15 phút, xử lý dứt điểm trong khung 05:00–22:00 hằng ngày\.<\/p>/g,
        "<p>Bồn cầu tắc, nước trào ra nền nhà và cả gia đình không vệ sinh được là tình huống cần xử lý sớm. <strong>Gọi ngay 0963.953.533</strong> trong khung 05:00-22:00 để được điều phối nhanh, báo rõ thời gian có mặt và phương án xử lý phù hợp.</p>",
      ],
      [
        /<p><strong>tiếp nhận 05:00-22:00 hằng ngày thực sự:<\/strong><\/p>\s*<p>Không phải &#8220;tiếp nhận 05:00-22:00, xử lý sáng hôm sau&#8221;\. Thợ trực xử lý nhanh thật sự, điều động được ngay sau cuộc gọi\.<\/p>/g,
        "<p><strong>Tiếp nhận 05:00-22:00 hằng ngày:</strong> Tổng đài chốt nhanh tình trạng, tư vấn phương án phù hợp và báo rõ thời gian có mặt theo khu vực trước khi điều phối thợ.</p>",
      ],
      [
        /<p>Địa chỉ: Quảng Ninh, Việt Nam Hotline: <strong>0963\.953\.533<\/strong> \(chính\) \/ <strong>0931\.156\.756<\/strong> \(phụ\) Zalo: 0963\.953\.533 Website: thongtaccongquangninh\.com Giờ làm việc: <strong>05:00-22:00 – kể cả ngoài khung triển khai chuẩn, cuối tuần, ngày lễ<\/strong><\/p>/g,
        "<p>Địa chỉ: Quảng Ninh, Việt Nam Hotline: <strong>0963.953.533</strong> (chính) / <strong>0931.156.756</strong> (phụ) Zalo: 0963.953.533 Website: thongtaccongquangninh.com Giờ làm việc: <strong>05:00-22:00 hằng ngày</strong></p>",
      ],
      [
        /<p>Có\. Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận và điều thợ <strong>05:00-22:00<\/strong>, kể cả ngoài khung triển khai chuẩn\. Gọi <strong>0963\.953\.533<\/strong>, thợ trực xử lý nhanh tiếp máy ngay và xác nhận thời gian đến\.<\/p>/g,
        "<p>Có. Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận và điều phối trong khung <strong>05:00-22:00</strong> hằng ngày. Gọi <strong>0963.953.533</strong> để được xác nhận thời gian có mặt phù hợp theo khu vực.</p>",
      ],
      [
        /<p><strong>Bồn cầu tắc ngay lúc này\?<\/strong> Đừng để qua đêm\. Gọi <strong>0963\.953\.533<\/strong> hoặc <strong>0931\.156\.756<\/strong> – thợ tiếp nhận 05:00-22:00 hằng ngày, có mặt nhanh, làm sạch không để lại rác, giá báo thẳng trước khi làm\. Zalo cùng số <strong>0963\.953\.533<\/strong> nếu cần nhắn tin trước\.<\/p>/g,
        "<p><strong>Bồn cầu tắc cần xử lý sớm?</strong> Gọi <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong> trong khung 05:00-22:00 hằng ngày để được điều phối nhanh, làm sạch gọn và báo giá rõ trước khi làm. Zalo cùng số <strong>0963.953.533</strong> nếu cần nhắn tin trước.</p>",
      ],
      [
        /"headline":"Thông tắc bồn cầu xử lý nhanh Quảng Ninh: thợ tiếp nhận 05:00-22:00 hằng ngày đến tận nơi"/g,
        '"headline":"Thông tắc bồn cầu Quảng Ninh: thợ xử lý nhanh tận nơi"',
      ],
      [
        /"description":"Thông tắc bồn cầu xử lý nhanh Quảng Ninh: gọi 0963\.953\.533, thợ tiếp nhận 05:00-22:00 hằng ngày, xử lý nhanh không đục phá tại Hạ Long, Cẩm Phả, Uông Bí\. Có báo giá trước khi làm\."/g,
        '"description":"Thông tắc bồn cầu Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày cho ca nghẹt, trào ngược và xử lý tận nơi. Gọi 0963.953.533."',
      ],
    ],
    forbidden: [
      "kể cả ngoài khung triển khai chuẩn",
      "tiếp nhận 05:00-22:00 hằng ngày thực sự",
      "thợ tiếp nhận 05:00-22:00 hằng ngày đến tận nơi",
    ],
  },
  {
    id: 2439,
    slug: "hut-be-phot-24-7-quang-ninh",
    replacements: [
      [
        /<figure class="wp-block-image size-large"><img src="https:\/\/thongtaccongquangninh\.com\/wp-content\/uploads\/2026\/06\/hut-be-phot-24-7-quang-ninh-2026-01\.webp" alt="Hút Bể Phốt Khẩn Cấp Quảng Ninh tại Quảng Ninh – thợ kỹ thuật xử lý tại nhà" loading="lazy"><figcaption>Thợ Môi Trường Đô Thị Số 1 xử lý hút bể phốt 05:00-22:00 Quảng Ninh tại Quảng Ninh<\/figcaption><\/figure>/g,
        '<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/hut-be-phot-24-7-quang-ninh-2026-01.webp" alt="Hút bể phốt Quảng Ninh tại hiện trường - thợ kỹ thuật xử lý thực tế" loading="lazy"><figcaption>Thợ Môi Trường Đô Thị Số 1 xử lý hút bể phốt Quảng Ninh tại hiện trường</figcaption></figure>',
      ],
      [
        /<figure class="wp-block-image size-large"><img src="https:\/\/thongtaccongquangninh\.com\/wp-content\/uploads\/2026\/06\/hut-be-phot-24-7-quang-ninh-2026-03\.webp" alt="Kết quả xử lý hút bể phốt 05:00-22:00 Quảng Ninh – sạch hoàn toàn" loading="lazy"><figcaption>Kết quả thực tế sau khi xử lý hút bể phốt 05:00-22:00 Quảng Ninh – Quảng Ninh 2026<\/figcaption><\/figure>/g,
        '<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/hut-be-phot-24-7-quang-ninh-2026-03.webp" alt="Kết quả xử lý hút bể phốt Quảng Ninh - sạch hoàn toàn" loading="lazy"><figcaption>Kết quả thực tế sau khi xử lý hút bể phốt Quảng Ninh năm 2026</figcaption></figure>',
      ],
      [
        /<p><strong>Hút bể phốt 05:00-22:00<\/strong> không có nghĩa là "chúng tôi nhận điện thoại 05:00-22:00"\. Nó có nghĩa là xe bồn sẵn sàng xuất phát bất kỳ lúc nào – 2 giờ sáng, 11 giờ đêm hay ngày lễ Tết – mà không cần lịch hẹn trước\.<\/p>/g,
        "<p><strong>Dịch vụ hút bể phốt khẩn cấp</strong> tại đây tập trung xử lý ca bể đầy, trào mùi và công trình cần làm sớm trong ngày. Tổng đài tiếp nhận 05:00-22:00 hằng ngày, báo rõ phương án và thời gian có mặt theo khu vực.</p>",
      ],
      [
        /<p><strong>Gọi ngay để nhận báo giá chính xác:<\/strong> <strong>0963\.953\.533<\/strong> hoặc <strong>0931\.156\.756<\/strong> \(Zalo cùng số\)\. Thợ trực ca 05:00-22:00, phản hồi trong vòng 2 phút\.<\/p>/g,
        "<p><strong>Gọi ngay để nhận báo giá chính xác:</strong> <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong> (Zalo cùng số). Tổng đài tiếp nhận 05:00-22:00 hằng ngày và phản hồi nhanh trong ngày.</p>",
      ],
      [
        /<p>Gọi được\. Đội thợ trực ca đêm 05:00-22:00, sẵn sàng xuất phát ngay sau cuộc gọi\. Không thu phụ phí đêm khuya – giá dịch vụ bằng nhau dù gọi lúc 2 giờ sáng hay 10 giờ sáng\.<\/p>/g,
        "<p>Khách nên gọi trong khung 05:00-22:00 để được điều phối nhanh và báo rõ thời gian có mặt theo từng khu vực.</p>",
      ],
      [
        /<p><strong>Bể phốt đang có vấn đề\? Đừng đợi đến sáng\.<\/strong> Gọi ngay <strong>0963\.953\.533<\/strong> hoặc <strong>0931\.156\.756<\/strong> – xe bồn xuất phát trong 15 phút, tiếp nhận 05:00-22:00 hằng ngày khắp Quảng Ninh\. Báo giá tại chỗ, không phụ phí đêm khuya, bảo hành 3 tháng\.<\/p>/g,
        "<p><strong>Bể phốt đang có vấn đề?</strong> Gọi ngay <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong> trong khung 05:00-22:00 hằng ngày để được điều phối nhanh, báo giá tại chỗ và xác nhận thời gian có mặt theo khu vực.</p>",
      ],
      [
        /<figure class="wp-block-image size-large"><img src="https:\/\/thongtaccongquangninh\.com\/wp-content\/uploads\/2026\/06\/hut-be-phot-24-7-quang-ninh-2026-02\.webp" alt="Máy thông tắc chuyên dụng – hút bể phốt 05:00-22:00 Quảng Ninh Hạ Long Cẩm Phả" loading="lazy"><figcaption>Thiết bị hiện đại cho dịch vụ hút bể phốt Quảng Ninh tại Hạ Long<\/figcaption><\/figure>/g,
        '<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/hut-be-phot-24-7-quang-ninh-2026-02.webp" alt="Máy chuyên dụng hỗ trợ hút bể phốt Quảng Ninh tại Hạ Long, Cẩm Phả" loading="lazy"><figcaption>Thiết bị hiện đại cho dịch vụ hút bể phốt Quảng Ninh tại Hạ Long</figcaption></figure>',
      ],
    ],
    forbidden: [
      "Hút bể phốt 05:00-22:00",
      "đội thợ trực ca đêm 05:00-22:00",
      "không phụ phí đêm khuya",
      "Kết quả xử lý hút bể phốt 05:00-22:00 Quảng Ninh",
      "hút bể phốt 05:00-22:00 Quảng Ninh tại Quảng Ninh",
    ],
  },
  {
    id: 2702,
    slug: "hut-be-phot-khach-san-quang-ninh",
    replacements: [
      [
        /<p>``<code>json \{[\s\S]*?<\/code>``<\/p>/g,
        "",
      ],
    ],
    forbidden: [
      "openingHours&quot;: &quot;Mo-Su 00:00-24:00&quot;",
      "Dịch vụ hút bể phốt khách sạn có làm ban đêm không?",
      "Phụ phí ca đêm (22h–6h)",
    ],
  },
  {
    id: 2782,
    slug: "thong-tac-cong-24-7-quang-ninh",
    replacements: [
      [
        /<figure class="wp-block-image size-large"><img src="https:\/\/thongtaccongquangninh\.com\/wp-content\/uploads\/2026\/06\/thong-tac-cong-24-7-quang-ninh-01\.webp" alt="Thông Tắc Cống Khẩn Cấp Quảng Ninh tại Quảng Ninh – thợ kỹ thuật xử lý tại nhà" loading="lazy"><figcaption>Thợ Môi Trường Đô Thị Số 1 xử lý thông tắc cống Quảng Ninh tại hiện trường<\/figcaption><\/figure>/g,
        '<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-24-7-quang-ninh-01.webp" alt="Thông tắc cống Quảng Ninh tại hiện trường - thợ kỹ thuật xử lý thực tế" loading="lazy"><figcaption>Thợ Môi Trường Đô Thị Số 1 xử lý thông tắc cống Quảng Ninh tại hiện trường</figcaption></figure>',
      ],
      [
        /<figure class="wp-block-image size-large"><img src="https:\/\/thongtaccongquangninh\.com\/wp-content\/uploads\/2026\/06\/thong-tac-cong-24-7-quang-ninh-03\.webp" alt="Kết quả xử lý thông tắc cống 05:00-22:00 Quảng Ninh – sạch hoàn toàn" loading="lazy"><figcaption>Kết quả thực tế sau khi xử lý thông tắc cống Quảng Ninh năm 2026<\/figcaption><\/figure>/g,
        '<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-24-7-quang-ninh-03.webp" alt="Kết quả xử lý thông tắc cống Quảng Ninh - sạch hoàn toàn" loading="lazy"><figcaption>Kết quả thực tế sau khi xử lý thông tắc cống Quảng Ninh năm 2026</figcaption></figure>',
      ],
      [
        /<li><strong>05:00-22:00 thật sự<\/strong> — không phải "05:00-22:00 có nhận tin nhắn"\. Thợ xuất phát ngay khi nhận cuộc gọi\.<\/li>/g,
        '<li><strong>Tiếp nhận 05:00-22:00 hằng ngày</strong> — tổng đài chốt tình trạng, điều phối nhanh và báo rõ thời gian có mặt theo khu vực.</li>',
      ],
      [
        /<h2>Khu Vực tiếp nhận 05:00-22:00 hằng ngày<\/h2>/g,
        "<h2>Khu vực phục vụ và hotline liên hệ</h2>",
      ],
      [
        /<p>Không\. Giá thông tắc cống tại Môi Trường Đô Thị Số 1 Quảng Ninh áp dụng đồng nhất 05:00-22:00, không phân biệt giờ hành chính hay ngoài giờ, ngày thường hay ngày lễ\. Giá được báo trước khi làm và không có phụ phí phát sinh\.<\/p>/g,
        "<p>Giá thông tắc cống được báo trước khi làm trong khung tiếp nhận 05:00-22:00 hằng ngày, không tự ý cộng thêm chi phí khi chưa thống nhất với khách.</p>",
      ],
      [
        /<p><strong>Liên hệ ngay — tiếp nhận 05:00-22:00 hằng ngày kể cả Tết:<\/strong><br \/>/g,
        "<p><strong>Liên hệ ngay trong khung 05:00-22:00 hằng ngày:</strong><br />",
      ],
      [
        /"serviceType":"Thông tắc cống 05:00-22:00"/g,
        '"serviceType":"Thông tắc cống khẩn cấp"',
      ],
      [
        /"description":"Dịch vụ thông tắc cống 05:00-22:00 tại Quảng Ninh, xử lý nước trào, mùi hôi, cống nghẹt ban đêm, báo giá rõ trước khi làm\."/g,
        '"description":"Dịch vụ thông tắc cống tại Quảng Ninh, xử lý nước trào, mùi hôi và cống nghẹt nặng, báo giá rõ trước khi làm."',
      ],
      [
        /<figure class="wp-block-image size-large"><img src="https:\/\/thongtaccongquangninh\.com\/wp-content\/uploads\/2026\/06\/thong-tac-cong-gieng-day-may-lo-xo-03\.webp" alt="Máy lò xo thông tắc cống 05:00-22:00 tại Quảng Ninh không đục phá" loading="lazy"><figcaption>Máy lò xo xử lý cống nghẹt tại Quảng Ninh, hạn chế đục phá nền nhà\.<\/figcaption><\/figure>/g,
        '<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-gieng-day-may-lo-xo-03.webp" alt="Máy lò xo thông tắc cống tại Quảng Ninh, hạn chế đục phá" loading="lazy"><figcaption>Máy lò xo xử lý cống nghẹt tại Quảng Ninh, hạn chế đục phá nền nhà.</figcaption></figure>',
      ],
    ],
    forbidden: [
      'serviceType":"Thông tắc cống 05:00-22:00"',
      'description":"Dịch vụ thông tắc cống 05:00-22:00',
      '05:00-22:00 có nhận tin nhắn',
      "Khu Vực tiếp nhận 05:00-22:00 hằng ngày",
      "Kết quả xử lý thông tắc cống 05:00-22:00 Quảng Ninh",
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
      "User-Agent": "Codex cleanup-inline-post-content-live",
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

function applyReplacements(raw, replacements) {
  return replacements.reduce((acc, [pattern, value]) => acc.replace(pattern, value), raw);
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
    throw new Error("Missing WP auth in .env");
  }

  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const stamp = formatProjectStamp(new Date());
  const backupDir = join(ROOT, "backups", `cleanup-inline-post-content-live-${stamp}`);
  const reportPath = join(ROOT, "reports", `cleanup-inline-post-content-live-${stamp}.json`);
  mkdirSync(backupDir, { recursive: true });
  mkdirSync(dirname(reportPath), { recursive: true });

  const report = {
    generatedAt: formatProjectTimestamp(new Date()),
    backupDir,
    reportPath,
    targets: [],
    public: [],
    success: false,
  };

  for (const target of TARGETS) {
    const current = await wp(`/wp-json/wp/v2/posts/${target.id}?context=edit`, auth);
    const before = current.json?.content?.raw || "";
    const after = applyReplacements(before, target.replacements);
    const backupPath = join(backupDir, `post-${target.id}-${target.slug}.before.json`);
    writeFileSync(backupPath, JSON.stringify(current.json, null, 2), "utf8");
    let updateStatus = null;
    let changed = false;
    if (after !== before) {
      changed = true;
      const update = await wp(`/wp-json/wp/v2/posts/${target.id}`, auth, {
        method: "POST",
        body: JSON.stringify({ content: after }),
      });
      updateStatus = update.status;
    }
    report.targets.push({
      id: target.id,
      slug: target.slug,
      backupPath,
      changed,
      updateStatus,
      ok: !changed || updateStatus === 200,
    });
  }

  for (const target of TARGETS) {
    const url = `${BASE_URL}/${target.slug}/?nowprocket=1&codex=${stamp}`;
    const response = await fetch(url, { headers: { "User-Agent": "Codex cleanup-inline-post-content-live" } });
    const html = await response.text();
    const hits = target.forbidden.filter((needle) => html.includes(needle));
    report.public.push({
      id: target.id,
      path: `/${target.slug}/`,
      status: response.status,
      ok: response.ok && hits.length === 0,
      hits,
    });
  }

  report.success = report.targets.every((item) => item.ok) && report.public.every((item) => item.ok);
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
