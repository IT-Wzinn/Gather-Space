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

    // The watermark is purely in y: 195..240 and x: 80..360
    // Notice that each stone has a base color.
    // If we take a 7x7 median filter ONLY on the stone pixels in y: 195..240, x: 80..360,
    // where any pixel with lum < 50 is mortar:
    const lum = new Float32Array(440 * 440);
    for (let i = 0; i < 440 * 440; i++) {
      lum[i] = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
    }

    // Step 1: Mortar in the watermark is lum < 52
    // Let's smooth out the watermark text by horizontal median (letters are vertical strokes 2-3px wide)
    for (let y = 195; y <= 240; y++) {
      for (let x = 80; x <= 360; x++) {
        const idx = y * 440 + x;
        if (lum[idx] <= 52) continue; // Keep mortar

        // Sample horizontal window [-6..+6] of non-mortar pixels
        const vals = [];
        for (let dx = -6; dx <= 6; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= 440) continue;
          const nidx = y * 440 + nx;
          if (lum[nidx] > 52) {
            vals.push(lum[nidx]);
          }
        }
        if (vals.length >= 3) {
          vals.sort((a, b) => a - b);
          // 40th percentile gives clean base stone without watermark highlight
          lum[idx] = vals[Math.floor(vals.length * 0.4)];
        }
      }
    }

    // Vertical median pass to smooth out any horizontal ridges
    for (let y = 195; y <= 240; y++) {
      for (let x = 80; x <= 360; x++) {
        const idx = y * 440 + x;
        if (lum[idx] <= 52) continue;
        const vals = [];
        for (let dy = -4; dy <= 4; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= 440) continue;
          const nidx = ny * 440 + x;
          if (lum[nidx] > 52) {
            vals.push(lum[nidx]);
          }
        }
        if (vals.length >= 3) {
          vals.sort((a, b) => a - b);
          lum[idx] = vals[Math.floor(vals.length * 0.5)];
        }
      }
    }

    // Palette quantization
    const palette = [44, 98, 114, 132, 154];
    for (let i = 0; i < 440 * 440; i++) {
      let l = lum[i];
      if (l <= 52) {
        l = 44;
      } else {
        let best = palette[1];
        let minD = 999;
        for (let pIdx = 1; pIdx < palette.length; pIdx++) {
          const diff = Math.abs(l - palette[pIdx]);
          if (diff < minD) {
            minD = diff;
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
  console.log('Saved perfect cobblestone to:', outPath);

  await el.screenshot({ path: path.join(__dirname, 'preview_perfect_cobblestone.png') });
  await browser.close();
})();
