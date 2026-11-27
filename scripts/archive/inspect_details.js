const fs = require('fs');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  // Inspect fountain_ornate_pedestal
  const b64_4 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051469_14d4d65b.webp').toString('base64');
  const b64_5 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795373051471_c0ebaac7.jpg').toString('base64');

  const res = await page.evaluate(async (uri4, uri5) => {
    function load(u) {
      return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = u; });
    }
    const i4 = await load(uri4);
    const i5 = await load(uri5);

    function scanRows(img) {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;
      const rowNonWhite = [];
      for (let y = 0; y < img.height; y++) {
        let count = 0;
        for (let x = 0; x < img.width; x++) {
          const p = (y * img.width + x) * 4;
          if (d[p] < 240 || d[p+1] < 240 || d[p+2] < 240) count++;
        }
        rowNonWhite.push(count);
      }
      return rowNonWhite;
    }

    return {
      rows4: scanRows(i4).map((c, y) => ({ y, c })).filter(r => r.c > 0),
      rows5: scanRows(i5).map((c, y) => ({ y, c })).filter(r => r.c > 0)
    };
  }, 'data:image/webp;base64,' + b64_4, 'data:image/jpeg;base64,' + b64_5);

  const r4 = res.rows4;
  console.log('Fountain ornate (img4): top non-white y =', r4[0].y, 'bottom non-white y =', r4[r4.length-1].y);
  // Check where watermark text might be in img4 (around y > 240)
  console.log('Fountain ornate bottom rows:');
  r4.filter(r => r.y > 200).forEach(r => console.log('y=' + r.y + ': count=' + r.c));

  const r5 = res.rows5;
  console.log('Kidney pool (img5): top non-white y =', r5[0].y, 'bottom non-white y =', r5[r5.length-1].y);

  await browser.close();
})();
