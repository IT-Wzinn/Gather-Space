const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const imgPath = 'C:/Users/ASUS/.gemini/antigravity/brain/3c1bf6a3-c874-4a8e-9e4f-b023595c93c9/.user_uploaded/media_1795410083794_9c542057.jpg';
  const imgB64 = fs.readFileSync(imgPath).toString('base64');

  const info = await page.evaluate(async (b64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.src = 'data:image/jpeg;base64,' + b64;
    });
  }, imgB64);

  console.log('Image dimensions:', info);
  await browser.close();
})();
