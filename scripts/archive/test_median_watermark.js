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
  const imgPath = 'C:/Users/ASUS/Downloads/Test 1/raw_uploaded_texture.png';
  const imgB64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <canvas id="c" width="440" height="440"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 440, 440, 0, 0, 440, 440);
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

    // Apply 5x5 median filter ONLY in y: 190..245, x: 75..365
    const copy = new Uint8ClampedArray(d);
    const R = 3; // 7x7 window

    for (let y = 190; y <= 245; y++) {
      for (let x = 75; x <= 365; x++) {
        const rVals = [], gVals = [], bVals = [];
        for (let dy = -R; dy <= R; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= 440) continue;
          for (let dx = -R; dx <= R; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= 440) continue;
            const nidx = (ny * 440 + nx) * 4;
            rVals.push(copy[nidx]);
            gVals.push(copy[nidx+1]);
            bVals.push(copy[nidx+2]);
          }
        }
        rVals.sort((a,b) => a - b);
        gVals.sort((a,b) => a - b);
        bVals.sort((a,b) => a - b);

        const mid = Math.floor(rVals.length / 2);
        const idx = (y * 440 + x) * 4;
        d[idx] = rVals[mid];
        d[idx+1] = gVals[mid];
        d[idx+2] = bVals[mid];
      }
    }

    ctx.putImageData(imgData, 0, 0);
  });

  const el = await page.$('#c');
  await el.screenshot({ path: path.join(__dirname, 'preview_median_watermark.png') });
  await browser.close();
})();
