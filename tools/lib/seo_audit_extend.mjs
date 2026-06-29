// Helpers cho audit_seo_full.mjs.
// Parse HTML thô của 1 URL live, trả về bộ chỉ số On-page/Content/Image/Schema.
// Chỉ đọc, không gọi WordPress API.

const FORBIDDEN_WORDS = [
  'chuyên nghiệp',
  'uy tín',
  'hàng đầu',
  'tận tâm',
  'hy vọng bài viết hữu ích',
];

const REQUIRED_H2_PATTERNS = [
  { key: 'nguyen_nhan', label: 'Nguyên nhân', re: /nguy[eê]n\s*nh[aâ]n/i },
  { key: 'tai_sao_chon', label: 'Tại sao chọn / Cam kết', re: /(t[aạ]i\s*sao|cam\s*k[eế]t|3\s*kh[oô]ng)/i },
  { key: 'bang_gia', label: 'Bảng giá', re: /(b[aả]ng\s*gi[aá]|chi\s*ph[ií]|gi[aá]\s*d[ịi]ch\s*v[uụ])/i },
  { key: 'quy_trinh', label: 'Quy trình', re: /quy\s*tr[ìi]nh/i },
  { key: 'lien_he', label: 'NAP / Liên hệ', re: /(li[eê]n\s*h[eệ]|li[eê]n\s*l[aạ]c|th[oô]ng\s*tin\s*li[eê]n)/i },
  { key: 'faq', label: 'FAQ / Câu hỏi', re: /(faq|c[aâ]u\s*h[oỏ]i|h[oỏ]i\s*[—-]?\s*đ[aá]p)/i },
];

const HOTLINE_PATTERNS = [
  /0963[\s.\-]?953[\s.\-]?533/g,
  /0931[\s.\-]?156[\s.\-]?756/g,
];

const HOTLINE_DIGITS = ['0963953533', '0931156756', '84963953533', '84931156756'];

const SERVICE_HINTS = {
  hut_be_phot: /h[uú]t\s*b[eể]\s*ph[ốo]t/i,
  hut_ham_cau: /h[uú]t\s*h[aầ]m\s*c[aầ]u/i,
  thong_tac_cong: /th[oô]ng\s*t[aắ]c\s*c[oố]ng/i,
  thong_tac_bon_cau: /th[oô]ng\s*t[aắ]c\s*b[oồ]n\s*c[aầ]u/i,
  nao_vet_ho_ga: /n[aạ]o\s*v[eé]t\s*h[oố]\s*ga/i,
  xu_ly_mui_hoi: /x[uử]\s*l[ýy]\s*m[uù]i\s*h[oô]i/i,
};

const LOCATION_HINTS = [
  /qu[aả]ng\s*ninh/i,
  /h[aạ]\s*long/i,
  /c[aẩ]m\s*ph[aả]/i,
  /u[oô]ng\s*b[ií]/i,
  /m[oó]ng\s*c[aá]i/i,
  /[dđ][oô]ng\s*tri[eề]u/i,
  /qu[aả]ng\s*y[eê]n/i,
  /v[aâ]n\s*[dđ][oồ]n/i,
  /b[aã]i\s*ch[aá]y/i,
  /h[oo]\s*[xs]a/i,
  /t[ií]\s*ti[eê]n\s*y[eê]n/i,
];

