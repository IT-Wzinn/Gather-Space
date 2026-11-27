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

  const palette = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    // Sample top area (y: 20..140) where there is NO watermark
    const hist = {};
    for (let y = 20; y < 140; y++) {
      for (let x = 20; x < 420; x++) {
        const idx = (y * 440 + x) * 4;
        // round to nearest 4 to group JPEG noise
        const r = Math.round(d[idx] / 6) * 6;
        const g = Math.round(d[idx+1] / 6) * 6;
        const b = Math.round(d[idx+2] / 6) * 6;
        const key = `${r},${g},${b}`;
        hist[key] = (hist[key] || 0) + 1;
      }
    }

    const sorted = Object.entries(hist).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 15);
  });

  console.log('Top colors in non-watermark region:', palette);
  await browser.close();
})();
