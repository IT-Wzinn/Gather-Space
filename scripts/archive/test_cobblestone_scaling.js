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
  const imgPath = 'C:/Users/ASUS/Downloads/Test 1/preview_clean_clone2.png';
  const imgB64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <canvas id="c128" width="128" height="128"></canvas>
    <canvas id="c176" width="176" height="176"></canvas>
    <canvas id="c220" width="220" height="220"></canvas>
    <canvas id="cPathway" width="512" height="128"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        // 128x128
        const c128 = document.getElementById('c128');
        const ctx128 = c128.getContext('2d');
        ctx128.imageSmoothingEnabled = true;
        ctx128.drawImage(img, 0, 0, 128, 128);

        // 176x176
        const c176 = document.getElementById('c176');
        const ctx176 = c176.getContext('2d');
        ctx176.imageSmoothingEnabled = true;
        ctx176.drawImage(img, 0, 0, 176, 176);

        // 220x220
        const c220 = document.getElementById('c220');
        const ctx220 = c220.getContext('2d');
        ctx220.imageSmoothingEnabled = true;
        ctx220.drawImage(img, 0, 0, 220, 220);

        // Sample pathway strip of 4 repeated tiles
        const cp = document.getElementById('cPathway');
        const ctxP = cp.getContext('2d');
        const pat = ctxP.createPattern(c128, 'repeat');
        ctxP.fillStyle = pat;
        ctxP.fillRect(0, 0, 512, 128);

        window.loaded = true;
      };
      img.src = 'data:image/png;base64,${imgB64}';
    </script>
  `);

  await page.waitForFunction('window.loaded === true');

  const elPathway = await page.$('#cPathway');
  await elPathway.screenshot({ path: path.join(__dirname, 'preview_pathway_strip.png') });

  // Save 128x128 version as outdoor_cobblestone_pavement.png
  const el128 = await page.$('#c128');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el128.screenshot({ path: outPath });
  console.log('Saved 128x128 cobblestone pattern to:', outPath);

  await browser.close();
})();
