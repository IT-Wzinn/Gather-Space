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

  // 1. Zoom into Reception & South Avenue
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 51.5 * 32, y: 54 * 32, zoom: 1.85 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const southPath = path.join(__dirname, 'verified_scattered_reception.png');
  await page.screenshot({ path: southPath });
  console.log('Saved Reception screenshot to:', southPath);

  // 2. Zoom into North Avenue (Pantry, Cafeteria, Boardroom, Central Lounge)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 45 * 32, y: 26 * 32, zoom: 1.85 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const northPath = path.join(__dirname, 'verified_scattered_north_avenue.png');
  await page.screenshot({ path: northPath });
  console.log('Saved North Avenue screenshot to:', northPath);

  // 3. Zoom into Main Entrance & South Lawn
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 51.5 * 32, y: 72 * 32, zoom: 1.85 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const mainEntrancePath = path.join(__dirname, 'verified_scattered_main_entrance.png');
  await page.screenshot({ path: mainEntrancePath });
  console.log('Saved Main Entrance screenshot to:', mainEntrancePath);

  // 4. Zoom into Classical Ruins Garden (West Courtyard)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 23 * 32, y: 42 * 32, zoom: 2.0 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const ruinsPath = path.join(__dirname, 'verified_scattered_ruins.png');
  await page.screenshot({ path: ruinsPath });
  console.log('Saved Ruins screenshot to:', ruinsPath);

  // 5. Test collision on flowerbeds & grass (both should be walkable / non-blocking)
  const collisionTest = await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (!me) return { error: 'No mapEngineInstance' };

    // Test flowerbed at x: 55.0 * 32 = 1760, y: 51.2 * 32 = 1638.4
    const flowerbedWalkable = !me.checkCollision(1760, 1638);

    // Test grass tuft at x: 40.8 * 32 = 1305.6, y: 51.2 * 32 = 1638.4
    const grassWalkable = !me.checkCollision(1306, 1638);

    // Test cherry tree trunk (should remain blocked)
    const treeBlocked = me.checkCollision(1454, 1638);

    return { flowerbedWalkable, grassWalkable, treeBlocked };
  });

  console.log('Collision Test Result:', collisionTest);

  await browser.close();
})();
