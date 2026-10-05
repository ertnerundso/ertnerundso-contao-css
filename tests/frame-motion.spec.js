import { test, expect } from '@playwright/test';

async function startAnimations(page) {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.addScriptTag({ type: 'module', url: '/dist/site.js' });
  await expect(page.locator('html')).toHaveClass(/js-ready/);
}

for (const width of [1000, 1440]) {
  test(`service borders stay within their frame while contents reveal at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tests/fixtures/frames.html');
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelector('#services').style.marginTop = '1200px';
    });
    await startAnimations(page);
    // Inhalt ist vor dem Scroll-Trigger verschoben, die Linien sind bereits an ihrem Platz.
    expect(await page.locator('.service-card .content-text').first().evaluate(el =>
      new DOMMatrix(getComputedStyle(el).transform).m42)).toBeGreaterThan(0);
    const checkBounds = async () => {
      const geometry = await page.locator('.service-grid').evaluate(grid => {
        const boundary = grid.getBoundingClientRect();
        return [...grid.querySelectorAll('.service-card')].map(card => {
          const rect = card.getBoundingClientRect();
          return { transform: getComputedStyle(card).transform, overflow: rect.bottom - boundary.bottom };
        });
      });
      for (const card of geometry) {
        expect(card.transform).toBe('none');
        expect(card.overflow).toBeLessThanOrEqual(0);
      }
    };
    await checkBounds();
    await page.locator('.service-grid').evaluate(el => window.scrollTo({
      top: el.getBoundingClientRect().top + scrollY, behavior: 'instant',
    }));
    for (let frame = 0; frame < 8; frame++) {
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
      await checkBounds();
    }
    await expect.poll(() => page.locator('.service-card .content-text').first().evaluate(el =>
      new DOMMatrix(getComputedStyle(el).transform).m42)).toBe(0);
    await expect(page.locator('.service-card .content-text').first()).toHaveCSS('transform', 'none');
    await checkBounds();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.service-card .content-text').first()).toHaveCSS('transform', 'none');
  });
}

test('FAQ separators respect Contao text wrappers and keyboard expansion', async ({ page }) => {
  await page.goto('/tests/fixtures/frames.html');
  const questions = page.locator('#questions-cms .question');
  await expect(questions.first()).toHaveCSS('border-top-width', '0px');
  for (const question of (await questions.all()).slice(1)) {
    await expect(question).toHaveCSS('border-top-style', 'dashed');
    await expect(question).toHaveCSS('border-top-width', '1px');
  }
  const summary = questions.nth(1).locator('summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(questions.nth(1)).toHaveAttribute('open', '');
  await expect(questions.nth(1).locator('p')).toBeVisible();
  await expect(questions.nth(2)).toHaveCSS('border-top-style', 'dashed');
});

for (const height of [640, 1000]) {
  test(`configurator reveal includes all four crosses and cleans up at ${height}px height`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height });
    await page.goto('/tests/fixtures/frames.html');
    await page.evaluate(async () => {
      await document.fonts.ready;
      const scene = document.querySelector('#configurator');
      scene.classList.add('configurator-scene');
      const heading = document.createElement('div');
      heading.className = 'configurator-scene-heading shell';
      heading.append(scene.querySelector('h2'));
      const media = document.createElement('div');
      media.className = 'configurator-scene-media';
      media.innerHTML = '<video class="configurator-scene-video"></video>';
      const video = media.querySelector('video');
      Object.defineProperty(video, 'duration', { value: 8 });
      Object.defineProperty(video, 'readyState', { value: 1 });
      const content = document.createElement('div');
      content.className = 'configurator-scene-content shell';
      content.append(media, scene.querySelector('.configurator-scene-cards'));
      const sticky = document.createElement('div');
      sticky.className = 'configurator-scene-sticky';
      sticky.append(heading, content);
      scene.append(sticky);
    });
    await startAnimations(page);
    await expect(page.locator('.configurator-scene-card-reveal')).toHaveCount(1);
    await page.locator('.configurator-scene').evaluate(el => window.scrollTo({
      top: el.getBoundingClientRect().bottom + scrollY - innerHeight, behavior: 'instant',
    }));
    await expect(page.locator('.configurator-scene-card-reveal')).toHaveCSS('opacity', '1');
    const bounds = await page.locator('.configurator-scene-cards').evaluate(cards => {
      const frame = cards.getBoundingClientRect();
      const wrapper = cards.parentElement.getBoundingClientRect();
      const sticky = cards.closest('.configurator-scene-sticky').getBoundingClientRect();
      const mark = getComputedStyle(cards, '::before');
      const half = parseFloat(mark.height) / 2;
      return {
        clipped: frame.left - half < wrapper.left || frame.right + half > wrapper.right ||
          frame.top - half < wrapper.top || frame.bottom + half > wrapper.bottom,
        belowSticky: frame.bottom + half - sticky.bottom,
      };
    });
    expect(bounds.clipped).toBe(false);
    expect(bounds.belowSticky).toBeLessThanOrEqual(0.5);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.configurator-scene-card-reveal')).toHaveCount(0);
    await expect(page.locator('.configurator-scene')).not.toHaveClass(/is-scroll-ready/);
    await expect(page.locator('.configurator-scene-content > .configurator-scene-cards')).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('.configurator-scene-card-reveal')).toHaveCount(1);
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(page.locator('.configurator-scene-card-reveal')).toHaveCount(0);
    await expect(page.locator('.configurator-scene-cards')).toHaveCSS('overflow', 'visible');
  });
}
