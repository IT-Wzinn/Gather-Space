const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  // Type name and Join
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1200));

  // Center camera and zoom in on player
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me && me.player) {
      me.setZoom(2.2);
      me.camera.x = me.player.x;
      me.camera.y = me.player.y;
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // 1. Initial State: Camera OFF
  const pathOff1 = path.join(__dirname, 'test_cam_off_initial.png');
  await page.screenshot({ path: pathOff1 });
  console.log('Saved', pathOff1);

  // 2. Click Camera button in bottom dock to turn ON
  await page.click('.widget-bottom-dock .media-toggle-cam');
  await new Promise(r => setTimeout(r, 600));

  // Re-center camera on player
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me && me.player) {
      me.camera.x = me.player.x;
      me.camera.y = me.player.y;
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // Capture Camera ON: Video bubble above head!
  const pathOn = path.join(__dirname, 'test_cam_on_bubble.png');
  await page.screenshot({ path: pathOn });
  console.log('Saved', pathOn);

  // 3. Walk character to verify video bubble tracks player movement
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('KeyD');
    await new Promise(r => setTimeout(r, 50));
  }
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('KeyW');
    await new Promise(r => setTimeout(r, 50));
  }
  await new Promise(r => setTimeout(r, 300));

  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me && me.player) {
      me.camera.x = me.player.x;
      me.camera.y = me.player.y;
    }
  });
  await new Promise(r => setTimeout(r, 300));

  const pathWalking = path.join(__dirname, 'test_cam_on_walking.png');
  await page.screenshot({ path: pathWalking });
  console.log('Saved', pathWalking);

  // 4. Click Camera button again to turn OFF
  await page.click('.widget-bottom-dock .media-toggle-cam');
  await new Promise(r => setTimeout(r, 500));

  const pathOff2 = path.join(__dirname, 'test_cam_off_returned.png');
  await page.screenshot({ path: pathOff2 });
  console.log('Saved', pathOff2);

  await browser.close();
  console.log('All tests completed successfully!');
})();
