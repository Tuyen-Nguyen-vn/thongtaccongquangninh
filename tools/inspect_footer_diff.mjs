import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROJECT = 'D:\\.thongtaccongquangninh';

const urls = {
  homepage: 'https://thongtaccongquangninh.com/',
  shared_standard: 'https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh-2/',
  ha_long: 'https://thongtaccongquangninh.com/thong-tac-cong-ha-long/',
  gieng_day: 'https://thongtaccongquangninh.com/thong-tac-cong-gieng-day-2/',
};

async function inspect() {
  const scratchDir = path.join(PROJECT, 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  for (const [name, url] of Object.entries(urls)) {
    console.log(`Fetching ${name}: ${url} ...`);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'TTCQN-Inspector/1.0' } });
      const html = await res.text();

      const footerMatch = html.match(/<footer\b[^>]*class=["\'][^"\']*\bhome-footer\b[^"\']*["\'][^>]*>([\s\S]*?)<\/footer>/i);
      if (footerMatch) {
        let norm = footerMatch[0];
        norm = norm.replace(/\sloading=["\'](lazy|eager)["\']/gi, '');
        norm = norm.replace(/\sdecoding=["\'](async|sync|auto)["\']/gi, '');
        norm = norm.replace(/\sclass=["\']([^"\']*\b)(lazyloaded|lazyloading|lazyload)\b([^"\']*["\'])/gi, ' class="$1$3"');
        norm = norm.replace(/\sdata-lazy-[^=]+=["\'][^"\']*["\']/gi, '');
        norm = norm.replace(/\sdata-src=["\'][^"\']*["\']/gi, '');
        norm = norm.replace(/\s+/g, ' ').trim();

        const hash = crypto.createHash('md5').update(norm).digest('hex').slice(0, 12);
        console.log(`-> Found footer: length = ${footerMatch[0].length}, normalized hash = ${hash}`);

        const filePath = path.join(scratchDir, `footer_${name}_${hash}.html`);
        fs.writeFileSync(filePath, norm, 'utf8');
        console.log(`-> Saved normalized footer to ${filePath}`);
      } else {
        console.log(`-> NO home-footer found!`);
      }
    } catch (e) {
      console.error(`-> Error: ${e.message}`);
    }
  }
}

inspect();
