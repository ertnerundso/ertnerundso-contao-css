import { test, expect } from '@playwright/test';

for (const width of [390, 760, 1440, 1920]) {
  test(`related articles scroll without page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tests/fixtures/journal-article.html');
    await page.addScriptTag({ type: 'module', url: '/dist/site.js' });

    const track = page.locator('.journal-related .mod_newslist');
    await expect(track.locator('.journal-related-card')).toHaveCount(5);
    await expect(track).toHaveAttribute('role', 'region');
    await expect(page.locator('.journal-related-status')).toHaveText('01 / 05');
    await expect(page.getByRole('button', { name: 'Vorherige Artikel' })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    await page.getByRole('button', { name: 'Nächste Artikel' }).click();
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect(page.getByRole('button', { name: 'Vorherige Artikel' })).toBeEnabled();

    await track.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    await expect(page.getByRole('button', { name: 'Nächste Artikel' })).toBeDisabled();
    await expect(track.locator('.journal-related-card').last()).toBeInViewport();
  });
}

test('related articles remain reachable without JavaScript', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tests/fixtures/journal-article.html');
  const track = page.locator('.journal-related .mod_newslist');
  await expect(track.locator('.journal-related-card')).toHaveCount(5);
  await expect(page.locator('.journal-related-controls')).toHaveCount(0);
  expect(await track.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await track.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  expect(await track.evaluate((element) => {
    const trackRect = element.getBoundingClientRect();
    const cardRect = element.querySelector('.journal-related-card:last-child').getBoundingClientRect();
    return cardRect.left < trackRect.right && cardRect.right > trackRect.left;
  })).toBe(true);
});