export function removeDiacritics(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function stripTagsAndShell(html) {
  // Strip header/footer/nav/aside/script/style để đếm content thật.
  let h = html;
  h = h.replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
  h = h.replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  h = h.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ');
  h = h.replace(/<header\b[\s\S]*?<\/header>/gi, ' ');
  h = h.replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ');
  h = h.replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ');
  h = h.replace(/<aside\b[\s\S]*?<\/aside>/gi, ' ');
  return h;
}

export function getMainHtml(html) {
  // Ưu tiên <main>, <article>, .entry-content, #content, fallback toàn body đã strip shell.
  const candidates = [
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class=["'][^"']*\bentry-content\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/(?:article|main|section)/i,
    /<div[^>]+id=["']content["'][^>]*>([\s\S]*?)<\/div>\s*<\/(?:body|main)/i,
  ];
  for (const re of candidates) {
    const m = html.match(re);
    if (m && m[1] && m[1].length > 500) return m[1];
  }
  return stripTagsAndShell(html);
}

export function textFromHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function extractHeadings(html) {
  const h1 = [];
  const h2 = [];
  const h3 = [];
  let m;
  const reH1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  while ((m = reH1.exec(html)) !== null) h1.push(textFromHtml(m[1]));
  const reH2 = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  while ((m = reH2.exec(html)) !== null) h2.push(textFromHtml(m[1]));
  const reH3 = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi;
  while ((m = reH3.exec(html)) !== null) h3.push(textFromHtml(m[1]));
  return { h1, h2, h3 };
}

export function checkRequiredH2(h2List) {
  const joined = h2List.join(' \n ');
  const missing = [];
  const hit = [];
  for (const p of REQUIRED_H2_PATTERNS) {
    if (p.re.test(joined)) hit.push(p.label);
    else missing.push(p.label);
  }
  return { hit, missing };
}

export function findForbiddenWords(text) {
  const lower = text.toLowerCase();
  const hits = [];
  for (const w of FORBIDDEN_WORDS) {
    let idx = 0;
    let n = 0;
    while ((idx = lower.indexOf(w, idx)) !== -1) {
      n++;
      idx += w.length;
    }
    if (n > 0) hits.push({ word: w, count: n });
  }
  return hits;
}

export function countHotline(text) {
  let total = 0;
  for (const re of HOTLINE_PATTERNS) {
    const m = text.match(re);
    if (m) total += m.length;
  }
  return total;
}

export function focusKeywordFromSlug(slug) {
  // slug "thong-tac-cong-bai-chay" -> "thong tac cong bai chay" (ASCII lowercase).
  return slug.replace(/-/g, ' ').toLowerCase();
}

export function keywordDensity(text, focusKeywordAscii) {
  const ascii = removeDiacritics(text).toLowerCase();
  const total = countWords(ascii);
  if (!total || !focusKeywordAscii) return { count: 0, total, density: 0 };
  const words = focusKeywordAscii.split(/\s+/).length;
  const phrase = focusKeywordAscii.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = ascii.indexOf(phrase, idx)) !== -1) {
    count++;
    idx += phrase.length;
  }
  // density = occurrences * keyword_word_count / total_words
  const density = total > 0 ? (count * words) / total : 0;
  return { count, total, density };
}

export function extractImagesInMain(mainHtml, siteHost) {
  const imgs = [];
  const re = /<img\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(mainHtml)) !== null) {
    const attrs = m[1];
    const src = (attrs.match(/\bsrc=["']([^"']+)["']/i) || attrs.match(/\bdata-src=["']([^"']+)["']/i) || [])[1] || '';
    const alt = (attrs.match(/\balt=["']([^"']*)["']/i) || [])[1] ?? null;
    if (!src) continue;
    if (/data:image/i.test(src)) continue;
    const filename = src.split('/').pop().split('?')[0];
    const external = /^https?:\/\//i.test(src) && !src.includes(siteHost);
    imgs.push({ src, alt, filename, external });
  }
  return imgs;
}

