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

  // 1. Focus Pod Overview (Zoom 1.05)
  console.log('Capturing Focus Pod Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 91.5 * 32;
      engine.player.y = 34 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 91.5 * 32;
      engine.camera.y = 30.5 * 32;
      engine.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_focus_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Focus Pod overview to', shotOverview);

  // 2. Deep Work Acoustic Desk & Soundwave Rug close-up (Zoom 1.35)
  console.log('Capturing Acoustic Desk & Soundwave Rug close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 91 * 32;
      engine.player.y = 28 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 91 * 32;
      engine.camera.y = 30 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotDesk = path.join(__dirname, 'phase2_focus_desk_soundwave.png');
  await page.screenshot({ path: shotDesk });
  console.log('Saved acoustic desk close-up to', shotDesk);

  // 3. Algorithm Blackboard & Ambient Light Shelf close-up (Zoom 1.35)
  console.log('Capturing Algorithm Blackboard & Ambient Light Shelf close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 91 * 32;
      engine.player.y = 27 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 92 * 32;
      engine.camera.y = 26 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBoard = path.join(__dirname, 'phase2_focus_blackboard_ambient.png');
  await page.screenshot({ path: shotBoard });
  console.log('Saved blackboard close-up to', shotBoard);

  // 4. Eames Lounge Chair, Marble Tea Table & Floor Lamp close-up (Zoom 1.35)
  console.log('Capturing Eames Lounge Chair & Reading Corner close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 92.5 * 32;
      engine.player.y = 34 * 32;
      engine.player.direction = 'right';
      engine.camera.x = 94.5 * 32;
      engine.camera.y = 33.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotEames = path.join(__dirname, 'phase2_focus_eames_reading.png');
  await page.screenshot({ path: shotEames });
  console.log('Saved Eames reading corner close-up to', shotEames);

  await browser.close();
  console.log('All Focus Pod screenshots captured successfully!');
})();
