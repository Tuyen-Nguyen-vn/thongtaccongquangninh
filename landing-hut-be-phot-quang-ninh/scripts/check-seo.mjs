import { readFileSync } from 'node:fs';
import {
  business,
  faqs,
  galleryImages,
  navItems,
  newsItems,
  pricingCards,
  quickBenefits,
  reviews,
  services,
} from '../src/data.js';
import { allSchemas } from '../src/seo-schema.js';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const dataSource = readFileSync(new URL('../src/data.js', import.meta.url), 'utf8');
const schemaSource = readFileSync(new URL('../src/seo-schema.js', import.meta.url), 'utf8');
const combinedSource = `${indexHtml}\n${appSource}\n${dataSource}\n${schemaSource}`;

const faqSchema = allSchemas.find((schema) => schema['@type'] === 'FAQPage');
const localBusinessSchema = allSchemas.find((schema) => schema['@type'] === 'LocalBusiness');

const requiredH2 = [
  'Dịch Vụ Chính Tại Quảng Ninh',
  'Vì Sao Chọn Chúng Tôi?',
  'Quy Trình Làm Việc',
  'Hình Ảnh Thi Công Thực Tế',
  'Đội Ngũ Kỹ Thuật & Cam Kết Dịch Vụ',
  'Khách Hàng Nói Về Chúng Tôi',
  'Bảng Giá Tham Khảo',
  'Khu Vực Phục Vụ Tại Quảng Ninh',
  'Câu Hỏi Thường Gặp',
  'Tin Tức / Kiến Thức',
];

const forbiddenPhrases = ['chuyên nghiệp', 'uy tín', 'hàng đầu', 'tận tâm'];
const visibleCopy = `${appSource}\n${dataSource}`;

const checks = [
  ['meta title exact', indexHtml.includes(`<title>${business.title}</title>`)],
  ['meta description exact', indexHtml.includes(`content="${business.description}"`)],
  ['meta keywords exact', indexHtml.includes(`content="${business.keywords}"`)],
  ['canonical exact', indexHtml.includes(`rel="canonical" href="${business.pageUrl}"`)],
  ['robots max image preview present', indexHtml.includes('max-image-preview:large')],
  ['OG image uses plugin asset URL', indexHtml.includes('/wp-content/plugins/ttcqn-qn-service-landing/assets/images/hero-xe-hut-be-phot-quang-ninh.jpg')],
  ['only one H1 in App source', (appSource.match(/<h1\b/g) || []).length === 1],
  ['required H2 headings present', requiredH2.every((heading) => appSource.includes(heading))],
  ['hotline displayed and tel link correct', combinedSource.includes(business.hotline) && combinedSource.includes(business.phoneHref)],
  ['header has 7 nav items configured', navItems.length === 7],
  ['4 quick benefit cards configured', quickBenefits.length === 4],
  ['4 service cards configured', services.length === 4],
  ['4 pricing cards configured', pricingCards.length === 4],
  ['5 FAQ entries configured', faqs.length === 5],
  ['8 gallery images configured', galleryImages.length === 8],
  ['3 testimonial cards configured', reviews.length === 3],
  ['3 news cards configured', newsItems.length === 3],
  ['4 JSON-LD schemas configured', allSchemas.length === 4],
  ['LocalBusiness schema has required fields', Boolean(localBusinessSchema?.telephone && localBusinessSchema?.address && localBusinessSchema?.openingHours)],
  ['FAQ schema mirrors FAQ data', Boolean(faqSchema && faqSchema.mainEntity.length === faqs.length)],
  ['no lorem ipsum', !/lorem ipsum/i.test(combinedSource)],
  ['all visible img tags include alt', (appSource.match(/<img\b/g) || []).length === (appSource.match(/\balt=/g) || []).length],
  ['no blocked generic claims in copy', forbiddenPhrases.every((phrase) => !visibleCopy.toLowerCase().includes(phrase))],
  ['author link present', appSource.includes('https://thongtaccongquangninh.com/author/nguyensonghao/')],
];

const failed = checks.filter(([, passed]) => !passed);

for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
