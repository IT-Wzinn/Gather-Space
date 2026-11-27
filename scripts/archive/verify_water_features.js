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

  // 1. Zoom into North Central Campus Lawn (Grand Marble Orb Fountain)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 52 * 32, y: 7 * 32, zoom: 1.85 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const northFountainPath = path.join(__dirname, 'verified_fountain_north_grand_orb.png');
  await page.screenshot({ path: northFountainPath });
  console.log('Saved North Grand Orb Fountain screenshot to:', northFountainPath);

  // 2. Zoom into South-East Relaxation Lawn (Kidney Swimming Pool below Room 9)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 86 * 32, y: 72 * 32, zoom: 1.85 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const poolPath = path.join(__dirname, 'verified_pool_kidney_southeast.png');
  await page.screenshot({ path: poolPath });
  console.log('Saved Kidney Pool screenshot to:', poolPath);

  // 3. Zoom into West Garden Sanctuary (Enlarged Circular Stone Fountain on West Lawn)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 5 * 32, y: 38 * 32, zoom: 1.95 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const westFountainPath = path.join(__dirname, 'verified_fountain_west_sanctuary.png');
  await page.screenshot({ path: westFountainPath });
  console.log('Saved West Sanctuary Fountain screenshot to:', westFountainPath);

  // 4. Zoom into South-West Lawn (Grand Orb & Tiered Classic Fountains under Cherry Blossoms)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 19 * 32, y: 72 * 32, zoom: 1.85 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const swFountainPath = path.join(__dirname, 'verified_fountain_southwest_lawns.png');
  await page.screenshot({ path: swFountainPath });
  console.log('Saved South-West Fountains screenshot to:', swFountainPath);

  // 5. Zoom into Executive Suites Promenade Plaza (Ornate Pedestal Fountain)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 83 * 32, y: 22 * 32, zoom: 2.1 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const execFountainPath = path.join(__dirname, 'verified_fountain_exec_promenade.png');
  await page.screenshot({ path: execFountainPath });
  console.log('Saved Exec Promenade Fountain screenshot to:', execFountainPath);

  // 6. Full campus overview
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 53 * 32, y: 39 * 32, zoom: 0.72 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const overviewPath = path.join(__dirname, 'verified_water_features_overview.png');
  await page.screenshot({ path: overviewPath });
  console.log('Saved Full Overview screenshot to:', overviewPath);

  // 7. Test collisions
  const collisionTest = await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (!me) return { error: 'No mapEngineInstance' };

    const TILE = 32;

    // Test Enlarged Grand Orb Fountain at x: 49.4, y: 1.8, w: 96, h: 62
    const grandFountainBlocked = me.checkCollision(1676, 136);
    // Walkway beside grand fountain (walkable): x = 45 * 32 = 1440, y = 136
    const grandFountainWalkableBeside = !me.checkCollision(1440, 136);

    // Test Enlarged Kidney Pool at x: 84.5, y: 71.5, w: 76, h: 71
    const poolBlocked = me.checkCollision(2780, 2360);
    // Deck beside pool (walkable): x = 81 * 32 = 2592, y = 2360
    const poolWalkableBeside = !me.checkCollision(2592, 2360);

    // Test Enlarged Circular Stone Fountain at x: 3.2, y: 35.5, w: 42, h: 40
    const stoneFountainBlocked = me.checkCollision(144, 1186);
    const stoneFountainWalkableBeside = !me.checkCollision(200, 1186);

    // Test Enlarged Ornate Pedestal Fountain at x: 84.0, y: 20.6, w: 42, h: 44
    const ornateFountainBlocked = me.checkCollision(2730, 715);

    return {
      grandFountainBlocked,
      grandFountainWalkableBeside,
      poolBlocked,
      poolWalkableBeside,
      stoneFountainBlocked,
      ornateFountainBlocked
    };
  });

  console.log('Collision Test Result:', collisionTest);

  await browser.close();
})();
