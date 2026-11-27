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
    ],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Type name and join
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Zen Garden Overview (Zoom 1.05)
  console.log('Capturing Zen Garden Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 29 * 32;
      engine.player.y = 38 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 29 * 32;
      engine.camera.y = 38 * 32;
      engine.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_zen_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Zen Garden overview to', shotOverview);

  // 2. Koi Pond & Arched Wooden Moon Bridge close-up (Zoom 1.35)
  console.log('Capturing Koi Pond & Bridge close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 28 * 32;
      engine.player.y = 34.5 * 32;
      engine.player.direction = 'right';
      engine.camera.x = 29 * 32;
      engine.camera.y = 36 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotPond = path.join(__dirname, 'phase2_zen_pond_bridge.png');
  await page.screenshot({ path: shotPond });
  console.log('Saved pond & bridge close-up to', shotPond);

  // 3. Northwest Tatami & Tea Ceremony close-up (Zoom 1.35)
  console.log('Capturing Tatami Pavilion close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 23 * 32;
      engine.player.y = 33.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 23.5 * 32;
      engine.camera.y = 32.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTatami = path.join(__dirname, 'phase2_zen_tatami.png');
  await page.screenshot({ path: shotTatami });
  console.log('Saved tatami pavilion close-up to', shotTatami);

  // 4. Southwest Shishi-odoshi & Bamboo Grove close-up (Zoom 1.35)
  console.log('Capturing Bamboo & Fountain close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 24.5 * 32;
      engine.player.y = 44 * 32;
      engine.player.direction = 'left';
      engine.camera.x = 24 * 32;
      engine.camera.y = 43.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBamboo = path.join(__dirname, 'phase2_zen_bamboo_fountain.png');
  await page.screenshot({ path: shotBamboo });
  console.log('Saved bamboo & fountain close-up to', shotBamboo);

  // 5. Northeast Raked Sand & Pine Bonsai close-up (Zoom 1.35)
  console.log('Capturing Raked Sand & Bonsai close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 35 * 32;
      engine.player.y = 35 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 35 * 32;
      engine.camera.y = 33 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBonsai = path.join(__dirname, 'phase2_zen_bonsai_sand.png');
  await page.screenshot({ path: shotBonsai });
  console.log('Saved raked sand & bonsai close-up to', shotBonsai);

  await browser.close();
  console.log('All Zen Garden verification screenshots captured successfully!');
})();
