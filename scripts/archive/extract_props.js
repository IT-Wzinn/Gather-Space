const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Helper function injected into page
  await page.evaluate(() => {
    window.processCrop = function(img, sx, sy, sw, sh, whiteThreshold = 225, maskWatermark = false) {
      // Create initial canvas for crop
      const pad = 4;
      const cv = document.createElement('canvas');
      cv.width = sw + pad * 2;
      cv.height = sh + pad * 2;
      const ctx = cv.getContext('2d');

      // Fill white background to ensure boundary connectivity
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, sx, sy, sw, sh, pad, pad, sw, sh);

      const w = cv.width;
      const h = cv.height;

      // If maskWatermark is requested (for flowers bottom-left watermark box)
      if (maskWatermark) {
        const cropData = ctx.getImageData(0, 0, w, h);
        const cd = cropData.data;
        for (let y = 250; y < h; y++) {
          for (let x = 0; x < 200; x++) {
            const idx = (y * w + x) * 4;
            const r = cd[idx], g = cd[idx+1], b = cd[idx+2];
            // If not distinctly green, turn to pure white
            if (!(g > r + 12 && g > b + 12)) {
              cd[idx] = 255;
              cd[idx+1] = 255;
              cd[idx+2] = 255;
            }
          }
        }
        ctx.putImageData(cropData, 0, 0);
      }

      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const visited = new Uint8Array(w * h);
      const queue = [];

      function isWhite(x, y) {
        const idx = (y * w + x) * 4;
        const r = d[idx], g = d[idx+1], b = d[idx+2];
        const minC = Math.min(r, g, b);
        const maxC = Math.max(r, g, b);
        // Pure or near white, or neutral light color
        return (minC >= whiteThreshold && (maxC - minC) < 32) || (r >= 238 && g >= 238 && b >= 238);
      }

      // Seed all 4 outer edges
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
        const x = queue[head++];
        const y = queue[head++];
        const idx = (y * w + x) * 4;
        d[idx + 3] = 0; // Set transparent

        const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (let i = 0; i < 4; i++) {
          const nx = neighbors[i][0];
          const ny = neighbors[i][1];
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nidx = ny * w + nx;
            if (!visited[nidx] && isWhite(nx, ny)) {
              visited[nidx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }

      // Clean anti-alias white fringe around edge of sprite
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          if (d[idx + 3] > 0) {
            const r = d[idx], g = d[idx+1], b = d[idx+2];
            if (r > 218 && g > 218 && b > 218) {
              let hasTransAdj = false;
              for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
                const ax = x + dx, ay = y + dy;
                if (ax >= 0 && ax < w && ay >= 0 && ay < h) {
                  if (d[(ay * w + ax) * 4 + 3] === 0) { hasTransAdj = true; break; }
                } else {
                  hasTransAdj = true; break;
                }
              }
              if (hasTransAdj) {
                d[idx + 3] = 0;
              }
            }
          }
        }
      }

      // Find tight bounding box of visible pixels
      let minX = w, maxX = 0, minY = h, maxY = 0;
      let hasPixels = false;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          if (d[idx + 3] > 0) {
            hasPixels = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (!hasPixels) {
        return null;
      }

      const tightW = maxX - minX + 1;
      const tightH = maxY - minY + 1;
      ctx.putImageData(imgData, 0, 0);

      const tightCv = document.createElement('canvas');
      tightCv.width = tightW;
      tightCv.height = tightH;
      const tCtx = tightCv.getContext('2d');
      tCtx.drawImage(cv, minX, minY, tightW, tightH, 0, 0, tightW, tightH);

      return {
        w: tightW,
        h: tightH,
        b64: tightCv.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
      };
    };
  });

  const uploads = {
    lamppost: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795363920606_4864ca49.jpg',
    flowers: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795363920606_68456520.jpg',
    pillars: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795363920528_c9623fae.jpg',
    grass: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795363920586_46aea59d.jpg'
  };

  const tasks = [
    // 1. Lamppost with birds
    {
      source: uploads.lamppost,
      filename: 'outdoor_street_lamppost.png',
      crop: [0, 0, 612, 612],
      threshold: 228
    },
    // 2. Daisy flowerbed (Isometric diamond patch)
    {
      source: uploads.flowers,
      filename: 'outdoor_daisy_flowerbed.png',
      crop: [0, 0, 480, 329],
      threshold: 228,
      maskWatermark: true
    },
    // 3. Ancient Pillars
    {
      source: uploads.pillars,
      filename: 'outdoor_ancient_pillar_intact.png',
      crop: [130, 130, 190, 400],
      threshold: 225
    },
    {
      source: uploads.pillars,
      filename: 'outdoor_ancient_pillar_cracked.png',
      crop: [430, 130, 180, 400],
      threshold: 225
    },
    {
      source: uploads.pillars,
      filename: 'outdoor_ancient_pillar_ruin.png',
      crop: [690, 230, 190, 300],
      threshold: 225
    },
    {
      source: uploads.pillars,
      filename: 'outdoor_ancient_pedestal.png',
      crop: [138, 656, 175, 112],
      threshold: 225
    },
    // 4. Wild Grass
    {
      source: uploads.grass,
      filename: 'outdoor_tall_grass_tuft_a.png',
      crop: [40, 325, 220, 128],
      threshold: 225
    },
    {
      source: uploads.grass,
      filename: 'outdoor_tall_grass_tuft_b.png',
      crop: [310, 325, 200, 145],
      threshold: 225
    },
    {
      source: uploads.grass,
      filename: 'outdoor_wild_grass_row.png',
      crop: [40, 40, 440, 120],
      threshold: 225
    }
  ];

  for (const t of tasks) {
    const srcB64 = fs.readFileSync(t.source).toString('base64');
    const result = await page.evaluate(async (uri, crop, th, mask) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = uri; });
      return window.processCrop(img, crop[0], crop[1], crop[2], crop[3], th, mask);
    }, 'data:image/jpeg;base64,' + srcB64, t.crop, t.threshold, !!t.maskWatermark);

    if (result) {
      const outPath = path.join(targetDir, t.filename);
      fs.writeFileSync(outPath, Buffer.from(result.b64, 'base64'));
      console.log(`[Extracted] ${t.filename}: ${result.w}x${result.h}px -> ${outPath}`);
    } else {
      console.error(`[Error] Failed to extract ${t.filename}`);
    }
  }

  await browser.close();
  console.log('All outdoor props extracted successfully!');
})();
