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
    // Lấy tất cả dropdown / combobox / select-like elements
    const dropdowns = Array.from(document.querySelectorAll('[role="combobox"], [role="listbox"], [role="button"], div.dropdown, material-select'))
      .map(el => ({
        tagName: el.tagName,
        role: el.getAttribute('role'),
        text: el.textContent?.trim().substring(0, 100) || '',
        visible: el.offsetWidth > 0 && el.offsetHeight > 0
      })).filter(el => el.visible && el.text.length > 0);
      
    // Lấy các checkbox
    const checkboxes = Array.from(document.querySelectorAll('[role="checkbox"], input[type="checkbox"]'))
      .map(cb => ({
        tagName: cb.tagName,
        text: cb.textContent?.trim() || cb.closest('label')?.textContent?.trim() || cb.parentElement?.textContent?.trim() || '',
        visible: cb.offsetWidth > 0 && cb.offsetHeight > 0
      })).filter(cb => cb.visible);
      
    // Lấy các button "Tiếp"
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button'))
      .map(b => ({
        tagName: b.tagName,
        text: b.textContent?.trim(),
        visible: b.offsetWidth > 0 && b.offsetHeight > 0
      })).filter(b => b.visible && (b.text?.includes('Tiếp') || b.text?.includes('Next')));
      
    return { dropdowns, checkboxes, buttons };
  });
  
  console.log('--- DROPDOWNS ---');
  console.log(JSON.stringify(dump.dropdowns, null, 2));
  
  console.log('--- CHECKBOXES ---');
  console.log(JSON.stringify(dump.checkboxes, null, 2));
  
  console.log('--- BUTTONS ---');
  console.log(JSON.stringify(dump.buttons, null, 2));
  
  await browser.disconnect();
}

main().catch(console.error);
