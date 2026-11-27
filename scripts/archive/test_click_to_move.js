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
  await page.setViewport({ width: 1400, height: 850 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Type name & Click Join
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  console.log('Joined room. Waiting for Office View...');
  await new Promise(r => setTimeout(r, 1000));

  // Get initial player coordinates
  const initialPos = await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    return {
      x: inst.player.x,
      y: inst.player.y,
      camera: { x: inst.camera.x, y: inst.camera.y, zoom: inst.camera.zoom },
      canvasSize: { w: inst.canvas.width, h: inst.canvas.height }
    };
  });
  console.log('Initial player pos:', initialPos);

  // Click on the map canvas to the upper-left of screen center (say, screen center - 140px X, -120px Y)
  const canvasEl = await page.$('#officeMapCanvas');
  const box = await canvasEl.boundingBox();
  console.log('Canvas box:', box);

  const clickX = box.x + box.width / 2 - 140;
  const clickY = box.y + box.height / 2 - 120;
  console.log(`Clicking at screen coordinates (${clickX}, ${clickY})...`);

  await page.mouse.click(clickX, clickY);

  // Check targetPos right after click
  const targetPos = await page.evaluate(() => window.mapEngineInstance.targetPos);
  console.log('Target position set in mapEngine:', targetPos);

  if (!targetPos) {
    console.error('ERROR: targetPos was NOT set on click!');
  } else {
    console.log('SUCCESS: targetPos was properly set to:', targetPos);
  }

  // Wait 1.5 seconds for player to walk towards target
  await new Promise(r => setTimeout(r, 1500));

  const movedPos = await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    return {
      x: inst.player.x,
      y: inst.player.y,
      isMoving: inst.player.isMoving,
      direction: inst.player.direction
    };
  });
  console.log('Player state after 1.5s:', movedPos);

  const movedDistance = Math.hypot(movedPos.x - initialPos.x, movedPos.y - initialPos.y);
  console.log(`Player moved distance: ${movedDistance.toFixed(2)} px`);

  if (movedDistance > 10) {
    console.log('CONFIRMED: Player successfully moved via mouse click!');
  } else {
    console.error('WARNING: Player did not move as expected.');
  }

  // Take screenshot showing the character walking towards target indicator
  const outPath = path.join(__dirname, 'test_click_to_move_result.png');
  await page.screenshot({ path: outPath });
  console.log('Screenshot saved to', outPath);

  // Also test clicking another spot (e.g. into the hallway or towards central lounge)
  const clickX2 = box.x + box.width / 2 + 100;
  const clickY2 = box.y + box.height / 2 - 180;
  console.log(`Clicking second position (${clickX2}, ${clickY2})...`);
  await page.mouse.click(clickX2, clickY2);
  await new Promise(r => setTimeout(r, 1500));

  const finalPos = await page.evaluate(() => {
    const inst = window.mapEngineInstance;
    return {
      x: inst.player.x,
      y: inst.player.y,
      isMoving: inst.player.isMoving,
      direction: inst.player.direction
    };
  });
  console.log('Player state after second click:', finalPos);

  const outPath2 = path.join(__dirname, 'test_click_to_move_result_2.png');
  await page.screenshot({ path: outPath2 });
  console.log('Second screenshot saved to', outPath2);

  await browser.close();
})();
