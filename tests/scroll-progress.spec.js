import { test, expect } from '@playwright/test';

async function start(page, { english = false, ready = true } = {}) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && message.text().includes('Frontend-Modul')) errors.push(message.text());
  });
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.goto('/tests/fixtures/scroll-progress.html');
  await page.evaluate(async ({ english, ready }) => {
    await document.fonts.ready;
    if (english) document.documentElement.lang = 'en';
    const video = document.querySelector('.configurator-scene-video');
    Object.defineProperty(video, 'duration', { value: 8 });
    Object.defineProperty(video, 'readyState', { value: ready ? 1 : 0 });
    // Der Hero-Film bleibt lokal simuliert: kein Netzfehler beendet die zu prüfende Strecke.
    const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    Object.defineProperty(HTMLMediaElement.prototype, 'src', {
      ...descriptor, set(value) { if (!this.classList.contains('hero-motion-video')) descriptor.set.call(this, value); },
    });
  }, { english, ready });
  await page.addScriptTag({ type: 'module', url: '/dist/site.js' });
  await expect(page.locator('.menu-label')).toHaveCount(1);
  return errors;
}

async function scrollStory(page, name, fraction) {
  await page.evaluate(({ name, fraction }) => {
    const element = document.querySelector(name);
    const rect = element.getBoundingClientRect();
    const header = document.querySelector('.site-header').offsetHeight;
    let start, distance;
    if (name === '.configurator-scene') {
      start = rect.top + scrollY - header;
      distance = rect.height - innerHeight + header;
    } else if (name === '.showreel-section') {
      start = rect.top + scrollY;
      distance = innerHeight * 5.3;
    } else {
      const spacer = element.closest('.pin-spacer');
      start = spacer.getBoundingClientRect().top + scrollY;
      if (name === '.hero') {
        start -= 2 * header;
        distance = Math.round(innerHeight * 1.25);
      } else {
        const track = element.querySelector('.work-track');
        const viewport = element.querySelector('.work-viewport');
        distance = Math.max(0, track.scrollWidth - viewport.clientWidth) + innerHeight * 0.25;
      }
    }
    window.scrollTo({ top: start + distance * fraction, behavior: 'instant' });
  }, { name, fraction });
}

for (const [selector, label] of [
  ['.hero', 'Startfilm'], ['.showreel-section', 'Showreel'],
  ['.work', 'Arbeiten'], ['.configurator-scene', 'Konfigurator'],
]) {
  test(`${label}: actual scroll distance, moving ticks, reverse scroll and exit`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 900 });
    const errors = await start(page);
    const indicator = page.getByRole('progressbar', { name: `Scrollfortschritt: ${label}`, includeHidden: true });
    for (const fraction of [0.2, 0.8, 0.4]) {
      await scrollStory(page, selector, fraction);
      await expect(indicator).toBeVisible();
      await expect(indicator).toHaveAttribute('aria-valuenow', String(fraction * 100));
      await expect(page.getByRole('progressbar')).toHaveCount(1);
      const highlight = await indicator.evaluate(el => {
        const scales = [...el.children].map(tick => new DOMMatrix(getComputedStyle(tick).transform).m11);
        return scales.indexOf(Math.max(...scales)) / (scales.length - 1);
      });
      expect(Math.abs(highlight - fraction)).toBeLessThan(0.02);
      expect(await indicator.evaluate(el => el.parentElement === document.body)).toBe(true);
      if (selector === '.work') {
        await expect.poll(() => page.locator('.work-track').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41)).toBeLessThan(0); // ursprüngliche Animation bleibt aktiv
      }
    }
    await scrollStory(page, selector, 1.1);
    await expect(indicator).toBeHidden();
    await scrollStory(page, selector, -0.1);
    await expect(indicator).toBeHidden();
    expect(errors).toEqual([]);
  });
}

test('refresh, menu, responsive teardown and preference changes leave no stale indicators', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await start(page);
  await expect(page.locator('.section-scroll-progress')).toHaveCount(4);
  await scrollStory(page, '.showreel-section', 0.5);
  const indicator = page.getByRole('progressbar', { name: 'Scrollfortschritt: Showreel', includeHidden: true });
  await expect(indicator).toHaveAttribute('aria-valuenow', '50');
  await page.setViewportSize({ width: 1200, height: 700 });
  // Refresh erfolgt verzögert; danach beziehen wir uns auf die neu berechnete Scrollstrecke.
  await expect.poll(() => page.locator('.showreel-section').evaluate(el =>
    el.querySelector('.pin-spacer').style.paddingBottom)).toBe('3710px');
  await scrollStory(page, '.showreel-section', 0.5);
  await expect(indicator).toHaveAttribute('aria-valuenow', '50');
  await page.keyboard.press('Tab'); // macht den ausgeblendeten Header für Tastaturbedienung sichtbar
  await page.locator('.menu-toggle').evaluate(el => el.click());
  await expect(page.locator('body')).toHaveClass(/menu-open/);
  await expect(indicator).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(indicator).toBeVisible();
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.section-scroll-progress')).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('.section-scroll-progress')).toHaveCount(4);
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(page.locator('.section-scroll-progress')).toHaveCount(0);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.section-scroll-progress')).toHaveCount(4);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await expect(page.locator('.section-scroll-progress')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('metadata starts the configurator indicator once; media failures remove only the affected story', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await start(page, { english: true, ready: false });
  const config = page.getByRole('progressbar', { name: 'Scroll progress: Configurator', includeHidden: true });
  await expect(config).toHaveCount(0);
  for (let i = 0; i < 2; i++) await page.locator('.configurator-scene-video').evaluate(el => el.dispatchEvent(new Event('loadedmetadata')));
  await expect(config).toHaveCount(1);
  await scrollStory(page, '.configurator-scene', 0.75);
  await expect(config).toHaveAttribute('aria-valuenow', '75');
  expect(await page.locator('.configurator-scene-video').evaluate(el => el.currentTime)).toBeGreaterThan(7);
  await page.locator('.configurator-scene-video').evaluate(el => el.dispatchEvent(new Event('error')));
  await expect(config).toHaveCount(0);
  await expect(page.locator('.configurator-scene')).not.toHaveClass(/is-scroll-ready/);
  await page.locator('.hero-motion-video').evaluate(el => el.dispatchEvent(new Event('error')));
  await expect(page.getByRole('progressbar', { name: 'Scroll progress: Opening film', includeHidden: true })).toHaveCount(0);
  await expect(page.locator('.section-scroll-progress')).toHaveCount(2);
  expect(errors).toEqual([]);
});
