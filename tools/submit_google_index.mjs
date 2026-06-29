/**
 * Submit URL từ inventory mới nhất lên Google Index qua Rank Math Instant Indexing API.
 * Đọc URL từ reports/url-inventory-YYYY-MM-DD.json (file mới nhất).
 * Usage: node tools/submit_google_index.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { submitIndexingUrl } from './lib/google_indexing_api.mjs';

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
const WP_USER = env.WP_USERNAME;
const WP_PASS = env.WP_APP_PASSWORD;

// Find most recent inventory file
const reportsDir = `${PROJECT}\\reports`;
const invFiles = fs.readdirSync(reportsDir).filter((f) => f.startsWith('url-inventory-') && f.endsWith('.json')).sort().reverse();
if (invFiles.length === 0) {
  console.error('No url-inventory-*.json file found. Run audit_site_full.mjs first.');
  process.exit(1);
}
const invPath = path.join(reportsDir, invFiles[0]);
console.log(`[INDEX] Reading: ${invPath}`);
const inventory = JSON.parse(fs.readFileSync(invPath, 'utf8'));

// Filter: chỉ URL trả 200 (đã verify ở audit)
const auditPath = path.join(reportsDir, `site-full-audit-${invFiles[0].slice('url-inventory-'.length, -5)}.json`);
let liveAudit = null;
if (fs.existsSync(auditPath)) {
  liveAudit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
}

const URLS = inventory
  .filter((it) => {
    if (!liveAudit) return true;
    const a = liveAudit.audit.find((x) => x.link === it.link);
    return !a || a.fetchStatus === 200;
  })
  .map((it) => it.link.replace(/\/$/, '') + '/');

console.log(`[INDEX] Submitting ${URLS.length} URLs via Google Indexing API...`);
console.log(`[INDEX] Time: ${new Date().toISOString()}`);
const submitResults = [];
for (const url of URLS) {
  const res = await submitIndexingUrl(PROJECT, url);
  submitResults.push({ url, ok: res.ok, status: res.status ?? 0, payload: res.payload ?? null });
}
const successCount = submitResults.filter((item) => item.ok).length;
const failCount = submitResults.length - successCount;
const submitOk = failCount === 0;
const submitStatus = submitOk ? 200 : 207;
const submitBody = JSON.stringify({ ok: submitOk, successCount, failCount, sample: submitResults.slice(0, 5) });
console.log(`[INDEX] Success: ${successCount}/${URLS.length}`);
console.log(`[INDEX] Fail: ${failCount}/${URLS.length}`);
console.log(`[INDEX] Submit response: ${submitBody.slice(0, 500)}`);

const result = {
  submittedAt: new Date().toISOString(),
  urlCount: URLS.length,
  submitStatus,
  submitOk,
  submitResponse: submitBody,
  urls: URLS,
  results: submitResults,
};

const outFile = `${PROJECT}\\SEO_GOOGLE_INDEX_${new Date().toISOString().slice(0, 10)}.json`;
fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
console.log(`[INDEX] Result saved to: ${outFile}`);

if (result.submitOk) {
  console.log(`\n=== THANH CONG: Submit ${URLS.length} URL ===`);
} else {
  console.log(`\n=== LOI: Submit that bai, status ${submitStatus} ===`);
  process.exit(1);
}
