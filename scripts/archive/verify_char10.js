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

  // Select Character 10 (click next 9 times from index 0 or click thumbnail)
  const buttons = await page.$$('.char-thumb-btn');
  if (buttons.length > 9) {
    await buttons[9].click();
  } else {
    for (let i = 0; i < 9; i++) {
      await page.click('#charNextBtn');
      await new Promise(r => setTimeout(r, 100));
    }
  }
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(__dirname, 'test_char10_prejoin.png') });
  console.log('Saved test_char10_prejoin.png');

  // Type name and join
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 800));

  // Focus camera on player and set direction down
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me && me.player) {
      me.player.direction = 'down';
      me.setZoom(2.2);
      me.camera.x = me.player.x;
      me.camera.y = me.player.y;
    }
  });
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: path.join(__dirname, 'test_char10_in_game_down.png') });
  console.log('Saved test_char10_in_game_down.png');

  // Set direction right
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    if (me && me.player) {
      me.player.direction = 'right';
      me.player.frameIndex = 1;
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, 'test_char10_in_game_right.png') });
  console.log('Saved test_char10_in_game_right.png');

  await browser.close();
})();
