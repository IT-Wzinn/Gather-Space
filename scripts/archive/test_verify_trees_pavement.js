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

  // 1. South Avenue West (Room 6 tree hugging wall)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 11 * 32;
      inst.camera.y = 52 * 32;
      inst.camera.zoom = 2.0;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_tree_south_west_fixed.png') });
  console.log('Saved verify_tree_south_west_fixed.png');

  // 2. South Avenue Center (Room 2 tree hugging wall above Reception)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 48 * 32;
      inst.camera.y = 52 * 32;
      inst.camera.zoom = 2.0;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_tree_south_center_fixed.png') });
  console.log('Saved verify_tree_south_center_fixed.png');

  // 3. North Avenue West (Room 5 tree hugging wall)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 27 * 32;
      inst.camera.y = 26 * 32;
      inst.camera.zoom = 2.0;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_tree_north_west_fixed.png') });
  console.log('Saved verify_tree_north_west_fixed.png');

  // 4. North Avenue East (Room 11 tree hugging wall)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 63 * 32;
      inst.camera.y = 26 * 32;
      inst.camera.zoom = 2.0;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_tree_north_east_fixed.png') });
  console.log('Saved verify_tree_north_east_fixed.png');

  // 5. East Boulevard (Bonsai tree hugging Reception east wall)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.camera.x = 68 * 32;
      inst.camera.y = 64 * 32;
      inst.camera.zoom = 2.0;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify_tree_east_reception_fixed.png') });
  console.log('Saved verify_tree_east_reception_fixed.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
