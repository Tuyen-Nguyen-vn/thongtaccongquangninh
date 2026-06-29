import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:\\.thongtaccongquangninh';
const REPORTS_DIR = path.join(ROOT, 'reports');
const ENV_PATH = path.join(ROOT, '.env');
const WRITE = process.argv.includes('--write');
const STAMP = new Date().toISOString().replace(/[:.]/g, '-');
const REPORT_PATH = path.join(REPORTS_DIR, `fix-image-alt-warnings-2026-06-13-${STAMP}.json`);

function parseEnv(file) {
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const BASE = (env.WP_BASE_URL || 'https://thongtaccongquangninh.com').replace(/\/$/, '');
const AUTH = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString('base64')}`;

const fixes = [
  {
    id: 2045,
    type: 'posts',
    slug: 'hoa-chat-tu-thong-cong',
    replacements: [
      {
        src: 'hoa-chat-thong-cong-an-toan-quang-ninh-01.webp',
        old: 'Hóa chất thông cống chỉ nên dùng khi xác định đúng loại tắc và vật liệu đường ống',
        next: 'Hóa chất thông cống Quảng Ninh chỉ nên dùng khi xác định đúng loại tắc và vật liệu đường ống',
      },
      {
        src: 'thong-tac-cong-chuyen-nghiep-quang-ninh-02.webp',
        old: 'Tắc cống nặng cần thiết bị cơ học thay vì lạm dụng hóa chất mạnh',
        next: 'Thông tắc cống Quảng Ninh tắc nặng cần thiết bị cơ học thay vì lạm dụng hóa chất mạnh',
      },
      {
        src: 'hoa-chat-tu-thong-cong-3-may-lo-xo-thong-cong-3.webp',
        old: 'Thợ dùng máy lò xo xử lý cống tắc khi hóa chất không hiệu quả',
        next: 'Thợ thông tắc cống Quảng Ninh dùng máy lò xo khi hóa chất không hiệu quả',
      },
    ],
  },
  {
    id: 2048,
    type: 'posts',
    slug: 'hut-be-phot-binh-lieu',
    replacements: [
      {
        src: 'hut-be-phot-binh-lieu-quang-ninh-case-study.webp',
        old: 'Đội thợ xử lý bể phốt bùn cứng vùng cao Bình Liêu',
        next: 'Đội thợ hút bể phốt Bình Liêu Quảng Ninh xử lý bể bùn cứng vùng cao',
      },
    ],
  },
  {
    id: 2049,
    type: 'posts',
    slug: 'hut-be-phot-co-to',
    replacements: [
      {
        src: 'hut-be-phot-co-to-quang-ninh-case-study.webp',
        old: 'Đội thợ xử lý bể phốt bùn cứng đảo Cô Tô – bùn chở ra đất liền',
        next: 'Đội thợ hút bể phốt Cô Tô Quảng Ninh xử lý bể bùn cứng trên đảo',
      },
    ],
  },
  {
    id: 2050,
    type: 'posts',
    slug: 'hut-be-phot-dam-ha',
    replacements: [
      {
        src: 'hut-be-phot-dam-ha-quang-ninh-case-study.webp',
        old: 'Đội thợ xử lý bể phốt nhà hàng và trang trại huyện Đầm Hà',
        next: 'Đội thợ hút bể phốt Đầm Hà Quảng Ninh xử lý bể nhà hàng và trang trại',
      },
    ],
  },
  {
    id: 2051,
    type: 'posts',
    slug: 'hut-be-phot-hai-ha',
    replacements: [
      {
        src: 'hut-be-phot-hai-ha-quang-ninh-case-study.webp',
        old: 'Đội thợ xử lý bể phốt cơ sở chế biến hải sản Hải Hà',
        next: 'Đội thợ hút bể phốt Hải Hà Quảng Ninh xử lý bể cơ sở chế biến hải sản',
      },
    ],
  },
  {
    id: 2046,
    type: 'posts',
    slug: 'mui-hoi-cong-nguyen-nhan-xu-ly',
    replacements: [
      {
        src: 'mui-hoi-cong-nguyen-nhan-xu-ly-anh-dau-bai-1.webp',
        old: 'Mùi hôi từ cống thường liên quan xi phông khô, hố ga hoặc bể phốt đầy',
        next: 'Mùi hôi cống Quảng Ninh thường liên quan xi phông khô, hố ga hoặc bể phốt đầy',
      },
      {
        src: 'mui-hoi-cong-nguyen-nhan-xu-ly-xu-ly-mui-1.webp',
        old: 'Kiểm tra nguồn mùi giúp xử lý đúng điểm thay vì che mùi tạm thời',
        next: 'Thợ xử lý mùi hôi cống Quảng Ninh kiểm tra đúng nguồn thay vì che mùi tạm thời',
      },
    ],
  },
  {
    id: 2356,
    type: 'pages',
    slug: 'nguyen-song-hao',
    replacements: [
      {
        src: 'bang-khen-bo-tai-nguyen-moi-truong-cong-ty-dong-bac-2023-ha-long.jpg',
        old: 'Bằng khen Bộ Tài nguyên và Môi trường tặng Công ty Cổ phần Môi Trường Đông Bắc năm 2023',
        next: 'Bằng khen Bộ Tài nguyên và Môi trường tại Hạ Long Quảng Ninh của Công ty Cổ phần Môi Trường Đông Bắc năm 2023',
      },
    ],
  },
];

async function wp(pathname, options = {}) {
  const response = await fetch(`${BASE}/wp-json/wp/v2/${pathname}`, {
    ...options,
    headers: {
      Authorization: AUTH,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Codex image alt fix 2026-06-13',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) throw new Error(`${response.status} ${pathname}: ${text.slice(0, 300)}`);
  return payload;
}

async function findMediaByFilename(filename) {
  const needle = filename.toLowerCase();
  const search = encodeURIComponent(filename.replace(/\.[^.]+$/, '').replace(/-\d+$/, ''));
  const items = await wp(`media?search=${search}&per_page=50&_fields=id,source_url,alt_text`);
  return items.find((item) => String(item.source_url || '').toLowerCase().includes(needle)) || null;
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: WRITE ? 'write' : 'dry-run',
  fixes: [],
};

for (const fix of fixes) {
  const post = await wp(`${fix.type}/${fix.id}?context=edit`);
  const raw = post.content?.raw || '';
  let nextRaw = raw;
  const pageReport = {
    id: fix.id,
    type: fix.type,
    slug: fix.slug,
    changedContent: false,
    replacements: [],
    mediaUpdates: [],
    backupRaw: raw,
  };

  for (const item of fix.replacements) {
    const found = nextRaw.includes(item.old);
    if (found) nextRaw = nextRaw.split(item.old).join(item.next);
    const media = await findMediaByFilename(item.src);
    pageReport.replacements.push({ src: item.src, found, old: item.old, next: item.next });
    pageReport.mediaUpdates.push({
      src: item.src,
      mediaId: media?.id || null,
      oldAlt: media?.alt_text || null,
      nextAlt: item.next,
      changed: Boolean(media && media.alt_text !== item.next),
    });
  }

  pageReport.changedContent = nextRaw !== raw;
  if (WRITE && pageReport.changedContent) {
    await wp(`${fix.type}/${fix.id}`, {
      method: 'POST',
      body: JSON.stringify({ content: nextRaw }),
    });
  }

  if (WRITE) {
    for (const mediaUpdate of pageReport.mediaUpdates) {
      if (!mediaUpdate.mediaId || !mediaUpdate.changed) continue;
      await wp(`media/${mediaUpdate.mediaId}`, {
        method: 'POST',
        body: JSON.stringify({ alt_text: mediaUpdate.nextAlt }),
      });
    }
  }

  report.fixes.push(pageReport);
}

fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  mode: report.mode,
  report: REPORT_PATH,
  pages: report.fixes.length,
  contentChanges: report.fixes.filter((item) => item.changedContent).length,
  mediaChanges: report.fixes.flatMap((item) => item.mediaUpdates).filter((item) => item.changed).length,
}, null, 2));
