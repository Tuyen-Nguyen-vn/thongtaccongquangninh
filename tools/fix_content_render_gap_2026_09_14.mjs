import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const SNIPPET_ID = 54; // "TTCQN Content Render Restore 2026-07-17"
const PURGE_SNIPPET_ID = 55; // "TTCQN One-Shot Content Render Cache Purge 2026-07-17"
const NEW_IDS = [4687, 4682, 4599]; // dau-hieu-be-phot-day-khach-san-ha-long, lich-hut-be-phot-homestay-van-don, nao-vet-ho-ga-nha-hang-ha-long-mua-mua
const DRY = process.argv.includes("--dry");

function readEnv(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return values;
}
const env = readEnv(`${ROOT}/.env`);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

async function getSnippet(id) {
  const r = await fetch(`https://${HOST}/wp-json/code-snippets/v1/snippets/${id}`, { headers: { Authorization: auth } });
  if (!r.ok) throw new Error(`GET snippet ${id} failed: ${r.status}`);
  return r.json();
}

async function patchSnippet(id, data) {
  const r = await fetch(`https://${HOST}/wp-json/code-snippets/v1/snippets/${id}`, {
    method: "PUT",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  const body = await r.json().catch(() => null);
  return { status: r.status, body };
}

async function main() {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/fix-content-render-gap-${stamp}`;
  if (!DRY) mkdirSync(backupDir, { recursive: true });

  // 1. Back up snippet 54 as-is, then add the 3 new post IDs to its allowlist.
  const snippet = await getSnippet(SNIPPET_ID);
  if (!DRY) writeFileSync(`${backupDir}/snippet-${SNIPPET_ID}-before.json`, JSON.stringify(snippet, null, 2), "utf8");

  const marker = "4692, 4696,\n);";
  if (!snippet.code.includes(marker)) {
    console.error("[FATAL] Expected marker not found in snippet code, aborting to avoid corrupting it.");
    console.error("Snippet code head:", snippet.code.slice(0, 200));
    process.exit(1);
  }
  const newCode = snippet.code.replace(marker, `4692, 4696, ${NEW_IDS.join(", ")},\n);`);
  console.log("--- diff preview ---");
  console.log("old:", marker);
  console.log("new:", newCode.match(/4692, 4696.*?\);/s)[0]);

  if (DRY) {
    console.log("[DRY RUN] would PUT snippet", SNIPPET_ID);
  } else {
    const res = await patchSnippet(SNIPPET_ID, { code: newCode });
    console.log(`PUT snippet ${SNIPPET_ID} -> status=${res.status}`);
    if (res.status >= 300) {
      console.error(res.body);
      process.exit(1);
    }
  }

  // 2. Temporarily activate the one-shot cache-purge snippet, call it, then deactivate again.
  if (!DRY) {
    const act = await patchSnippet(PURGE_SNIPPET_ID, { active: true });
    console.log(`activate purge snippet ${PURGE_SNIPPET_ID} -> status=${act.status}`);

    const purge = await fetch(`https://${HOST}/wp-json/ttcqn/v1/one-shot-content-render-cache-purge`, {
      method: "POST",
      headers: { Authorization: auth },
    });
    const purgeBody = await purge.json().catch(() => null);
    console.log("cache purge ->", purge.status, JSON.stringify(purgeBody));

    const deact = await patchSnippet(PURGE_SNIPPET_ID, { active: false });
    console.log(`deactivate purge snippet ${PURGE_SNIPPET_ID} -> status=${deact.status}`);
  }

  // 3. Verify: fetch the 3 live pages and check entry-content is no longer empty.
  const posts = [
    { id: 4687, slug: "dau-hieu-be-phot-day-khach-san-ha-long" },
    { id: 4682, slug: "lich-hut-be-phot-homestay-van-don" },
    { id: 4599, slug: "nao-vet-ho-ga-nha-hang-ha-long-mua-mua" },
  ];
  const results = [];
  for (const p of posts) {
    const meta = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${p.id}?context=edit`, { headers: { Authorization: auth } }).then(r => r.json());
    const live = await fetch(meta.link, { cache: "no-store" });
    const html = await live.text();
    const m = html.match(/<div class="entry-content"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/article|<footer|<div class="post-)/i);
    const len = m ? m[1].replace(/\s+/g, " ").trim().length : -1;
    console.log(`[verify] ${p.slug} live entry-content chars=${len}`);
    results.push({ ...p, entry_content_chars: len });
  }

  if (!DRY) writeFileSync(`${ROOT}/reports/fix-content-render-gap-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
