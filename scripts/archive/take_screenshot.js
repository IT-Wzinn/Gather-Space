const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1880, height: 860 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1. Initial view: Prejoin
  await page.screenshot({ path: path.join(__dirname, 'rendered_prejoin_clean.png') });
  console.log('Saved Prejoin clean screenshot');

  // 2. Type name and click Join -> Office view
  await page.type('#userNameInput', 'Lữ Quốc Vinh');
  await page.click('#joinBtn');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(__dirname, 'rendered_office_clean.png') });
  console.log('Saved Office clean screenshot with map');

  // 3. Click dock Chat button -> Chat view
  await page.click('#officeView .nav-chat-btn');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'rendered_chat_clean.png') });
  console.log('Saved Chat clean screenshot');

  // 4. Click dock Calendar button -> Calendar view
  await page.click('#chatView .nav-calendar-btn');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'rendered_calendar_clean.png') });
  console.log('Saved Calendar clean screenshot');

  // 5. Click dock Activity button -> Activity view
  await page.click('#calendarView .nav-activity-btn');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'rendered_activity_clean.png') });
  console.log('Saved Activity clean screenshot');

  await browser.close();
})();
