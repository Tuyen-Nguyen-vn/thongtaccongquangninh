/**
 * Google Indexing API (trực tiếp, service account) — push URL mới/sửa ngay.
 * Khác với submit_google_index.mjs (dùng Rank Math proxy).
 *
 * Auth: Service Account JSON trong secrets/indexing_service_account.json
 * Quota: 200 URL/ngày.
 *
 * Usage:
 *   node tools/google_indexing_direct.mjs https://thongtaccongquangninh.com/bai-viet/
 *   node tools/google_indexing_direct.mjs --file reports/new-urls.txt
 *   node tools/google_indexing_direct.mjs --type URL_DELETED https://example.com/old-url/
 */

import fs from 'node:fs';
import path from 'node:path';
import { createSign } from 'node:crypto';

const ROOT   = path.resolve(import.meta.dirname, '..');
const SA_KEY = path.join(ROOT, 'secrets', 'indexing_service_account.json');
const SCOPE  = 'https://www.googleapis.com/auth/indexing';
const API    = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

// ── JWT / OAuth2 dùng service account ────────────────────────────────────

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getAccessToken(sa) {
  const now    = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claim  = base64url(Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })));

  const sign  = createSign('RSA-SHA256');
  sign.update(`${header}.${claim}`);
  const sig   = base64url(sign.sign(sa.private_key));
  const jwt   = `${header}.${claim}.${sig}`;

  const body  = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt });
  const resp  = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
  const json  = await resp.json();

  if (!json.access_token) throw new Error(`Token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

// ── Submit một URL ────────────────────────────────────────────────────────

async function submitUrl(token, url, type = 'URL_UPDATED') {
  const resp = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type }),
  });
  const json = await resp.json();
  const ok   = resp.ok && json.urlNotificationMetadata;
  console.log(`  [${ok ? 'OK' : 'ERR'}] ${url} (${type}) — ${ok ? 'đã gửi' : JSON.stringify(json.error || json)}`);
  return { url, ok, status: resp.status };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(SA_KEY)) {
    console.error(`Thiếu: ${SA_KEY}`);
    console.error('Xem docs/google-apis-setup.md để tạo Service Account và tải JSON key.');
    process.exit(1);
  }

  const sa    = JSON.parse(fs.readFileSync(SA_KEY, 'utf8'));
  const args  = process.argv.slice(2);
  let type    = 'URL_UPDATED';
  const urls  = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type')         { type = args[++i]; }
    else if (args[i] === '--file')    { urls.push(...fs.readFileSync(args[++i], 'utf8').split(/\r?\n/).filter(Boolean)); }
    else if (args[i].startsWith('http')) { urls.push(args[i]); }
  }

  if (urls.length === 0) {
    console.log('Usage: node tools/google_indexing_direct.mjs <url> [<url2> ...] [--file urls.txt] [--type URL_UPDATED|URL_DELETED]');
    process.exit(0);
  }

  console.log(`[INDEXING] ${urls.length} URL | type: ${type}`);
  const token   = await getAccessToken(sa);
  const results = [];
  for (const url of urls) {
    results.push(await submitUrl(token, url, type));
    // tránh rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  const ok  = results.filter(r => r.ok).length;
  const err = results.length - ok;
  console.log(`\n[INDEXING] Xong: ${ok} thành công, ${err} lỗi.`);
  if (err > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
