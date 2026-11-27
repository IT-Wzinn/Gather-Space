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
  const inputJpg = 'C:\\\\Users\\\\ASUS\\\\.gemini\\\\antigravity\\\\brain\\\\ccfe7d8b-e8a9-4e7b-8795-5c5ff025fab1\\\\intern_walk_spritesheet_1795576069420.jpg';
  const data = fs.readFileSync(inputJpg).toString('base64');
  
  const pngBase64 = await page.evaluate(async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = 1024;
        srcCanvas.height = 1024;
        const sctx = srcCanvas.getContext('2d');
        sctx.drawImage(img, 0, 0);

        const outCanvas = document.createElement('canvas');
        outCanvas.width = 468;
        outCanvas.height = 840;
        const octx = outCanvas.getContext('2d');
        octx.imageSmoothingEnabled = false;

        const numCols = 4;
        const numRows = 4;
        const cellW = 1024 / numCols;
        const cellH = 1024 / numRows;
        const targetCellW = 117;
        const targetCellH = 210;

        for (let r = 0; r < 4; r++) {
          for (let col = 0; col < 4; col++) {
            const startX = Math.round(col * cellW);
            const startY = Math.round(r * cellH);
            const w = Math.round((col + 1) * cellW) - startX;
            const h = Math.round((r + 1) * cellH) - startY;

            const cellData = sctx.getImageData(startX, startY, w, h);
            const d = cellData.data;

            // BFS flood fill from borders with threshold 215
            const isWhite = (x, y) => {
              if (x < 0 || x >= w || y < 0 || y >= h) return false;
              const idx = (y * w + x) * 4;
              return d[idx] >= 215 && d[idx+1] >= 215 && d[idx+2] >= 215;
            };

            const visited = new Uint8Array(w * h);
            const queue = [];

            for (let x = 0; x < w; x++) {
              if (isWhite(x, 0)) { queue.push(x, 0); visited[0 * w + x] = 1; }
              if (isWhite(x, h - 1)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
            }
            for (let y = 0; y < h; y++) {
              if (isWhite(0, y) && !visited[y * w + 0]) { queue.push(0, y); visited[y * w + 0] = 1; }
              if (isWhite(w - 1, y) && !visited[y * w + (w - 1)]) { queue.push(w - 1, y); visited[y * w + (w - 1)] = 1; }
            }

            let head = 0;
            while (head < queue.length) {
              const qx = queue[head++];
              const qy = queue[head++];
              const idx = (qy * w + qx) * 4;
              d[idx + 3] = 0;

              const neighbors = [[qx+1, qy], [qx-1, qy], [qx, qy+1], [qx, qy-1]];
              for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                  const npos = ny * w + nx;
                  if (!visited[npos] && isWhite(nx, ny)) {
                    visited[npos] = 1;
                    queue.push(nx, ny);
                  }
                }
              }
            }

            // Find character bounding box
            let minX = w, maxX = 0, minY = h, maxY = 0;
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                if (d[idx + 3] > 0) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }

            if (minX <= maxX && minY <= maxY) {
              const charW = maxX - minX + 1;
              const charH = maxY - minY + 1;

              const tempC = document.createElement('canvas');
              tempC.width = w;
              tempC.height = h;
              const tctx = tempC.getContext('2d');
              tctx.putImageData(cellData, 0, 0);

              const targetH = 202;
              const scale = targetH / charH;
              const finalW = Math.round(charW * scale);
              const finalH = Math.round(charH * scale);
              const targetFeetY = 207;
              const destX = Math.round(col * targetCellW + (targetCellW - finalW) / 2);
              const destY = Math.round(r * targetCellH + (targetFeetY - finalH));

              octx.save();
              octx.drawImage(
                tempC,
                minX, minY, charW, charH,
                destX, destY, finalW, finalH
              );
              octx.restore();
            }
          }
        }

        resolve(outCanvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''));
      };
      img.src = 'data:image/jpeg;base64,' + base64;
    });
  }, data);

  const outPath = path.join(__dirname, 'assets', 'characters', 'char_10_intern.png');
  fs.writeFileSync(outPath, Buffer.from(pngBase64, 'base64'));
  console.log('Saved clean processed spritesheet to', outPath);
  await browser.close();
})();
