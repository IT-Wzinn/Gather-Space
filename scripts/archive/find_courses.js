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

  const mortarCourses = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    // Measure average luminance across each horizontal row
    const rowAvg = [];
    for (let y = 0; y < 440; y++) {
      let sum = 0;
      let mortarCount = 0;
      for (let x = 0; x < 440; x++) {
        const idx = (y * 440 + x) * 4;
        const lum = (d[idx] + d[idx+1] + d[idx+2]) / 3;
        sum += lum;
        if (lum < 50) mortarCount++;
      }
      rowAvg.push({ y, avgLum: (sum / 440).toFixed(1), mortarPct: Math.round((mortarCount / 440) * 100) });
    }

    // Find rows with highest mortar percentage around 140..180 and 240..280
    const topCandidates = rowAvg.filter(r => r.y >= 130 && r.y <= 180).sort((a,b) => b.mortarPct - a.mortarPct).slice(0, 5);
    const bottomCandidates = rowAvg.filter(r => r.y >= 250 && r.y <= 290).sort((a,b) => b.mortarPct - a.mortarPct).slice(0, 5);
    return { topCandidates, bottomCandidates };
  });

  console.log('Mortar courses:', mortarCourses);
  await browser.close();
})();
