const fs = require('fs');
const puppeteer = require('puppeteer-core');

const images = [
  { id: 'fountain_tiered_classic', path: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051329_a3c1689f.png' },
  { id: 'fountain_grand_marble_orb', path: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051473_a8d275f0.png' },
  { id: 'fountain_circular_stone', path: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051468_86976434.png' },
  { id: 'fountain_ornate_pedestal', path: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051469_14d4d65b.webp' },
  { id: 'outdoor_kidney_pool', path: 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051471_c0ebaac7.jpg' }
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  for (const img of images) {
    const ext = img.path.split('.').pop().toLowerCase();
    const mime = ext === 'jpg' ? 'image/jpeg' : (ext === 'webp' ? 'image/webp' : 'image/png');
    const b64 = fs.readFileSync(img.path).toString('base64');
    const dataUri = 'data:' + mime + ';base64,' + b64;
    const info = await page.evaluate(async (uri) => {
      return new Promise(res => {
        const i = new Image();
        i.onload = () => {
          const c = document.createElement('canvas');
          c.width = i.width;
          c.height = i.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(i, 0, 0);
          const d = ctx.getImageData(0, 0, i.width, i.height).data;
          let transparentPixels = 0;
          let whitePixels = 0;
          let minX = i.width, maxX = 0, minY = i.height, maxY = 0;
          for (let y = 0; y < i.height; y++) {
            for (let x = 0; x < i.width; x++) {
              const p = (y * i.width + x) * 4;
              const a = d[p+3];
              const r = d[p], g = d[p+1], b = d[p+2];
              if (a < 20) transparentPixels++;
              else {
                if (r > 240 && g > 240 && b > 240) whitePixels++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          res({
            w: i.width,
            h: i.height,
            transparentPixels,
            whitePixels,
            bbox: { minX, maxX, minY, maxY },
            corner0: [d[0], d[1], d[2], d[3]]
          });
        };
        i.src = uri;
      });
    }, dataUri);
    console.log(img.id, info);
  }
  await browser.close();
})();
