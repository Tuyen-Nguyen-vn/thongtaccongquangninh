/**
 * Audit toàn site: crawl URL inventory + audit footer/canonical/schema/meta/link gãy.
 * Output:
 *   - reports/url-inventory-2026-05-18.json
 *   - reports/site-full-audit-2026-05-18.md
 *
 * Usage: node tools/audit_site_full.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROJECT = 'D:\\.thongtaccongquangninh';
const SITE = 'https://thongtaccongquangninh.com';
const STAMP = new Date().toISOString().slice(0, 10);
const INVENTORY = path.join(PROJECT, 'reports', `url-inventory-${STAMP}.json`);
const REPORT = path.join(PROJECT, 'reports', `site-full-audit-${STAMP}.md`);
const DATA = path.join(PROJECT, 'reports', `site-full-audit-${STAMP}.json`);

function parseEnv(p) {
  const env = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = parseEnv(path.join(PROJECT, '.env'));
const AUTH = 'Basic ' + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString('base64');

const fetchJson = async (url) => {
  const r = await fetch(url, { headers: { Authorization: AUTH } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

const fetchText = async (url) => {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'TTCQN-Audit/1.0' }, redirect: 'follow' });
    return { status: r.status, finalUrl: r.url, body: await r.text() };
  } catch (e) {
    return { status: 0, finalUrl: url, body: '', error: String(e) };
  }
};

const headCheck = async (url) => {
  try {
    const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'TTCQN-Audit/1.0' }, redirect: 'follow' });
    return r.status;
  } catch {
    try {
      const r = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'TTCQN-Audit/1.0' }, redirect: 'follow' });
      await r.body?.cancel();
      return r.status;
    } catch {
      return 0;
    }
  }
};

async function crawlInventory() {
  const all = [];
  for (const kind of ['pages', 'posts']) {
    let page = 1;
    while (true) {
      const items = await fetchJson(`${SITE}/wp-json/wp/v2/${kind}?per_page=100&status=publish&page=${page}&_fields=id,slug,link,title,type,date`);
      if (!Array.isArray(items) || items.length === 0) break;
      for (const it of items) {
        all.push({
          id: it.id,
          type: it.type || kind.slice(0, -1),
          slug: it.slug,
          link: it.link,
          title: it.title?.rendered || '',
          date: it.date,
        });
      }
      if (items.length < 100) break;
      page++;
    }
  }
  return all;
}

function extract(html, baseUrl) {
  const get = (re) => { const m = html.match(re); return m ? m[1] : null; };
  const canonical = get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || get(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const metaDesc = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || get(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const ogDesc = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
  const title = get(/<title[^>]*>([\s\S]*?)<\/title>/i)?.trim();
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const robots = get(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const noindex = robots ? /noindex/i.test(robots) : false;

  const schemas = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1].trim());
      const arr = Array.isArray(obj) ? obj : [obj];
      for (const o of arr) {
        if (o['@graph']) {
          for (const g of o['@graph']) schemas.push(g['@type']);
        } else if (o['@type']) {
          schemas.push(o['@type']);
        }
      }
    } catch {}
  }

  const footerMatch = html.match(/<footer\b[^>]*class=["\'][^"\']*\bhome-footer\b[^"\']*["\'][^>]*>([\s\S]*?)<\/footer>/i);
  let footerHash = null;
  let footerLen = 0;

  if (footerMatch) {
    let norm = footerMatch[0];
    norm = norm.replace(/\sloading=["\'](lazy|eager)["\']/gi, '');
    norm = norm.replace(/\sdecoding=["\'](async|sync|auto)["\']/gi, '');
    norm = norm.replace(/\sclass=["\']([^"\']*\b)(lazyloaded|lazyloading|lazyload)\b([^"\']*["\'])/gi, ' class="$1$3"');
    norm = norm.replace(/\sdata-lazy-[^=]+=["\'][^"\']*["\']/gi, '');
    norm = norm.replace(/\sdata-src=["\'][^"\']*["\']/gi, '');
    norm = norm.replace(/\s+/g, ' ').trim();

    footerHash = crypto.createHash('md5').update(norm).digest('hex').slice(0, 12);
    footerLen = footerMatch[0].length;
  }

  const linkRe = /<a[^>]+href=["']([^"']+)["']/gi;
  const links = new Set();
  let lm;
  while ((lm = linkRe.exec(html)) !== null) {
    let href = lm[1].trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('/')) href = SITE + href;
    if (href.startsWith(SITE)) links.add(href.split('#')[0]);
  }

  return {
    title,
    canonical,
    metaDesc,
    metaDescLen: metaDesc ? [...metaDesc].length : 0,
    ogDesc,
    viewport,
    noindex,
    schemas: [...new Set(schemas.flat().filter(Boolean))],
    footerHash,
    footerLen,
    internalLinks: [...links],
  };
}

async function main() {
  console.log('[A1] Crawling URL inventory...');
  const inventory = await crawlInventory();
  fs.mkdirSync(path.dirname(INVENTORY), { recursive: true });
  fs.writeFileSync(INVENTORY, JSON.stringify(inventory, null, 2));
  console.log(`[A1] Found ${inventory.length} published URLs → ${INVENTORY}`);

  console.log('[A2] Fetching + extracting each URL...');
  const audit = [];
  const allLinks = new Set();
  for (let i = 0; i < inventory.length; i++) {
    const it = inventory[i];
    process.stdout.write(`  [${i + 1}/${inventory.length}] ${it.link} ... `);
    const { status, body } = await fetchText(it.link);
    if (status !== 200 || !body) {
      audit.push({ ...it, fetchStatus: status, error: 'no body' });
      console.log(`✗ ${status}`);
      continue;
    }
    const ex = extract(body, it.link);
    audit.push({ ...it, fetchStatus: status, ...ex });
    ex.internalLinks.forEach((u) => allLinks.add(u));
    console.log(`✓ schemas=${ex.schemas.join(',') || 'NONE'} metaLen=${ex.metaDescLen}`);
  }

  console.log(`[A2] Checking ${allLinks.size} unique internal links for 404...`);
  const linkStatus = {};
  const linksArr = [...allLinks];
  const inventoryLinks = new Set(inventory.map((x) => x.link.replace(/\/$/, '')));
  for (let i = 0; i < linksArr.length; i++) {
    const u = linksArr[i];
    const norm = u.replace(/\/$/, '');
    if (inventoryLinks.has(norm)) {
      linkStatus[u] = 200;
      continue;
    }
    const s = await headCheck(u);
    linkStatus[u] = s;
    if (i % 20 === 0) process.stdout.write(`  [${i + 1}/${linksArr.length}]\r`);
  }

  const broken = Object.entries(linkStatus).filter(([, s]) => s >= 400 || s === 0);
  console.log(`\n[A2] Broken: ${broken.length} / ${linksArr.length}`);

  // Per-URL broken links
  for (const a of audit) {
    if (!a.internalLinks) continue;
    a.brokenLinks = a.internalLinks.filter((u) => {
      const s = linkStatus[u];
      return s !== undefined && (s >= 400 || s === 0);
    });
  }

  // Footer hash groups
  const hashGroups = {};
  for (const a of audit) {
    if (!a.footerHash) continue;
    hashGroups[a.footerHash] = hashGroups[a.footerHash] || [];
    hashGroups[a.footerHash].push(a.link);
  }

  fs.writeFileSync(DATA, JSON.stringify({ audit, linkStatus, hashGroups }, null, 2));

  // === Build MD report ===
  const lines = [];
  lines.push(`# Site Full Audit — ${STAMP}`);
  lines.push('');
  lines.push(`**Site:** ${SITE}`);
  lines.push(`**Total URLs (published):** ${inventory.length}`);
  lines.push(`**Pages:** ${inventory.filter((x) => x.type === 'page').length} · **Posts:** ${inventory.filter((x) => x.type === 'post').length}`);
  lines.push(`**Unique footer variants:** ${Object.keys(hashGroups).length}`);
  lines.push(`**Broken internal links:** ${broken.length}`);
  lines.push('');

  lines.push('## 1. Footer variants');
  lines.push('');
  for (const [hash, urls] of Object.entries(hashGroups).sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`### Variant \`${hash}\` (${urls.length} URL)`);
    for (const u of urls.slice(0, 30)) lines.push(`- ${u}`);
    if (urls.length > 30) lines.push(`- … +${urls.length - 30} URL khác`);
    lines.push('');
  }

  lines.push('## 2. Bảng audit từng URL');
  lines.push('');
  lines.push('| # | URL | Type | Schema | Meta len | Viewport | Noindex | FooterHash | Broken links |');
  lines.push('|---|-----|------|--------|----------|----------|---------|------------|--------------|');
  audit.forEach((a, i) => {
    lines.push(
      `| ${i + 1} | ${a.link} | ${a.type} | ${(a.schemas || []).join(', ') || '—'} | ${a.metaDescLen ?? 0} | ${a.viewport ? '✓' : '✗'} | ${a.noindex ? '⚠' : '✓'} | ${a.footerHash || '—'} | ${a.brokenLinks?.length || 0} |`,
    );
  });
  lines.push('');

  lines.push('## 3. Broken links chi tiết');
  lines.push('');
  if (broken.length === 0) {
    lines.push('_Không có link gãy._');
  } else {
    lines.push('| URL gãy | HTTP | Xuất hiện trên page |');
    lines.push('|---------|------|---------------------|');
    for (const [u, s] of broken) {
      const pages = audit.filter((a) => (a.internalLinks || []).includes(u)).map((a) => a.link);
      lines.push(`| ${u} | ${s} | ${pages.slice(0, 3).join('<br>')}${pages.length > 3 ? `<br>+${pages.length - 3}` : ''} |`);
    }
  }
  lines.push('');

  lines.push('## 4. Page có vấn đề (ưu tiên fix)');
  lines.push('');
  const issues = [];
  for (const a of audit) {
    const probs = [];
    if (!a.schemas || a.schemas.length === 0) probs.push('NO_SCHEMA');
    if (!a.canonical) probs.push('NO_CANONICAL');
    if (!a.viewport) probs.push('NO_VIEWPORT');
    if (a.noindex) probs.push('NOINDEX');
    if (!a.metaDesc) probs.push('NO_META_DESC');
    else if (a.metaDescLen < 100) probs.push(`META_SHORT(${a.metaDescLen})`);
    else if (a.metaDescLen > 165) probs.push(`META_LONG(${a.metaDescLen})`);
    if (a.brokenLinks?.length) probs.push(`BROKEN(${a.brokenLinks.length})`);
    if (probs.length) issues.push({ url: a.link, type: a.type, probs });
  }
  if (issues.length === 0) {
    lines.push('_Không có vấn đề._');
  } else {
    lines.push('| URL | Type | Issues |');
    lines.push('|-----|------|--------|');
    for (const i of issues) {
      lines.push(`| ${i.url} | ${i.type} | ${i.probs.join(', ')} |`);
    }
  }
  lines.push('');

  lines.push('## 5. Tổng kết schema');
  lines.push('');
  const schemaCount = {};
  for (const a of audit) for (const s of a.schemas || []) schemaCount[s] = (schemaCount[s] || 0) + 1;
  lines.push('| Schema | Số page |');
  lines.push('|--------|---------|');
  for (const [s, c] of Object.entries(schemaCount).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${s} | ${c} |`);
  }
  lines.push('');

  lines.push('## 6. Fix list (đề xuất tự động)');
  lines.push('');
  const noSchema = issues.filter((i) => i.probs.includes('NO_SCHEMA')).length;
  const metaShort = issues.filter((i) => i.probs.some((p) => p.startsWith('META_SHORT') || p === 'NO_META_DESC')).length;
  const metaLong = issues.filter((i) => i.probs.some((p) => p.startsWith('META_LONG'))).length;
  lines.push(`- Schema thiếu: **${noSchema}** page → bổ sung qua Rank Math/plugin.`);
  lines.push(`- Meta description quá ngắn / thiếu: **${metaShort}** page → rewrite Phase C.`);
  lines.push(`- Meta description quá dài (>165): **${metaLong}** page → rút gọn Phase C.`);
  lines.push(`- Broken link: **${broken.length}** → fix Phase B.`);
  lines.push(`- Footer variants: **${Object.keys(hashGroups).length}** (lý tưởng = 1 cho toàn site).`);
  lines.push('');

  fs.writeFileSync(REPORT, lines.join('\n'));
  console.log(`[OUT] ${REPORT}`);
  console.log(`[OUT] ${DATA}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
