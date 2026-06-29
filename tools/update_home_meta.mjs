/**
 * Update home page (ID 23) meta description via Rank Math REST.
 * Run: node tools/update_home_meta.mjs
 */
import fs from 'node:fs';

const PROJECT = 'D:\\.thongtaccongquangninh';
const SITE = 'https://thongtaccongquangninh.com';

function parseEnv(p) {
  const env = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = parseEnv(`${PROJECT}\\.env`);
const auth = 'Basic ' + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString('base64');

const target = {
  id: 23,
  title: 'Hút bể phốt, thông tắc cống Quảng Ninh — tiếp nhận 05:00-22:00',
  description:
    'Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh. Có mặt 15-30 phút, báo giá trước, không phát sinh. Gọi 0963.953.533 / 0931.156.756.',
  keyword: 'hút bể phốt Quảng Ninh',
  score: 90,
};

const len = [...target.description].length;
console.log(`Meta length: ${len} chars`);
if (len < 140 || len > 165) {
  console.error('FAIL: meta length ngoài 140-165');
  process.exit(1);
}

async function wp(path, init = {}) {
  const r = await fetch(`${SITE}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers ?? {}),
    },
  });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!r.ok) throw new Error(`${r.status} ${path}: ${text.slice(0, 200)}`);
  return body;
}

// 1. Backup current state
const current = await wp(`/wp/v2/pages/${target.id}?context=edit`);
const stamp = new Date().toISOString().slice(0, 10);
const backupDir = `${PROJECT}\\seo-revisions\\wp-before-home-meta-${stamp}`;
fs.mkdirSync(backupDir, { recursive: true });
fs.writeFileSync(`${backupDir}\\pages-23-trang-chu.json`, JSON.stringify(current, null, 2));
console.log(`Backup: ${backupDir}\\pages-23-trang-chu.json`);

// 2. Update excerpt (used by some themes)
await wp(`/wp/v2/pages/${target.id}`, {
  method: 'POST',
  body: JSON.stringify({ excerpt: target.description }),
});
console.log('Excerpt updated.');

// 3. Update Rank Math meta
const rm = await wp('/rankmath/v1/updateMeta', {
  method: 'POST',
  body: JSON.stringify({
    objectType: 'post',
    objectID: target.id,
    meta: {
      rank_math_title: target.title,
      rank_math_description: target.description,
      rank_math_focus_keyword: target.keyword,
    },
  }),
});
console.log('Rank Math updateMeta:', JSON.stringify(rm));
