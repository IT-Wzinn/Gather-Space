const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const cobbleB64 = fs.readFileSync(path.join(__dirname, 'preview_flawless_cobblestone.png')).toString('base64');

  await page.setContent(`
    <canvas id="c88" width="88" height="88"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const can = document.getElementById('c88');
        const ctx = can.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, 88, 88);
        window.loaded = true;
      };
      img.src = 'data:image/png;base64,${cobbleB64}';
    </script>
  `);

  await page.waitForFunction('window.loaded === true');
  const el = await page.$('#c88');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved 88x88 outdoor_cobblestone_pavement.png to:', outPath);
  await browser.close();
})();
