/**
 * apply_meta_hotline_fix.mjs
 *
 * Apply plan từ seo-revisions/meta-hotline-fix-plan-<stamp>.json lên WordPress live.
 * - Backup current state về seo-revisions/wp-before-meta-hotline-<stamp>/
 * - Update excerpt qua REST /wp/v2/{type}s/{id}
 * - Update rank_math_description qua /rankmath/v1/updateMeta
 * - Verify live <meta name="description"> sau push (có cache-buster)
 *
 * Usage:
 *   node tools/apply_meta_hotline_fix.mjs --plan seo-revisions/meta-hotline-fix-plan-2026-05-27.json --dry-run
 *   node tools/apply_meta_hotline_fix.mjs --plan seo-revisions/meta-hotline-fix-plan-2026-05-27.json --apply
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const SITE = 'https://thongtaccongquangninh.com';
const STAMP_TS = new Date().toISOString().replace(/[:.]/g, '-');

const argv = process.argv.slice(2);
const planArgIdx = argv.indexOf('--plan');
const planPath = planArgIdx >= 0 ? argv[planArgIdx + 1] : null;
const apply = argv.includes('--apply');
const dryRun = argv.includes('--dry-run') || !apply;

if (!planPath) {
  console.error('Thiếu --plan <path>');
  process.exit(1);
}

function parseEnv(file) {
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}
const env = parseEnv(path.join(ROOT, '.env'));
const AUTH = 'Basic ' + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString('base64');

async function wp(p, init = {}) {
  const r = await fetch(`${SITE}/wp-json${p}`, {
    ...init,
    headers: {
      Authorization: AUTH,
      'Content-Type': 'application/json',
      'User-Agent': 'TTCQN-meta-hotline-fix/1.0',
      ...(init.headers || {}),
    },
  });
  const raw = await r.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    body = raw;
  }
  if (!r.ok) throw new Error(`WP ${r.status} ${p}: ${typeof body === 'object' ? body?.message || raw : body}`);
  return body;
}

async function fetchLiveMeta(url) {
  const u = new URL(url);
  u.searchParams.set('nowprocket', '1');
  u.searchParams.set('codex', STAMP_TS);
  const r = await fetch(u.toString(), { headers: { 'User-Agent': 'TTCQN-meta-hotline-verify/1.0' } });
  const html = await r.text();
  const m =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  return m ? m[1] : null;
}

async function main() {
  const planJson = path.isAbsolute(planPath) ? planPath : path.join(ROOT, planPath);
  console.log(`[1/4] Đọc plan ${planJson}`);
  const plan = JSON.parse(fs.readFileSync(planJson, 'utf8'));
  const rows = plan.rows.filter((r) => !r.fetchFail);
  console.log(`[1/4] ${rows.length} URL trong plan. Mode: ${dryRun ? 'DRY-RUN' : 'APPLY'}`);

  const backupDir = path.join(ROOT, 'seo-revisions', `wp-before-meta-hotline-${STAMP_TS}`);
  if (!dryRun) fs.mkdirSync(backupDir, { recursive: true });

  const result = { startedAt: new Date().toISOString(), planPath, mode: dryRun ? 'dry-run' : 'apply', items: [] };

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const restType = r.type === 'post' ? 'posts' : 'pages';
    process.stdout.write(`  [${i + 1}/${rows.length}] ${r.link} ... `);

    // 1. Fetch current
    const current = await wp(`/wp/v2/${restType}/${r.id}?context=edit`);
    if (current.slug !== r.slug) {
      console.log(`SKIP slug mismatch (${current.slug} != ${r.slug})`);
      result.items.push({ ...r, status: 'skip', reason: 'slug_mismatch', currentSlug: current.slug });
      continue;
    }

    if (dryRun) {
      console.log(`DRY (would set excerpt → ${r.proposedLen} chars)`);
      result.items.push({ ...r, status: 'dry_run', currentExcerpt: current.excerpt?.raw });
      continue;
    }

    // 2. Backup
    const backupFile = path.join(backupDir, `${restType}-${r.id}-${r.slug}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(current, null, 2));

    // 3. Update excerpt qua REST core
    const updated = await wp(`/wp/v2/${restType}/${r.id}`, {
      method: 'POST',
      body: JSON.stringify({ excerpt: r.proposed }),
    });

    // 4. Update rank_math_description (override Rank Math nếu có)
    let rmRes = null;
    try {
      rmRes = await wp(`/rankmath/v1/updateMeta`, {
        method: 'POST',
        body: JSON.stringify({
          objectType: 'post',
          objectID: r.id,
          meta: { rank_math_description: r.proposed },
        }),
      });
    } catch (e) {
      rmRes = { error: String(e) };
    }

    // 5. Verify live (chờ 2s để cache settle).
    await new Promise((res) => setTimeout(res, 2000));
    const liveMeta = await fetchLiveMeta(updated.link);
    const verified = liveMeta && (liveMeta === r.proposed || liveMeta.includes('0963.953.533') || liveMeta.includes('0931.156.756'));

    console.log(verified ? 'OK + verified' : `OK (verify ${liveMeta ? 'mismatch' : 'no_meta'})`);
    result.items.push({
      ...r,
      status: 'applied',
      backup: path.relative(ROOT, backupFile).replace(/\\/g, '/'),
      rankMath: rmRes,
      liveMeta,
      verified: !!verified,
    });
  }

  const reportPath = path.join(
    ROOT,
    'reports',
    `meta-hotline-fix-${dryRun ? 'dryrun' : 'apply'}-${STAMP_TS}.json`,
  );
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`[OUT] ${reportPath}`);

  if (!dryRun) {
    const applied = result.items.filter((x) => x.status === 'applied').length;
    const verified = result.items.filter((x) => x.verified).length;
    console.log(`[SUMMARY] Applied: ${applied}/${rows.length}. Verified live: ${verified}/${applied}.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
