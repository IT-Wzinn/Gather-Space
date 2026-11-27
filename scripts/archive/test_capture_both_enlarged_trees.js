const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1800, height: 750 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Login
  await page.waitForSelector('#userNameInput', { timeout: 5000 });
  await page.type('#userNameInput', 'Inspector');
  await page.click('#joinBtn');

  // Wait for canvas
  await page.waitForSelector('#officeMapCanvas', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  // Panoramic view of South Grand Avenue showing both trees
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 27 * 32;
      inst.camera.y = 53.5 * 32;
      inst.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_both_cherry_trees_side_by_side.png') });
  console.log('Saved verify_both_cherry_trees_side_by_side.png');

  await browser.close();
})();
