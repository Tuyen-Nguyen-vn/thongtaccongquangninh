import puppeteer from 'puppeteer-core';

async function main() {
  console.log('Connecting to Chrome...');
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  });
  
  const pages = await browser.pages();
  let adsPage = null;
  for (const p of pages) {
    if (p.url().includes('/campaigns/new') || p.url().includes('/setup')) {
      adsPage = p;
      break;
    }
  }
  
  if (!adsPage) {
    console.log('No active setup page found.');
    process.exit(1);
  }
  
  const dump = await adsPage.evaluate(() => {
    // Tìm các radio buttons (Vị trí)
    const radios = Array.from(document.querySelectorAll('material-radio, [role="radio"], input[type="radio"]'))
      .map(r => ({
        tagName: r.tagName,
        text: r.textContent?.trim() || '',
        checked: r.getAttribute('aria-checked') === 'true' || r.checked || false,
        visible: r.offsetWidth > 0 && r.offsetHeight > 0
      })).filter(r => r.visible);

    // Tìm các input text trên trang
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'))
      .map(i => ({
        tagName: i.tagName,
        placeholder: i.getAttribute('placeholder') || '',
        ariaLabel: i.getAttribute('aria-label') || '',
        id: i.getAttribute('id') || '',
        visible: i.offsetWidth > 0 && i.offsetHeight > 0
      })).filter(i => i.visible);

    // Tìm các nút hoặc text liên quan đến Vị trí
    const locationElements = Array.from(document.querySelectorAll('div, span, button'))
      .filter(el => {
        const text = el.textContent?.trim() || '';
        return (text.includes('vị trí') || text.includes('Location')) && text.length < 50;
      })
      .map(el => ({
        tagName: el.tagName,
        text: el.textContent?.trim() || ''
      }));

    return { radios, inputs, locationElements };
  });
  
  console.log('--- RADIOS ---');
  console.log(JSON.stringify(dump.radios, null, 2));
  
  console.log('--- INPUTS ---');
  console.log(JSON.stringify(dump.inputs, null, 2));

  console.log('--- LOCATION RELATED ELEMENTS ---');
  console.log(JSON.stringify(dump.locationElements.slice(0, 15), null, 2));
  
  await browser.disconnect();
}

main().catch(console.error);
