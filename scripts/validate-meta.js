import puppeteer from 'puppeteer';

// Replace with your actual production or preview domain
const BASE_URL = 'https://your-domain.com'; 
const PAGES_TO_CHECK = ['/', '/features', '/pricing', '/about'];

async function checkMetaTags(url) {
  let browser;
  try {
    console.log(`Checking meta tags for: ${url}`);
    browser = await puppeteer.launch({ headless: true }); // Changed to true for automation
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' }); // Wait for network activity to cease

    const metaTags = await page.evaluate(() => {
      const tags = {};
      // OG tags
      document.querySelectorAll('head meta[property^="og:"]')
        .forEach(el => {
          const property = el.getAttribute('property');
          const content = el.getAttribute('content');
          if (property && content) {
            tags[property] = content;
          }
        });
      // Twitter tags
      document.querySelectorAll('head meta[name^="twitter:"]')
        .forEach(el => {
          const name = el.getAttribute('name');
          const content = el.getAttribute('content');
          if (name && content) {
            tags[name] = content;
          }
        });
      // Title and Description
      tags['title'] = document.title;
      const descriptionTag = document.querySelector('head meta[name="description"]');
      tags['description'] = descriptionTag ? descriptionTag.getAttribute('content') : 'Not found';
      
      return tags;
    });

    console.log(`--- Meta Tags for ${url} ---`);
    console.log(JSON.stringify(metaTags, null, 2));
    console.log('---------------------------\n');

    // Basic validation example (extend as needed)
    if (!metaTags['og:title'] || !metaTags['og:description'] || !metaTags['og:image']) {
       console.warn(`[WARNING] Missing essential OG tags for ${url}`);
    }
    if (!metaTags['twitter:card']) {
       console.warn(`[WARNING] Missing twitter:card for ${url}`);
    }

  } catch (error) {
    console.error(`Error checking meta tags for ${url}:`, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

(async () => {
  console.log(`Starting meta tag validation for ${BASE_URL}...`);
  for (const pagePath of PAGES_TO_CHECK) {
    await checkMetaTags(`${BASE_URL}${pagePath}`);
  }
  console.log('Meta tag validation complete.');
})(); 