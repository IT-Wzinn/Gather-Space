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
  await page.setViewport({ width: 1600, height: 950 });

  // Read cobblestone texture
  const cobbleB64 = fs.readFileSync(path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites', 'outdoor_cobblestone_pavement.png')).toString('base64');
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

      function render() {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        const TILE = 32;

        // 1. Draw Grass
        const grassPat = ctx.createPattern(imgGrass, 'repeat');
        ctx.fillStyle = grassPat;
        ctx.fillRect(0, 0, 1200, 900);

        // 2. Draw Sample Grand Avenues
        const cobblePat = ctx.createPattern(imgCobble, 'repeat');

        // Draw paved avenue shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = cobblePat;

        // Horizontal Avenue (5 tiles wide)
        ctx.fillRect(50, 200, 1100, 5.5 * TILE);

        // Vertical Avenue (5 tiles wide)
        ctx.fillRect(400, 50, 5.5 * TILE, 800);

        // Plaza
        ctx.fillRect(350, 150, 280, 280);
        ctx.restore();

        // Curb borders
        ctx.strokeStyle = '#2c2d2e';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 200, 1100, 5.5 * TILE);
        ctx.strokeRect(400, 50, 5.5 * TILE, 800);

        window.testDone = true;
      }
    </script>
  `);

  await page.waitForFunction('window.testDone === true');
  const el = await page.$('#c');
  await el.screenshot({ path: path.join(__dirname, 'preview_walkway_test.png') });
  console.log('Saved preview_walkway_test.png');
  await browser.close();
})();
