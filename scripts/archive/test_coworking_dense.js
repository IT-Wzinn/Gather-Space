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

  // 1. Coworking Overview (Zoom 0.85)
  console.log('Capturing Coworking Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 21 * 32;
      engine.player.y = 65 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 21 * 32;
      engine.camera.y = 61 * 32;
      engine.camera.zoom = 0.85;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_coworking_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved Coworking overview to', shotOverview);

  // 2. Long Benching Workstation System & Hexagon Rug (Zoom 1.25)
  console.log('Capturing Benching Workstations...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 18.5 * 32;
      engine.player.y = 64 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 18.5 * 32;
      engine.camera.y = 61.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBench = path.join(__dirname, 'phase2_coworking_bench_workstations.png');
  await page.screenshot({ path: shotBench });
  console.log('Saved benching workstations close-up to', shotBench);

  // 3. Agile War Room, Miro Board & High-top Table (Zoom 1.25)
  console.log('Capturing Agile War Room...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 15 * 32;
      engine.player.y = 57.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 13.5 * 32;
      engine.camera.y = 54.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotAgile = path.join(__dirname, 'phase2_coworking_agile_war_room.png');
  await page.screenshot({ path: shotAgile });
  console.log('Saved agile war room close-up to', shotAgile);

  // 4. Wooden Bleacher Stadium Seats & Phone Pods (Zoom 1.25)
  console.log('Capturing Bleachers & Phone Pods...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 14 * 32;
      engine.player.y = 67 * 32;
      engine.player.direction = 'left';
      engine.camera.x = 12 * 32;
      engine.camera.y = 66.5 * 32;
      engine.camera.zoom = 1.25;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotBleachers = path.join(__dirname, 'phase2_coworking_bleachers_pods.png');
  await page.screenshot({ path: shotBleachers });
  console.log('Saved bleachers & pods close-up to', shotBleachers);

  await browser.close();
  console.log('All Coworking screenshots captured successfully!');
})();
