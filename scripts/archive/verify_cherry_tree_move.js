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

  // Focus camera on Reception (Room 1) and South Avenue
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      // Focus on Reception room (Room 1: x: 40..63, y: 52..70) and north walkway (y: 47..52)
      me.camera = { x: 51.5 * 32, y: 54 * 32, zoom: 1.85 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const screenshotPath = path.join(__dirname, 'verified_cherry_tree_moved.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved Reception screenshot to:', screenshotPath);

  // Test collisions
  const colTest = await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (!me) return { error: 'No mapEngineInstance' };

    const TILE = 32;
    const tw = (78 / 16) * TILE; // 156
    const th = (60 / 16) * TILE; // 120

    // Old location: x = 58.0, y = 47.1
    // Trunk was at x: 58.0 * 32 + 156 * 0.5 = 1934, y: 47.1 * 32 + 120 * 0.8 = 1603
    const oldTrunkBlocked = me.checkCollision(1934, 1603);

    // New location: x = 43.0, y = 48.2
    // Trunk is at x: 43.0 * 32 + 156 * 0.5 = 1454, y: 48.2 * 32 + 120 * 0.8 = 1638
    const newTrunkBlocked = me.checkCollision(1454, 1638);

    // Walkway path in middle of road at x: 45.0 * 32 = 1440, y: 48.5 * 32 = 1552 (should be walkable!)
    const roadwayWalkable = !me.checkCollision(1440, 1552);

    // Walkway doorway clearance at x: 49.5 * 32 = 1584, y: 50.0 * 32 = 1600
    const doorwayWalkable = !me.checkCollision(1584, 1600);

    // Walkway south avenue clearance at x: 40.0 * 32 = 1280, y: 49.0 * 32 = 1568
    const walkwayWalkable = !me.checkCollision(1280, 1568);

    return { oldTrunkBlocked, newTrunkBlocked, doorwayWalkable, walkwayWalkable };
  });

  console.log('Collision Test Result:', colTest);

  await browser.close();
})();
