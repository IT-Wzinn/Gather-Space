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
        ctx.drawImage(img, 0, 0, 440, 440, 0, 0, 440, 440);
        window.loaded = true;
      };
      img.src = 'data:image/png;base64,${imgB64}';
    </script>
  `);

  await page.waitForFunction('window.loaded === true');

  await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');

    // 1. Left stone (x: 42..102, y: 185..235)
    ctx.drawImage(c, 42, 238, 60, 22, 42, 192, 60, 22);
    ctx.drawImage(c, 42, 238, 60, 22, 42, 214, 60, 22);

    // 2. Center-left large stone (x: 106..215, y: 214..255)
    ctx.drawImage(c, 110, 265, 105, 42, 110, 215, 105, 42);

    // 3. Center stone (x: 220..318, y: 185..228)
    ctx.drawImage(c, 220, 150, 98, 38, 220, 188, 98, 38);

    // 4. Center-right stone (x: 320..400, y: 185..230)
    ctx.drawImage(c, 325, 148, 75, 38, 325, 186, 75, 38);

    // 5. Mortar lines restoration:
    ctx.fillStyle = '#2c2d2e';
    // Horizontal mortar between top stones (3, 4) and bottom stones (5, 6) at y: 228..234
    ctx.fillRect(218, 228, 185, 7);
    // Vertical mortar between stone 3 and stone 4 at x: 318..323, y: 160..230
    ctx.fillRect(318, 160, 6, 72);
    // Vertical mortar between stone 2 and stone 3 at x: 215..220, y: 160..230
    ctx.fillRect(215, 160, 6, 72);
    // Horizontal mortar above stone 2 at y: 212..218, x: 105..218
    ctx.fillRect(105, 212, 114, 6);
    // Vertical mortar to the left of stone 2 at x: 103..108, y: 215..320
    ctx.fillRect(103, 215, 6, 105);

    // Stone 5 (below stone 3, at x: 220..270, y: 235..280):
    // If any shadow from watermark remains at y: 235..250:
    ctx.drawImage(c, 222, 255, 48, 25, 222, 235, 48, 25);

    // Stone 6 (below stone 4, at x: 275..360, y: 235..295):
    ctx.drawImage(c, 275, 260, 85, 30, 275, 235, 85, 30);

    // Mortar between stone 5 and stone 6 at x: 270..275, y: 230..280:
    ctx.fillRect(270, 230, 6, 52);
  });

  const el = await page.$('#c');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved 100% clean cloned texture to:', outPath);

  await el.screenshot({ path: path.join(__dirname, 'preview_clean_clone2.png') });
  await browser.close();
})();
