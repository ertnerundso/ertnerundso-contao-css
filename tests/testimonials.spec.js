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
