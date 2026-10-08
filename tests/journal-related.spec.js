import { test, expect } from '@playwright/test';

for (const width of [390, 760, 1440, 1920]) {
  test(`related articles use the home journal slider at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tests/fixtures/journal-article.html');
    await page.addScriptTag({ type: 'module', url: '/dist/site.js' });

    const track = page.locator('.journal-related .mod_newslist');
    await expect(track.locator('.journal-row')).toHaveCount(5);
    await expect(track).toHaveAttribute('role', 'region');
    await expect(track).toHaveClass(/is-journal-paged/);
    await expect(page.locator('.journal-slider-status')).toContainText('/ 05');
    await expect(page.getByRole('button', { name: 'Vorherige Beiträge' })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    const firstVisible = await track.locator('.journal-row:visible').first().locator('h3').textContent();
    await page.getByRole('button', { name: 'Nächste Beiträge' }).click();
    await expect(page.getByRole('button', { name: 'Vorherige Beiträge' })).toBeEnabled();
    await expect(track.locator('.journal-row:visible').first().locator('h3')).not.toHaveText(firstVisible);
    await expect(page.locator('.journal-slider-status')).not.toContainText('01–');
  });
}

test('related articles remain reachable without JavaScript', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tests/fixtures/journal-article.html');
  const track = page.locator('.journal-related .mod_newslist');
  await expect(track.locator('.journal-row')).toHaveCount(5);
  await expect(page.locator('.journal-slider-controls')).toHaveCount(0);
  expect(await track.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await track.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  expect(await track.evaluate((element) => {
    const trackRect = element.getBoundingClientRect();
    const cardRect = element.querySelector('.journal-row:last-child').getBoundingClientRect();
    return cardRect.left < trackRect.right && cardRect.right > trackRect.left;
  })).toBe(true);
});
