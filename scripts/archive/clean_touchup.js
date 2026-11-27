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
  const imgPath = 'C:/Users/ASUS/Downloads/Test 1/preview_clean_palette_snap.png';
  const imgB64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <canvas id="c" width="440" height="440"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Touch up center stone faces with clean palette
        // Stone left: fill (140, 215, 75, 25) with #727473 (114)
        ctx.fillStyle = '#727473';
        ctx.fillRect(135, 215, 78, 25);

        // Stone right: fill (222, 205, 90, 23) with #727473 (114)
        ctx.fillRect(222, 205, 95, 22);

        // Small stone bottom right: fill (325, 205, 75, 22) with #848685 (132)
        ctx.fillStyle = '#848685';
        ctx.fillRect(325, 208, 72, 20);

        // Clean mortar lines: #2c2d2e (44)
        ctx.fillStyle = '#2c2d2e';
        // Vertical mortar between left and center stones
        ctx.fillRect(214, 160, 6, 70);
        // Vertical mortar between center and right stones
        ctx.fillRect(318, 160, 6, 70);
        // Horizontal mortar course at y: 228
        ctx.fillRect(214, 227, 185, 6);
        // Top mortar of left stone at y: 212
        ctx.fillRect(105, 212, 114, 6);

        window.loaded = true;
      };
      img.src = 'data:image/png;base64,${imgB64}';
    </script>
  `);

  await page.waitForFunction('window.loaded === true');

  const el = await page.$('#c');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved final flawless texture to:', outPath);

  await el.screenshot({ path: path.join(__dirname, 'preview_flawless_cobblestone.png') });
  await browser.close();
})();
