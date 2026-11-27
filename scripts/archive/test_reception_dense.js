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

  // 1. Reception Overview (Zoom 1.05)
  console.log('Capturing Reception Lobby Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 51 * 32;
      engine.player.y = 62 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 51.5 * 32;
      engine.camera.y = 61 * 32;
      engine.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_reception_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved overview to', shotOverview);

  // 2. Central Reception Desk & Brand Wall close-up (Zoom 1.35)
  console.log('Capturing Reception Desk close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 51 * 32;
      engine.player.y = 59.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 51.5 * 32;
      engine.camera.y = 56.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotDesk = path.join(__dirname, 'phase2_reception_desk.png');
  await page.screenshot({ path: shotDesk });
  console.log('Saved desk close-up to', shotDesk);

  // 3. South Entrance & Turnstiles close-up (Zoom 1.35)
  console.log('Capturing Entrance & Turnstiles close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 51 * 32;
      engine.player.y = 67.5 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 51 * 32;
      engine.camera.y = 67.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotEntrance = path.join(__dirname, 'phase2_reception_entrance.png');
  await page.screenshot({ path: shotEntrance });
  console.log('Saved entrance close-up to', shotEntrance);

  // 4. Test player walk around VIP lounge
  console.log('Testing player walking to VIP lounge...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 44 * 32;
      engine.player.y = 61 * 32;
      engine.camera.x = 44 * 32;
      engine.camera.y = 60 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotVIP = path.join(__dirname, 'phase2_reception_vip.png');
  await page.screenshot({ path: shotVIP });
  console.log('Saved VIP lounge close-up to', shotVIP);

  await browser.close();
  console.log('All verification screenshots captured successfully!');
})();
