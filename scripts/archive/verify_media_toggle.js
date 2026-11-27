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
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1880, height: 860 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Join room -> Office view
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 400));

  // 1. Initial Muted state screenshot of bottom dock
  const dock = await page.$('.widget-bottom-dock');
  const dockBox = await dock.boundingBox();

  await page.screenshot({
    path: path.join(__dirname, 'dock_muted.png'),
    clip: {
      x: dockBox.x - 20,
      y: dockBox.y - 15,
      width: dockBox.width + 40,
      height: dockBox.height + 30
    }
  });
  console.log('Saved dock_muted.png');

  // 2. Click Mic & Cam to turn them ON
  await page.click('.widget-bottom-dock .media-toggle-mic');
  await page.click('.widget-bottom-dock .media-toggle-cam');
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({
    path: path.join(__dirname, 'dock_active.png'),
    clip: {
      x: dockBox.x - 20,
      y: dockBox.y - 15,
      width: dockBox.width + 40,
      height: dockBox.height + 30
    }
  });
  console.log('Saved dock_active.png');

  // 3. Click Mic & Cam again to turn them back OFF
  await page.click('.widget-bottom-dock .media-toggle-mic');
  await page.click('.widget-bottom-dock .media-toggle-cam');
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({
    path: path.join(__dirname, 'dock_toggled_off.png'),
    clip: {
      x: dockBox.x - 20,
      y: dockBox.y - 15,
      width: dockBox.width + 40,
      height: dockBox.height + 30
    }
  });
  console.log('Saved dock_toggled_off.png');

  await browser.close();
})();
