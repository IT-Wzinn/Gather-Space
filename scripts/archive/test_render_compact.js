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

  // 1. Reception spawn view
  const shot1 = path.join(__dirname, 'test_reception_compact.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved Reception spawn screenshot to', shot1);

  // 2. Central Lounge view (x = 51 * 32 = 1632, y = 38 * 32 = 1216)
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 1632;
      engine.player.y = 1216;
      engine.camera.x = 1632;
      engine.camera.y = 1216;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const shot2 = path.join(__dirname, 'test_lounge_compact.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved Central Lounge screenshot to', shot2);

  // 3. West Avenue & Zen Garden (x = 28 * 32 = 896, y = 38 * 32 = 1216)
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 28 * 32;
      engine.player.y = 38 * 32;
      engine.camera.x = 28 * 32;
      engine.camera.y = 38 * 32;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const shot3 = path.join(__dirname, 'test_zen_compact.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved Zen screenshot to', shot3);

  // 4. Boardroom (x = 21 * 32 = 672, y = 16 * 32 = 512)
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 21 * 32;
      engine.player.y = 16 * 32;
      engine.camera.x = 21 * 32;
      engine.camera.y = 16 * 32;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const shot4 = path.join(__dirname, 'test_boardroom_compact.png');
  await page.screenshot({ path: shot4 });
  console.log('Saved Boardroom screenshot to', shot4);

  // 5. East Avenue & Private Offices (x = 83 * 32 = 2656, y = 22 * 32 = 704)
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 83 * 32;
      engine.player.y = 22 * 32;
      engine.camera.x = 83 * 32;
      engine.camera.y = 22 * 32;
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const shot5 = path.join(__dirname, 'test_offices_compact.png');
  await page.screenshot({ path: shot5 });
  console.log('Saved Offices screenshot to', shot5);

  // Collision Checks
  const collisionTest = await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    return {
      wallCollision: engine.checkCollision(40 * 32, 32 * 32),
      doorPassable: !engine.checkCollision(49 * 32 + 32, 52 * 32),
      pondCollision: engine.checkCollision(28 * 32, 38 * 32),
      hallwayFree: !engine.checkCollision(51 * 32, 49 * 32)
    };
  });
  console.log('Collision check results:', JSON.stringify(collisionTest));

  await browser.close();
})();
