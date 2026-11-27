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
    <canvas id="c" width="440" height="440"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 440, 440, 0, 0, 440, 440);
        window.loaded = true;
      };
      img.src = 'data:image/jpeg;base64,${imgB64}';
    </script>
  `);

  await page.waitForFunction('window.loaded === true');

  const pixelAnalysis = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    // Measure color transitions along row y=100
    const transitions = [];
    let lastR = d[0], lastG = d[1], lastB = d[2];
    let lastX = 0;
    for (let x = 1; x < 440; x++) {
      const idx = (100 * 440 + x) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      const diff = Math.abs(r - lastR) + Math.abs(g - lastG) + Math.abs(b - lastB);
      if (diff > 30) {
        transitions.push(x - lastX);
        lastX = x;
        lastR = r; lastG = g; lastB = b;
      }
    }
    return transitions.slice(0, 25);
  });

  console.log('Horizontal run lengths:', pixelAnalysis);
  await browser.close();
})();
