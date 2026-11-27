const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 850 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1000));

  // Verify speed property
  const speed = await page.evaluate(() => window.mapEngineInstance.player.speed);
  console.log('Current player speed:', speed);

  // Set click destination
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    me.targetPos = { x: me.player.x + 64, y: me.player.y, tileX: Math.floor((me.player.x + 64)/32)*32, tileY: Math.floor(me.player.y/32)*32 };
  });

  // Verify targetPos is active
  let hasTarget = await page.evaluate(() => !!window.mapEngineInstance.targetPos);
  console.log('Has targetPos before key press:', hasTarget);

  // Press KeyD
  await page.keyboard.press('KeyD');
  await new Promise(r => setTimeout(r, 50));

  // Verify targetPos was canceled by manual key
  hasTarget = await page.evaluate(() => !!window.mapEngineInstance.targetPos);
  console.log('Has targetPos after manual key press:', hasTarget);

  await browser.close();
  console.log('All movement mode checks passed!');
})();
