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

  // 1. PM Studio Overview (Zoom 1.05)
  console.log('Capturing PM Studio Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 74.5 * 32;
      engine.player.y = 34 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 74.5 * 32;
      engine.camera.y = 30.5 * 32;
      engine.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_pm_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved PM Studio overview to', shotOverview);

  // 2. Agile Desk, Scandi Rug & Guest Chairs close-up (Zoom 1.35)
  console.log('Capturing Agile Desk & Scandi Rug close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 74 * 32;
      engine.player.y = 28 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 74 * 32;
      engine.camera.y = 30 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotDesk = path.join(__dirname, 'phase2_pm_desk_kanban.png');
  await page.screenshot({ path: shotDesk });
  console.log('Saved desk & rug close-up to', shotDesk);

  // 3. Wall Kanban Board & Burndown Display close-up (Zoom 1.35)
  console.log('Capturing Wall Kanban & Burndown Display close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 74 * 32;
      engine.player.y = 27 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 74.5 * 32;
      engine.camera.y = 26 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotWall = path.join(__dirname, 'phase2_pm_wall_boards.png');
  await page.screenshot({ path: shotWall });
  console.log('Saved wall boards close-up to', shotWall);

  // 4. Brainstorming Table, Herbal Tea Credenza & Printer close-up (Zoom 1.35)
  console.log('Capturing Brainstorming Table & Tea Credenza close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 75.5 * 32;
      engine.player.y = 31 * 32;
      engine.player.direction = 'right';
      engine.camera.x = 77.5 * 32;
      engine.camera.y = 31 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTea = path.join(__dirname, 'phase2_pm_brainstorm_tea.png');
  await page.screenshot({ path: shotTea });
  console.log('Saved brainstorm table & tea station close-up to', shotTea);

  await browser.close();
  console.log('All PM Studio screenshots captured successfully!');
})();
