import { test, expect } from '@playwright/test';

for (const width of [390, 760, 1280, 1920]) {
  test(`journal article reads cleanly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tests/fixtures/journal-article.html');
    await page.addScriptTag({ type: 'module', url: '/dist/site.js' });

    const article = page.locator('[data-journal-article]');
    const toc = article.locator('.news-detail-toc');
    await expect(article.locator('h1')).toHaveCount(1);
    await expect(article.locator('.news-detail-body > .content-section')).toHaveCount(3);
    await expect(toc.locator('a')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    if (width <= 760) {
      await expect(toc).not.toHaveAttribute('open');
      await toc.locator('summary').click();
      await expect(toc).toHaveAttribute('open');
    } else {
      await expect(toc).toHaveAttribute('open');
    }

    await toc.locator('a').nth(1).click();
    await expect(page).toHaveURL(/#journal-section-2$/);
    await expect(article.locator('#journal-section-2 h2')).toBeInViewport();
    if (width <= 760) await expect(toc).not.toHaveAttribute('open');
  });
}
