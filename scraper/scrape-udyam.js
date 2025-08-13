const puppeteer = require('puppeteer');
const fs = require('fs-extra');

async function scrapeForm(url, outputFile) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Load page with no timeout limit
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

  let frame = page.mainFrame();


  const iframeHandle = await page.$('iframe');
  if (iframeHandle) {
    console.log('Form appears to be inside an iframe — switching context...');
    frame = await iframeHandle.contentFrame();
    if (!frame) {
      console.error('Could not access iframe content.');
      await browser.close();
      return;
    }
  }


  await frame.waitForSelector('form', { timeout: 60000 });

  const fields = await frame.$$eval(
    'form input, form select, form textarea, form button',
    elements =>
      elements.map(el => {
        const tag = el.tagName.toLowerCase();
        return {
          tag,
          name: el.getAttribute('name') || null,
          id: el.id || null,
          type: el.getAttribute('type') || (tag === 'select' ? 'select' : tag),
          required: el.required || el.getAttribute('aria-required') === 'true' || false,
          pattern: el.getAttribute('pattern') || null,
          maxlength: el.getAttribute('maxlength') || null,
          placeholder: el.getAttribute('placeholder') || null,
          label: (() => {
            const forId = el.getAttribute('id');
            if (forId) {
              const lbl = document.querySelector(`label[for="${forId}"]`);
              if (lbl) return lbl.innerText.trim();
            }
            const pLabel = el.closest('label');
            if (pLabel) return pLabel.innerText.trim();
            return null;
          })(),
          options: tag === 'select'
            ? Array.from(el.options).map(o => ({ value: o.value, label: o.innerText.trim() }))
            : undefined
        };
      })
  );


  await fs.writeJson(outputFile, fields, { spaces: 2 });
  console.log(` Saved schema to ${outputFile}`);

  await browser.close();
}

(async () => {
  const url = 'https://udyamregistration.gov.in/UdyamRegistration.aspx';
  await scrapeForm(url, 'udyam-step1.json');
})();
