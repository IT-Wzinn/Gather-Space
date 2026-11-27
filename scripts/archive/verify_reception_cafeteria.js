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
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Join Room
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1000));

  // 1. Capture Reception Lobby close-up (Spawn pos in front of desk)
  console.log('Setting camera on Reception Lobby (Khu 1)...');
  await page.evaluate(() => {
    window.mapEngineInstance.player.x = 51 * 16;
    window.mapEngineInstance.player.y = 64 * 16;
    window.mapEngineInstance.player.direction = 'up';
    window.mapEngineInstance.camera.x = 51 * 16;
    window.mapEngineInstance.camera.y = 64 * 16;
    window.mapEngineInstance.camera.zoom = 1.35;
  });
  await new Promise(r => setTimeout(r, 800));

  const shotReception = path.join(__dirname, 'phase2_reception_detail.png');
  await page.screenshot({ path: shotReception });
  console.log('Saved Reception Lobby detail screenshot to', shotReception);

  // 2. Capture Cafeteria close-up (Standing at communal dining table)
  console.log('Moving player to Cafeteria (Khu 11)...');
  await page.evaluate(() => {
    window.mapEngineInstance.player.x = 57 * 16;
    window.mapEngineInstance.player.y = 11 * 16;
    window.mapEngineInstance.player.direction = 'up';
    window.mapEngineInstance.camera.x = 57 * 16;
    window.mapEngineInstance.camera.y = 13 * 16;
    window.mapEngineInstance.camera.zoom = 1.4;
  });
  await new Promise(r => setTimeout(r, 800));

  const shotCafeteria = path.join(__dirname, 'phase2_cafeteria_detail.png');
  await page.screenshot({ path: shotCafeteria });
  console.log('Saved Cafeteria detail screenshot to', shotCafeteria);

  // Reset camera
  await page.evaluate(() => {
    window.mapEngineInstance.camera.zoom = 1.0;
  });

  await browser.close();
  console.log('Verification completed successfully!');
})();
