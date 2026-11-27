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
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 850 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Login
  await page.waitForSelector('#userNameInput', { timeout: 5000 });
  await page.type('#userNameInput', 'LandscapeTester');
  await page.click('#joinBtn');

  // Wait for canvas
  await page.waitForSelector('#officeMapCanvas', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Capture Khu 3 (Vườn Tiểu Cảnh & Hồ Cá Koi Zen)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 25 * 16;
      inst.player.y = 31 * 16;
      inst.camera.x = 25 * 16;
      inst.camera.y = 38 * 16;
      inst.camera.zoom = 1.8;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_zen_garden_detail.png') });
  console.log('Saved phase2_zen_garden_detail.png');

  // 2. Capture Khu 4 (Không Gian Làm Việc Mở / Coworking)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 18 * 16;
      inst.player.y = 62 * 16;
      inst.camera.x = 18 * 16;
      inst.camera.y = 64 * 16;
      inst.camera.zoom = 1.7;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_open_workspace_detail.png') });
  console.log('Saved phase2_open_workspace_detail.png');

  // 3. Test collision logic
  const collisionTest = await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (!inst) return false;

    // Zen Garden tests
    const hitKoiPondWater = inst.checkCollision(25 * 16, 38 * 16);
    const hitGardenWalkway = inst.checkCollision(25 * 16, 31 * 16);
    const hitGardenSouthDoor = inst.checkCollision(25 * 16, 47 * 16);
    const hitGardenEastDoor = inst.checkCollision(32 * 16, 37 * 16);

    // Open Workspace tests
    const hitDevDesk = inst.checkCollision(10 * 16, 60.5 * 16);
    const hitOpenWalkway = inst.checkCollision(26 * 16, 60 * 16);
    const hitWorkspaceNorthDoor = inst.checkCollision(26 * 16, 55 * 16);
    const hitWorkspaceEastDoor = inst.checkCollision(32 * 16, 64 * 16);

    return {
      hitKoiPondWater,
      hitGardenWalkway,
      hitGardenSouthDoor,
      hitGardenEastDoor,
      hitDevDesk,
      hitOpenWalkway,
      hitWorkspaceNorthDoor,
      hitWorkspaceEastDoor
    };
  });

  console.log('Collision test results:', collisionTest);

  await browser.close();
  console.log('Zen Garden and Coworking test completed successfully!');
})();
