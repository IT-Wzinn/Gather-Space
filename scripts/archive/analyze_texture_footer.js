const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const imgPath = 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795410083794_9c542057.jpg';
  const imgB64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <canvas id="c" width="440" height="454"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        window.loaded = true;
      };
      img.src = 'data:image/jpeg;base64,${imgB64}';
    </script>
  `);

  await page.waitForFunction('window.loaded === true');

  // Let's inspect the bottom rows to find where the footer starts
  const footerAnalysis = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 454);
    const d = imgData.data;

    // Check bottom 40 rows
    const rowWhiteCounts = [];
    for (let y = 414; y < 454; y++) {
      let whiteCount = 0;
      for (let x = 0; x < 440; x++) {
        const idx = (y * 440 + x) * 4;
        const r = d[idx], g = d[idx+1], b = d[idx+2];
        if (r > 240 && g > 240 && b > 240) whiteCount++;
      }
      rowWhiteCounts.push({ y, whiteCount });
    }
    return rowWhiteCounts;
  });

  console.log('Bottom rows white count:', footerAnalysis);

  // Take screenshot of raw image
  const el = await page.$('#c');
  await el.screenshot({ path: 'raw_uploaded_texture.png' });

  await browser.close();
})();
