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
  const imgPath = 'C:/Users/ASUS/Downloads/Test 1/preview_median_watermark2.png';
  const imgB64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <canvas id="c" width="440" height="440"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        window.loaded = true;
      };
      img.src = 'data:image/png;base64,${imgB64}';
    </script>
  `);

  await page.waitForFunction('window.loaded === true');

  await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    // Palette snap
    const palette = [44, 98, 114, 132, 154];
    for (let i = 0; i < 440 * 440; i++) {
      const l = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
      let closest = palette[0];
      let minD = 999;
      for (const p of palette) {
        const diff = Math.abs(l - p);
        if (diff < minD) {
          minD = diff;
          closest = p;
        }
      }
      d[i * 4] = closest;
      d[i * 4 + 1] = closest + (closest > 50 ? 2 : 0);
      d[i * 4 + 2] = closest + (closest > 50 ? 1 : 0);
      d[i * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  });

  const el = await page.$('#c');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved snapped palette texture to:', outPath);

  await el.screenshot({ path: path.join(__dirname, 'preview_clean_palette_snap.png') });
  await browser.close();
})();
