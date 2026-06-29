#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BRIEFS_DIR = path.join(ROOT, 'image-briefs');
const ASSETS_DIR = path.join(BRIEFS_DIR, 'assets');
const USAGE_LOG = path.join(ROOT, 'image-usage.log.json');
const LOCAL_IMAGE_ROOT = 'D:\\TUYEN\\Anh-seo';
const PROMPT_PATH = path.join(ROOT, '.claude', 'prompts', 'image-agent-prompt.md');
const UNIFORM_PATH = path.join(ROOT, '.claude', 'prompts', 'uniform-reference.md');

function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}
function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function loadText(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}
function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function slugTokens(slug) {
  return normalizeText(slug).split(/\s+/).filter(Boolean);
}
function scoreFile(filePath, tokens, area, service) {
  const base = normalizeText(path.basename(filePath));
  let score = 0;
  for (const t of tokens) if (t && base.includes(t)) score += 4;
  for (const t of slugTokens(area)) if (t && base.includes(t)) score += 3;
  for (const t of slugTokens(service)) if (t && base.includes(t)) score += 2;
  if (base.includes('hero') || base.includes('dau bai')) score += 2;
  if (base.includes('quy trinh') || base.includes('case') || base.includes('cta')) score += 1;
  return score;
}
function listLocalImages(rootDir) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;
  const stack = [rootDir];
  while (stack.length) {
    const cur = stack.pop();
    for (const ent of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (/\.(webp|jpg|jpeg|png)$/i.test(ent.name)) out.push(full);
    }
  }
  return out;
}
function usageMap() {
  return readJson(USAGE_LOG, {});
}
function wasUsedRecently(filePath, days = 30) {
  const log = usageMap();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return Object.values(log).some(entry => {
    const ts = Date.parse(entry?.date || '');
    if (!Number.isFinite(ts) || ts < cutoff) return false;
    return Array.isArray(entry?.images) && entry.images.some(img => String(img?.file || '') === filePath);
  });
}
function selectLocalImages(brief, count) {
  const tokens = [brief.slug, brief.area, brief.service, ...(String(brief.focusKeyword || '').split(/\s+/))]
    .map(normalizeText)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean);
  const all = listLocalImages(LOCAL_IMAGE_ROOT);
  const scored = all
    .filter(filePath => !wasUsedRecently(filePath, 30))
    .map(filePath => ({ filePath, score: scoreFile(filePath, tokens, brief.area, brief.service) }))
    .sort((a, b) => b.score - a.score || a.filePath.localeCompare(b.filePath));
  const selected = scored.slice(0, Math.max(count, 1)).map(x => x.filePath);
  if (selected.length >= Math.max(count, 1)) return selected;
  const fallback = all
    .filter(filePath => !selected.includes(filePath))
    .map(filePath => ({ filePath, score: scoreFile(filePath, tokens, brief.area, brief.service) }))
    .sort((a, b) => b.score - a.score || a.filePath.localeCompare(b.filePath));
  return selected.concat(fallback.slice(0, Math.max(count, 1) - selected.length).map(x => x.filePath));
}
function selectImagesFromPackage(brief) {
  const pkg = readJson(brief.packagePath, null);
  if (!pkg || !Array.isArray(pkg.images) || !pkg.images.length) {
    throw new Error(`Missing image package: ${brief.packagePath}`);
  }
  const requestedCount = Number(brief.imageCount || pkg.images.length || 5);
  const localCandidates = selectLocalImages(brief, requestedCount);
  return pkg.images.map((img, idx) => {
    const localPath = localCandidates[idx] || img.filePath;
    return {
      ...img,
      filePath: path.isAbsolute(localPath) ? localPath : path.join(ROOT, localPath),
    };
  });
}
function buildContext(brief) {
  return {
    prompt: loadText(PROMPT_PATH),
    uniformReference: loadText(UNIFORM_PATH),
    brief,
  };
}
function buildAIPrompt(brief) {
  const area = brief.area || 'địa phương được chỉ định';
  const service = brief.service || 'dịch vụ môi trường';
  const keyword = brief.focusKeyword || `${service} ${area}`;
  return [
    'Photorealistic, natural smartphone-like photo, not poster style.',
    `Topic: ${keyword}.`,
    `Scene: service work in ${area}, matching the article intent and local context.`,
    `Technician uniform must follow the project reference: cream/light gray workwear with dark blue trim on shoulders, collar, sleeves, and pockets; consistent technical-service look.`,
    'No logos unless naturally placed on the shirt, no fake branding, no glossy advertising style.',
    'Realistic tools and environment, clean but authentic, suitable for SEO local content.',
    'If the image is used as AI or edited AI, caption must start with "Ảnh minh họa...".',
    '16:9 landscape, high detail, balanced lighting, no text overlay unless explicitly requested.',
  ].join(' ');
}

