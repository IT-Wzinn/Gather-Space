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

    const copy = new Uint8ClampedArray(d);
    const R = 6; // 13x13 window

    for (let y = 185; y <= 250; y++) {
      for (let x = 65; x <= 375; x++) {
        const idx = (y * 440 + x) * 4;
        const curLum = (copy[idx] + copy[idx+1] + copy[idx+2]) / 3;
        // If it's a mortar line (lum <= 46), keep it as dark mortar
        if (curLum <= 46) {
          d[idx] = 44;
          d[idx+1] = 44;
          d[idx+2] = 44;
          continue;
        }

        const rVals = [], gVals = [], bVals = [];
        for (let dy = -R; dy <= R; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= 440) continue;
          for (let dx = -R; dx <= R; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= 440) continue;
            const nidx = (ny * 440 + nx) * 4;
            const nLum = (copy[nidx] + copy[nidx+1] + copy[nidx+2]) / 3;
            // Only gather non-mortar pixels
            if (nLum > 48) {
              rVals.push(copy[nidx]);
              gVals.push(copy[nidx+1]);
              bVals.push(copy[nidx+2]);
            }
          }
        }

        if (rVals.length > 0) {
          rVals.sort((a,b) => a - b);
          gVals.sort((a,b) => a - b);
          bVals.sort((a,b) => a - b);

          const mid = Math.floor(rVals.length * 0.45); // slight bias towards base tone
          d[idx] = rVals[mid];
          d[idx+1] = gVals[mid];
          d[idx+2] = bVals[mid];
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  });

  const el = await page.$('#c');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved seamless texture to:', outPath);

  await el.screenshot({ path: path.join(__dirname, 'preview_median_watermark2.png') });
  await browser.close();
})();
