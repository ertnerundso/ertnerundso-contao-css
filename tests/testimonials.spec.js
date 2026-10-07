import { test, expect } from '@playwright/test';

async function start(page) {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.addScriptTag({ type: 'module', url: '/dist/site.js' });
  await expect(page.locator('.form-honeypot')).toHaveCount(1);
}

for (const width of [390, 1440]) {
  test(`all CMS testimonials join the switcher in article order at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/tests/fixtures/site.html');
    await page.evaluate(() => {
      const main = document.querySelector('main');
      const article = document.createElement('div');
      article.className = 'mod_article';
      main.append(article);
      const existing = [...main.querySelectorAll('.testimonial-feature')];
      existing.forEach(slide => article.append(slide));
      for (const [company, quote] of [
        ['TerraVerde', 'ERTNER&SO hat genau verstanden, was wir wollten. Das Kurzvideo überzeugt vom Schnitt bis zur grafischen Nachbearbeitung.'],
        ['Wholey', 'Der Beitrag von ERTNER&SO zur INTERNORGA war auf unserer Leinwand ein echter Hingucker. Kreativ gedacht.'],
      ]) {
        const slide = document.createElement('section');
        slide.className = 'shell testimonial-feature';
        slide.innerHTML = '<div class="content-text testimonial-quote"><div class="rte"><blockquote><p></p></blockquote></div></div><div class="testimonial-signature"><div class="content-text testimonial-company"><div class="rte"><p></p></div></div></div>';
        slide.querySelector('.testimonial-quote p').textContent = quote;
        slide.querySelector('.testimonial-company p').textContent = company;
        article.append(slide);
      }
      const other = document.createElement('div');
      other.className = 'mod_article';
      other.innerHTML = '<section class="testimonial-feature"><p>Andere Seite</p></section>';
      main.append(other);
    });
    await start(page);
    const carousel = page.locator('.testimonial-carousel');
    const tabs = carousel.getByRole('tab');
    await expect(tabs).toHaveCount(4);
    for (const [index, company] of ['Steitz Secura', 'Visora Studios', 'TerraVerde', 'Wholey'].entries()) {
      await tabs.nth(index).click();
      const panel = carousel.getByRole('tabpanel');
      await expect(panel).toHaveCount(1);
      await expect(panel).toContainText(company);
      await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true');
      const panelId = await panel.getAttribute('id');
      await expect(tabs.nth(index)).toHaveAttribute('aria-controls', panelId);
    }
    await tabs.last().press('ArrowRight');
    await expect(tabs.first()).toBeFocused();
    await tabs.first().press('ArrowLeft');
    await expect(tabs.last()).toBeFocused();
    await tabs.last().press('Home');
    await expect(tabs.first()).toBeFocused();
    await tabs.first().press('End');
    await expect(tabs.last()).toBeFocused();
    await expect(page.locator('.mod_article > .testimonial-feature')).toHaveCount(1);
    const bounds = await carousel.locator('.testimonial-switch').boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(tabs).toHaveCount(4);
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 1000 });
    await expect(tabs).toHaveCount(4);
    await expect(carousel.getByRole('tabpanel')).toContainText('Wholey');
  });
}

test('a single CMS testimonial stays visible without an empty switcher', async ({ page }) => {
  await page.goto('/tests/fixtures/site.html');
  await page.locator('.testimonial-feature--closing').evaluate(el => el.remove());
  await start(page);
  await expect(page.locator('.testimonial-carousel')).toHaveCount(0);
  await expect(page.locator('.testimonial-feature')).toBeVisible();
});

// Isolierter Browser mit echter Sichtbarkeitsprüfung und kontrollierter Uhr:
// acht Sekunden testen, ohne die Tests acht Sekunden warten zu lassen.
async function startAutoplay(page, { language = 'de', reducedMotion = 'no-preference' } = {}) {
  await page.emulateMedia({ reducedMotion });
  await page.route('**/tests/fixtures/testimonials-autoplay.html', route => route.fulfill({
    contentType: 'text/html',
    body: `<html lang="${language}"><head><style>
      .testimonial-carousel { min-height: 300px; }
      [hidden] { display: none; }
      main { margin-bottom: 2000px; }
    </style></head><body><button id="outside">Außerhalb</button><main><div class="mod_article">
      <section class="testimonial-feature"><p>Steitz Secura</p><a href="#project">Projekt</a></section>
      <section class="testimonial-feature"><p>Visora Studios</p></section>
      <section class="testimonial-feature"><p>Wholey</p></section>
    </div></main></body></html>`,
  }));
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.goto('/tests/fixtures/testimonials-autoplay.html');
  await page.clock.pauseAt(new Date("2026-01-01T00:00:10Z"));
  await page.addScriptTag({ type: 'module', content: `
    import { initTestimonials } from '/src/testimonials.js';
    import { config } from '/src/config.js';
    const cleanups = [];
    initTestimonials({
      config,
      listen: (target, event, handler) => target.addEventListener(event, handler),
      cleanup: callback => cleanups.push(callback),
      observer: (observer, target) => { observer.observe(target); cleanups.push(() => observer.disconnect()); },
    });
  ` });
  const carousel = page.locator('.testimonial-carousel');
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  // Die native Observer-Zustellung erfolgt nach dem Rendern.
  await page.screenshot();
  return carousel;
}

test('testimonials rotate every eight seconds, wrap, and never move focus', async ({ page }) => {
  const carousel = await startAutoplay(page);
  await page.locator('#outside').focus();
  await page.clock.runFor(7999);
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await page.clock.runFor(1);
  await expect(carousel.getByRole('tabpanel')).toContainText('Visora Studios');
  await page.clock.runFor(16000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await expect(page.locator('#outside')).toBeFocused();
});

test('manual selection, hover, and keyboard focus give the reader a fresh interval', async ({ page }) => {
  const carousel = await startAutoplay(page);
  await page.clock.runFor(7000);
  await carousel.getByRole('tab').nth(1).click();
  await page.clock.runFor(16000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Visora Studios');
  await page.mouse.move(1000, 700);
  await page.locator('#outside').focus();
  await page.clock.runFor(7999);
  await expect(carousel.getByRole('tabpanel')).toContainText('Visora Studios');
  await page.clock.runFor(1);
  await expect(carousel.getByRole('tabpanel')).toContainText('Wholey');
  await carousel.hover();
  await page.clock.runFor(16000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Wholey');
  await page.mouse.move(1000, 700);
  await carousel.getByRole('tab').last().focus();
  await carousel.getByRole('tab').last().press('ArrowRight');
  await page.clock.runFor(16000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await expect(carousel.getByRole('tab').first()).toBeFocused();
});

test('pause stays stopped until resumed, with translated playback labels', async ({ page }) => {
  const carousel = await startAutoplay(page, { language: 'en' });
  await carousel.getByRole('button', { name: 'Pause automatic rotation' }).click();
  await page.mouse.move(1000, 700);
  await page.locator('#outside').focus();
  await page.clock.runFor(24000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await carousel.getByRole('button', { name: 'Resume automatic rotation' }).click();
  await page.mouse.move(1000, 700);
  await page.locator('#outside').focus();
  await page.clock.runFor(8000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Visora Studios');
});

test('out-of-view and hidden pages suspend autoplay and resume with a full interval', async ({ page }) => {
  const carousel = await startAutoplay(page);
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.screenshot();
  await page.clock.runFor(24000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot();
  await page.clock.runFor(8000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Visora Studios');
  // Den Browser-Zustand simulieren; native visibilitychange-Listener ausführen.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(24000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Visora Studios');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(8000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Wholey');
});

test('reduced motion keeps manual controls working and reacts to preference changes', async ({ page }) => {
  const carousel = await startAutoplay(page, { reducedMotion: 'reduce' });
  await expect(carousel.locator('.testimonial-playback')).toBeHidden();
  await page.clock.runFor(24000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await carousel.getByRole('tab').last().click();
  await expect(carousel.getByRole('tabpanel')).toContainText('Wholey');
  await page.mouse.move(1000, 700);
  await page.locator('#outside').focus();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(carousel.locator('.testimonial-playback')).toBeVisible();
  await page.clock.runFor(8000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(carousel.locator('.testimonial-playback')).toBeHidden();
  await page.clock.runFor(24000);
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
});
