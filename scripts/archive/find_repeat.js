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

  const match = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    // Compare row 0 with row y (y from 350 to 439)
    const matches = [];
    for (let y = 350; y < 439; y++) {
      let diff = 0;
      for (let x = 0; x < 440; x++) {
        const idx0 = (0 * 440 + x) * 4;
        const idxy = (y * 440 + x) * 4;
        diff += Math.abs(d[idx0] - d[idxy]) + Math.abs(d[idx0+1] - d[idxy+1]) + Math.abs(d[idx0+2] - d[idxy+2]);
      }
      matches.push({ y, avgDiff: (diff / 440).toFixed(1) });
    }
    matches.sort((a, b) => parseFloat(a.avgDiff) - parseFloat(b.avgDiff));
    return matches.slice(0, 5);
  });

  console.log('Top match candidate rows for row 0:', match);

  // Also check column 0 with column x (x from 380 to 439)
  const xMatch = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    const matches = [];
    for (let x = 380; x < 439; x++) {
      let diff = 0;
      for (let y = 0; y < 440; y++) {
        const idx0 = (y * 440 + 0) * 4;
        const idxx = (y * 440 + x) * 4;
        diff += Math.abs(d[idx0] - d[idxx]) + Math.abs(d[idx0+1] - d[idxx+1]) + Math.abs(d[idx0+2] - d[idxx+2]);
      }
      matches.push({ x, avgDiff: (diff / 440).toFixed(1) });
    }
    xMatchSort = matches.sort((a, b) => parseFloat(a.avgDiff) - parseFloat(b.avgDiff));
    return matches.slice(0, 5);
  });

  console.log('Left match candidate cols for col 0:', xMatch);
  await browser.close();
})();
