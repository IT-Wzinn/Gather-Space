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

  // 1. Cafeteria Overview (Zoom 0.9)
  console.log('Capturing Cafeteria Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 56 * 32;
      engine.player.y = 19 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 57.5 * 32;
      engine.camera.y = 15.5 * 32;
      engine.camera.zoom = 0.9;
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotOverview = path.join(__dirname, 'phase2_cafeteria_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Cafeteria overview to', shotOverview);

  // 2. Communal Oak Long Dining Table Close-up (Zoom 1.35)
  console.log('Capturing Communal Dining Table close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 55 * 32;
      engine.player.y = 14.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 57 * 32;
      engine.camera.y = 11.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTable = path.join(__dirname, 'phase2_cafeteria_communal_table.png');
  await page.screenshot({ path: shotTable });
  console.log('Saved Communal Table close-up to', shotTable);

  // 3. Buffet Food Warmer & Salad Bar Close-up (Zoom 1.35)
  console.log('Capturing Buffet & Salad Bar close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 56.5 * 32;
      engine.player.y = 10 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 57 * 32;
      engine.camera.y = 9 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBuffet = path.join(__dirname, 'phase2_cafeteria_buffet_salad_bar.png');
  await page.screenshot({ path: shotBuffet });
  console.log('Saved Buffet & Salad Bar close-up to', shotBuffet);

  // 4. Booth Sofa Dining Set & Vending Machine Close-up (Zoom 1.25)
  console.log('Capturing Booth Sofa & Vending Machine close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 55.5 * 32;
      engine.player.y = 17 * 32;
      engine.player.direction = 'right';
      engine.camera.x = 57.5 * 32;
      engine.camera.y = 18.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBooth = path.join(__dirname, 'phase2_cafeteria_booth_vending_corners.png');
  await page.screenshot({ path: shotBooth });
  console.log('Saved Booth Sofa & Vending close-up to', shotBooth);

  await browser.close();
  console.log('All 4 Cafeteria screenshots captured successfully!');
})();