export function checkImageQuality(images, slugAscii) {
  const issues = [];
  for (const img of images) {
    const altRaw = img.alt;
    const decorativeEmptyAlt =
      altRaw !== null &&
      altRaw.trim() === '' &&
      /\/assets\/(?:service-icons|stats-icons)\//i.test(img.src);
    if (decorativeEmptyAlt) continue;
    if (altRaw === null) {
      issues.push({ src: img.src, problem: 'NO_ALT_ATTR' });
    } else if (altRaw.trim() === '') {
      issues.push({ src: img.src, problem: 'EMPTY_ALT' });
    } else {
      const altAscii = removeDiacritics(altRaw).toLowerCase();
      const hasService = Object.values(SERVICE_HINTS).some((re) => re.test(altRaw));
      const hasLocation = LOCATION_HINTS.some((re) => re.test(altRaw));
      if (!hasService && !hasLocation) {
        issues.push({ src: img.src, problem: 'ALT_NO_SERVICE_OR_LOCATION', alt: altRaw });
      }
      // slug keyword hint check
      void altAscii;
    }
    if (img.filename && /[A-ZÀ-ỹ\s_]/.test(img.filename)) {
      issues.push({ src: img.src, problem: 'FILENAME_NOT_SEO_SLUG' });
    }
    if (img.filename && /(placeholder|dummy|sample|ai-generated|openai|chatgpt)/i.test(img.filename)) {
      issues.push({ src: img.src, problem: 'PLACEHOLDER_OR_AI_FILENAME' });
    }
    if (img.external) {
      issues.push({ src: img.src, problem: 'EXTERNAL_HOTLINK' });
    }
    void slugAscii;
  }
  return issues;
}

export function extractJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    try {
      const obj = JSON.parse(raw);
      blocks.push({ ok: true, data: obj });
    } catch (e) {
      blocks.push({ ok: false, error: String(e), rawSnippet: raw.slice(0, 200) });
    }
  }
  return blocks;
}

export function flattenSchemaTypes(blocks) {
  const out = [];
  for (const b of blocks) {
    if (!b.ok) continue;
    const arr = Array.isArray(b.data) ? b.data : [b.data];
    for (const o of arr) {
      if (o['@graph']) {
        for (const g of o['@graph']) {
          if (g && g['@type']) out.push({ type: g['@type'], node: g });
        }
      } else if (o['@type']) {
        out.push({ type: o['@type'], node: o });
      }
    }
  }
  return out;
}

export function findSchemaNode(flat, typeName) {
  return flat.find((s) => {
    const t = s.type;
    if (Array.isArray(t)) return t.includes(typeName);
    return t === typeName;
  });
}

export function checkSchemaRequired(html, pageKind) {
  // pageKind: 'service_landing' | 'service_subpage' | 'other'
  const blocks = extractJsonLd(html);
  const flat = flattenSchemaTypes(blocks);
  const typeList = flat.map((s) => (Array.isArray(s.type) ? s.type.join('|') : s.type));
  const parseErrors = blocks.filter((b) => !b.ok).map((b) => b.error);

  const problems = [];
  for (const block of blocks) {
    if (!block.ok) continue;
    const root = block.data;
    const hasContext =
      Array.isArray(root)
        ? root.some((item) => item && item['@context'])
        : Boolean(root && (root['@context'] || root['@graph']));
    if (!hasContext) problems.push('JSONLD_NO_CONTEXT');
  }

  const has = (t) => !!findSchemaNode(flat, t);

  if (!has('LocalBusiness') && !has('Organization')) problems.push('MISSING_LOCALBUSINESS');
  if (!has('BreadcrumbList')) problems.push('MISSING_BREADCRUMBLIST');

  if (pageKind === 'service_landing' || pageKind === 'service_subpage') {
    if (!has('Service')) problems.push('MISSING_SERVICE');
  }

  // FAQ: nếu page có <h2> FAQ thì cần FAQPage
  if (/(<h2[^>]*>[^<]*(faq|c[aâ]u\s*h[oỏ]i)[^<]*<\/h2>)/i.test(html) && !has('FAQPage')) {
    problems.push('MISSING_FAQPAGE');
  }

  // LocalBusiness/Organization phải có hotline khớp
  const lb = findSchemaNode(flat, 'LocalBusiness') || findSchemaNode(flat, 'Organization');
  if (lb) {
    const tel = JSON.stringify(lb.node);
    const compactDigits = tel.replace(/\D/g, '');
    const ok =
      HOTLINE_DIGITS.some((h) => compactDigits.includes(h)) ||
      HOTLINE_PATTERNS.some((re) => {
        re.lastIndex = 0;
        return re.test(tel);
      });
    if (!ok) problems.push('LB_HOTLINE_MISMATCH');
    if (!/\btelephone\b/i.test(tel)) problems.push('LB_NO_TELEPHONE');
    if (!/\baddress\b/i.test(tel)) problems.push('LB_NO_ADDRESS');
  }

  // FAQPage phải có mainEntity
  const faq = findSchemaNode(flat, 'FAQPage');
  if (faq) {
    const me = faq.node.mainEntity;
    if (!me || (Array.isArray(me) && me.length === 0)) problems.push('FAQ_NO_MAINENTITY');
    const items = Array.isArray(me) ? me : me ? [me] : [];
    for (const item of items) {
      if (!item?.name) problems.push('FAQ_ITEM_NO_NAME');
      if (!item?.acceptedAnswer) problems.push('FAQ_ITEM_NO_ACCEPTEDANSWER');
    }
  }

  return { types: typeList, problems, parseErrors };
}