function copyAssets(images) {
  ensureDir(ASSETS_DIR);
  return images.map((img) => {
    const src = img.filePath;
    const dest = path.join(ASSETS_DIR, img.fileName);
    if (!fs.existsSync(src)) throw new Error(`Image file not found: ${src}`);
    fs.copyFileSync(src, dest);
    return { ...img, copiedPath: dest };
  });
}

function updateUsageLog(slug, images) {
  const log = readJson(USAGE_LOG, {});
  log[slug] = {
    date: new Date().toISOString().slice(0, 10),
    images: images.map(img => ({ file: img.copiedPath, mediaId: img.mediaId || null, role: img.slot })),
  };
  writeJson(USAGE_LOG, log);
}
function createUsageEntry(slug, images) {
  return {
    date: new Date().toISOString().slice(0, 10),
    slug,
    images: images.map(img => ({ file: img.copiedPath, mediaId: img.mediaId || null, role: img.slot })),
  };
}

const argv = process.argv.slice(2);
const slugIndex = argv.indexOf('--slug');
const slug = slugIndex >= 0 ? argv[slugIndex + 1] : null;
if (!slug) {
  console.error('Usage: node tools/image_agent_process.mjs --slug <slug>');
  process.exit(1);
}

const briefPath = path.join(BRIEFS_DIR, `${slug}-image-brief.json`);
if (!fs.existsSync(briefPath)) {
  console.error(`Brief not found: ${briefPath}`);
  process.exit(1);
}
const brief = readJson(briefPath);
if (!brief) {
  console.error(`Invalid brief JSON: ${briefPath}`);
  process.exit(1);
}
const context = buildContext(brief);
const aiPrompt = buildAIPrompt(brief);
const images = copyAssets(selectImagesFromPackage(brief));
const packagePath = path.join(BRIEFS_DIR, `${slug}-image-package.json`);
const statusPath = path.join(BRIEFS_DIR, `${slug}-image-status.json`);
const pkg = {
  schemaVersion: 1,
  status: 'READY_FOR_REVIEW',
  slug,
  sourceType: brief.sourceType || 'pending',
  packageReadyAt: new Date().toISOString(),
  briefPath,
  packagePath,
  promptPath: PROMPT_PATH,
  uniformReferencePath: UNIFORM_PATH,
  imageCount: images.length,
  images: images.map((img, index) => ({
    index: index + 1,
    slot: img.slot,
    fileName: img.fileName,
    filePath: img.copiedPath,
    fileSizeKb: img.fileSizeKb ?? 0,
    altText: img.altText,
    caption: img.caption,
    pageUrl: img.pageUrl,
    placement: img.placement,
    note: img.note,
    reusedAcrossPages: img.reusedAcrossPages ?? 0,
    privacyOk: img.privacyOk ?? true,
    customerFaceVisible: img.customerFaceVisible ?? false,
    isPoster: img.isPoster ?? false,
    sourceType: brief.sourceType || 'pending',
  })),
  meta: {
    service: brief.service || null,
    area: brief.area || null,
    focusKeyword: brief.focusKeyword || null,
    imageRoot: LOCAL_IMAGE_ROOT,
  },
  agent: {
    name: 'image-agent',
    prompt: PROMPT_PATH,
    uniformReference: UNIFORM_PATH,
    aiPrompt,
  },
};

writeJson(packagePath, pkg);
writeJson(statusPath, {
  schemaVersion: 1,
  status: 'READY_FOR_REVIEW',
  slug,
  briefPath,
  packagePath,
  promptPath: PROMPT_PATH,
  uniformReferencePath: UNIFORM_PATH,
  nextAction: 'Content agent review and insertion',
  updatedAt: new Date().toISOString(),
});
updateUsageLog(slug, images);
const usageEntry = createUsageEntry(slug, images);

console.log(JSON.stringify({
  ok: true,
  slug,
  status: 'READY_FOR_REVIEW',
  briefPath,
  packagePath,
  statusPath,
  imageCount: images.length,
  promptPath: PROMPT_PATH,
  uniformReferencePath: UNIFORM_PATH,
  images: pkg.images,
  usageEntry,
}, null, 2));
