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
  const cobbleB64 = fs.readFileSync(path.join(__dirname, 'preview_flawless_cobblestone.png')).toString('base64');
  const grassB64 = fs.readFileSync(path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'floor_pathway_stone_brick.png')).toString('base64');

  await page.setContent(`
    <canvas id="c" width="1200" height="900"></canvas>
    <script>
      const imgCobble = new Image();
      const imgGrass = new Image();
      let loaded = 0;
      function check() {
        loaded++;
        if (loaded === 2) render();
      }
      imgCobble.onload = check;
      imgGrass.onload = check;
      imgCobble.src = 'data:image/png;base64,${cobbleB64}';
      imgGrass.src = 'data:image/png;base64,${grassB64}';

      function createScaledPattern(srcImg, size) {
        const can = document.createElement('canvas');
        can.width = size;
        can.height = size;
        const cctx = can.getContext('2d');
        cctx.imageSmoothingEnabled = true;
        cctx.drawImage(srcImg, 0, 0, size, size);
        return cctx.createPattern(can, 'repeat');
      }

      function render() {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        const TILE = 32;

        // Draw Grass
        const grassPat = ctx.createPattern(imgGrass, 'repeat');
        ctx.fillStyle = grassPat;
        ctx.fillRect(0, 0, 1200, 900);

        const scales = [
          { name: 'Scale 64px (2 tiles)', size: 64, y: 50 },
          { name: 'Scale 80px (2.5 tiles)', size: 80, y: 260 },
          { name: 'Scale 96px (3 tiles)', size: 96, y: 470 },
          { name: 'Scale 112px (3.5 tiles)', size: 112, y: 680 }
        ];

        scales.forEach(sc => {
          const pat = createScaledPattern(imgCobble, sc.size);
          ctx.save();
          // Road shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 3;
          ctx.fillStyle = pat;
          ctx.fillRect(50, sc.y, 1100, 5.2 * TILE);
          ctx.restore();

          // Road curbing
          ctx.strokeStyle = '#2c2d2e';
          ctx.lineWidth = 3;
          ctx.strokeRect(50, sc.y, 1100, 5.2 * TILE);

          // Inner stone bevel
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.strokeRect(51.5, sc.y + 1.5, 1097, 5.2 * TILE - 3);

          // Label
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(sc.name, 60, sc.y - 8);
        });

        window.testDone = true;
      }
    </script>
  `);

  await page.waitForFunction('window.testDone === true');
  const el = await page.$('#c');
  await el.screenshot({ path: path.join(__dirname, 'preview_scale_comparison.png') });
  console.log('Saved preview_scale_comparison.png');
  await browser.close();
})();
