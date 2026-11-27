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

  // 1. Central Lounge Overview (Zoom 1.05)
  console.log('Capturing Central Lounge Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 51.5 * 32;
      engine.player.y = 38 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 51.5 * 32;
      engine.camera.y = 38 * 32;
      engine.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_lounge_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved lounge overview to', shotOverview);

  // 2. Central Island & Fireplace Hearth close-up (Zoom 1.35)
  console.log('Capturing Center Island close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 51.5 * 32;
      engine.player.y = 38.5 * 32;
      engine.camera.x = 51.5 * 32;
      engine.camera.y = 38.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotCenter = path.join(__dirname, 'phase2_lounge_center.png');
  await page.screenshot({ path: shotCenter });
  console.log('Saved center island close-up to', shotCenter);

  // 3. Northwest Coffee Bar & Southwest Arcade (West half, Zoom 1.35)
  console.log('Capturing West Wing (Bar & Games)...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 44 * 32;
      engine.player.y = 38 * 32;
      engine.camera.x = 44 * 32;
      engine.camera.y = 38 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotWest = path.join(__dirname, 'phase2_lounge_west_games_bar.png');
  await page.screenshot({ path: shotWest });
  console.log('Saved west wing close-up to', shotWest);

  // 4. Northeast Grand Piano & Southeast Boho Nook (East half, Zoom 1.35)
  console.log('Capturing East Wing (Piano & Boho Nook)...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 59.5 * 32;
      engine.player.y = 38 * 32;
      engine.camera.x = 59.5 * 32;
      engine.camera.y = 38 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotEast = path.join(__dirname, 'phase2_lounge_east_piano_boho.png');
  await page.screenshot({ path: shotEast });
  console.log('Saved east wing close-up to', shotEast);

  await browser.close();
  console.log('All verification screenshots captured successfully!');
})();
