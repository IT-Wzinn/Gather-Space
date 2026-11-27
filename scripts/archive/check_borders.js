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

  const borderInfo = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    function getPixel(x, y) {
      const idx = (y * 440 + x) * 4;
      return [d[idx], d[idx+1], d[idx+2]];
    }

    return {
      topRow: [getPixel(0,0), getPixel(50,0), getPixel(100,0), getPixel(200,0), getPixel(300,0), getPixel(439,0)],
      bottomRow: [getPixel(0,430), getPixel(50,430), getPixel(100,430), getPixel(200,430), getPixel(300,430), getPixel(439,430)],
      leftCol: [getPixel(0,0), getPixel(0,50), getPixel(0,100), getPixel(0,200), getPixel(0,300), getPixel(0,430)],
      rightCol: [getPixel(439,0), getPixel(439,50), getPixel(439,100), getPixel(439,200), getPixel(439,300), getPixel(439,430)],
    };
  });

  console.log('Border sample pixels:', borderInfo);
  await browser.close();
})();
