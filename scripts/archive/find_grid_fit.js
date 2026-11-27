const puppeteer = require('puppeteer-core');
const fs = require('fs');

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

  const result = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    // Test different grid candidate sizes: 44 (10px), 40 (11px), 55 (8px), etc.
    const candidates = [32, 40, 44, 48, 50, 55, 64, 88, 110];
    const scores = {};

    candidates.forEach(grid => {
      const step = 440 / grid;
      let varianceSum = 0;
      let count = 0;

      // Sample 20 cells
      for (let gy = 2; gy < Math.min(grid - 2, 20); gy++) {
        for (let gx = 2; gx < Math.min(grid - 2, 20); gx++) {
          const startX = Math.round(gx * step);
          const startY = Math.round(gy * step);
          const endX = Math.round((gx + 1) * step);
          const endY = Math.round((gy + 1) * step);

          let rSum = 0, gSum = 0, bSum = 0, pCount = 0;
          for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
              const idx = (y * 440 + x) * 4;
              rSum += d[idx]; gSum += d[idx+1]; bSum += d[idx+2];
              pCount++;
            }
          }
          const rAvg = rSum / pCount, gAvg = gSum / pCount, bAvg = bSum / pCount;
          let cellVar = 0;
          for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
              const idx = (y * 440 + x) * 4;
              cellVar += Math.abs(d[idx] - rAvg) + Math.abs(d[idx+1] - gAvg) + Math.abs(d[idx+2] - bAvg);
            }
          }
          varianceSum += cellVar / pCount;
          count++;
        }
      }
      scores[grid] = (varianceSum / count).toFixed(2);
    });

    return scores;
  });

  console.log('Grid variance scores (lower means better fit):', result);
  await browser.close();
})();
