import { test, expect } from '@playwright/test';

async function start(page, width, reducedMotion = 'reduce') {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion });
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.goto('/tests/fixtures/work-portfolio.html');
  await expect(page.locator('.menu-label')).toHaveCount(1);
  await expect(page.locator('.portfolio-card')).toHaveCount(15);
  await expect(page.locator('.portfolio-card h3')).toHaveCount(15);
  await expect(page.locator('.portfolio-card .button-arrow')).toHaveCount(15);
  await expect.poll(() => page.locator('.portfolio-card img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
}

for (const width of [390, 1440, 2560]) {
  test(`original portfolio supports native scrolling and keyboard at ${width}px`, async ({ page }) => {
    await start(page, width);
    const viewport = page.locator('.work-viewport');
    await expect(viewport).toHaveCSS('overflow-x', 'auto');
    await viewport.focus();
    await page.keyboard.press('End');
    await expect(page.locator('.work-count')).toHaveText('15');
    await expect(page.locator('.work-current')).toHaveText('Woll Group Logo Animation');
    await expect(page.locator('.portfolio-card .button').last()).toBeFocused();
    const end = await page.evaluate(() => {
      const card = document.querySelector('.portfolio-card:last-child').getBoundingClientRect();
      const shell = document.querySelector('.work-meta').parentElement, rect = shell.getBoundingClientRect();
      return { delta: card.right - (rect.right - parseFloat(getComputedStyle(shell).paddingRight)), overflow: document.documentElement.scrollWidth-document.documentElement.clientWidth };
    });
    expect(Math.abs(end.delta)).toBeLessThanOrEqual(1);
    expect(end.overflow).toBeLessThanOrEqual(1);
    await page.keyboard.press('Home');
    await expect(page.locator('.work-count')).toHaveText('01');
    await expect(page.locator('.portfolio-card .button').first()).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.portfolio-card .button').nth(1)).toBeFocused();
    await expect(page.locator('.portfolio-card h3').first()).toHaveCSS('font-weight', '400');
  });
}

for (const width of [1440, 2560]) {
  test(`pinned portfolio reveals focused cards and restores native scrolling at ${width}px`, async ({ page }) => {
    await start(page, width, 'no-preference');
    await expect(page.locator('.work').locator('..')).toHaveClass(/pin-spacer/);
    await page.locator('.portfolio-card .button').last().focus();
    await expect(page.locator('.work-count')).toHaveText('15');
    await expect.poll(() => page.locator('.portfolio-card').last().evaluate(card => {
      const rect = card.getBoundingClientRect(), shell = document.querySelector('.work-meta').parentElement;
      const bounds = shell.getBoundingClientRect();
      return Math.abs(rect.right-(bounds.right-parseFloat(getComputedStyle(shell).paddingRight)));
    })).toBeLessThanOrEqual(1);
    await page.locator('.portfolio-card .button').nth(7).focus();
    await expect.poll(() => page.locator('.portfolio-card').nth(7).evaluate(card => {
      const rect = card.getBoundingClientRect();return rect.left >= 0 && rect.right <= innerWidth;
    })).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.work-track')).toHaveCSS('transform', 'none');
    await expect(page.locator('.work-viewport')).toHaveCSS('overflow-x', 'auto');
  });
}

test('portfolio remains horizontally reachable when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3199/tests/fixtures/work-portfolio.html');
  await expect(page.locator('.work-viewport')).toHaveCSS('overflow-x', 'auto');
  await page.locator('.portfolio-card .button').last().focus();
  await expect(page.locator('.portfolio-card .button').last()).toBeInViewport();
  await context.close();
});
