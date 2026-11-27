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

    // 1. Inpaint stone 1 (left stone at x: 40..105, y: 185..235):
    // Source clean bottom of this stone: x: 40..105, y: 235..260
    ctx.drawImage(c, 42, 238, 62, 20, 42, 195, 62, 20);
    ctx.drawImage(c, 42, 238, 62, 20, 42, 215, 62, 20);

    // 2. Inpaint stone 2 (center-left large stone at x: 105..220, y: 215..260):
    // Source clean bottom of this stone: x: 105..220, y: 260..305
    ctx.drawImage(c, 110, 265, 105, 40, 110, 215, 105, 40);

    // 3. Inpaint stone 3 (center stone at x: 218..320, y: 180..230):
    // Source clean top of this stone: x: 218..320, y: 145..185
    ctx.drawImage(c, 222, 150, 96, 35, 222, 185, 96, 35);

    // 4. Inpaint stone 4 (center-right stone at x: 320..400, y: 180..230):
    // Source clean top of this stone: x: 320..400, y: 145..180
    ctx.drawImage(c, 325, 148, 72, 35, 325, 183, 72, 35);

    // 5. Inpaint the camera aperture logo right in the intersection at (x: 200..235, y: 200..235):
    // In that intersection, there's mortar line between stone 2 and stone 3!
    // Mortar line runs vertically around x=218. Let's redraw the crisp mortar:
    ctx.fillStyle = '#2c2d2e';
    ctx.fillRect(215, 185, 6, 45);

    // Also horizontal mortar above stone 2 at y: 215, x: 105..218:
    ctx.fillRect(105, 213, 113, 6);
  });

  const el = await page.$('#c');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved cloned inpaint texture to:', outPath);

  await el.screenshot({ path: path.join(__dirname, 'preview_clone_inpaint.png') });
  await browser.close();
})();
