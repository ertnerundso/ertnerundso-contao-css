import { test, expect } from '@playwright/test';

for (const width of [390, 760, 1280, 1920]) {
  test(`journal article reads cleanly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tests/fixtures/journal-article.html');
    await page.addScriptTag({ type: 'module', url: '/dist/site.js' });

    const article = page.locator('[data-journal-article]');
    await expect(article.locator('h1')).toHaveCount(1);
    await expect(article.locator('.news-detail-hero img')).toHaveCount(1);
    await expect(article.locator('.news-detail-body > .content-section')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await expect(article.locator('.news-detail-toc')).toHaveCount(0);
    await expect(article.locator('.news-detail-back')).toHaveAttribute('href', '/journal/');
  });
}

test('journal article stays readable without a cover image', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tests/fixtures/journal-article.html');
  await page.locator('.news-detail-hero').evaluate((hero) => {
    hero.innerHTML = '<div class="journal-index-media-fallback" aria-hidden="true"><span>ERTNER&SO</span><strong>JOURNAL</strong></div>';
  });
  await expect(page.locator('.news-detail-hero .journal-index-media-fallback')).toBeVisible();
  await expect(page.locator('.news-detail-body > .content-section').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
