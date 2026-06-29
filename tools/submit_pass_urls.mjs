import fs from 'fs';
import { submitIndexingUrl } from './lib/google_indexing_api.mjs';

const SITE = 'https://thongtaccongquangninh.com';
let WP_USER = 'chatgpt';
let WP_PASS = 'G62y T4fU 41TV IqJ0 04ae lT2i'; // fallback

try {
  const envPath = 'C:/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const userMatch = envContent.match(/^WP_USERNAME\s*=\s*(.*)$/m);
    const passMatch = envContent.match(/^WP_APP_PASSWORD\s*=\s*(.*)$/m);
    if (userMatch) WP_USER = userMatch[1].trim().replace(/['"]/g, '');
    if (passMatch) WP_PASS = passMatch[1].trim().replace(/['"]/g, '');
  }
} catch (e) {
  console.log('[INDEX] Warning: Could not read .env file, using fallback credentials.');
}

const passUrls = JSON.parse(fs.readFileSync("D:\\.thongtaccongquangninh\\reports\\ai_overview_pass_urls.json", "utf-8"));

async function submitUrls() {
  console.log(`[INDEX] Submitting ${passUrls.length} PASS URLs via Google Indexing API...`);
  console.log(`[INDEX] Time: ${new Date().toISOString()}`);

  const results = [];
  for (const url of passUrls) {
    const res = await submitIndexingUrl('D:\\.thongtaccongquangninh', url);
    results.push({ url, ok: res.ok, status: res.status ?? 0, payload: res.payload ?? null });
  }

  const successCount = results.filter((item) => item.ok).length;
  const failCount = results.length - successCount;
  console.log(`[INDEX] Success: ${successCount}/${results.length}`);
  console.log(`[INDEX] Fail: ${failCount}/${results.length}`);
  console.log(`[INDEX] Sample: ${JSON.stringify(results.slice(0, 3))}`);

  if (failCount === 0) {
    console.log(`Successfully submitted to Google!`);
    return;
  }

  process.exitCode = 1;
}

submitUrls().catch(console.error);
