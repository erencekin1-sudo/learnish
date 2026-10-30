const puppeteer = require('/Users/erencekin/Desktop/İntegral/Özel Dersler/Burak Deveci/node_modules/puppeteer');
const OUT = '/Users/erencekin/.gemini/antigravity/brain/4da161f7-9967-416a-8d52-e3253dd25a5b/';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('file:///Users/erencekin/Desktop/İntegral/Learnish/index.html', { waitUntil: 'load' });

  const report = {};

  // 1. Test Search Input and Focus
  await page.evaluate(() => window.APP.switchView('directory'));
  await page.focus('#dir-search-input');
  await page.keyboard.type('school', { delay: 20 });
  report.searchVal = await page.evaluate(() => document.querySelector('#dir-search-input')?.value);
  report.searchFocused = await page.evaluate(() => document.activeElement?.id === 'dir-search-input');
  report.searchResultsText = await page.evaluate(() => document.querySelector('#dir-results-info')?.innerText);

  // 2. Test Pagination in Oxford
  await page.evaluate(() => {
    window.APP.switchModule('oxford');
    window.APP.switchView('directory');
  });
  report.oxfordPage1Text = await page.evaluate(() => document.querySelector('#dir-results-info')?.innerText);
  await page.evaluate(() => window.APP.setDirectoryPage(2));
  report.oxfordPage2Text = await page.evaluate(() => document.querySelector('#dir-results-info')?.innerText);

  // 3. Test Dark Mode Logo Colors
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  report.darkModeLogoH1Color = await page.evaluate(() => {
    const el = document.querySelector('.brand-info h1');
    return window.getComputedStyle(el).color;
  });

  // 4. Test Stats View with YDS module
  await page.evaluate(() => {
    window.APP.switchModule('yds');
    window.APP.switchView('stats');
  });
  report.statsYdsTitle = await page.evaluate(() => {
    return document.querySelector('.stats-curriculum-station h2')?.innerText;
  });

  // 5. Test Maarif Daily Theme on day 82 (should NOT be Theme 9)
  await page.evaluate(() => {
    window.APP.switchModule('maarif');
    window.APP.switchView('daily');
    const sel = document.getElementById('day-select-dropdown');
    if (sel) {
      sel.value = '82';
      sel.dispatchEvent(new Event('change'));
    }
  });
  report.dailyDay82Header = await page.evaluate(() => {
    return document.querySelector('.dash-target-title, .module-banner-title, h1, h2')?.innerText;
  });

  // 6. Test Quiz completion lifecycle
  await page.evaluate(() => {
    window.APP.switchView('quiz');
    window.APP.startQuiz();
  });
  const quizPlayedBefore = await page.evaluate(() => window.APP.getState ? window.APP.getState().userData.stats.quizzesPlayed : 0);
  // Complete quiz quickly
  await page.evaluate(() => {
    // Answer all questions
    const qState = window.APP.getState ? window.APP.getState().quizState : null;
  });

  // 7. Test retestDebugWord
  await page.evaluate(() => {
    window.APP.retestDebugWord('Scientist');
  });
  report.debugQuizActive = await page.evaluate(() => {
    return document.querySelector('.quiz-target-word')?.innerText;
  });

  // 8. Test Settings sync
  await page.evaluate(() => {
    document.getElementById('speed-toggle-btn')?.click();
  });
  report.desktopSpeed = await page.evaluate(() => document.getElementById('speed-toggle-btn')?.innerText);
  report.mobileSpeed = await page.evaluate(() => document.getElementById('m-speed-toggle-btn')?.innerText);

  console.log('--- TEST REPORT ---');
  console.log(JSON.stringify(report, null, 2));

  // Take screenshot of Directory with Pagination
  await page.evaluate(() => {
    window.APP.switchView('directory');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: OUT + 'audit_step1_directory_pagination.png' });

  // Take screenshot of Dark Mode Home
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    window.APP.switchView('home');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: OUT + 'audit_step4_dark_home.png' });

  await browser.close();
  console.log('Audit completed and screenshots saved!');
})();

