/**
 * Audit SEO full-site read-only.
 *
 * Output:
 * - reports/site-full-audit-<date>.json / .md
 * - reports/seo-full-audit-<date>.json / .md
 * - docs/SEO_PROGRESS.csv append task rows unless --no-csv
 *
 * Usage:
 *   node tools/audit_seo_full.mjs
 *   node tools/audit_seo_full.mjs --limit 3 --no-csv
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  removeDiacritics,
  textFromHtml,
  countWords,
  extractHeadings,
  checkRequiredH2,
  findForbiddenWords,
  countHotline,
  focusKeywordFromSlug,
  keywordDensity,
  extractImagesInMain,
  checkImageQuality,
  checkSchemaRequired,
  classifyPageKind,
  findDuplicateTitles,
} from './lib/seo_audit_extend.mjs';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const SITE = 'https://thongtaccongquangninh.com';
const SITE_HOST = new URL(SITE).host;
const REPORTS_DIR = path.join(ROOT, 'reports');
const CSV_PATH = path.join(ROOT, 'docs', 'SEO_PROGRESS.csv');
const STAMP = localDateStamp();

const argv = process.argv.slice(2);
const limit = readArgInt('--limit');
const noCsv = argv.includes('--no-csv');
const suffix = limit ? '-smoke' : '';

const SITE_AUDIT_JSON = path.join(REPORTS_DIR, `site-full-audit-${STAMP}${suffix}.json`);
const SITE_AUDIT_MD = path.join(REPORTS_DIR, `site-full-audit-${STAMP}${suffix}.md`);
const SEO_AUDIT_JSON = path.join(REPORTS_DIR, `seo-full-audit-${STAMP}${suffix}.json`);
const SEO_AUDIT_MD = path.join(REPORTS_DIR, `seo-full-audit-${STAMP}${suffix}.md`);

const EXPECTED_NOINDEX_PATHS = new Set([
  '/dieu-khoan-dich-vu',
  '/chinh-sach-bao-mat',
  '/he-thong-lien-ket-doi-tac',
  '/xe-hut-be-phot-quang-ninh-2026',
]);

const HIGH_PREFIXES = [
  'NO_H1',
  'MULTI_H1',
  'MISSING_H2:',
  'SCHEMA_PARSE_ERROR',
  'MISSING_LOCALBUSINESS',
  'MISSING_BREADCRUMBLIST',
  'MISSING_SERVICE',
  'MISSING_FAQPAGE',
  'LB_HOTLINE_MISMATCH',
  'FAQ_NO_MAINENTITY',
  'FORBIDDEN_WORD',
  'BROKEN_LINK',
  'DUPLICATE_TITLE',
  'NOINDEX_UNEXPECTED',
  'ROBOTS_CONFLICT',
];

const MEDIUM_PREFIXES = [
  'TITLE_',
  'META_',
  'WORD_',
  'HOTLINE_LOW',
  'IMG_LOW',
  'IMG:',
  'H1_MISSING_KEYWORD',
  'NO_CANONICAL',
  'NO_VIEWPORT',
  'SLUG_',
  'KEYWORD_',
];

function localDateStamp(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function localTimeStamp(d = new Date()) {
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
}

function readArgInt(name) {
  const idx = argv.indexOf(name);
  if (idx < 0) return null;
  const value = Number.parseInt(argv[idx + 1], 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function normalizedPathFromUrl(url) {
  try {
    const pathname = new URL(url).pathname.replace(/\/$/, '');
    return pathname || '/';
  } catch {
    return '';
  }
}

function isExpectedNoindex(row) {
  return EXPECTED_NOINDEX_PATHS.has(normalizedPathFromUrl(row.link));
}

function parseEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = parseEnv(path.join(ROOT, '.env'));
const AUTH =
  env.WP_USERNAME && env.WP_APP_PASSWORD
    ? 'Basic ' + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString('base64')
    : '';

function authHeaders(extra = {}) {
  return AUTH ? { Authorization: AUTH, ...extra } : extra;
}

async function fetchJson(url) {
  const r = await fetch(url, {
    headers: authHeaders({ Accept: 'application/json', 'User-Agent': 'TTCQN-SEO-Full-Audit/1.0' }),
    signal: AbortSignal.timeout(60000),
  });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function fetchText(url) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'TTCQN-SEO-Full-Audit/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(60000),
    });
    return { status: r.status, finalUrl: r.url, body: await r.text() };
  } catch (e) {
    return { status: 0, finalUrl: url, body: '', error: String(e) };
  }
}

async function headCheck(url) {
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'TTCQN-SEO-Full-Audit/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });
    return r.status;
  } catch {
    try {
      const r = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'TTCQN-SEO-Full-Audit/1.0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
      });
      await r.body?.cancel();
      return r.status;
    } catch {
      return 0;
    }
  }
}

async function crawlInventory() {
  const all = [];
  for (const kind of ['pages', 'posts']) {
    for (let page = 1; page <= 20; page++) {
      const items = await fetchJson(
        `${SITE}/wp-json/wp/v2/${kind}?per_page=100&status=publish&page=${page}&_fields=id,slug,link,title,type,date`,
      );
      if (!Array.isArray(items) || items.length === 0) break;
      for (const it of items) {
        all.push({
          id: it.id,
          type: it.type || kind.slice(0, -1),
          slug: it.slug,
          link: it.link,
          title: textFromHtml(it.title?.rendered || ''),
          date: it.date,
        });
      }
      if (items.length < 100) break;
    }
  }
  return all.sort((a, b) => a.link.localeCompare(b.link));
}

function extractLegacy(html) {
  const get = (re) => html.match(re)?.[1] || null;
  const canonical =
    get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    get(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const metaDesc =
    get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    get(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const ogDesc = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
  const title = textFromHtml(get(/<title[^>]*>([\s\S]*?)<\/title>/i) || '');
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const robots = [...html.matchAll(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/gi)].map(
    (match) => match[1],
  );
  const noindex = robots.some((value) => /\bnoindex\b/i.test(value));
  const hasIndex = robots.some((value) => /\bindex\b/i.test(value));
  const robotsConflict = noindex && hasIndex;
  const schemas = extractSchemaTypes(html);
  const internalLinks = extractInternalLinks(html);
  const footer = extractFooterHash(html);
  return {
    title,
    canonical,
    metaDesc,
    metaDescLen: metaDesc ? [...metaDesc].length : 0,
    ogDesc,
    viewport,
    noindex,
    robots,
    robotsConflict,
    schemas,
    footerHash: footer.hash,
    footerLen: footer.length,
    internalLinks,
  };
}

function extractSchemaTypes(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1].trim());
      const arr = Array.isArray(obj) ? obj : [obj];
      for (const item of arr) {
        if (item?.['@graph']) {
          for (const node of item['@graph']) appendType(out, node?.['@type']);
        } else {
          appendType(out, item?.['@type']);
        }
      }
    } catch {}
  }
  return [...new Set(out.filter(Boolean))];
}

function appendType(out, value) {
  if (Array.isArray(value)) out.push(...value);
  else if (value) out.push(value);
}

function extractFooterHash(html) {
  const match = html.match(/<footer\b[^>]*class=["'][^"']*\bhome-footer\b[^"']*["'][^>]*>([\s\S]*?)<\/footer>/i);
  if (!match) return { hash: null, length: 0 };
  const normalized = match[0]
    .replace(/\sloading=["'](lazy|eager)["']/gi, '')
    .replace(/\sdecoding=["'](async|sync|auto)["']/gi, '')
    .replace(/\sdata-lazy-[^=]+=["'][^"']*["']/gi, '')
    .replace(/\sdata-src=["'][^"']*["']/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    hash: crypto.createHash('md5').update(normalized).digest('hex').slice(0, 12),
    length: match[0].length,
  };
}

function extractInternalLinks(html) {
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  const links = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1].trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('/')) href = SITE + href;
    if (href.startsWith(SITE)) links.add(href.split('#')[0]);
  }
  return [...links];
}

function stripShell(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, ' ');
}

function mainContentHtml(html) {
  const patterns = [
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class=["'][^"']*\bentry-content\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1] && match[1].length > 300) return stripShell(match[1]);
  }
  return stripShell(html);
}

async function buildSiteAudit() {
  console.log(`[A1] Crawl inventory: ${SITE}`);
  let inventory = await crawlInventory();
  if (limit) inventory = inventory.slice(0, limit);
  console.log(`[A1] URL publish audit: ${inventory.length}`);

  const htmlByUrl = new Map();
  const audit = [];
  const allLinks = new Set();

  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];
    process.stdout.write(`  [${i + 1}/${inventory.length}] ${item.link} ... `);
    const fetched = await fetchText(item.link);
    htmlByUrl.set(item.link, fetched.body);
    if (fetched.status !== 200 || !fetched.body) {
      audit.push({ ...item, fetchStatus: fetched.status, finalUrl: fetched.finalUrl, error: fetched.error || 'no_body' });
      console.log(`HTTP ${fetched.status}`);
      continue;
    }
    const extracted = extractLegacy(fetched.body);
    extracted.internalLinks.forEach((u) => allLinks.add(u));
    audit.push({ ...item, fetchStatus: fetched.status, finalUrl: fetched.finalUrl, ...extracted });
    console.log(`OK schema=${extracted.schemas.join(',') || 'NONE'} metaLen=${extracted.metaDescLen}`);
  }

  console.log(`[A2] Check internal links: ${allLinks.size}`);
  const inventoryLinks = new Set(inventory.map((x) => x.link.replace(/\/$/, '')));
  const linkStatus = {};
  for (const url of allLinks) {
    if (inventoryLinks.has(url.replace(/\/$/, ''))) linkStatus[url] = 200;
    else linkStatus[url] = await headCheck(url);
  }

  for (const row of audit) {
    row.brokenLinks = (row.internalLinks || []).filter((u) => {
      const status = linkStatus[u];
      return status === 0 || status >= 400;
    });
  }

  const hashGroups = {};
  for (const row of audit) {
    if (!row.footerHash) continue;
    hashGroups[row.footerHash] ||= [];
    hashGroups[row.footerHash].push(row.link);
  }

  const siteData = {
    generatedAt: new Date().toISOString(),
    source: 'audit_seo_full compatible site-full stage',
    limit,
    audit,
    linkStatus,
    hashGroups,
  };
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(SITE_AUDIT_JSON, JSON.stringify(siteData, null, 2), 'utf8');
  fs.writeFileSync(SITE_AUDIT_MD, renderSiteAuditMd(siteData), 'utf8');
  return { siteData, htmlByUrl };
}

function renderSiteAuditMd({ audit, linkStatus, hashGroups }) {
  const broken = Object.entries(linkStatus).filter(([, status]) => status === 0 || status >= 400);
  const lines = [];
  lines.push(`# Site Full Audit — ${STAMP}${limit ? ' (smoke)' : ''}`);
  lines.push('');
  lines.push(`**Site:** ${SITE}`);
  lines.push(`**Total URLs (published):** ${audit.length}`);
  lines.push(`**Pages:** ${audit.filter((x) => x.type === 'page').length} · **Posts:** ${audit.filter((x) => x.type === 'post').length}`);
  lines.push(`**Unique footer variants:** ${Object.keys(hashGroups).length}`);
  lines.push(`**Broken internal links:** ${broken.length}`);
  lines.push('');
  lines.push('## Bảng audit từng URL');
  lines.push('');
  lines.push('| # | URL | Type | Schema | Meta len | Viewport | Noindex | FooterHash | Broken links |');
  lines.push('|---|---|---|---|---:|---|---|---|---:|');
  audit.forEach((row, idx) => {
    lines.push(
      `| ${idx + 1} | ${mdCell(row.link)} | ${row.type} | ${mdCell((row.schemas || []).join(', ') || '-')} | ${row.metaDescLen || 0} | ${row.viewport ? 'OK' : 'MISS'} | ${row.noindex ? 'WARN' : 'OK'} | ${row.footerHash || '-'} | ${row.brokenLinks?.length || 0} |`,
    );
  });
  lines.push('');
  lines.push('## Broken links chi tiết');
  lines.push('');
  if (broken.length === 0) lines.push('_Không có link gãy._');
  else {
    lines.push('| URL gãy | HTTP |');
    lines.push('|---|---:|');
    for (const [url, status] of broken) lines.push(`| ${mdCell(url)} | ${status} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function analyzeRow(row, html) {
  if (row.fetchStatus !== 200 || !html) {
    return { ...row, pageKind: 'other', wordCount: 0, probs: ['FETCH_FAIL'], severity: 'HIGH', score: 0 };
  }

  const contentHtml = mainContentHtml(html);
  const headingHtml = stripShell(html);
  const contentText = textFromHtml(contentHtml);
  const wordCount = countWords(contentText);
  const headings = extractHeadings(headingHtml);
  const pageKind = classifyPageKind(row.slug, row.title);
  const requiredH2 = checkRequiredH2(headings.h2);
  const forbidden = findForbiddenWords(contentText);
  const hotlineBody = countHotline(html);
  const hotlineMain = countHotline(contentText);
  const focus = focusKeywordFromSlug(row.slug);
  const kd = keywordDensity(contentText, focus);
  const images = extractImagesInMain(contentHtml, SITE_HOST);
  const imageIssues = checkImageQuality(images, focus);
  const schema = checkSchemaRequired(html, pageKind);
  const probs = [];
  const expectedNoindex = isExpectedNoindex(row);

  if (headings.h1.length === 0) probs.push('NO_H1');
  else if (headings.h1.length > 1) probs.push('MULTI_H1');
  else if (pageKind === 'service_landing' || pageKind === 'service_subpage' || pageKind === 'info') {
    const h1Ascii = removeDiacritics(headings.h1[0]).toLowerCase();
    const focusHead = focus.split(/\s+/).slice(0, 3).join(' ');
    if (focusHead && !h1Ascii.includes(focusHead)) probs.push('H1_MISSING_KEYWORD');
  }

  if (pageKind === 'service_landing' || pageKind === 'service_subpage' || pageKind === 'info') {
    for (const missing of requiredH2.missing) probs.push(`MISSING_H2:${missing}`);
  }

  if (!expectedNoindex) {
    if (pageKind === 'home') {
      if (wordCount < 1200) probs.push(`WORD_LOW_HOME(${wordCount})`);
      else if (wordCount > 4500) probs.push(`WORD_TOO_LONG_HOME(${wordCount})`);
    } else {
      if (wordCount < 2000) probs.push(`WORD_LOW(${wordCount})`);
      else if (wordCount < 2500) probs.push(`WORD_BELOW_TARGET(${wordCount})`);
      else if (wordCount > 3500) probs.push(`WORD_TOO_LONG(${wordCount})`);
      else if (wordCount > 3000) probs.push(`WORD_ABOVE_TARGET(${wordCount})`);
    }
    if (forbidden.length) probs.push('FORBIDDEN_WORD');
    if (hotlineMain < 2) probs.push(`HOTLINE_LOW(${hotlineMain})`);
    if (kd.density > 0.025) probs.push(`KEYWORD_STUFFING(${(kd.density * 100).toFixed(2)}%)`);
  }

  const titleLen = [...(row.title || '')].length;
  if (!row.title) probs.push('NO_SEO_TITLE');
  else if (titleLen < 50) probs.push(`TITLE_SHORT(${titleLen})`);
  else if (titleLen > 70) probs.push(`TITLE_LONG(${titleLen})`);

  if (!row.metaDesc) probs.push('NO_META_DESC');
  else {
    if (row.metaDescLen < 150) probs.push(`META_SHORT(${row.metaDescLen})`);
    else if (row.metaDescLen > 160) probs.push(`META_LONG(${row.metaDescLen})`);
    if (!/(0963[\s.\-]?953[\s.\-]?533|0931[\s.\-]?156[\s.\-]?756)/.test(row.metaDesc)) probs.push('META_NO_HOTLINE');
  }

  if (!row.canonical) probs.push('NO_CANONICAL');
  if (!row.viewport) probs.push('NO_VIEWPORT');
  if (row.noindex && !isExpectedNoindex(row)) probs.push('NOINDEX_UNEXPECTED');
  if (row.robotsConflict) probs.push('ROBOTS_CONFLICT');

  if (!expectedNoindex) {
    if (images.length < 3) probs.push(`IMG_LOW(${images.length})`);
    for (const kind of new Set(imageIssues.map((item) => item.problem))) {
      probs.push(`IMG:${kind}(${imageIssues.filter((item) => item.problem === kind).length})`);
    }
  }

  if (schema.parseErrors.length) probs.push('SCHEMA_PARSE_ERROR');
  if (!expectedNoindex) probs.push(...schema.problems);

  if (row.brokenLinks?.length) probs.push(`BROKEN_LINK(${row.brokenLinks.length})`);
  if (/(^|-)20\d{2}($|-)|\d{6,}/.test(row.slug)) probs.push('SLUG_HAS_DATE_OR_LONG_NUMBER');
  if (/[À-ỹ]/.test(row.slug)) probs.push('SLUG_HAS_DIACRITIC');

  const severity = classifySeverity(probs);
  return {
    ...row,
    pageKind,
    wordCount,
    headings,
    requiredH2,
    forbidden,
    hotlineCountBody: hotlineBody,
    hotlineCountMain: hotlineMain,
    keyword: { focusAscii: focus, ...kd },
    images: { total: images.length, items: images, issues: imageIssues },
    schema,
    probs,
    severity,
    score: scoreFromProblems(probs),
  };
}

function classifySeverity(probs) {
  if (probs.some((p) => HIGH_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix)))) return 'HIGH';
  if (probs.some((p) => MEDIUM_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix)))) return 'MEDIUM';
  return 'PASS';
}

function scoreFromProblems(probs) {
  let score = 100;
  for (const p of probs) {
    if (HIGH_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix))) score -= 8;
    else if (MEDIUM_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix))) score -= 3;
    else score -= 1;
  }
  return Math.max(0, score);
}

function applyDuplicateTitleIssues(results) {
  const pairs = findDuplicateTitles(
    results.map((row) => ({
      id: row.id,
      type: row.type,
      slug: row.slug,
      title: row.title || row.meta?.seoTitle || '',
      link: row.link,
    })),
    0.85,
  );
  const affected = new Set();
  for (const pair of pairs) {
    affected.add(pair.a);
    affected.add(pair.b);
  }
  for (const row of results) {
    if (!affected.has(row.link) || row.probs.includes('DUPLICATE_TITLE')) continue;
    row.probs.push('DUPLICATE_TITLE');
    row.severity = classifySeverity(row.probs);
    row.score = scoreFromProblems(row.probs);
  }
  return pairs;
}

function issueCategory(problem) {
  if (problem.startsWith('MISSING_H2') || problem.includes('H1')) return 'heading';
  if (problem.startsWith('META') || problem.startsWith('TITLE') || problem === 'DUPLICATE_TITLE') return 'title_meta';
  if (problem.startsWith('IMG')) return 'image';
  if (
    problem.includes('SCHEMA') ||
    problem === 'MISSING_LOCALBUSINESS' ||
    problem === 'MISSING_BREADCRUMBLIST' ||
    problem === 'MISSING_SERVICE' ||
    problem === 'MISSING_FAQPAGE' ||
    problem.startsWith('LB_') ||
    problem.startsWith('FAQ_') ||
    problem === 'JSONLD_NO_CONTEXT'
  )
    return 'schema';
  if (
    problem.includes('BROKEN') ||
    problem.includes('CANONICAL') ||
    problem.includes('NOINDEX') ||
    problem.includes('ROBOTS') ||
    problem.includes('VIEWPORT')
  )
    return 'technical';
  return 'content';
}

function nextActionFor(row, problem) {
  if (problem === 'NO_H1') return 'Bổ sung 1 H1 chứa từ khóa chính';
  if (problem === 'MULTI_H1') return 'Gộp về đúng 1 H1';
  if (problem.startsWith('MISSING_H2:')) return `Bổ sung section ${problem.split(':')[1]}`;
  if (problem === 'FORBIDDEN_WORD') return `Loại bỏ từ cấm: ${row.forbidden.map((x) => x.word).join(', ')}`;
  if (problem === 'DUPLICATE_TITLE') return 'Rewrite title khác intent, tránh trùng cụm 5 từ';
  if (problem.startsWith('BROKEN_LINK')) return `Sửa ${row.brokenLinks?.length || 0} internal link gãy`;
  if (problem === 'MISSING_LOCALBUSINESS') return 'Bổ sung LocalBusiness schema khớp NAP visible';
  if (problem === 'MISSING_BREADCRUMBLIST') return 'Bổ sung BreadcrumbList schema';
  if (problem === 'MISSING_SERVICE') return 'Bổ sung Service schema cho landing dịch vụ';
  if (problem === 'MISSING_FAQPAGE') return 'Bổ sung FAQPage schema khi FAQ hiển thị';
  if (problem === 'LB_HOTLINE_MISMATCH') return 'Sửa hotline trong LocalBusiness schema';
  if (problem === 'SCHEMA_PARSE_ERROR') return 'Sửa JSON-LD để parse hợp lệ';
  if (problem === 'ROBOTS_CONFLICT') return 'Gộp về một robots meta nhất quán';
  return `Xem chi tiết trong ${path.basename(SEO_AUDIT_MD)}`;
}

function renderSeoMd(results, dupPairs, siteData, csvRows) {
  const total = results.length;
  const fail = results.filter((x) => x.severity === 'HIGH').length;
  const warn = results.filter((x) => x.severity === 'MEDIUM').length;
  const pass = results.filter((x) => x.severity === 'PASS').length;
  const broken = Object.entries(siteData.linkStatus).filter(([, status]) => status === 0 || status >= 400);
  const schemaCount = {};
  for (const row of results) for (const type of row.schema?.types || []) schemaCount[type] = (schemaCount[type] || 0) + 1;
  const categoryCount = {};
  for (const row of results) {
    for (const problem of row.probs) {
      const cat = issueCategory(problem);
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
  }

  const lines = [];
  lines.push(`# SEO Full Audit — ${STAMP}${limit ? ' (smoke)' : ''}`);
  lines.push('');
  lines.push(`## 0. Tổng quan`);
  lines.push(`- URL audit: ${total} | PASS: ${pass} | FAIL: ${fail} | WARN: ${warn}`);
  lines.push(`- Raw technical: ${path.relative(ROOT, SITE_AUDIT_JSON).replace(/\\/g, '/')}`);
  lines.push(`- Top 5 issue category: ${Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}=${v}`).join(' | ') || 'không có'}`);
  lines.push('');

  lines.push('## 1. Title/Meta');
  lines.push('');
  lines.push(`### Cặp title duplicate ≥85%`);
  if (!dupPairs.length) lines.push('_Không phát hiện._');
  else {
    lines.push('| Similarity | URL A | URL B |');
    lines.push('|---:|---|---|');
    for (const pair of dupPairs.slice(0, 50)) lines.push(`| ${pair.similarity} | ${mdCell(pair.a)} | ${mdCell(pair.b)} |`);
  }
  lines.push('');
  addProblemList(lines, results, 'URL meta/title length bất thường hoặc không có hotline trong meta', (p) =>
    p.startsWith('TITLE_') || p === 'NO_SEO_TITLE' || p.startsWith('META_') || p === 'NO_META_DESC',
  );

  lines.push('## 2. Heading & Content');
  lines.push('');
  addProblemList(lines, results, 'URL thiếu H1, nhiều H1 hoặc thiếu H2 bắt buộc', (p) =>
    p === 'NO_H1' || p === 'MULTI_H1' || p === 'H1_MISSING_KEYWORD' || p.startsWith('MISSING_H2:'),
  );
  addProblemList(lines, results, 'URL word count out of range', (p) => p.startsWith('WORD_'));
  const forbiddenRows = results.filter((row) => row.forbidden?.length);
  lines.push('### URL chứa từ cấm');
  if (!forbiddenRows.length) lines.push('_Không phát hiện._');
  else for (const row of forbiddenRows) lines.push(`- ${row.link} — ${row.forbidden.map((x) => `"${x.word}" x${x.count}`).join(', ')}`);
  lines.push('');
  addProblemList(lines, results, 'URL thiếu hotline trong body/main content', (p) => p.startsWith('HOTLINE_LOW'));

  lines.push('## 3. Image SEO');
  lines.push('');
  addProblemList(lines, results, 'URL < 3 ảnh nội dung', (p) => p.startsWith('IMG_LOW'));
  const imgRows = results.filter((row) => row.images?.issues?.length);
  lines.push('### URL có ảnh thiếu alt / alt sai / hotlink ngoài domain');
  if (!imgRows.length) lines.push('_Không phát hiện._');
  else {
    lines.push('| URL | Số ảnh | Vấn đề |');
    lines.push('|---|---:|---|');
    for (const row of imgRows) {
      const counts = {};
      for (const issue of row.images.issues) counts[issue.problem] = (counts[issue.problem] || 0) + 1;
      lines.push(`| ${row.link} | ${row.images.total} | ${Object.entries(counts).map(([k, v]) => `${k} x${v}`).join(', ')} |`);
    }
  }
  lines.push('');

  lines.push('## 4. Schema');
  lines.push('');
  lines.push('| Schema type | Số page |');
  lines.push('|---|---:|');
  for (const [type, count] of Object.entries(schemaCount).sort((a, b) => b[1] - a[1])) lines.push(`| ${mdCell(type)} | ${count} |`);
  lines.push('');
  addProblemList(lines, results, 'URL thiếu schema bắt buộc, JSON-LD lỗi hoặc hotline schema sai', (p) =>
    p.includes('SCHEMA') ||
    p === 'MISSING_LOCALBUSINESS' ||
    p === 'MISSING_BREADCRUMBLIST' ||
    p === 'MISSING_SERVICE' ||
    p === 'MISSING_FAQPAGE' ||
    p.startsWith('LB_') ||
    p.startsWith('FAQ_') ||
    p === 'JSONLD_NO_CONTEXT',
  );

  lines.push('## 5. Technical (kế thừa site-full audit)');
  lines.push('');
  lines.push(`- Broken internal link: ${broken.length}`);
  lines.push(`- Footer variant: ${Object.keys(siteData.hashGroups || {}).length}`);
  addProblemList(lines, results, 'Canonical / viewport / robots bất thường', (p) =>
    p === 'NO_CANONICAL' || p === 'NO_VIEWPORT' || p === 'NOINDEX_UNEXPECTED' || p === 'ROBOTS_CONFLICT',
  );
  if (broken.length) {
    lines.push('### Broken internal link chi tiết');
    lines.push('| URL gãy | HTTP | Xuất hiện trên |');
    lines.push('|---|---:|---|');
    for (const [url, status] of broken) {
      const pages = results.filter((row) => (row.internalLinks || []).includes(url)).map((row) => row.link);
      lines.push(`| ${mdCell(url)} | ${status} | ${pages.slice(0, 3).map(mdCell).join('<br>')}${pages.length > 3 ? `<br>+${pages.length - 3}` : ''} |`);
    }
    lines.push('');
  }

  lines.push('## 6. Top 20 URL ưu tiên fix');
  lines.push('');
  lines.push('| URL | Score | Issues | Next action |');
  lines.push('|---|---:|---|---|');
  const ranked = [...results].filter((row) => row.probs.length).sort((a, b) => a.score - b.score || b.probs.length - a.probs.length).slice(0, 20);
  for (const row of ranked) {
    lines.push(`| ${mdCell(row.link)} | ${row.score} | ${mdCell(row.probs.slice(0, 5).join('; '))} | ${mdCell(nextActionFor(row, row.probs[0]))} |`);
  }
  lines.push('');

  lines.push('## 7. Đã ghi vào SEO_PROGRESS.csv');
  lines.push('');
  if (noCsv) lines.push('- `--no-csv`: không ghi CSV.');
  else lines.push(`- ${csvRows} dòng task mới, dạng AUDIT-${STAMP}-<n>.`);
  lines.push('');
  lines.push('## 8. Bảng audit từng URL');
  lines.push('');
  lines.push('| # | URL | Type | Kind | Sev | Score | Words | Imgs | H1 | Schema | Issues |');
  lines.push('|---:|---|---|---|---|---:|---:|---:|---:|---|---:|');
  results.forEach((row, idx) => {
    lines.push(
      `| ${idx + 1} | ${mdCell(row.link)} | ${row.type} | ${row.pageKind} | ${row.severity} | ${row.score} | ${row.wordCount || 0} | ${row.images?.total || 0} | ${row.headings?.h1?.length || 0} | ${mdCell((row.schema?.types || []).join(', ') || '-')} | ${row.probs.length} |`,
    );
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`Việc tiếp theo nên làm: ${ranked[0]?.link || results[0]?.link || SITE}`);
  lines.push('');
  return lines.join('\n');
}

function addProblemList(lines, results, title, match) {
  const rows = results.filter((row) => row.probs.some(match));
  lines.push(`### ${title}`);
  if (!rows.length) {
    lines.push('_Không phát hiện._');
    lines.push('');
    return;
  }
  lines.push('| URL | Issues |');
  lines.push('|---|---|');
  for (const row of rows) lines.push(`| ${mdCell(row.link)} | ${mdCell(row.probs.filter(match).join(', '))} |`);
  lines.push('');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function makeCsvRows(results) {
  const date = STAMP;
  const time = localTimeStamp();
  const reportRel = path.relative(ROOT, SEO_AUDIT_MD).replace(/\\/g, '/');
  const reportJsonRel = path.relative(ROOT, SEO_AUDIT_JSON).replace(/\\/g, '/');
  const rows = [];
  let n = 1;

  for (const row of results) {
    for (const problem of row.probs) {
      const isHigh = HIGH_PREFIXES.some((prefix) => problem === prefix || problem.startsWith(prefix));
      if (!isHigh) continue;
      rows.push([
        date,
        time,
        `AUDIT-${STAMP}-${String(n++).padStart(3, '0')}`,
        'audit',
        row.keyword?.focusAscii || '',
        row.link,
        row.slug,
        'pending',
        'medium',
        '',
        '',
        '',
        '',
        `Audit HIGH: ${problem}`,
        'tools/audit_seo_full.mjs tools/lib/seo_audit_extend.mjs',
        problem,
        nextActionFor(row, problem),
        `seo-full-audit ${STAMP}`,
        'NOT_REQUIRED',
        '',
        '',
        reportRel,
        reportJsonRel,
        reportRel,
        '',
      ]);
    }
  }

  const mediumCount = results.reduce(
    (sum, row) => sum + row.probs.filter((problem) => !HIGH_PREFIXES.some((prefix) => problem === prefix || problem.startsWith(prefix))).length,
    0,
  );
  if (mediumCount > 0) {
    rows.push([
      date,
      time,
      `AUDIT-${STAMP}-${String(n++).padStart(3, '0')}`,
      'audit',
      '',
      SITE,
      'site-medium-summary',
      'pending',
      'easy',
      '',
      '',
      '',
      '',
      `Audit MEDIUM summary: ${mediumCount} issue`,
      'tools/audit_seo_full.mjs tools/lib/seo_audit_extend.mjs',
      `${mediumCount} issue MEDIUM gồm meta length, ảnh/alt, word count, hotline hoặc slug`,
      `Xem chi tiết trong ${path.basename(SEO_AUDIT_MD)}`,
      `seo-full-audit ${STAMP}`,
      'NOT_REQUIRED',
      '',
      '',
      reportRel,
      reportJsonRel,
      reportRel,
      '',
    ]);
  }

  return rows;
}

function appendCsvRows(rows) {
  if (!rows.length) return 0;
  const out = rows.map((row) => row.map(csvEscape).join(',')).join('\n') + '\n';
  fs.appendFileSync(CSV_PATH, out, 'utf8');
  return rows.length;
}

async function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const { siteData, htmlByUrl } = await buildSiteAudit();

  console.log('[A3] Extend SEO checks from freshly generated site-full JSON...');
  const reloadedSiteData = JSON.parse(fs.readFileSync(SITE_AUDIT_JSON, 'utf8'));
  const results = reloadedSiteData.audit.map((row) => analyzeRow(row, htmlByUrl.get(row.link) || ''));
  const dupPairs = applyDuplicateTitleIssues(results);
  const csvRows = noCsv ? [] : makeCsvRows(results);

  fs.writeFileSync(
    SEO_AUDIT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        site: SITE,
        sourceSiteAudit: path.relative(ROOT, SITE_AUDIT_JSON).replace(/\\/g, '/'),
        count: results.length,
        duplicateTitleThreshold: 0.85,
        duplicateTitlePairs: dupPairs,
        results,
      },
      null,
      2,
    ),
    'utf8',
  );

  const appended = noCsv ? 0 : appendCsvRows(csvRows);
  fs.writeFileSync(SEO_AUDIT_MD, renderSeoMd(results, dupPairs, siteData, appended), 'utf8');

  console.log(`[OUT] ${SITE_AUDIT_JSON}`);
  console.log(`[OUT] ${SITE_AUDIT_MD}`);
  console.log(`[OUT] ${SEO_AUDIT_JSON}`);
  console.log(`[OUT] ${SEO_AUDIT_MD}`);
  console.log(noCsv ? '[OUT] --no-csv, không ghi SEO_PROGRESS.csv' : `[OUT] Appended ${appended} dòng vào ${CSV_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
