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
    const imgData = ctx.getImageData(0, 0, 440, 440);
    const d = imgData.data;

    // Discrete palette levels:
    // 1. Mortar: ~44 (35..58)
    // 2. Dark stone: ~98 (85..106)
    // 3. Mid stone: ~114 (107..125)
    // 4. Light stone: ~132 (126..145)
    // 5. Bright highlight: ~154 (146..180)
    
    // In the watermark region (x: 40..400, y: 170..270), watermark adds an overlay.
    // If we quantize each pixel to the nearest authentic palette tone:
    const palette = [
      44,   // Mortar
      98,   // Deep shadow
      114,  // Midtone
      132,  // Light stone
      154   // Top highlight
    ];

    // First, let's identify mortar pixels in the watermark band.
    // Mortar is strictly darker than surrounding stone pixels.
    for (let y = 0; y < 440; y++) {
      for (let x = 0; x < 440; x++) {
        const idx = (y * 440 + x) * 4;
        let lum = (d[idx] + d[idx+1] + d[idx+2]) / 3;

        // In watermark band y: 170..275, subtract watermark boost if in center
        const inWatermarkY = (y >= 170 && y <= 275);
        const inWatermarkX = (x >= 40 && x <= 400);
        if (inWatermarkY && inWatermarkX) {
          // Check if this pixel has a watermark lift
          // Watermark text in shutterstock adds ~18-24 to luminance
          // If lum is between 55 and 75, it's lifted mortar!
          if (lum >= 55 && lum <= 78) {
            lum = 44;
          } else if (lum > 78 && lum < 118) {
            // Lifted dark stone
            lum = Math.max(98, lum - 14);
          } else if (lum >= 118 && lum < 140) {
            lum = Math.max(114, lum - 14);
          } else if (lum >= 140) {
            lum = Math.max(132, lum - 12);
          }
        }

        // Snap to closest palette color
        let closest = palette[0];
        let minDiff = 999;
        for (const p of palette) {
          const diff = Math.abs(lum - p);
          if (diff < minDiff) {
            minDiff = diff;
            closest = p;
          }
        }

        // Apply color
        d[idx] = closest;
        d[idx+1] = closest + (closest > 50 ? 2 : 0); // subtle neutral warm
        d[idx+2] = closest + (closest > 50 ? 1 : 0);
        d[idx+3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  });

  // Save the cleaned texture
  const el = await page.$('#c');
  const outPath = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png');
  await el.screenshot({ path: outPath });
  console.log('Saved cleaned cobblestone texture to:', outPath);

  // Also save a preview in root
  await el.screenshot({ path: path.join(__dirname, 'preview_clean_cobblestone.png') });

  await browser.close();
})();
