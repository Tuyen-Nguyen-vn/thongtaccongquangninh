import { readFileSync, writeFileSync } from 'node:fs';

const TOKEN_FILE = String.raw`D:\.thongtaccongquangninh\secrets\token_webmasters.json`;
const token = JSON.parse(readFileSync(TOKEN_FILE, 'utf8'));

async function httpJson(url, method = 'GET', body = null, headers = {}) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : {} };
}

// Refresh access token
const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: token.client_id,
    client_secret: token.client_secret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token'
  })
});
const refreshData = await refreshRes.json();
if (!refreshData.access_token) {
  console.error('Refresh token thất bại:', JSON.stringify(refreshData));
  process.exit(1);
}

token.token = refreshData.access_token;
token.expiry = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();
writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2));
console.log('Token mới, hết hạn:', token.expiry);

const AT = refreshData.access_token;
const SITE = 'https://thongtaccongquangninh.com/';
const SITEMAP = 'https://thongtaccongquangninh.com/news-sitemap.xml';
const BASE = 'https://www.googleapis.com/webmasters/v3';

// Submit news sitemap
const submit = await fetch(
  `${BASE}/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(SITEMAP)}`,
  { method: 'PUT', headers: { Authorization: `Bearer ${AT}`, 'Content-Length': '0' } }
);
console.log('Submit HTTP:', submit.status);
if (submit.status === 200 || submit.status === 204) {
  console.log('✓ news-sitemap.xml đã submit vào Google Search Console');
} else {
  const err = await submit.text();
  console.error('Lỗi submit:', err.substring(0, 400));
}

// List all sitemaps
const list = await httpJson(
  `${BASE}/sites/${encodeURIComponent(SITE)}/sitemaps`,
  'GET', null, { Authorization: `Bearer ${AT}` }
);
console.log('\nTất cả sitemaps trong GSC:');
(list.body.sitemap || []).forEach(s => {
  const status = s.isPending ? 'pending' : (s.errors > 0 ? `${s.errors} errors` : 'OK');
  console.log(` - ${s.path} | ${status} | lastDownloaded: ${s.lastDownloaded || 'chưa crawl'}`);
});
