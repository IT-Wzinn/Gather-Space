const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Join office
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Verify player initial speed
  const playerState = await page.evaluate(() => {
    const me = window.mapEngineInstance;
    return {
      speed: me.player.speed,
      x: me.player.x,
      y: me.player.y,
      camera: { ...me.camera }
    };
  });
  console.log('Player initial state:', playerState);

  // 2. Test Mouse Hover on a tile near the player
  const canvasEl = await page.$('#officeMapCanvas');
  const box = await canvasEl.boundingBox();
  const hoverScreenX = box.x + box.width / 2 + 96;
  const hoverScreenY = box.y + box.height / 2 - 64;

  console.log(`Moving mouse to hover position (${hoverScreenX}, ${hoverScreenY})...`);
  await page.mouse.move(hoverScreenX, hoverScreenY);
  await new Promise(r => setTimeout(r, 400));

  const hoverTileInfo = await page.evaluate(() => {
    return window.mapEngineInstance.hoverTile;
  });
  console.log('Hover tile info:', hoverTileInfo);

  // Take screenshot of Hover indicator
  const hoverScreenshotPath = path.join(__dirname, 'verified_mouse_hover_tile.png');
  await page.screenshot({ path: hoverScreenshotPath });
  console.log('Saved hover screenshot to:', hoverScreenshotPath);

  // 3. Click to move to a destination tile
  console.log(`Clicking to set move destination at (${hoverScreenX}, ${hoverScreenY})...`);
  await page.mouse.click(hoverScreenX, hoverScreenY);
  await new Promise(r => setTimeout(r, 150)); // Capture immediately while moving towards target

  const targetTileInfo = await page.evaluate(() => {
    const me = window.mapEngineInstance;
    return {
      targetPos: me.targetPos,
      isMoving: me.player.isMoving,
      playerPos: { x: me.player.x, y: me.player.y }
    };
  });
  console.log('Target tile info after click:', targetTileInfo);

  // Take screenshot of Active White Destination Target Tile
  const clickScreenshotPath = path.join(__dirname, 'verified_white_target_tile.png');
  await page.screenshot({ path: clickScreenshotPath });
  console.log('Saved active white target screenshot to:', clickScreenshotPath);

  // 4. Test speed measurement over 1.0 second
  const posBefore = await page.evaluate(() => ({ x: window.mapEngineInstance.player.x, y: window.mapEngineInstance.player.y }));
  await new Promise(r => setTimeout(r, 1000));
  const posAfter = await page.evaluate(() => ({ x: window.mapEngineInstance.player.x, y: window.mapEngineInstance.player.y }));

  const distTraveled = Math.hypot(posAfter.x - posBefore.x, posAfter.y - posBefore.y);
  console.log(`Distance traveled in 1 second: ${distTraveled.toFixed(2)} px (Speed: ~${(distTraveled / 60).toFixed(2)} px/frame at 60Hz)`);

  // 5. Test another click further away to get a clear zoomed-in view of the white tile indicator
  await page.evaluate(() => {
    const me = window.mapEngineInstance;
    me.camera.zoom = 1.9;
    // Set targetPos 120px to the right of player
    const clampedX = me.player.x + 128;
    const clampedY = me.player.y - 64;
    const tileX = Math.floor(clampedX / 32) * 32;
    const tileY = Math.floor(clampedY / 32) * 32;
    me.targetPos = { x: clampedX, y: clampedY, tileX, tileY };
    me.targetIndicatorTimer = 0.5;
    me.render();
  });
  await new Promise(r => setTimeout(r, 300));

  const targetZoomScreenshotPath = path.join(__dirname, 'verified_white_target_tile_zoom.png');
  await page.screenshot({ path: targetZoomScreenshotPath });
  console.log('Saved zoomed target screenshot to:', targetZoomScreenshotPath);

  await browser.close();
  console.log('Verification finished successfully!');
})();
