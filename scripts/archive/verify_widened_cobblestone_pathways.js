const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Join office
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Full Campus Overview
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 53 * 32, y: 39 * 32, zoom: 0.72 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 500));
  const overviewPath = path.join(__dirname, 'verified_cobblestone_full_overview.png');
  await page.screenshot({ path: overviewPath });
  console.log('Saved Full Campus Overview to:', overviewPath);

  // 2. North Grand Avenue & Food Court Promenade (Pantry / Cafeteria / Lounge / Grand Fountain)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 52 * 32, y: 22 * 32, zoom: 1.6 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 500));
  const northAvenuePath = path.join(__dirname, 'verified_cobblestone_north_avenue.png');
  await page.screenshot({ path: northAvenuePath });
  console.log('Saved North Grand Avenue to:', northAvenuePath);

  // 3. Central Hub Plaza & Main Entrance Boulevard
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 51 * 32, y: 55 * 32, zoom: 1.6 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 500));
  const centralHubPath = path.join(__dirname, 'verified_cobblestone_central_hub.png');
  await page.screenshot({ path: centralHubPath });
  console.log('Saved Central Hub Plaza to:', centralHubPath);

  // 4. Executive Suites Promenade & Crossroad Plaza
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 83 * 32, y: 22 * 32, zoom: 1.7 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 500));
  const execPromenadePath = path.join(__dirname, 'verified_cobblestone_exec_promenade.png');
  await page.screenshot({ path: execPromenadePath });
  console.log('Saved Executive Suites Promenade to:', execPromenadePath);

  // 5. Player Walk Test on Widened Cobblestone Avenue with White Target Tile
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 51 * 32, y: 50 * 32, zoom: 1.85 };
      // Move player into Central Plaza
      me.player.x = 51 * 32;
      me.player.y = 51 * 32;
      // Set target to walk east along the South Grand Avenue
      const targetX = 64 * 32;
      const targetY = 50 * 32;
      const tileX = Math.floor(targetX / 32) * 32;
      const tileY = Math.floor(targetY / 32) * 32;
      me.targetPos = { x: targetX, y: targetY, tileX, tileY };
      me.targetIndicatorTimer = 0.5;
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 500));
  const walkTestPath = path.join(__dirname, 'verified_cobblestone_walk_test.png');
  await page.screenshot({ path: walkTestPath });
  console.log('Saved Walk Test on Cobblestone to:', walkTestPath);

  await browser.close();
  console.log('All pathway verifications complete!');
})();
