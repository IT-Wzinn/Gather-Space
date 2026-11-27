const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Type name and join
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1200));

  // 1. CEO Executive Suite Overview (Zoom 1.05)
  console.log('Capturing CEO Suite Overview...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 74.5 * 32;
      engine.player.y = 16.5 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 74.5 * 32;
      engine.camera.y = 13.5 * 32;
      engine.camera.zoom = 1.05;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOverview = path.join(__dirname, 'phase2_ceo_overview.png');
  await page.screenshot({ path: shotOverview });
  console.log('Saved CEO Suite overview to', shotOverview);

  // 2. Walnut L-Desk & Executive Throne close-up (Zoom 1.35)
  console.log('Capturing L-Desk & Throne close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 74 * 32;
      engine.player.y = 12 * 32;
      engine.player.direction = 'down';
      engine.camera.x = 74 * 32;
      engine.camera.y = 12.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotDesk = path.join(__dirname, 'phase2_ceo_desk_throne.png');
  await page.screenshot({ path: shotDesk });
  console.log('Saved desk & throne close-up to', shotDesk);

  // 3. Grand Vitrine & Safe close-up (Zoom 1.35)
  console.log('Capturing Grand Vitrine & Safe close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 76 * 32;
      engine.player.y = 10 * 32;
      engine.player.direction = 'up';
      engine.camera.x = 76 * 32;
      engine.camera.y = 9.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotVitrine = path.join(__dirname, 'phase2_ceo_vitrine_safe.png');
  await page.screenshot({ path: shotVitrine });
  console.log('Saved vitrine & safe close-up to', shotVitrine);

  // 4. VIP Leather Sofa & Champagne Bar close-up (Zoom 1.35)
  console.log('Capturing VIP Sofa & Champagne Bar close-up...');
  await page.evaluate(() => {
    const engine = window.mapEngineInstance;
    if (engine) {
      engine.player.x = 74.5 * 32;
      engine.player.y = 17 * 32;
      engine.player.direction = 'left';
      engine.camera.x = 74.5 * 32;
      engine.camera.y = 16.5 * 32;
      engine.camera.zoom = 1.35;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotSofa = path.join(__dirname, 'phase2_ceo_sofa_bar.png');
  await page.screenshot({ path: shotSofa });
  console.log('Saved VIP sofa & bar close-up to', shotSofa);

  await browser.close();
  console.log('All CEO Suite screenshots captured successfully!');
})();
