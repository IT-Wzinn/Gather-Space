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

  // Join
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Full map screenshot
  const fullPath = path.join(__dirname, 'verified_walkway_decorations_full.png');
  await page.screenshot({ path: fullPath });
  console.log('Saved full overview screenshot to:', fullPath);

  // 2. Zoom to Bottom area (x: 53 * 32, y: 73 * 32, zoom: 1.8)
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 53 * 32, y: 73 * 32, zoom: 1.6 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const bottomPath = path.join(__dirname, 'verified_bottom_sakura_trees.png');
  await page.screenshot({ path: bottomPath });
  console.log('Saved bottom sakura screenshot to:', bottomPath);

  // 3. Zoom to bottom-left corner
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 18 * 32, y: 73 * 32, zoom: 1.8 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const bottomLeftPath = path.join(__dirname, 'verified_bottom_left_sakura.png');
  await page.screenshot({ path: bottomLeftPath });
  console.log('Saved bottom-left sakura screenshot to:', bottomLeftPath);

  // 4. Zoom to bottom-right corner
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me) {
      me.camera = { x: 88 * 32, y: 73 * 32, zoom: 1.8 };
      me.render();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const bottomRightPath = path.join(__dirname, 'verified_bottom_right_sakura.png');
  await page.screenshot({ path: bottomRightPath });
  console.log('Saved bottom-right sakura screenshot to:', bottomRightPath);

  // 5. Test collision on bottom sakura tree
  const colTest = await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (!me) return { error: 'No mapEngine' };
    // tree at x: 23.0 * 32 = 736, y: 71.8 * 32 = 2297.6
    // tw = 156, th = 120. Base: x around 814, y around 2400
    const treeBlocked = me.checkCollision(814, 2400);
    const pathBesideOpen = !me.checkCollision(850, 2400);
    return { treeBlocked, pathBesideOpen };
  });
  console.log('Bottom Sakura Collision Result:', colTest);

  await browser.close();
})();
