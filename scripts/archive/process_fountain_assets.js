const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const spritesDir = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  // Load raw files
  const p1 = 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051329_a3c1689f.png';
  const p2 = 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051473_a8d275f0.png';
  const p3 = 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051468_86976434.png';
  const p4 = 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051469_14d4d65b.webp';
  const p5 = 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051471_c0ebaac7.jpg';

  const b1 = fs.readFileSync(p1).toString('base64');
  const b2 = fs.readFileSync(p2).toString('base64');
  const b3 = fs.readFileSync(p3).toString('base64');
  const b4 = fs.readFileSync(p4).toString('base64');
  const b5 = fs.readFileSync(p5).toString('base64');

  const processed = await page.evaluate(async (d1, d2, d3, d4, d5) => {
    function load(mime, b64) {
      return new Promise(r => {
        const i = new Image();
        i.onload = () => r(i);
        i.src = 'data:' + mime + ';base64,' + b64;
      });
    }

    const img1 = await load('image/png', d1);
    const img2 = await load('image/png', d2);
    const img3 = await load('image/png', d3);
    const img4 = await load('image/webp', d4);
    const img5 = await load('image/jpeg', d5);

    // 1. Process img1 (crop tight)
    function cropTight(img) {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;
      let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const a = d[(y * img.width + x) * 4 + 3];
          if (a > 20) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
      }
      const cw = maxX - minX + 1;
      const ch = maxY - minY + 1;
      const out = document.createElement('canvas');
      out.width = cw; out.height = ch;
      const oCtx = out.getContext('2d');
      oCtx.drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
      return { dataUri: out.toDataURL('image/png'), w: cw, h: ch };
    }

    // 2. Process img4 (crop y: 0..216, then flood-fill white background to transparent)
    function processImg4(img) {
      const cutH = 216;
      const c = document.createElement('canvas');
      c.width = img.width; c.height = cutH;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const d = imgData.data;
      const w = c.width, h = c.height;

      // Flood fill from corners
      const visited = new Uint8Array(w * h);
      const queue = [];
      function isWhite(x, y) {
        const p = (y * w + x) * 4;
        return d[p] > 235 && d[p+1] > 235 && d[p+2] > 235;
      }

      for (let x = 0; x < w; x++) {
        if (isWhite(x, 0)) queue.push([x, 0]);
        if (isWhite(x, h - 1)) queue.push([x, h - 1]);
      }
      for (let y = 0; y < h; y++) {
        if (isWhite(0, y)) queue.push([0, y]);
        if (isWhite(w - 1, y)) queue.push([w - 1, y]);
      }

      while (queue.length > 0) {
        const [x, y] = queue.pop();
        const idx = y * w + x;
        if (visited[idx]) continue;
        visited[idx] = 1;
        d[idx * 4 + 3] = 0; // make transparent

        const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny * w + nx] && isWhite(nx, ny)) {
            queue.push([nx, ny]);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Crop tight
      return cropTight(c);
    }

    // 3. Process img5 (flood fill exterior white background of kidney pool)
    function processImg5(img) {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const d = imgData.data;
      const w = c.width, h = c.height;

      const visited = new Uint8Array(w * h);
      const queue = [];
      function isWhite(x, y) {
        const p = (y * w + x) * 4;
        return d[p] > 235 && d[p+1] > 235 && d[p+2] > 235;
      }

      for (let x = 0; x < w; x++) {
        if (isWhite(x, 0)) queue.push([x, 0]);
        if (isWhite(x, h - 1)) queue.push([x, h - 1]);
      }
      for (let y = 0; y < h; y++) {
        if (isWhite(0, y)) queue.push([0, y]);
        if (isWhite(w - 1, y)) queue.push([w - 1, y]);
      }

      while (queue.length > 0) {
        const [x, y] = queue.pop();
        const idx = y * w + x;
        if (visited[idx]) continue;
        visited[idx] = 1;
        d[idx * 4 + 3] = 0; // make transparent

        const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny * w + nx] && isWhite(nx, ny)) {
            queue.push([nx, ny]);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return cropTight(c);
    }

    const res1 = cropTight(img1);
    const res2 = cropTight(img2);
    const res3 = cropTight(img3);
    const res4 = processImg4(img4);
    const res5 = processImg5(img5);

    return { res1, res2, res3, res4, res5 };
  }, b1, b2, b3, b4, b5);

  function save(res, filename) {
    const raw = res.dataUri.replace(/^data:image\/png;base64,/, '');
    const outPath = path.join(spritesDir, filename);
    fs.writeFileSync(outPath, Buffer.from(raw, 'base64'));
    console.log(`Saved ${filename}: w=${res.w}, h=${res.h}`);
  }

  save(processed.res1, 'outdoor_fountain_tiered_classic.png');
  save(processed.res2, 'outdoor_fountain_grand_orb.png');
  save(processed.res3, 'outdoor_fountain_circular_stone.png');
  save(processed.res4, 'outdoor_fountain_ornate_pedestal.png');
  save(processed.res5, 'outdoor_water_pool_kidney.png');

  await browser.close();
})();
