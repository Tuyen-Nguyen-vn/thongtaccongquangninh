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
    if (p.url().includes('ads.google.com')) {
      adsPage = p;
      break;
    }
  }
  
  if (!adsPage) {
    console.log('No Google Ads tab found.');
    process.exit(1);
  }
  
  console.log(`Connected to: ${adsPage.url()}`);
  
  // Dump all inputs and buttons on the page
  const dump = await adsPage.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      tagName: i.tagName,
      type: i.getAttribute('type'),
      id: i.getAttribute('id'),
      name: i.getAttribute('name'),
      placeholder: i.getAttribute('placeholder'),
      ariaLabel: i.getAttribute('aria-label'),
      value: i.value,
      visible: i.offsetWidth > 0 && i.offsetHeight > 0,
      classes: i.className,
      outerHTML: i.outerHTML.substring(0, 200)
    }));
    
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button')).map(b => ({
      tagName: b.tagName,
      text: b.textContent?.trim().substring(0, 50),
      ariaLabel: b.getAttribute('aria-label'),
      id: b.getAttribute('id'),
      visible: b.offsetWidth > 0 && b.offsetHeight > 0,
      classes: b.className
    })).filter(b => b.visible);
    
    return { inputs, buttons };
  });
  
  console.log('--- INPUTS ---');
  console.log(JSON.stringify(dump.inputs, null, 2));
  
  console.log('--- BUTTONS ---');
  console.log(JSON.stringify(dump.buttons, null, 2));
  
  await browser.disconnect();
}

main().catch(console.error);
