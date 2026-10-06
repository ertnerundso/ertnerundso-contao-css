import { test, expect } from '@playwright/test';

async function start(page, width, reducedMotion = 'reduce') {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion });
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.goto('/tests/fixtures/scroll-progress.html');
  await page.evaluate(() => {
    const track = document.querySelector('.work-track');
    track.append(track.lastElementChild.cloneNode(true));
    const outro = document.createElement('div');
    outro.className = 'work-outro content-element-group';
    outro.innerHTML = '<div class="content-text"><div class="rte"><p class="micro">Sechs Schritte</p></div></div><div class="content-headline"><h3>Vom Einzelteil zum fertigen Produkt</h3></div><div class="content-text"><div class="rte"><p>Jede Anleitung entsteht aus Ihren CAD-Daten, präzise bebildert, mehrsprachig und genau auf Ihr Produkt abgestimmt.</p></div></div><div class="button content-hyperlink"><a href="#contact">Projekt anfragen</a></div>';
    track.append(outro);
  });
  await page.addScriptTag({ type: 'module', url: '/dist/site.js' });
  await expect(page.locator('.menu-label')).toHaveCount(1);
}

async function expectEndAligned(page, mobile = false) {
  const measurements = await page.evaluate(() => {
    const heading = document.querySelector('.work-heading'), outro = document.querySelector('.work-outro');
    const h = heading.getBoundingClientRect(), styles = getComputedStyle(heading), o = outro.getBoundingClientRect();
    const left = h.left + parseFloat(styles.paddingLeft), right = h.right - parseFloat(styles.paddingRight);
    const viewport = document.querySelector('.work-viewport').getBoundingClientRect();
    return { right: o.right - right, left: o.left - left, width: o.width, contentWidth: right-left, contentHeight: outro.scrollHeight, top: o.top-viewport.top, bottom: viewport.bottom-o.bottom, overflow: document.documentElement.scrollWidth-document.documentElement.clientWidth };
  });
  expect(Math.abs(measurements.right)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(measurements.width - measurements.contentWidth / (mobile ? 1 : 2))).toBeLessThanOrEqual(0.5);
  if (mobile) expect(Math.abs(measurements.left)).toBeLessThanOrEqual(0.5);
  expect(measurements.top).toBeGreaterThanOrEqual(0);
  expect(measurements.bottom).toBeGreaterThanOrEqual(0);
  expect(measurements.overflow).toBeLessThanOrEqual(1);
  await expect(page.locator('.work-count')).toHaveText('06');
  await expect(page.locator('.work-outro h3')).toHaveCSS('font-size', await page.locator('.work-card h3').first().evaluate(el => getComputedStyle(el).fontSize));
}

for (const width of [390, 1000, 1920, 2560]) {
  test(`native work outro follows shared layout including custom tokens at ${width}px`, async ({ page }) => {
    await start(page, width);
    await expect(page.locator('.work-viewport')).toHaveCSS('overflow-x', 'auto');
    for (const custom of [false, true]) {
      if (custom) await page.evaluate(() => {
        document.documentElement.style.setProperty('--layout-container-max', '80rem');
        document.documentElement.style.setProperty('--space-gutter', '2rem');
      });
      await page.locator('.work-viewport').evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
      await expectEndAligned(page, width <= 760);
    }
    await page.locator('.work-outro a').focus();
    await expect(page.locator('.work-outro a')).toBeFocused();
    await page.locator('.work-viewport').evaluate(el => el.scrollTo({ left: 0, behavior: 'instant' }));
    await expect(page.locator('.work-count')).toHaveText('01');
  });
}

for (const width of [1440, 2560]) {
  test(`pinned work reaches the aligned outro and keyboard focus reveals it at ${width}px`, async ({ page }) => {
    await start(page, width, 'no-preference');
    await expect(page.locator('.work').locator('..')).toHaveClass(/pin-spacer/);
    await page.evaluate(() => {
      const work = document.querySelector('.work'), spacer = work.closest('.pin-spacer');
      const viewport = work.querySelector('.work-viewport'), track = work.querySelector('.work-track');
      const start = spacer.getBoundingClientRect().top + scrollY;
      const distance = track.scrollWidth - viewport.clientWidth + innerHeight * 0.25;
      window.scrollTo({ top: start + distance, behavior: 'instant' });
    });
    await expect.poll(() => page.locator('.work-outro').evaluate(el => Math.abs(el.getBoundingClientRect().right - (document.querySelector('.work-heading').getBoundingClientRect().right - parseFloat(getComputedStyle(document.querySelector('.work-heading')).paddingRight))))).toBeLessThanOrEqual(0.5);
    await expectEndAligned(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    // Der Anfrage-Link muss aus jeder Scrollposition mit Tab erreichbar bleiben.
    await page.locator('.work-outro a').focus();
    await expect(page.locator('.work-outro a')).toBeFocused();
    await expect.poll(() => page.locator('.work-viewport').evaluate(el => el.scrollLeft)).toBe(0);
    await expect.poll(() => page.locator('.work-outro').evaluate(el => Math.abs(el.getBoundingClientRect().right - (document.querySelector('.work-heading').getBoundingClientRect().right - parseFloat(getComputedStyle(document.querySelector('.work-heading')).paddingRight))))).toBeLessThanOrEqual(0.5);
    await expectEndAligned(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.work-track')).toHaveCSS('transform', 'none');
    await page.locator('.work-viewport').evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
    await expectEndAligned(page);
  });
}