export function classifyPageKind(slug, title) {
  const s = (slug || '').toLowerCase();
  const t = (title || '').toLowerCase();
  if (!s || s === '/') return 'home';
  if (
    /(hut-be-phot|hut-ham-cau|thong-tac-cong|thong-tac-bon-cau|nao-vet-ho-ga|xu-ly-mui-hoi)/.test(s)
  ) {
    // landing tổng (kết thúc bằng "-quang-ninh") vs subpage (phường/huyện cụ thể)
    if (/-quang-ninh$/.test(s)) return 'service_landing';
    return 'service_subpage';
  }
  if (/(lien-he|gioi-thieu|bang-gia|chinh-sach|chi-phi)/.test(s)) return 'other';
  if (/(blog|tin|tu-van|huong-dan|dau-hieu|cach-)/.test(s) || t.includes('blog')) return 'info';
  return 'other';
}

export function titleShingles(title, n = 5) {
  const ascii = removeDiacritics(title).toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = ascii.split(/\s+/).filter(Boolean);
  if (words.length < n) return [words.join(' ')];
  const shingles = [];
  for (let i = 0; i <= words.length - n; i++) shingles.push(words.slice(i, i + n).join(' '));
  return shingles;
}

export function jaccard(aSet, bSet) {
  const a = aSet instanceof Set ? aSet : new Set(aSet);
  const b = bSet instanceof Set ? bSet : new Set(bSet);
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function findDuplicateTitles(items, threshold = 0.7) {
  // items: [{ slug, title, link, id, type }]
  const pairs = [];
  const prepped = items.map((it) => ({
    ...it,
    shingles: new Set(titleShingles(it.title || '', 5)),
  }));
  for (let i = 0; i < prepped.length; i++) {
    for (let j = i + 1; j < prepped.length; j++) {
      const A = prepped[i];
      const B = prepped[j];
      const s = jaccard(A.shingles, B.shingles);
      if (s >= threshold) {
        const sameUrl = A.link === B.link;
        pairs.push({
          a: A.link,
          b: B.link,
          aId: A.id,
          bId: B.id,
          aType: A.type,
          bType: B.type,
          similarity: +s.toFixed(2),
          note: sameUrl ? 'SAME_URL_DIFFERENT_POST_ID' : '',
        });
      }
    }
  }
  return pairs.sort((a, b) => b.similarity - a.similarity);
}

export {
  FORBIDDEN_WORDS,
  REQUIRED_H2_PATTERNS,
  HOTLINE_PATTERNS,
  HOTLINE_DIGITS,
  SERVICE_HINTS,
  LOCATION_HINTS,
};
