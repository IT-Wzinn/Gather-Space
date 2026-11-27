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
    ],
    defaultViewport: { width: 1400, height: 850 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Type name and join
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 1: Spawn at Reception
  const shot1 = path.join(__dirname, 'test_reception_32px.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved Reception spawn screenshot to', shot1);

  // Navigate to Central Lounge: x = 51 * 32 = 1632, y = 38 * 32 = 1216
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 1632;
      engine.player.y = 1240;
      engine.camera.x = 1632;
      engine.camera.y = 1240;
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const shot2 = path.join(__dirname, 'test_lounge_32px.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved Central Lounge screenshot to', shot2);

  // Navigate to Zen Garden & Large Boardroom (West wing)
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 25 * 32; // 800
      engine.player.y = 38 * 32; // 1216 (Zen Garden near Koi pond)
      engine.camera.x = 25 * 32;
      engine.camera.y = 38 * 32;
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const shot3 = path.join(__dirname, 'test_zen_pond_32px.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved Zen Pond screenshot to', shot3);

  // Test collisions: verify checkCollision on wall and pond
  const collisionTest = await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    return {
      wallCollision: engine.checkCollision(40 * 32, 35 * 32), // Wall between hallway and lounge
      doorPassable: !engine.checkCollision(49 * 32 + 32, 55 * 32), // Doorway into reception
      pondCollision: engine.checkCollision(25 * 32, 38 * 32), // Inside Zen koi pond
      hallwayFree: !engine.checkCollision(51 * 32, 50 * 32) // South avenue hallway
    };
  });
  console.log('Collision check results:', JSON.stringify(collisionTest));

  await browser.close();
})();
