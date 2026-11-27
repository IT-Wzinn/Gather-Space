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

  // 1. Join office
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1200));

  // 2. Full overview screenshot
  const fullPath = path.join(__dirname, 'verified_walkway_decorations_full.png');
  await page.screenshot({ path: fullPath });
  console.log('Saved full overview screenshot to:', fullPath);

  // 3. Zoom / Move to North Avenue (Pantry, Cafeteria, Zen Garden, Central Lounge walkways)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 45 * 32, y: 26 * 32, zoom: 2.2 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const northPath = path.join(__dirname, 'verified_north_avenue_decorations.png');
  await page.screenshot({ path: northPath });
  console.log('Saved North Avenue zoom screenshot to:', northPath);

  // 4. Zoom / Move to Zen Garden Classical Sanctuary
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 30 * 32, y: 35 * 32, zoom: 2.2 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const zenPath = path.join(__dirname, 'verified_zen_garden_pillars.png');
  await page.screenshot({ path: zenPath });
  console.log('Saved Zen Garden zoom screenshot to:', zenPath);

  // 5. Zoom / Move to South Avenue & Reception entrance
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 50 * 32, y: 50 * 32, zoom: 2.2 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const southPath = path.join(__dirname, 'verified_south_avenue_reception.png');
  await page.screenshot({ path: southPath });
  console.log('Saved South Avenue zoom screenshot to:', southPath);

  // 6. Test collision on lamppost & pillar
  const collisionTest = await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (!me) return { error: 'No mapEngineInstance' };
    // Test lamppost at x: 38.6 * 32 = 1235.2, y: 25.2 * 32 = 806.4
    // tw = 40, th = 62. Post base: x around 1249, y around 860
    const lpBlocked = me.checkCollision(1249, 860);
    // Open path beside lamppost at x = 1270, y = 860 (walkable)
    const lpOpen = !me.checkCollision(1270, 860);

    // Test ancient pillar at x: 23.5 * 32 = 752, y: 47.8 * 32 = 1529.6
    // tw = 32, th = 82. Base: x around 768, y around 1600
    const pillarBlocked = me.checkCollision(768, 1600);
    const pillarOpen = !me.checkCollision(790, 1600);

    // Test flowerbed (should NOT be blocked) at x: 31.5 * 32 = 1008, y: 24.8 * 32 = 793.6
    const flowerbedOpen = !me.checkCollision(1020, 805);

    return { lpBlocked, lpOpen, pillarBlocked, pillarOpen, flowerbedOpen };
  });
  console.log('Collision Test Result:', collisionTest);

  await browser.close();
})();
