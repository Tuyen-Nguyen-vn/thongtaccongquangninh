import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const targetUrl = process.env.LANDING_URL || 'http://localhost:4174/';
const chromePath = '/home/dell/.local/bin/google-chrome';
const screenshotDir = new URL('../reports/visual-check/', import.meta.url);
mkdirSync(screenshotDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: existsSync(chromePath) ? chromePath : undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const step = Math.max(240, Math.floor(window.innerHeight * 0.75));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await delay(180);
      }
      await Promise.all(
        [...document.images].map(
          (image) =>
            new Promise((resolve) => {
              image.loading = 'eager';
              image.scrollIntoView({ block: 'center' });
              if (image.complete) {
                resolve();
                return;
              }
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
            }),
        ),
      );
      window.scrollTo(0, 0);
      await delay(350);
    });

    const data = await page.evaluate(() => {
      const allImages = [...document.images];
      const buttons = [...document.querySelectorAll('a, button')];
      const overflowButtons = buttons
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .map((element) => element.textContent.trim().replace(/\s+/g, ' ').slice(0, 80));

      return {
        title: document.title,
        h1Count: document.querySelectorAll('h1').length,
        h2Count: document.querySelectorAll('h2').length,
        h3Count: document.querySelectorAll('h3').length,
        jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
        imageCount: allImages.length,
        brokenImages: allImages
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute('src')),
        hasMobileSticky: Boolean(document.querySelector('.fixed.inset-x-0.bottom-0')),
        hasCallCta: document.body.innerText.includes('0963.953.533'),
        hasZaloCta: document.body.innerText.includes('Nhắn Zalo'),
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        overflowButtons,
      };
    });

    await page.screenshot({
      path: fileURLToPath(new URL(`${viewport.name}.png`, screenshotDir)),
      fullPage: true,
    });

    results.push({ viewport, data });
    await page.close();
  }
} finally {
  await browser.close();
}

const failures = [];

for (const result of results) {
  const { viewport, data } = result;
  const prefix = `${viewport.name} ${viewport.width}x${viewport.height}`;
  if (data.h1Count !== 1) failures.push(`${prefix}: expected 1 H1, got ${data.h1Count}`);
  if (data.h2Count < 8) failures.push(`${prefix}: expected at least 8 H2, got ${data.h2Count}`);
  if (data.h3Count < 16) failures.push(`${prefix}: expected service/FAQ H3s, got ${data.h3Count}`);
  if (data.jsonLdCount !== 4) failures.push(`${prefix}: expected 4 JSON-LD scripts, got ${data.jsonLdCount}`);
  if (data.brokenImages.length > 0) failures.push(`${prefix}: broken images ${data.brokenImages.join(', ')}`);
  if (!data.hasCallCta) failures.push(`${prefix}: hotline CTA missing`);
  if (!data.hasZaloCta) failures.push(`${prefix}: Zalo CTA missing`);
  if (data.horizontalOverflow > 2) failures.push(`${prefix}: horizontal overflow ${data.horizontalOverflow}px`);
  if (data.overflowButtons.length > 0) failures.push(`${prefix}: button text overflow ${data.overflowButtons.join(' | ')}`);
}

for (const result of results) {
  console.log(
    `PASS ${result.viewport.name}: H1=${result.data.h1Count}, H2=${result.data.h2Count}, H3=${result.data.h3Count}, JSON-LD=${result.data.jsonLdCount}, images=${result.data.imageCount}, overflow=${result.data.horizontalOverflow}px`,
  );
}

console.log(`Screenshots: ${screenshotDir.pathname}`);

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
}
