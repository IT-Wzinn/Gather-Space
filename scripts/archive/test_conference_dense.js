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

  // 1. Conference Hall Overview (Zoom 0.85)
  console.log('Capturing Conference Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 21 * 32;
      engine.player.y = 20 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 21 * 32;
      engine.camera.y = 15.5 * 32;
      engine.camera.zoom = 0.85;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_conference_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Conference overview to', shotOverview);

  // 2. Grand Boardroom U-Table & Royal Carpet close-up (Zoom 1.25)
  console.log('Capturing Grand U-Table & Royal Carpet close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 20 * 32;
      engine.player.y = 17.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 20 * 32;
      engine.camera.y = 14.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTable = path.join(__dirname, 'phase2_conference_u_table_carpet.png');
  await page.screenshot({ path: shotTable });
  console.log('Saved grand U-table close-up to', shotTable);

  // 3. Stage, 120" Video Wall & 3D Acoustic Wood Slats close-up (Zoom 1.25)
  console.log('Capturing Stage & Acoustic Wall close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 17 * 32;
      engine.player.y = 11 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 20 * 32;
      engine.camera.y = 9.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotStage = path.join(__dirname, 'phase2_conference_stage_acoustic.png');
  await page.screenshot({ path: shotStage });
  console.log('Saved stage close-up to', shotStage);

  // 4. Translation Booth, Advisory Row & AV Mixing Desk close-up (Zoom 1.25)
  console.log('Capturing Booth & AV Desk close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 27 * 32;
      engine.player.y = 14 * 32;
      engine.player.direction = 'right';
      engine.camera.x = 30.5 * 32;
      engine.camera.y = 14 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBoothAV = path.join(__dirname, 'phase2_conference_booth_av_desk.png');
  await page.screenshot({ path: shotBoothAV });
  console.log('Saved booth & AV desk close-up to', shotBoothAV);

  // 5. Teabreak Buffet & Auditorium Seats close-up (Zoom 1.25)
  console.log('Capturing Teabreak & Auditorium Seats close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 14 * 32;
      engine.player.y = 13.5 * 32;
      engine.player.direction = 'left';
      engine.camera.x = 11.5 * 32;
      engine.camera.y = 13.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTeabreak = path.join(__dirname, 'phase2_conference_teabreak_seats.png');
  await page.screenshot({ path: shotTeabreak });
  console.log('Saved teabreak & auditorium close-up to', shotTeabreak);

  await browser.close();
  console.log('All Conference screenshots captured successfully!');
})();
