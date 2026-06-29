import { readFileSync, writeFileSync } from "node:fs";
import { platform } from "node:process";

const PROJECT_ROOT = platform === "linux" ? "/mnt/d/.thongtaccongquangninh" : "D:\\.thongtaccongquangninh";
const ENV_PATH = `${PROJECT_ROOT}/.env`;
const REPORT_PATH = `${PROJECT_ROOT}/reports/youtube-reupload-2026-05-30/live-iframe-update.json`;

const REPLACEMENTS = [
  { type: "pages", id: 26, slug: "hut-be-phot-quang-ninh", oldId: "vcVjDZLV_O0", newId: "DmiPD6WM9Jg" },
  { type: "pages", id: 35, slug: "thong-tac-cong-quang-ninh", oldId: "oWFUTKj4O18", newId: "pXSJIOhrO3Q" },
];

function readEnvFile(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function replaceAllIds(text, oldId, newId) {
  return text.split(oldId).join(newId);
}

const env = readEnvFile(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const headers = {
  Authorization: auth,
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "Codex YouTube iframe update",
};

const rows = [];
for (const item of REPLACEMENTS) {
  const url = `${baseUrl}/wp-json/wp/v2/${item.type}/${item.id}?context=edit`;
  const beforeResponse = await fetch(url, { headers });
  const beforeJson = await beforeResponse.json();
  const raw = beforeJson?.content?.raw ?? "";
  const updated = replaceAllIds(raw, item.oldId, item.newId);
  const changed = updated !== raw;
  const row = {
    ...item,
    fetchStatus: beforeResponse.status,
    changed,
    beforeOldCount: raw.split(item.oldId).length - 1,
    beforeNewCount: raw.split(item.newId).length - 1,
  };
  if (changed) {
    const updateResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: updated }),
    });
    const updateJson = await updateResponse.json();
    row.updateStatus = updateResponse.status;
    row.updatedLink = updateJson?.link || "";
    const afterRaw = updateJson?.content?.raw ?? updated;
    row.afterOldCount = afterRaw.split(item.oldId).length - 1;
    row.afterNewCount = afterRaw.split(item.newId).length - 1;
  }
  rows.push(row);
}

const report = { generatedAt: new Date().toISOString(), rows };
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (rows.some((row) => row.changed && row.updateStatus >= 300)) process.exitCode = 1;
