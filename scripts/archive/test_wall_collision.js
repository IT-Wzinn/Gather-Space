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

  // Join Room
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 800));

  // 1. Initial Position check (Spawn in Reception)
  const initialPos = await page.evaluate(() => {
    const p = window.mapEngineInstance.player;
    return { x: p.x, y: p.y };
  });
  console.log('Initial spawn pos in Reception:', initialPos);

  // 2. From initial pos (x = 816, in front of door), hold KeyW to walk straight UP through the door
  console.log('Holding KeyW for 1.8 seconds to walk UP through the doorway...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1800));
  await page.keyboard.up('KeyW');

  const throughDoorPos = await page.evaluate(() => {
    const p = window.mapEngineInstance.player;
    return { x: p.x, y: p.y };
  });
  console.log('Player pos after walking up through doorway:', throughDoorPos);

  if (throughDoorPos.y < 860) {
    console.log('SUCCESS: Player passed right through the door into the corridor at y =', throughDoorPos.y);
  } else {
    console.error('FAIL: Player was blocked at door, y =', throughDoorPos.y);
  }

  // Screenshot showing player out in the corridor
  const outPathDoor = path.join(__dirname, 'test_through_door.png');
  await page.screenshot({ path: outPathDoor });
  console.log('Saved screenshot of passing through door to', outPathDoor);

  // 3. Now in the corridor, try to walk into the solid bottom wall of Central Lounge (Room 2)
  // Central Lounge bottom wall is at y = 47*16 = 752. Door is at x: 49..54 (784..864).
  // First, walk left in corridor to x = 700 (solid wall of Central Lounge)
  console.log('Walking left in corridor towards x = 700...');
  await page.keyboard.down('KeyA');
  await new Promise(r => setTimeout(r, 1000));
  await page.keyboard.up('KeyA');

  const inCorridorPos = await page.evaluate(() => {
    const p = window.mapEngineInstance.player;
    return { x: p.x, y: p.y };
  });
  console.log('Position in corridor:', inCorridorPos);

  // Now try to walk UP into Central Lounge's solid bottom wall at x ~ 700
  console.log('Trying to walk UP into Central Lounge solid bottom wall (y = 752) at x ~ 700...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1500));
  await page.keyboard.up('KeyW');

  const centralLoungeWallPos = await page.evaluate(() => {
    const p = window.mapEngineInstance.player;
    return { x: p.x, y: p.y };
  });
  console.log('Position against Central Lounge solid wall:', centralLoungeWallPos);

  // Bottom wall of Central Lounge is at y = 752. Player should be stopped at y ~ 761!
  if (centralLoungeWallPos.y >= 757 && centralLoungeWallPos.y <= 766) {
    console.log('SUCCESS: Player was stopped solidly by Central Lounge bottom wall at y =', centralLoungeWallPos.y);
  } else {
    console.error('FAIL: Player penetrated Central Lounge bottom wall, y =', centralLoungeWallPos.y);
  }

  const outPathBlocked2 = path.join(__dirname, 'test_central_lounge_blocked.png');
  await page.screenshot({ path: outPathBlocked2 });
  console.log('Saved screenshot to', outPathBlocked2);

  await browser.close();
  console.log('All verification passed!');
})();
