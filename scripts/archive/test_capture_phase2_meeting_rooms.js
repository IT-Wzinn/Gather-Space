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
  await page.type('#userNameInput', 'Auditor');
  await page.click('#joinBtn');

  // Wait for canvas
  await page.waitForSelector('#officeMapCanvas', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Capture Khu 5 (Phòng Họp Lớn Hội Nghị)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 18 * 16;
      inst.player.y = 15 * 16;
      inst.camera.x = 18 * 16;
      inst.camera.y = 13.5 * 16;
      inst.camera.zoom = 1.7;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_conference_hall_detail.png') });
  console.log('Saved phase2_conference_hall_detail.png');

  // 2. Capture Khu 6 (Phòng Họp Nhỏ / Phỏng Vấn)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 9.5 * 16;
      inst.player.y = 38 * 16;
      inst.camera.x = 9.5 * 16;
      inst.camera.y = 38 * 16;
      inst.camera.zoom = 1.9;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_meeting_pod_detail.png') });
  console.log('Saved phase2_meeting_pod_detail.png');

  // 3. Test collision logic
  const collisionTest = await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (!inst) return false;
    const hitBoardroomTable = inst.checkCollision(18 * 16, 12.5 * 16);
    const hitBoardroomAisle = inst.checkCollision(18 * 16, 17 * 16);
    const hitBoardroomDoor = inst.checkCollision(18 * 16, 22 * 16);

    const hitInterviewTable = inst.checkCollision(8.5 * 16, 42.5 * 16);
    const hitInterviewAisle = inst.checkCollision(9.5 * 16, 38 * 16);
    const hitInterviewEastDoor = inst.checkCollision(15 * 16, 37 * 16);

    return {
      hitBoardroomTable,
      hitBoardroomAisle,
      hitBoardroomDoor,
      hitInterviewTable,
      hitInterviewAisle,
      hitInterviewEastDoor
    };
  });

  console.log('Collision test results:', collisionTest);

  await browser.close();
  console.log('Meeting rooms test completed successfully!');
})();
