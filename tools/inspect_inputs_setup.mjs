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
    // Lấy tất cả checkbox (chọn cách thức đạt mục tiêu)
    const checkboxes = Array.from(document.querySelectorAll('[role="checkbox"], input[type="checkbox"]')).map(cb => ({
      tagName: cb.tagName,
      role: cb.getAttribute('role'),
      type: cb.getAttribute('type'),
      ariaLabel: cb.getAttribute('aria-label'),
      text: cb.textContent?.trim() || cb.closest('label')?.textContent?.trim() || cb.parentElement?.textContent?.trim() || '',
      checked: cb.getAttribute('aria-checked') === 'true' || cb.checked,
      visible: cb.offsetWidth > 0 && cb.offsetHeight > 0
    })).filter(cb => cb.visible);
    
    // Lấy các input văn bản đang có trên trang
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      tagName: i.tagName,
      type: i.getAttribute('type'),
      id: i.id,
      placeholder: i.placeholder,
      ariaLabel: i.getAttribute('aria-label'),
      value: i.value,
      visible: i.offsetWidth > 0 && i.offsetHeight > 0,
      labelText: i.closest('label')?.textContent?.trim() || i.parentElement?.textContent?.trim() || ''
    })).filter(i => i.visible);
    
    // Lấy các button Tiếp tục
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], material-button')).map(b => ({
      tagName: b.tagName,
      text: b.textContent?.trim(),
      visible: b.offsetWidth > 0 && b.offsetHeight > 0
    })).filter(b => b.visible && b.text.includes('Tiếp tục'));
    
    return { checkboxes, inputs, buttons };
  });
  
  console.log('--- CHECKBOXES ---');
  console.log(JSON.stringify(dump.checkboxes, null, 2));
  
  console.log('--- INPUTS ---');
  console.log(JSON.stringify(dump.inputs, null, 2));
  
  console.log('--- BUTTONS ---');
  console.log(JSON.stringify(dump.buttons, null, 2));
  
  await browser.disconnect();
}

main().catch(console.error);
