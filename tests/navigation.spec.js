import { test, expect } from '@playwright/test';

async function start(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Frontend-Modul'))
      errors.push(message.text());
  });
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1'
      ? route.continue()
      : route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
  await page.goto('/tests/fixtures/navigation.html');
  await expect(page.locator('.menu-label')).toHaveText('Menü');
  return errors;
}

for (const width of [390, 1440]) {
  test(`transparent navigation pushes the complete page and restores it at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = await start(page);
    await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.menu-toggle')).toBeVisible();
    await expect(page.locator('.header-nav')).toBeHidden();
    await expect(page.locator('.header-actions > .button')).toBeHidden();
    await expect(page.locator('.header-actions > .lang-link')).toBeHidden();
    await expect(page.locator('.menu-panel-bottom > .button')).toBeHidden();
    expect(await page.locator('.menu-panel-nav a').allTextContents())
      .toEqual(['Arbeiten', 'Journal', 'Kontakt', 'Leistungen']);
    expect(await page.locator('.menu-panel-bottom > div a').allTextContents())
      .toEqual(['EN', 'Impressum', 'Datenschutz', 'AGB']);
    await expect(page.locator('.page-shell > .before-content')).toHaveCount(1);
    await expect(page.locator('.page-shell > .after-content')).toHaveCount(1);
    await expect(page.locator('.page-shell > .site-footer')).toHaveCount(1);
    const before = await page.locator('.page-shell').boundingBox();
    await page.locator('.menu-toggle').click();
    await expect(page.locator('.menu-panel')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page.locator('.site-footer')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page.locator('.hero-actions > .button')).toHaveCSS('background-color', 'rgb(36, 85, 237)');
    await expect(page.locator('.menu-panel')).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('.page-shell')).toHaveAttribute('inert', '');
    await expect(page.locator('.site-header')).toHaveAttribute('inert', '');
    await expect(page.locator('.menu-close')).toBeFocused();
    const panel = await page.locator('.menu-panel').boundingBox();
    const shifted = await page.locator('.page-shell').boundingBox();
    expect(shifted.y - before.y).toBeCloseTo(panel.height, 0);
    expect(shifted.width).toBeLessThan(before.width);
    await expect(page.locator('.menu-panel-nav a[href="#services"]')).toHaveCount(1);
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('.menu-panel-top .brand')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('.menu-panel-bottom > div a').last()).toBeFocused();
    await page.locator('.menu-dismiss').click();
    await expect(page.locator('.menu-toggle')).toBeFocused();
    await expect(page.locator('.page-shell')).not.toHaveAttribute('inert', '');
    await expect(page.locator('.page-shell')).toHaveCSS('transform', 'none');
    expect((await page.locator('.page-shell').boundingBox()).y).toBe(before.y);
    expect(errors).toEqual([]);
  });
}

test('opening at a scrolled position preserves the viewport and pointer focus does not lock the header', async ({ page }) => {
  const errors = await start(page);
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(page.locator('.site-header')).toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollTo(0, 650));
  await expect(page.locator('.site-header')).not.toHaveClass(/is-hidden/);
  await page.locator('.menu-toggle').click();
  expect(await page.evaluate(() => window.scrollY)).toBe(650);
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await page.evaluate(() => window.scrollY)).toBe(650);
  await page.locator('.menu-close').click();
  expect(await page.evaluate(() => window.scrollY)).toBe(650);
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(page.locator('.site-header')).toHaveClass(/is-hidden/);
  expect(errors).toEqual([]);
});

test('the menu scrolls independently on a short screen and anchor links close it', async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 280 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = await start(page);
  await page.locator('.menu-toggle').click();
  const panel = page.locator('.menu-panel');
  expect(await panel.evaluate((el) => el.scrollHeight)).toBeGreaterThan(await panel.evaluate((el) => el.clientHeight));
  await panel.hover();
  await page.mouse.wheel(0, 250);
  await expect.poll(() => panel.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await page.locator('.menu-toggle').click();
  expect(await panel.evaluate((el) => el.scrollTop)).toBe(0);
  await page.locator('.menu-panel-nav a[href="#contact"]').click();
  await expect(page.locator('body')).not.toHaveClass(/menu-open/);
  await expect(page.locator('.page-shell')).not.toHaveAttribute('inert', '');
  expect(errors).toEqual([]);
});

test('motion preference switches preserve the open menu and every close restores the page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = await start(page);
  await page.locator('.menu-toggle').click();
  await expect.poll(() => page.locator('.page-shell').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m22)).toBeCloseTo(0.98, 2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.page-shell')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.menu-panel')).toHaveClass(/is-open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.page-shell')).toHaveCSS('transform', 'none');
  await page.locator('.menu-toggle').click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.menu-panel')).toHaveClass(/is-open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-panel')).toHaveAttribute('inert', '');
  expect(errors).toEqual([]);
});
