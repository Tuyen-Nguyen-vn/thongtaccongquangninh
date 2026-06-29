import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_PATH = join(PROJECT, "reports", "inspect-wp-link-sources-2026-04-30.json");
const NEEDLES = ["page_id=39", "ve-chung-toi", "hut-be-phot-tien-yen"];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex link source inspect",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(60000),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  return { ok: response.ok, status: response.status, payload };
}

function hits(value) {
  const text = JSON.stringify(value);
  return NEEDLES.filter((needle) => text.includes(needle));
}

function snippets(value) {
  const text = JSON.stringify(value);
  const out = [];
  for (const needle of NEEDLES) {
    let index = text.indexOf(needle);
    while (index >= 0 && out.length < 40) {
      out.push({ needle, snippet: text.slice(Math.max(0, index - 160), index + 220) });
      index = text.indexOf(needle, index + needle.length);
    }
  }
  return out;
}

async function listAll(baseUrl, auth, collection) {
  const all = [];
  for (let page = 1; page < 20; page++) {
    const path = `/wp/v2/${collection}?status=any&context=edit&per_page=100&page=${page}`;
    const result = await wp(baseUrl, auth, path);
    if (!result.ok) break;
    all.push(...result.payload);
    if (result.payload.length < 100) break;
  }
  return all;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const result = { menus: [], widgets: [], pages: [], posts: [], settings: null, sidebars: null };

  for (const collection of ["pages", "posts", "menu-items", "widgets"]) {
    const rows = await listAll(baseUrl, auth, collection);
    for (const row of rows) {
      const rowHits = hits(row);
      if (rowHits.length) {
        const item = {
          id: row.id,
          slug: row.slug,
          title: row.title?.raw ?? row.title?.rendered ?? row.name ?? row.id,
          hits: rowHits,
          snippets: snippets(row),
        };
        if (collection === "menu-items") result.menus.push(item);
        else if (collection === "widgets") result.widgets.push(item);
        else result[collection].push(item);
      }
    }
  }

  for (const path of ["/wp/v2/settings", "/wp/v2/sidebars?context=edit", "/rankmath/v1/getRedirections"]) {
    const r = await wp(baseUrl, auth, path);
    const item = { path, status: r.status, hits: hits(r.payload), snippets: snippets(r.payload) };
    if (path.includes("settings")) result.settings = item;
    else if (path.includes("sidebars")) result.sidebars = item;
    else result.redirections = item;
  }

  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
