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

  // 1. CTO Executive Suite Overview (Zoom 1.05)
  console.log('Capturing CTO Suite Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 91.5 * 32;
      engine.player.y = 17 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 91.5 * 32;
      engine.camera.y = 13.5 * 32;
      engine.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_cto_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved CTO Suite overview to', shotOverview);

  // 2. Triple 4K Monitor Standing Desk & Aeron Chair close-up (Zoom 1.35)
  console.log('Capturing Standing Desk & Aeron Chair close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 91 * 32;
      engine.player.y = 11 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 91 * 32;
      engine.camera.y = 13 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotDesk = path.join(__dirname, 'phase2_cto_desk_rig.png');
  await page.screenshot({ path: shotDesk });
  console.log('Saved standing desk rig close-up to', shotDesk);

  // 3. Mini Datacenter 42U Server Rack & Telemetry Dashboard close-up (Zoom 1.35)
  console.log('Capturing Server Rack & Telemetry Dashboard close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 92.5 * 32;
      engine.player.y = 10.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 93.5 * 32;
      engine.camera.y = 9.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotRack = path.join(__dirname, 'phase2_cto_server_rack.png');
  await page.screenshot({ path: shotRack });
  console.log('Saved server rack close-up to', shotRack);

  // 4. Cold Brew Tower, Red Bull Fridge & Collectibles close-up (Zoom 1.35)
  console.log('Capturing Cold Brew, Dev Bar & Showcase close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 92.5 * 32;
      engine.player.y = 16.5 * 32;
      engine.player.direction = 'right';
      engine.camera.x = 94.5 * 32;
      engine.camera.y = 15.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBar = path.join(__dirname, 'phase2_cto_coldbrew_bar.png');
  await page.screenshot({ path: shotBar });
  console.log('Saved cold brew & dev bar close-up to', shotBar);

  await browser.close();
  console.log('All CTO Suite screenshots captured successfully!');
})();
