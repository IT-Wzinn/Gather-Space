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

  // 1. Small Meeting Pod Overview (Zoom 1.05)
  console.log('Capturing Small Meeting Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 12.5 * 32;
      engine.player.y = 36 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 12.5 * 32;
      engine.camera.y = 38 * 32;
      engine.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_meeting_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Small Meeting overview to', shotOverview);

  // 2. Smart Huddle Oval Table close-up (Zoom 1.35)
  console.log('Capturing Smart Huddle Oval Table close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 12.5 * 32;
      engine.player.y = 39.5 * 32;
      engine.player.direction = 'right';
      engine.camera.x = 12.5 * 32;
      engine.camera.y = 40 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTable = path.join(__dirname, 'phase2_meeting_oval_table.png');
  await page.screenshot({ path: shotTable });
  console.log('Saved oval table close-up to', shotTable);

  // 3. Teleconference Display & Whiteboard close-up (Zoom 1.35)
  console.log('Capturing Teleconference Wall close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 12.5 * 32;
      engine.player.y = 33 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 12.5 * 32;
      engine.camera.y = 32.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTelecon = path.join(__dirname, 'phase2_meeting_telecon_wall.png');
  await page.screenshot({ path: shotTelecon });
  console.log('Saved teleconference wall close-up to', shotTelecon);

  // 4. Acoustic Lounge & Refreshment close-up (Zoom 1.35)
  console.log('Capturing Lounge & Refreshment close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 12.5 * 32;
      engine.player.y = 44.5 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 12.5 * 32;
      engine.camera.y = 44.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotLounge = path.join(__dirname, 'phase2_meeting_lounge_water.png');
  await page.screenshot({ path: shotLounge });
  console.log('Saved lounge & refreshment close-up to', shotLounge);

  await browser.close();
  console.log('All Small Meeting screenshots captured successfully!');
})();
