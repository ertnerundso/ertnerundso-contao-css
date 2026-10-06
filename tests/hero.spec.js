import { test, expect } from '@playwright/test';

test('static hero never requests video, pins the page or moves the hand while scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  const videos = [], errors = [];
  page.on('request', request => { if (/hero-(release|industrial-soft)\.mp4/.test(request.url())) videos.push(request.url()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tests/fixtures/hero.html');
  const image = page.locator('.hero-media img');
  await expect(image).toBeVisible();
  const crop = () => image.evaluate(el => {
    const rect=el.getBoundingClientRect(),hero=el.closest('.hero').getBoundingClientRect();
    return { top:rect.top-hero.top, left:rect.left-hero.left, transform:getComputedStyle(el).transform };
  });
  const before = await crop();
  for (const top of [500, 0]) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), top);
    await expect(image).toHaveCSS('transform', 'none');
    const after = await crop();
    expect(Math.abs(after.top-before.top)).toBeLessThan(1);
    expect(Math.abs(after.left-before.left)).toBeLessThan(1);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(image).toBeVisible();
  await expect(page.locator('.hero video')).toHaveCount(0);
  expect(await page.locator('.hero').evaluate(el => Boolean(el.closest('.pin-spacer')))).toBe(false);
  await expect(page.getByRole('progressbar', { name: /Startfilm|Opening film/, includeHidden: true })).toHaveCount(0);
  expect(videos).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [360, 390, 760, 1000, 1920]) {
  test(`centered original hero at ${width}px keeps its fallback centered and fits the page`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tests/fixtures/hero.html');
    await expect(page.locator('.hero-media img')).toBeVisible();
    await expect(page.locator('.hero-motion-video')).toHaveCount(0);
    const geometry = await page.locator('.hero-media img').evaluate(el => {
      const rect = el.getBoundingClientRect();
      const hero = el.closest('.hero').getBoundingClientRect();
      return { center: rect.left + rect.width / 2, expectedCenter: hero.left + hero.width / 2, position: getComputedStyle(el).objectPosition, transform: getComputedStyle(el).transform, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    expect(Math.abs(geometry.center - geometry.expectedCenter)).toBeLessThan(1);
    expect(geometry.position).toBe('50% 50%');
    expect(geometry.transform).toBe('none');
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    // Die Zentrierung darf den Verlauf ins Weiß nicht wieder überschreiben.
    await expect(page.locator('.hero-media img')).toHaveCSS('mask-image', /linear-gradient/);
  });
}
