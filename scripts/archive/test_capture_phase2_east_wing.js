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
  await page.type('#userNameInput', 'Inspector');
  await page.click('#joinBtn');

  // Wait for canvas
  await page.waitForSelector('#officeMapCanvas', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Capture Khu 8 (Phòng Đọc Sách & Thảo Luận)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 87 * 16;
      inst.player.y = 47 * 16;
      inst.camera.x = 87 * 16;
      inst.camera.y = 46.5 * 16;
      inst.camera.zoom = 1.8;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_library_detail.png') });
  console.log('Saved phase2_library_detail.png');

  // 2. Capture Khu 9 (Phòng Thư Giãn & Tiếp Khách Nhỏ)
  await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (inst) {
      inst.player.x = 87 * 16;
      inst.player.y = 66 * 16;
      inst.camera.x = 87 * 16;
      inst.camera.y = 65.5 * 16;
      inst.camera.zoom = 1.8;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'phase2_quiet_lounge_detail.png') });
  console.log('Saved phase2_quiet_lounge_detail.png');

  // 3. Test collision logic
  const collisionTest = await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    if (!inst) return false;
    // Test hitting North Bookcase in Library (x=75*16, y=41*16)
    const hitBookcase = inst.checkCollision(75 * 16, 41 * 16);
    // Test open aisle in Library (x=86*16, y=44*16)
    const hitOpenAisle = inst.checkCollision(86 * 16, 44 * 16);
    // Test hitting VIP Sofa in Quiet Lounge (x=85*16, y=64.5*16)
    const hitSofa = inst.checkCollision(85 * 16, 64.5 * 16);
    // Test walking through West door of Library (x=72*16, y=45*16)
    const hitLibraryDoor = inst.checkCollision(72 * 16, 45 * 16);
    return { hitBookcase, hitOpenAisle, hitSofa, hitLibraryDoor };
  });

  console.log('Collision test results:', collisionTest);

  await browser.close();
  console.log('Test completed successfully!');
})();
