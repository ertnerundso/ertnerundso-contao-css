import { test, expect } from '@playwright/test';

test('centered original hero seeks the real video while preserving the centered poster crop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tests/fixtures/hero.html');
  const video = page.locator('.hero-motion-video');
  await expect(video).toHaveClass(/is-ready/);
  await expect(video).toHaveCSS('opacity', '1');
  await expect(video).toHaveAttribute('src', /hero-release\.mp4$/);
  await expect(video).toHaveAttribute('poster', /hero-sensor\.jpg$/);
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 0.65, behavior: 'instant' }));
  await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(2);
  await expect(video).toHaveCSS('opacity', '1');
  const crop = await video.evaluate(el => {
    const image = el.parentElement.querySelector('img');
    const a = el.getBoundingClientRect(), b = image.getBoundingClientRect();
    return { difference: Math.max(Math.abs(a.left - b.left), Math.abs(a.width - b.width)), position: getComputedStyle(el).objectPosition };
  });
  expect(crop.difference).toBeLessThan(1);
  expect(crop.position).toBe('50% 50%');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).toHaveCount(0);
  await expect(page.locator('.hero-media img')).toBeVisible();
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
  });
}

test('a failed hero video leaves the poster and releases the scroll pin', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/hero-release.mp4', route => route.abort());
  await page.goto('/tests/fixtures/hero.html');
  await expect(page.locator('.hero-motion-video')).toHaveCount(0);
  await expect(page.locator('.hero-media img')).toBeVisible();
  await expect(page.locator('.hero').locator('..')).not.toHaveClass(/pin-spacer/);
});
