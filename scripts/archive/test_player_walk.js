const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1880, height: 860 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Join room -> Office view
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 600));

  // Hold KeyW to walk UP towards Central Lounge
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('KeyW');
    await new Promise(r => setTimeout(r, 50));
  }

  // Then walk LEFT towards Zen Garden
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('KeyA');
    await new Promise(r => setTimeout(r, 50));
  }

  await new Promise(r => setTimeout(r, 400));
  const outPath = path.join(__dirname, 'rendered_player_walked.png');
  await page.screenshot({ path: outPath });
  console.log('Saved rendered_player_walked.png');

  await browser.close();
})();
