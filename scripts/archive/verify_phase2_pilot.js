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
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Join Room
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1000));

  // 1. Move player directly into Central Lounge right next to the Plum Sofa & Velvet Rug
  console.log('Navigating player into Central Lounge (Khu 2)...');
  await page.evaluate(() => {
    // Walk to center of Central Lounge near the rug and coffee table
    window.mapEngineInstance.player.x = 58 * 16;
    window.mapEngineInstance.player.y = 42 * 16;
    window.mapEngineInstance.player.direction = 'up';
    window.mapEngineInstance.camera.x = 51 * 16;
    window.mapEngineInstance.camera.y = 38 * 16;
    window.mapEngineInstance.camera.zoom = 1.35; // Nice detailed zoom
  });
  await new Promise(r => setTimeout(r, 800));

  const shotLounge = path.join(__dirname, 'phase2_central_lounge_detail.png');
  await page.screenshot({ path: shotLounge });
  console.log('Saved Central Lounge detail screenshot to', shotLounge);

  // 2. Move player into Pantry Bar (Khu 10) ordering at the coffee counter
  console.log('Navigating player into Pantry Bar (Khu 10)...');
  await page.evaluate(() => {
    // Stand in front of the espresso machine and cash register at the counter
    window.mapEngineInstance.player.x = 44 * 16;
    window.mapEngineInstance.player.y = 10 * 16;
    window.mapEngineInstance.player.direction = 'up';
    window.mapEngineInstance.camera.x = 45 * 16;
    window.mapEngineInstance.camera.y = 12 * 16;
    window.mapEngineInstance.camera.zoom = 1.45; // Close-up on cafe details
  });
  await new Promise(r => setTimeout(r, 800));

  const shotPantry = path.join(__dirname, 'phase2_pantry_bar_detail.png');
  await page.screenshot({ path: shotPantry });
  console.log('Saved Pantry Bar detail screenshot to', shotPantry);

  // 3. Reset camera zoom to 1.0 for standard overview
  await page.evaluate(() => {
    window.mapEngineInstance.camera.zoom = 1.0;
  });

  await browser.close();
  console.log('All Phase 2 pilot screenshots captured successfully!');
})();
