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
  await page.setViewport({ width: 1600, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Login
  await page.waitForSelector('#userNameInput', { timeout: 5000 });
  await page.type('#userNameInput', 'Inspector');
  await page.click('#joinBtn');

  // Wait for canvas
  await page.waitForSelector('#officeMapCanvas', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Enlarged Cherry Blossom tree at Room 2 (matching user's screenshot spot)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 48 * 32;
      inst.camera.y = 52 * 32;
      inst.camera.zoom = 1.9;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_enlarged_tree_room2.png') });
  console.log('Saved verify_enlarged_tree_room2.png');

  // 2. Area 4 (Open Workspace - West & South Lawns)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 18 * 32;
      inst.camera.y = 68 * 32;
      inst.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_trees_area4.png') });
  console.log('Saved verify_trees_area4.png');

  // 3. Area 3 (Zen Garden - West Courtyard & North Lawn)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 24 * 32;
      inst.camera.y = 40 * 32;
      inst.camera.zoom = 1.4;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_trees_area3.png') });
  console.log('Saved verify_trees_area3.png');

  // 4. Spawn Area (Sảnh Lễ Tân / South Campus Entrance Boulevard)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 54 * 32;
      inst.camera.y = 74 * 32;
      inst.camera.zoom = 1.4;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_trees_spawn.png') });
  console.log('Saved verify_trees_spawn.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
