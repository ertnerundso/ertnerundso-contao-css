import { test, expect } from '@playwright/test';

async function expectAligned(page, selectors, content = false) {
  const measurements = await page.locator(selectors).evaluateAll((elements, content) => {
    const header = document.querySelector('.header-inner');
    const rect = header.getBoundingClientRect();
    const style = getComputedStyle(header);
    const left = rect.left + parseFloat(style.paddingLeft);
    const right = rect.right - parseFloat(style.paddingRight);
    return elements.map(element => {
      const r = element.getBoundingClientRect();
      const s = getComputedStyle(element);
      return {
        selector: element.className || element.id,
        left: r.left + (content ? parseFloat(s.paddingLeft) : 0) - left,
        right: r.right - (content ? parseFloat(s.paddingRight) : 0) - right,
      };
    });
  }, content);
  expect(measurements.length).toBeGreaterThan(0);
  for (const measurement of measurements) {
    expect(Math.abs(measurement.left), measurement.selector + ' left').toBeLessThanOrEqual(0.5);
    expect(Math.abs(measurement.right), measurement.selector + ' right').toBeLessThanOrEqual(0.5);
  }
}

for (const width of [390, 1000, 1920, 2560]) {
  test(`CMS sections and nested grids follow the shared layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/tests/fixtures/layout.html');
    await page.evaluate(() => document.fonts.ready);
    await expectAligned(page, '.shell,.container,.contact-band-copy,.contact-band-media,.news-intro,.news-detail > .project-visual,.news-detail > .content-section', true);
    await expectAligned(page, '.news-grid,.client-references-grid,.benefits-table,.project-visual figure,.contact-band-media figure');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    // Auch eigene Einstellungen müssen alle Bereiche gemeinsam verändern.
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--layout-container-max', '80rem');
      document.documentElement.style.setProperty('--space-gutter', '2rem');
    });
    await expectAligned(page, '.shell,.container,.contact-band-copy,.contact-band-media,.news-intro,.news-detail > .project-visual,.news-detail > .content-section', true);
    await expectAligned(page, '.news-grid,.client-references-grid,.benefits-table,.project-visual figure,.contact-band-media figure');
  });
}

for (const width of [1920, 2560]) {
  test(`pinned showreel benefits retain shared width and restore it after motion changes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/tests/fixtures/layout.html');
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
      ? route.continue() : route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addScriptTag({ type: 'module', url: '/dist/site.js' });
    await expect(page.locator('html')).toHaveClass(/showreel-motion/);
    await expectAligned(page, '.benefits-stage,.showreel-outro', true);
    await expectAligned(page, '.benefits-table');
    await page.locator('.showreel-stage').evaluate(stage => window.scrollTo({
      top: stage.getBoundingClientRect().top + scrollY + innerHeight * 3, behavior: 'instant',
    }));
    await expectAligned(page, '.benefits-stage,.showreel-outro', true);
    await expectAligned(page, '.benefits-table');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/showreel-motion/);
    await expectAligned(page, '.benefits-stage,.showreel-outro', true);
    await expectAligned(page, '.benefits-table');
    await page.setViewportSize({ width: 390, height: 900 });
    await expectAligned(page, '.benefits-stage,.showreel-outro', true);
    await expectAligned(page, '.benefits-table');
  });
}
