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
  await page.type('#userNameInput', 'ExecutiveTester');
  await page.click('#joinBtn');

  // Wait for canvas
  await page.waitForSelector('#officeMapCanvas', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Capture Overview of All 4 Private Offices (7A, 7B, 7C, 7D)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 87 * 16;
      inst.player.y = 20 * 16;
      inst.camera.x = 87 * 16;
      inst.camera.y = 20 * 16;
      inst.camera.zoom = 1.5;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_private_offices_overview.png') });
  console.log('Saved phase2_private_offices_overview.png');

  // 2. Capture Close-up of 7A & 7B (Executive Suites)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 87 * 16;
      inst.player.y = 12 * 16;
      inst.camera.x = 87 * 16;
      inst.camera.y = 11.5 * 16;
      inst.camera.zoom = 1.85;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_executive_suites_7ab.png') });
  console.log('Saved phase2_executive_suites_7ab.png');

  // 3. Capture Close-up of 7C & 7D (Manager & Focus Pod)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 87 * 16;
      inst.player.y = 28 * 16;
      inst.camera.x = 87 * 16;
      inst.camera.y = 28.5 * 16;
      inst.camera.zoom = 1.85;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_studios_7cd.png') });
  console.log('Saved phase2_studios_7cd.png');

  // 4. Test collision logic
  const collisionTest = await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (!inst) return false;

    // 7A CEO Suite
    const hitCeoDesk = inst.checkCollision(77.5 * 16, 10.5 * 16);
    const hitCeoWalkway = inst.checkCollision(78 * 16, 15 * 16);
    const hitCeoDoor = inst.checkCollision(78 * 16, 18 * 16);

    // 7B Director Suite
    const hitDirectorDesk = inst.checkCollision(94.5 * 16, 10.5 * 16);
    const hitDirectorDoor = inst.checkCollision(95 * 16, 18 * 16);

    // 7C Manager Studio
    const hitManagerDesk = inst.checkCollision(77.5 * 16, 27.5 * 16);
    const hitManagerDoor = inst.checkCollision(78 * 16, 35 * 16);

    // 7D Focus Pod
    const hitFocusDesk = inst.checkCollision(94.5 * 16, 25.5 * 16);
    const hitFocusDoor = inst.checkCollision(95 * 16, 35 * 16);

    return {
      hitCeoDesk,
      hitCeoWalkway,
      hitCeoDoor,
      hitDirectorDesk,
      hitDirectorDoor,
      hitManagerDesk,
      hitManagerDoor,
      hitFocusDesk,
      hitFocusDoor
    };
  });

  console.log('Collision test results:', collisionTest);

  await browser.close();
  console.log('All tests completed successfully!');
})();
