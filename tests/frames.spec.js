import { test, expect } from '@playwright/test';

const frames = '.service-grid, .benefits-table, .steps, .index-grid, .news-grid, .configurator-scene-cards, .card, .question-list, .journal-row, .client-references-grid, .work-card';
const cards = '.card, .service-card, .index-card, .step, .benefit-column, .journal-row, .question, .work-card, .configurator-scene-card';

for (const width of [360, 760, 1000, 1440]) {
  test(`open line design replaces all card variants at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tests/fixtures/frames.html');
    await page.evaluate(() => document.fonts.ready);
    for (const card of await page.locator(cards).all()) {
      await expect(card).toHaveCSS('box-shadow', 'none');
      await expect(card).toHaveCSS('border-radius', '0px');
      await expect(card).toHaveCSS('border-left-style', /none|dashed/);
      await expect(card).toHaveCSS('border-right-width', '0px');
    }
    for (const frame of await page.locator(frames).all()) {
      await expect(frame).toHaveCSS('border-top-style', 'dashed');
      await expect(frame).toHaveCSS('border-bottom-style', 'dashed');
      const markers = await frame.evaluate((element) => ['::before', '::after'].map((pseudo) => {
        const style = getComputedStyle(element, pseudo);
        return { content: style.content, display: style.display, pointer: style.pointerEvents, height: parseFloat(style.height), paint: style.backgroundImage };
      }));
      for (const marker of markers) {
        expect(marker.content).toBe('""');
        expect(marker.display).toBe('block');
        expect(marker.pointer).toBe('none');
        expect(marker.height).toBeGreaterThan(0);
        expect(marker.paint).toContain('linear-gradient');
      }
    }
    for (const image of await page.locator('.service-card img, .index-card img, .work-card img').all()) {
      await expect(image).toHaveCSS('border-radius', '0px');
      await expect(image).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(page.locator('table')).toHaveCSS('border-top-style', 'dashed');
    await expect(page.locator('table')).toHaveCSS('box-shadow', 'none');
    const separator = page.locator('.benefit-column').nth(1);
    await expect(separator).toHaveCSS(width <= 760 ? 'border-top-style' : 'border-left-style', 'dashed');
  });
}

test('shared line and cross settings change every raster including references', async ({ page }) => {
  await page.goto('/tests/fixtures/frames.html');
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--color-frame-line', 'rgb(90, 100, 110)');
    document.documentElement.style.setProperty('--color-frame-cross', 'rgb(80, 90, 100)');
    document.documentElement.style.setProperty('--space-frame-marker-half', '1rem');
  });
  for (const frame of await page.locator(frames).all()) {
    await expect(frame).toHaveCSS('border-top-color', 'rgb(90, 100, 110)');
    const mark = await frame.evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return { height: style.height, paint: style.backgroundImage };
    });
    expect(mark.height).toBe('32px');
    expect(mark.paint).toContain('rgb(80, 90, 100)');
  }
});

test('line frames preserve FAQ keyboard operation, CMS links and horizontal journal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/tests/fixtures/frames.html');
  const summary = page.locator('.question summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.question').first()).toHaveAttribute('open', '');
  await expect(page.locator('.question').first().locator('p')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.question').first()).not.toHaveAttribute('open', '');
  await page.locator('.card-link-overlay a').click();
  await expect(page).toHaveURL(/#benefits$/);
  const journal = page.locator('.journal-list');
  await journal.scrollIntoViewIfNeeded();
  await journal.evaluate(element => element.scrollTo({ left: element.scrollWidth, behavior: 'instant' }));
  expect(await journal.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  await expect(journal.locator('a').last()).toBeInViewport();
});
