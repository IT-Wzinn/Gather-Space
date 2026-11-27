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
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const inputHandle = await page.$('#userNameInput');
  if (inputHandle) {
    try {
      await page.type('#userNameInput', 'Lữ Quốc Vinh');
      await page.click('#joinBtn');
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.log('Join click note:', e.message);
    }
  }

  // 1. Quiet Lounge Overview (Zoom 0.85)
  console.log('Capturing Quiet Lounge Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 83 * 32;
      engine.player.y = 60.5 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 83 * 32;
      engine.camera.y = 63.5 * 32;
      engine.camera.zoom = 0.85;
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotOverview = path.join(__dirname, 'phase2_quiet_lounge_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Quiet Lounge overview to', shotOverview);

  // 2. Central VIP Salon Close-up (Zoom 1.25)
  console.log('Capturing Central VIP Salon close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 83 * 32;
      engine.player.y = 61.2 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 83 * 32;
      engine.camera.y = 64.8 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotSalon = path.join(__dirname, 'phase2_quiet_lounge_vip_salon.png');
  await page.screenshot({ path: shotSalon });
  console.log('Saved Central VIP Salon close-up to', shotSalon);

  // 3. Biophilic Moss Wall & Nature Aquarium Close-up (Zoom 1.25)
  console.log('Capturing Biophilic Moss Wall & Nature Aquarium close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 89 * 32;
      engine.player.y = 60.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 90 * 32;
      engine.camera.y = 58.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotAqua = path.join(__dirname, 'phase2_quiet_lounge_biophilic_aquarium.png');
  await page.screenshot({ path: shotAqua });
  console.log('Saved Biophilic Wall & Aquarium close-up to', shotAqua);

  // 4. Artisan Coffee Bar & Boardgame Corner Close-up (Zoom 1.2)
  console.log('Capturing Coffee Bar & Boardgame corner close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 75 * 32;
      engine.player.y = 61 * 32;
      engine.player.direction = 'left';
      engine.camera.x = 73.5 * 32;
      engine.camera.y = 63 * 32;
      engine.camera.zoom = 1.2;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBar = path.join(__dirname, 'phase2_quiet_lounge_bar_hifi_corners.png');
  await page.screenshot({ path: shotBar });
  console.log('Saved Coffee Bar & Boardgame close-up to', shotBar);

  await browser.close();
  console.log('All 4 Quiet Lounge screenshots captured successfully!');
})();
