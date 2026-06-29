/**
 * draft_meta_hotline_fix_plan.mjs — Read-only.
 *
 * Đọc seo-full-audit JSON mới nhất, lọc URL có META_NO_HOTLINE,
 * fetch excerpt hiện tại từ REST WP, sinh proposed meta theo template,
 * ghi plan ra seo-revisions/meta-hotline-fix-plan-<stamp>.md để Tuyền duyệt.
 *
 * Không gọi WordPress write API. Sau khi Tuyền duyệt, tool khác sẽ apply.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const SITE = 'https://thongtaccongquangninh.com';
const STAMP = new Date().toISOString().slice(0, 10);

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

function findLatestAudit() {
  const files = fs
    .readdirSync(path.join(ROOT, 'reports'))
    .filter((f) => /^seo-full-audit-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  return files.length ? path.join(ROOT, 'reports', files.at(-1)) : null;
}

async function fetchExcerpt(type, slug) {
  const r = await fetch(
    `${SITE}/wp-json/wp/v2/${type}s?slug=${slug}&context=edit&_fields=id,slug,type,excerpt,title`,
    { headers: { Authorization: AUTH } },
  );
  if (!r.ok) return null;
  const arr = await r.json();
  return arr[0] || null;
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveServiceAndLocation(slug) {
  const tokens = slug.toLowerCase();
  const serviceMap = [
    ['hut-be-phot', 'Hút bể phốt'],
    ['hut-ham-cau', 'Hút hầm cầu'],
    ['thong-tac-bon-cau', 'Thông tắc bồn cầu'],
    ['thong-tac-cong', 'Thông tắc cống'],
    ['nao-vet-ho-ga', 'Nạo vét hố ga'],
    ['xu-ly-mui-hoi', 'Xử lý mùi hôi'],
    ['cau-hoi-thuong-gap', 'Câu hỏi thường gặp'],
    ['bang-gia', 'Bảng giá'],
    ['blog', 'Blog'],
    ['gioi-thieu', 'Giới thiệu Môi Trường Đô Thị Quảng Ninh'],
    ['lien-he', 'Liên hệ Môi Trường Đô Thị Quảng Ninh'],
  ];
  const locationMap = [
    ['quang-ninh', 'Quảng Ninh'],
    ['ha-long', 'Hạ Long'],
    ['cam-pha', 'Cẩm Phả'],
    ['uong-bi', 'Uông Bí'],
    ['mong-cai', 'Móng Cái'],
    ['dong-trieu', 'Đông Triều'],
    ['quang-yen', 'Quảng Yên'],
    ['van-don', 'Vân Đồn'],
    ['bai-chay', 'Bãi Cháy'],
    ['hoanh-bo', 'Hoành Bồ'],
    ['tien-yen', 'Tiên Yên'],
    ['hai-ha', 'Hải Hà'],
    ['dam-ha', 'Đầm Hà'],
    ['binh-lieu', 'Bình Liêu'],
    ['ba-che', 'Ba Chẽ'],
    ['co-to', 'Cô Tô'],
  ];
  const service = serviceMap.find(([k]) => tokens.includes(k))?.[1] || '';
  const location = locationMap.find(([k]) => tokens.includes(k))?.[1] || 'Quảng Ninh';
  return { service, location };
}

function proposeMeta(slug, currentExcerpt) {
  const { service, location } = deriveServiceAndLocation(slug);
  const cur = stripHtml(currentExcerpt);
  const curLen = [...cur].length;

  // Pattern đã validate bởi fix_city_meta_descriptions.mjs (4 trang thành phố, length 150-160).
  const cityPattern = (svc, loc) =>
    `${svc} ${loc} 24/7, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi tại nhà, nhà hàng ngay trong ngày.`;

  // 1) Page service + location cụ thể → dùng cityPattern.
  if (service && /Hút bể phốt|Hút hầm cầu|Thông tắc bồn cầu|Thông tắc cống|Nạo vét hố ga|Xử lý mùi hôi/.test(service) && location !== 'Quảng Ninh') {
    const tpl = cityPattern(service, location);
    return { proposed: tpl, length: [...tpl].length, strategy: 'city_pattern' };
  }

  // 2) Page service + Quảng Ninh (landing tỉnh).
  if (service && /Hút bể phốt|Hút hầm cầu|Thông tắc bồn cầu|Thông tắc cống|Nạo vét hố ga|Xử lý mùi hôi/.test(service)) {
    const tpl = `${service} ${location} 24/7, có mặt 15 phút, không đục phá, bảo hành dài hạn. Gọi 0963.953.533 / 0931.156.756 để báo giá và xử lý trong ngày.`;
    return { proposed: tpl, length: [...tpl].length, strategy: 'service_landing' };
  }

  // 3) Trang khác (FAQ, giới thiệu, blog, liên hệ, đối tác): giữ ý hiện tại + chèn hotline cuối.
  if (curLen >= 60) {
    const tail = '. Gọi 0963.953.533 / 0931.156.756 để được tư vấn.';
    const tailLen = [...tail].length;
    const targetTotal = 158;
    const keepLen = Math.max(60, targetTotal - tailLen);
    let head = cur;
    if (curLen > keepLen) {
      head = cur.slice(0, keepLen);
      // Ưu tiên cắt ở dấu câu cuối (. , ; :) trong cửa sổ 30 ký tự cuối.
      const punctRe = /[.,;:][^.,;:]*$/;
      const punctMatch = head.match(punctRe);
      if (punctMatch && punctMatch.index >= keepLen - 50) {
        head = head.slice(0, punctMatch.index);
      } else {
        // Fallback: cắt ở dấu cách cuối, nhưng chỉ nếu còn ≥ keepLen - 20.
        const lastSpace = head.lastIndexOf(' ');
        if (lastSpace > keepLen - 20) head = head.slice(0, lastSpace);
      }
      head = head.replace(/[,;:.\-–—\s]+$/, '');
    } else {
      head = head.replace(/[,;:.\-–—\s]+$/, '');
    }
    const proposed = head + tail;
    return { proposed, length: [...proposed].length, strategy: 'keep_intent_append_hotline' };
  }

  // 4) Fallback chung.
  const tpl = `${service || 'Môi Trường Đô Thị Số 1 Quảng Ninh'} — ${location}. Dịch vụ 24/7 có mặt 15 phút. Gọi 0963.953.533 / 0931.156.756 để được tư vấn và báo giá nhanh.`;
  return { proposed: tpl, length: [...tpl].length, strategy: 'fallback' };
}

async function main() {
  const auditPath = findLatestAudit();
  if (!auditPath) {
    console.error('Không tìm thấy seo-full-audit JSON. Chạy audit trước.');
    process.exit(1);
  }
  console.log(`[1/3] Đọc ${auditPath}`);
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));

  const targets = audit.results.filter((r) => r.probs?.includes('META_NO_HOTLINE'));
  console.log(`[2/3] Có ${targets.length} URL flagged META_NO_HOTLINE.`);

  const rows = [];
  for (let i = 0; i < targets.length; i++) {
    const r = targets[i];
    const restType = r.type === 'post' ? 'post' : 'page';
    process.stdout.write(`  [${i + 1}/${targets.length}] ${r.link} ... `);
    const wpItem = await fetchExcerpt(restType, r.slug);
    if (!wpItem) {
      console.log('FETCH_FAIL');
      rows.push({ ...r, fetchFail: true });
      continue;
    }
    const current = stripHtml(wpItem.excerpt?.raw || wpItem.excerpt?.rendered);
    const proposal = proposeMeta(r.slug, current);
    console.log(`OK (${[...current].length} → ${proposal.length}, ${proposal.strategy})`);
    rows.push({
      id: wpItem.id,
      type: wpItem.type,
      slug: r.slug,
      link: r.link,
      currentLen: [...current].length,
      current,
      proposedLen: proposal.length,
      proposed: proposal.proposed,
      strategy: proposal.strategy,
    });
  }

  const outDir = path.join(ROOT, 'seo-revisions');
  fs.mkdirSync(outDir, { recursive: true });
  const planMd = path.join(outDir, `meta-hotline-fix-plan-${STAMP}.md`);
  const planJson = path.join(outDir, `meta-hotline-fix-plan-${STAMP}.json`);

  const lines = [];
  lines.push(`# Plan fix META_NO_HOTLINE — ${STAMP}`);
  lines.push('');
  lines.push(`**Nguồn audit:** ${path.relative(ROOT, auditPath).replace(/\\/g, '/')}`);
  lines.push(`**Số URL:** ${rows.length}`);
  lines.push('');
  lines.push('## Đề xuất theo URL');
  lines.push('');
  for (const r of rows) {
    lines.push(`### ${r.link}`);
    lines.push('');
    lines.push(`- **WP ID:** ${r.id} (${r.type}) | **slug:** \`${r.slug}\``);
    lines.push(`- **Excerpt hiện tại** (${r.currentLen} ký tự):`);
    lines.push('  > ' + (r.current || '_(rỗng)_'));
    lines.push(`- **Excerpt đề xuất** (${r.proposedLen} ký tự, strategy: ${r.strategy}):`);
    lines.push('  > ' + r.proposed);
    const warn = [];
    if (r.proposedLen < 145 || r.proposedLen > 165) warn.push(`length ${r.proposedLen} ngoài 145-165`);
    if (!/0963\.953\.533/.test(r.proposed) && !/0931\.156\.756/.test(r.proposed)) warn.push('thiếu hotline');
    if (warn.length) lines.push(`- ⚠ **Cần sửa tay:** ${warn.join(', ')}`);
    lines.push('');
  }
  lines.push('## Quy ước duyệt');
  lines.push('');
  lines.push('- Tuyền đọc từng đề xuất, sửa tay vào file MD này nếu muốn đổi câu.');
  lines.push('- Sau khi duyệt, chạy `node tools/apply_meta_hotline_fix.mjs --plan ' + path.basename(planMd) + ' --apply` để push live (tool đó chưa tạo, làm sau khi plan duyệt).');
  lines.push('- Backup tự động tại `seo-revisions/wp-before-meta-hotline-<stamp>/`.');
  lines.push('');
  fs.writeFileSync(planMd, lines.join('\n'));
  fs.writeFileSync(planJson, JSON.stringify({ generatedAt: new Date().toISOString(), source: auditPath, rows }, null, 2));
  console.log(`[3/3] Output:`);
  console.log(`  ${planMd}`);
  console.log(`  ${planJson}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
