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

    // The genuine mortar lines in this texture are very dark: lum <= 45
    // Let's create a mortar mask where lum <= 45
    const isMortar = new Uint8Array(440 * 440);
    for (let i = 0; i < 440 * 440; i++) {
      const lum = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
      if (lum <= 48) {
        isMortar[i] = 1;
      }
    }

    // Connect stone components using flood fill (BFS)
    const stoneId = new Int32Array(440 * 440);
    stoneId.fill(-1);
    let nextId = 0;

    for (let y = 0; y < 440; y++) {
      for (let x = 0; x < 440; x++) {
        const idx = y * 440 + x;
        if (isMortar[idx] || stoneId[idx] !== -1) continue;

        // BFS
        const id = nextId++;
        const queue = [idx];
        stoneId[idx] = id;
        let qHead = 0;

        while (qHead < queue.length) {
          const cur = queue[qHead++];
          const cx = cur % 440;
          const cy = Math.floor(cur / 440);

          const neighbors = [
            cx > 0 ? cur - 1 : -1,
            cx < 439 ? cur + 1 : -1,
            cy > 0 ? cur - 440 : -1,
            cy < 439 ? cur + 440 : -1
          ];

          for (const n of neighbors) {
            if (n !== -1 && !isMortar[n] && stoneId[n] === -1) {
              stoneId[n] = id;
              queue.push(n);
            }
          }
        }
      }
    }

    // For each stone, collect its palette distribution from pixels OUTSIDE watermark zone (y < 175 or y > 275)
    // or if the stone is mostly inside watermark, use the lower quartile to avoid the text
    for (let id = 0; id < nextId; id++) {
      const stonePixels = [];
      const safeLums = [];

      for (let y = 0; y < 440; y++) {
        for (let x = 0; x < 440; x++) {
          const idx = y * 440 + x;
          if (stoneId[idx] === id) {
            stonePixels.push(idx);
            const inW = (y >= 175 && y <= 275 && x >= 50 && x <= 390);
            const l = (d[idx * 4] + d[idx * 4 + 1] + d[idx * 4 + 2]) / 3;
            if (!inW) {
              safeLums.push(l);
            }
          }
        }
      }

      if (stonePixels.length === 0) continue;

      // Determine typical base stone tone
      let baseTone = 114;
      if (safeLums.length > 10) {
        safeLums.sort((a, b) => a - b);
        baseTone = safeLums[Math.floor(safeLums.length * 0.4)]; // robust midtone
      } else {
        // Sample all stone pixels with 25th percentile
        const allLums = stonePixels.map(i => (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3);
        allLums.sort((a, b) => a - b);
        baseTone = allLums[Math.floor(allLums.length * 0.25)];
      }

      // Quantize base tone to authentic palette
      const stonePalette = [98, 114, 132, 154];
      let closestBase = stonePalette[0];
      let minD = 999;
      for (const sp of stonePalette) {
        if (Math.abs(baseTone - sp) < minD) {
          minD = Math.abs(baseTone - sp);
          closestBase = sp;
        }
      }

      // For pixels of this stone that are in the watermark zone, replace with closestBase
      // (or preserve subtle top highlight if in upper 25% of stone)
      let minY = 440, maxY = 0;
      for (const p of stonePixels) {
        const py = Math.floor(p / 440);
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
      const stoneH = maxY - minY;

      for (const p of stonePixels) {
        const px = p % 440;
        const py = Math.floor(p / 440);
        const inW = (py >= 175 && py <= 275 && px >= 50 && px <= 390);

        if (inW) {
          // If in top 20% of stone, give highlight tone
          if (py < minY + stoneH * 0.25 && closestBase < 154) {
            const hi = closestBase === 98 ? 114 : (closestBase === 114 ? 132 : 154);
            d[p * 4] = hi;
            d[p * 4 + 1] = hi + 2;
            d[p * 4 + 2] = hi + 1;
          } else {
            d[p * 4] = closestBase;
            d[p * 4 + 1] = closestBase + 2;
            d[p * 4 + 2] = closestBase + 1;
          }
        } else {
          // Outside watermark: clean quantization to palette
          const curLum = (d[p * 4] + d[p * 4 + 1] + d[p * 4 + 2]) / 3;
          let best = stonePalette[0];
          let bestD = 999;
          for (const sp of stonePalette) {
            if (Math.abs(curLum - sp) < bestD) {
              bestD = Math.abs(curLum - sp);
              best = sp;
            }
          }
          d[p * 4] = best;
          d[p * 4 + 1] = best + 2;
          d[p * 4 + 2] = best + 1;
        }
        d[p * 4 + 3] = 255;
      }
    }

    // Ensure all mortar lines are solid dark charcoal #2c2d2e
    for (let i = 0; i < 440 * 440; i++) {
      if (isMortar[i]) {
        d[i * 4] = 44;
        d[i * 4 + 1] = 44;
        d[i * 4 + 2] = 44;
        d[i * 4 + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  });

  const el = await page.$('#c');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved pristine watermark-free cobblestone texture to:', outPath);

  await el.screenshot({ path: path.join(__dirname, 'preview_pristine_cobblestone.png') });
  await browser.close();
})();
