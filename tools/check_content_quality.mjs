import fs from 'node:fs';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node tools/check_content_quality.mjs <markdown-file>');
  process.exit(1);
}

const text = fs.readFileSync(path, 'utf8');
const lineValue = (label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (text.match(new RegExp(`^${escaped}:\\s*(.+)$`, 'm')) || [,''])[1].trim();
};

const title = lineValue('Meta Title');
const description = lineValue('Meta Description');
const slug = lineValue('Slug');
const focusKeyword = lineValue('Focus Keyword') || 'thông tắc bồn cầu Uông Bí';
const body = text
  .replace(/^Meta Title:.*$/m, '')
  .replace(/^Meta Description:.*$/m, '')
  .replace(/^Slug:.*$/m, '')
  .replace(/^Focus Keyword:.*$/m, '')
  .replace(/^Search Intent:.*$/m, '');

const words = body.match(/[\p{L}\p{N}]+(?:[-.\/][\p{L}\p{N}]+)*/gu) || [];
const literalRegex = (value, flags = 'giu') =>
  new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
const focusCount = (body.match(literalRegex(focusKeyword)) || []).length;
const h1 = (text.match(/^#\s+/gm) || []).length;
const h2s = [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
const requiredH2 = [
  'Nguyên nhân',
  'Tại sao chọn',
  'Cam kết 3 Không',
  'Bảng giá',
  'Quy trình 5 bước',
  'Case study E-E-A-T',
  'NAP liên hệ',
  'FAQ',
];
const bannedWords = ['chuyên nghiệp', 'uy tín', 'hàng đầu', 'tận tâm'];
const bannedHits = bannedWords.filter((word) => literalRegex(word, 'iu').test(text));
const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text);
const hotlinesOk = text.includes('0963.953.533') && text.includes('0931.156.756');
const ctaCount = (text.match(/0963\.953\.533 \/ 0931\.156\.756/g) || []).length;
const internalLinks = (text.match(/https:\/\/thongtaccongquangninh\.com\//g) || []).length;
const first100 = words.slice(0, 100).join(' ');
const density = words.length ? (focusCount / words.length) * 100 : 0;
const slugify = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const expectedSlug = slugify(focusKeyword);

const checks = [
  ['Meta Title 60-70 ký tự', [...title].length >= 60 && [...title].length <= 70],
  ['Meta Description 150-160 ký tự', [...description].length >= 150 && [...description].length <= 160],
  ['Focus keyword trong title', title.toLowerCase().includes(focusKeyword.toLowerCase())],
  ['Focus keyword trong description', description.toLowerCase().includes(focusKeyword.toLowerCase())],
  ['Slug chứa keyword', slug === expectedSlug],
  ['Word count 2500-3000', words.length >= 2500 && words.length <= 3000],
  ['Mật độ keyword 1-1.5%', density >= 1 && density <= 1.5],
  ['1 H1 duy nhất', h1 === 1],
  ['Focus keyword trong 100 từ đầu', first100.toLowerCase().includes(focusKeyword.toLowerCase())],
  ['Đủ H2 bắt buộc', requiredH2.every((required) => h2s.some((h2) => h2.toLowerCase().includes(required.toLowerCase())))],
  ['Có hotline đầy đủ', hotlinesOk],
  ['Có CTA giữa/cuối bài', ctaCount >= 3],
  ['Có internal links', internalLinks >= 4],
  ['Không có từ cấm', bannedHits.length === 0],
  ['Không emoji', !hasEmoji],
  ['Có FAQ voice search', /^###\s+/m.test(text) && h2s.some((h2) => h2.toLowerCase().includes('faq'))],
];

const passed = checks.filter(([, ok]) => ok).length;
const estimatedRankMathScore = Math.round((passed / checks.length) * 100);
const result = {
  path,
  titleLength: [...title].length,
  descriptionLength: [...description].length,
  wordCount: words.length,
  focusKeyword,
  focusCount,
  keywordDensity: Number(density.toFixed(2)),
  h1,
  h2Count: h2s.length,
  ctaCount,
  internalLinks,
  bannedHits,
  hasEmoji,
  estimatedRankMathScore,
  checks: Object.fromEntries(checks),
};

console.log(JSON.stringify(result, null, 2));
if (estimatedRankMathScore < 90 || bannedHits.length || hasEmoji) {
  process.exit(2);
}
