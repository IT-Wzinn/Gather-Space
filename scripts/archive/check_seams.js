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

  const seamCheck = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    let lrDiff = 0;
    for (let y = 0; y < 440; y++) {
      const idxL = (y * 440 + 0) * 4;
      const idxR = (y * 440 + 439) * 4;
      lrDiff += Math.abs(d[idxL] - d[idxR]) + Math.abs(d[idxL+1] - d[idxR+1]) + Math.abs(d[idxL+2] - d[idxR+2]);
    }

    let tbDiff = 0;
    for (let x = 0; x < 440; x++) {
      const idxT = (0 * 440 + x) * 4;
      const idxB = (439 * 440 + x) * 4;
      tbDiff += Math.abs(d[idxT] - d[idxB]) + Math.abs(d[idxT+1] - d[idxB+1]) + Math.abs(d[idxT+2] - d[idxB+2]);
    }

    return {
      avgLeftRightDiff: (lrDiff / 440).toFixed(2),
      avgTopBottomDiff: (tbDiff / 440).toFixed(2)
    };
  });

  console.log('Seam check result:', seamCheck);
  await browser.close();
})();
