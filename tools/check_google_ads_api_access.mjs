#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const envPath = new URL('../secrets/google_ads.env', import.meta.url);

function loadEnvFile(pathUrl) {
  if (!fs.existsSync(pathUrl)) return;
  const raw = fs.readFileSync(pathUrl, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

function getAdcToken() {
  return execFileSync('gcloud', ['auth', 'application-default', 'print-access-token'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

loadEnvFile(envPath);

const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const apiVersion = process.env.GOOGLE_ADS_API_VERSION || 'v24';

if (!developerToken) {
  console.error('Missing GOOGLE_ADS_DEVELOPER_TOKEN.');
  console.error('Create secrets/google_ads.env with: GOOGLE_ADS_DEVELOPER_TOKEN=...');
  process.exit(2);
}

const token = getAdcToken();
const response = await fetch(`https://googleads.googleapis.com/${apiVersion}/customers:listAccessibleCustomers`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'developer-token': developerToken,
  },
});

const bodyText = await response.text();
let body;
try {
  body = JSON.parse(bodyText);
} catch {
  body = bodyText;
}

if (!response.ok) {
  console.error(`Google Ads API check failed: HTTP ${response.status}`);
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

const names = body.resourceNames || [];
console.log('GOOGLE_ADS_API_OK');
console.log(`accessible_customers=${names.length}`);
for (const name of names) console.log(name);
