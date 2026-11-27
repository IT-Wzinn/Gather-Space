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

    // First: make a copy of luminance
    const lum = new Float32Array(440 * 440);
    for (let i = 0; i < 440 * 440; i++) {
      lum[i] = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
    }

    // Identify true mortar lines:
    // Outside the watermark, mortar is < 55. In the watermark, it's < 75.
    const isMortar = new Uint8Array(440 * 440);
    for (let y = 0; y < 440; y++) {
      const inW = (y >= 180 && y <= 265);
      for (let x = 0; x < 440; x++) {
        const idx = y * 440 + x;
        const thresh = (inW && x >= 70 && x <= 370) ? 68 : 55;
        if (lum[idx] < thresh) {
          isMortar[idx] = 1;
        }
      }
    }

    // Now, in the watermark zone (y: 180..265, x: 70..370):
    // For every stone pixel (!isMortar), apply a median filter using only non-mortar neighbors
    // within radius 7 (which is smaller than any stone, but larger than the 2-3px watermark font strokes!)
    const cleanLum = new Float32Array(lum);
    const R = 7;
    for (let y = 180; y <= 265; y++) {
      for (let x = 70; x <= 370; x++) {
        const idx = y * 440 + x;
        if (isMortar[idx]) {
          cleanLum[idx] = 44; // Solid mortar
          continue;
        }

        const vals = [];
        for (let dy = -R; dy <= R; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= 440) continue;
          for (let dx = -R; dx <= R; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= 440) continue;
            const nidx = ny * 440 + nx;
            if (!isMortar[nidx]) {
              vals.push(lum[nidx]);
            }
          }
        }

        if (vals.length > 0) {
          vals.sort((a, b) => a - b);
          // Take median
          const med = vals[Math.floor(vals.length / 2)];
          cleanLum[idx] = med;
        }
      }
    }

    // Palette quantization
    const palette = [44, 98, 114, 132, 154];
    for (let i = 0; i < 440 * 440; i++) {
      let l = cleanLum[i];
      if (isMortar[i]) {
        l = 44;
      } else {
        // Snap to stone palette [98, 114, 132, 154]
        let closest = palette[1];
        let minDiff = 999;
        for (let pIdx = 1; pIdx < palette.length; pIdx++) {
          const diff = Math.abs(l - palette[pIdx]);
          if (diff < minDiff) {
            minDiff = diff;
            closest = palette[pIdx];
          }
        }
        l = closest;
      }

      d[i * 4] = l;
      d[i * 4 + 1] = l + (l > 50 ? 2 : 0);
      d[i * 4 + 2] = l + (l > 50 ? 1 : 0);
      d[i * 4 + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
  });

  const el = await page.$('#c');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved 100% clean cobblestone texture to:', outPath);

  await el.screenshot({ path: path.join(__dirname, 'preview_clean_cobblestone2.png') });
  await browser.close();
})();
