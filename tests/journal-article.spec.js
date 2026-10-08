import { test, expect } from '@playwright/test';

for (const width of [390, 760, 1280, 1920]) {
  test(`journal article reads cleanly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tests/fixtures/journal-article.html');
    await page.addScriptTag({ type: 'module', url: '/dist/site.js' });

    const article = page.locator('[data-journal-article]');
    const toc = article.locator('.news-detail-toc');
    await expect(article.locator('h1')).toHaveCount(1);
    await expect(article.locator('.news-detail-hero img')).toHaveCount(1);
    await expect(article.locator('.news-detail-body > .content-section')).toHaveCount(3);
    await expect(toc.locator('a')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    await expect(toc).not.toHaveAttribute('open');
    await toc.locator('summary').click();
    await expect(toc).toHaveAttribute('open');

    await toc.locator('a').nth(1).click();
    await expect(page).toHaveURL(/#journal-section-2$/);
    await expect(article.locator('#journal-section-2 h2')).toBeInViewport();
    await expect(toc).not.toHaveAttribute('open');
  });
}

test('journal article stays readable without a cover image', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tests/fixtures/journal-article.html');
  await page.evaluate(() => {
    document.querySelector('.news-detail-hero').remove();
    document.querySelector('[data-journal-article]').classList.remove('has-hero-image');
  });
  await expect(page.locator('.news-detail-body > .content-section').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

for (const preference of ['no-preference', 'reduce']) {
  test(`journal page transition honors ${preference} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference });
    await page.goto('/tests/fixtures/site.html');
    await page.evaluate(() => {
      const link = document.createElement('a');
      link.id = 'article-transition-test-link';
      link.href = '/tests/fixtures/journal-article.html';
      link.textContent = 'Artikel';
      link.style.cssText = 'position:fixed;top:150px;left:100px;z-index:1000';
      document.body.append(link);
    });
    await page.locator('#article-transition-test-link').click({ noWaitAfter: true });
    await page.waitForURL('**/journal-article.html', { waitUntil: 'load' });
    const animations = await page.evaluate(() => document.getAnimations().map((animation) => animation.animationName));
    if (preference === 'no-preference') {
      expect(animations).toContain('journal-page-in');
    } else {
      expect(animations).not.toContain('journal-page-in');
    }
  });
}
