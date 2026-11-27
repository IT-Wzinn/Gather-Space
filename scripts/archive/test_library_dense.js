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

  // 1. Library Overview (Zoom 0.85)
  console.log('Capturing Grand Library Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 82.5 * 32;
      engine.player.y = 49 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 83 * 32;
      engine.camera.y = 46.5 * 32;
      engine.camera.zoom = 0.85;
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotOverview = path.join(__dirname, 'phase2_library_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Library overview to', shotOverview);

  // 2. Grand Reading Table & Emerald Lamps close-up (Zoom 1.25)
  console.log('Capturing Grand Reading Table close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 81.5 * 32;
      engine.player.y = 44.6 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 81 * 32;
      engine.camera.y = 46.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTable = path.join(__dirname, 'phase2_library_grand_table.png');
  await page.screenshot({ path: shotTable });
  console.log('Saved Grand Reading Table close-up to', shotTable);

  // 3. Massive Bookcases, Rolling Ladder & Antique Globe close-up (Zoom 1.25)
  console.log('Capturing Massive Bookcases & Rolling Ladder close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 87 * 32;
      engine.player.y = 43.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 89 * 32;
      engine.camera.y = 42 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBookcases = path.join(__dirname, 'phase2_library_bookcases_ladder.png');
  await page.screenshot({ path: shotBookcases });
  console.log('Saved Bookcases close-up to', shotBookcases);

  // 4. Librarian Service Desk, Discussion Pod & Wingback Corner (Zoom 1.25)
  console.log('Capturing Discussion Pod & Librarian Desk close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 74 * 32;
      engine.player.y = 45 * 32;
      engine.player.direction = 'left';
      engine.camera.x = 72 * 32;
      engine.camera.y = 45 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotDiscussion = path.join(__dirname, 'phase2_library_discussion_librarian.png');
  await page.screenshot({ path: shotDiscussion });
  console.log('Saved Discussion & Librarian close-up to', shotDiscussion);

  await browser.close();
  console.log('All 4 Library screenshots captured successfully!');
})();
