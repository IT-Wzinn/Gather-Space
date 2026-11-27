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

  // 1. Pantry Overview (Zoom 0.9)
  console.log('Capturing Pantry & Cafe Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 44.5 * 32;
      engine.player.y = 19 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 45 * 32;
      engine.camera.y = 15.5 * 32;
      engine.camera.zoom = 0.9;
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotOverview = path.join(__dirname, 'phase2_pantry_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Pantry overview to', shotOverview);

  // 2. Grand L-Bar Counter & Commercial Espresso Close-up (Zoom 1.35)
  console.log('Capturing L-Bar Counter & Espresso machine close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 44.5 * 32;
      engine.player.y = 14.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 44 * 32;
      engine.camera.y = 12.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBar = path.join(__dirname, 'phase2_pantry_bar_espresso.png');
  await page.screenshot({ path: shotBar });
  console.log('Saved L-Bar Counter close-up to', shotBar);

  // 3. North Kitchen Appliances & Smart Refrigerator Close-up (Zoom 1.35)
  console.log('Capturing North Kitchen Appliances close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 44.5 * 32;
      engine.player.y = 10 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 45 * 32;
      engine.camera.y = 9 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotKitchen = path.join(__dirname, 'phase2_pantry_kitchen_appliances.png');
  await page.screenshot({ path: shotKitchen });
  console.log('Saved Kitchen Appliances close-up to', shotKitchen);

  // 4. RO Water Purifier, Tea Syrup Station & Recycling Station Close-up (Zoom 1.35)
  console.log('Capturing Tea Station & Recycling Bins close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 44.5 * 32;
      engine.player.y = 18.5 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 44.5 * 32;
      engine.camera.y = 19.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTea = path.join(__dirname, 'phase2_pantry_tea_recycling_corner.png');
  await page.screenshot({ path: shotTea });
  console.log('Saved Tea Station & Recycling close-up to', shotTea);

  await browser.close();
  console.log('All 4 Pantry screenshots captured successfully!');
})();
