const puppeteer = require('puppeteer');
const fs = require('fs-extra');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', { waitUntil: 'networkidle0' });

  const fields = await page.$$eval('input, select, button', els =>
    els.map(el => ({
      tag: el.tagName.toLowerCase(),
      name: el.name || null,
      id: el.id || null,
      type: el.type || null,
      required: el.required || false,
      pattern: el.pattern || null,
      label: (() => {
        const lbl = document.querySelector(`label[for="${el.id}"]`);
        return lbl ? lbl.innerText.trim() : null;
      })()
    }))
  );

  await fs.writeJson('scraper/udyam-step1.json', fields, { spaces: 2 });
  console.log('Scraped fields saved to scraper/udyam-step1.json');

  await browser.close();
})();
