const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('https://finx-woad.vercel.app');
  await page.waitForTimeout(5000);
  
  const rootContent = await page.$eval('#root', el => el.innerHTML);
  console.log('Root content:', rootContent.substring(0, 500));
  
  await browser.close();
})();
