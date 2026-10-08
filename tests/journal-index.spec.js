import { test, expect } from '@playwright/test';

for (const width of [390, 760, 1440, 1920]) {
  test(`editorial journal index fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tests/fixtures/journal-index.html');
    await page.addScriptTag({ type: 'module', url: '/dist/site.js' });

    await expect(page.locator('.journal-index-item')).toHaveCount(8);
    await expect(page.locator('.journal-index-item:visible')).toHaveCount(7);
    await expect(page.locator('.journal-index-toolbar')).toBeVisible();
    await expect(page.locator('.journal-index-item:first-child + .journal-index-toolbar')).toHaveCount(1);
    await expect(page.locator('.journal-index-item:first-child h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    await page.locator('.journal-index-more').click();
    await expect(page.locator('.journal-index-item:visible')).toHaveCount(8);
    await page.getByRole('button', { name: 'Montage' }).click();
    await expect(page.locator('.journal-index-item:visible')).toHaveCount(2);
    await expect(page.locator('.journal-index-item:first-child')).toBeVisible();
    await expect(page.locator('.journal-index-status')).toHaveText('1 / 1 Artikel');
    await page.getByRole('button', { name: 'Alle', exact: true }).click();
    await expect(page.locator('.journal-index-item:visible')).toHaveCount(7);
  });
}

test('journal remains complete without JavaScript', async ({ page }) => {
  await page.goto('/tests/fixtures/journal-index.html');
  await expect(page.locator('.journal-index-item:visible')).toHaveCount(8);
  await expect(page.locator('.journal-index-toolbar')).toHaveCount(0);
  await expect(page.locator('.journal-index-item:first-child h1 a')).toHaveAttribute('href', '/tests/fixtures/journal-article.html');
});
