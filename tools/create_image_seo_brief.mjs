#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRAFTS_DIR = path.join(ROOT, 'content-drafts');
const BRIEFS_DIR = path.join(ROOT, 'image-briefs');

function usage() {
  console.log('Usage: node tools/create_image_seo_brief.mjs <file.md>');
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseFrontmatter(md) {
  const lines = md.split(/\r?\n/);
  const data = {};
  let i = 0;
  if (lines[0]?.trim() !== '---') return { data, body: md };
  i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---') {
      i++;
      break;
    }
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (m) data[m[1].trim()] = m[2].trim();
  }
  return { data, body: lines.slice(i).join('\n') };
}

function extractFirstHeading(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

function inferArea(slug, title) {
  const text = `${slug} ${title}`.toLowerCase();
  const areas = ['Bãi Cháy', 'Tuần Châu', 'Cao Xanh', 'Giếng Đáy', 'Hạ Long', 'Quảng Ninh', 'Cẩm Phả', 'Uông Bí', 'Vân Đồn', 'Móng Cái', 'Đông Triều', 'Quảng Yên'];
  return areas.find(a => text.includes(slugify(a))) || '';
}

function countHeadings(body) {
  return (body.match(/^##\s+/gm) || []).length;
}

function makeBrief({ slug, title, description, body }) {
  const h2Count = countHeadings(body);
  const area = inferArea(slug, title) || 'Quảng Ninh';
  const imagesNeeded = Math.max(3, Math.min(5, h2Count >= 10 ? 5 : h2Count >= 6 ? 4 : 3));
  return {
    status: 'PENDING_IMAGE_SEO',
    slug,
    title,
    service: title.toLowerCase().includes('hút bể phốt') ? 'hút bể phốt' : 'thông tắc cống',
    area,
    briefPath: path.join(BRIEFS_DIR, `${slug}-image-brief.json`),
    packagePath: path.join(BRIEFS_DIR, `${slug}-image-package.json`),
    sourceType: 'pending',
    imagesNeeded,
    content: {
      summary: description || extractFirstHeading(body) || title,
      h2Count,
      bodyWordCount: body.trim().split(/\s+/).filter(Boolean).length,
    },
    nextAction: 'Gọi image-agent để chọn ảnh và tạo image-package.json',
    images: [],
  };
}

const input = process.argv[2];
if (!input) {
  usage();
  process.exit(1);
}

const mdPath = path.isAbsolute(input) ? input : path.join(ROOT, input.startsWith('content-drafts') ? input : path.join('content-drafts', input));
if (!fs.existsSync(mdPath)) {
  console.error(`Markdown file not found: ${mdPath}`);
  process.exit(1);
}

const md = readText(mdPath);
const { data, body } = parseFrontmatter(md);
const slug = data.slug || slugify(path.basename(mdPath, path.extname(mdPath)));
const title = data['Meta Title'] || data.title || extractFirstHeading(body) || slug;
const description = data['Meta Description'] || data.description || '';
const brief = makeBrief({ slug, title, description, body });

fs.mkdirSync(BRIEFS_DIR, { recursive: true });
fs.writeFileSync(path.join(BRIEFS_DIR, `${slug}-image-brief.json`), JSON.stringify(brief, null, 2), 'utf8');
fs.writeFileSync(path.join(BRIEFS_DIR, `${slug}-image-status.json`), JSON.stringify({
  status: brief.status,
  slug,
  briefPath: brief.briefPath,
  packagePath: brief.packagePath,
  nextAction: brief.nextAction,
}, null, 2), 'utf8');

console.log(JSON.stringify({ ok: true, briefPath: brief.briefPath, status: brief.status, imagesNeeded: brief.imagesNeeded }, null, 2));
