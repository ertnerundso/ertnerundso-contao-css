import { test, expect } from '@playwright/test';

async function start(page, prepare) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Frontend-Modul'))
      errors.push(message.text());
  });
  // Kein Test sendet echte Formulare, Buchungen oder Anfragen an Drittanbieter.
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1'
      ? route.continue()
      : route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
  await page.goto('/tests/fixtures/site.html');
  if (prepare) await page.evaluate(prepare);
  await page.addScriptTag({ type: 'module', url: '/dist/site.js' });
  await expect(page.locator('.form-honeypot')).toHaveCount(1);
  return errors;
}

test('menu keeps focus inside, closes with Escape and restores its trigger', async ({
  page,
}) => {
  await page.setViewportSize({ width: 760, height: 900 });
  const errors = await start(page);
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.menu-panel')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('.menu-close')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.menu-panel-nav a').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.menu-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.menu-panel')).toHaveAttribute('inert', '');
  await expect(page.locator('.menu-toggle')).toBeFocused();
  expect(errors).toEqual([]);
});

test('header hides downwards, returns upwards and remains available for keyboard/menu', async ({
  page,
}) => {
  await page.setViewportSize({ width: 760, height: 900 });
  const errors = await start(page);
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(page.locator('.site-header')).toHaveClass(/is-hidden/);
  await expect(page.locator('.site-header')).toHaveAttribute('inert', '');
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(page.locator('.site-header')).not.toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollTo(0, 1000));
  await expect(page.locator('.site-header')).toHaveClass(/is-hidden/);
  await page.keyboard.press('Tab');
  await expect(page.locator('.site-header')).not.toHaveClass(/is-hidden/);
  await page.locator('.menu-toggle').click();
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  await expect(page.locator('.site-header')).not.toHaveClass(/is-hidden/);
  expect(errors).toEqual([]);
});

test('mobile work slider uses the actual card count and native scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const errors = await start(page);
  await expect(page.locator('.work-count')).toHaveText('01');
  await expect(page.locator('.work-viewport')).toHaveAttribute('tabindex', '0');
  await expect(page.locator('.work-viewport')).toHaveCSS('overflow-x', 'auto');
  await page
    .locator('.work-viewport')
    .evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
  await expect(page.locator('.work-count')).toHaveText('03');
  expect(errors).toEqual([]);
});

test('journal controls indicate both ends and move one article at a time', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const errors = await start(page);
  const buttons = page.locator('.journal-slider-controls button');
  await expect(buttons.first()).toBeDisabled();
  await expect(buttons.last()).toBeEnabled();
  await buttons.last().click();
  await expect(buttons.first()).toBeEnabled();
  await page
    .locator('.journal-list')
    .press('End');
  await expect(buttons.last()).toBeDisabled();
  expect(errors).toEqual([]);
});

test('testimonial switch unifies CMS voices and supports pointer and keyboard', async ({ page }) => {
  const errors = await start(page);
  const carousel = page.locator('.testimonial-carousel');
  const tabs = carousel.getByRole('tab');
  await expect(carousel.getByRole('tabpanel')).toHaveCount(1);
  await expect(tabs).toHaveCount(2);
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await tabs.last().click();
  await expect(carousel.getByRole('tabpanel')).toContainText('Visora Studios');
  await tabs.last().press('ArrowRight');
  await expect(tabs.first()).toBeFocused();
  await expect(carousel.getByRole('tabpanel')).toContainText('Steitz Secura');
  await expect(page.locator('main > .testimonial-feature')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('compact blue buttons keep their arrow tile and fit on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  const button = page.locator('.hero-actions .button');
  await expect(button).toHaveCSS('border-radius', '8px');
  await expect(button.locator('.button-arrow')).toHaveCount(1);
  await expect(button.locator('.button-arrow')).toHaveAttribute('aria-hidden', 'true');
  const width = await button.evaluate((element) => element.getBoundingClientRect().width);
  expect(width).toBeLessThan(390);
});

test('reduced motion keeps text readable and leaves effects uninitialized', async ({
  page,
}) => {
  const errors = await start(page, () => {
    document.querySelector('#headings h1').setAttribute('data-split', '');
  });
  await expect(page.locator('html')).not.toHaveClass(/js-ready|showreel-motion/);
  await expect(page.locator('.split-line')).toHaveCount(0);
  await expect(page.locator('.hero-motion-video')).toHaveCount(0);
  await expect(page.locator('#headings h1')).toBeVisible();
  expect(errors).toEqual([]);
});

test('viewport and reduced-motion changes restore split text and pinned work styles', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = await start(page, () => {
    document.querySelector('#headings h1').setAttribute('data-split', '');
  });
  await expect(page.locator('.split-line')).toHaveCount(1);
  await expect(page.locator('.work').locator('..')).toHaveClass(/pin-spacer/);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.locator('.work').locator('..')).not.toHaveClass(/pin-spacer/);
  await expect(page.locator('.work-track')).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.split-line')).toHaveCount(0);
  await expect(page.locator('#headings h1')).toHaveText('H1');
  await expect(page.locator('html')).not.toHaveClass(/js-ready/);
  expect(errors).toEqual([]);
});

test('missing optional sections do not prevent the form module from starting', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = await start(page, () => {
    document.querySelector('.menu-toggle').remove();
    document.querySelector('.hero').remove();
    document.querySelector('.work').remove();
    document.querySelector('.journal').remove();
    const section = document.createElement('section');
    section.className = 'benefits-section';
    document.querySelector('main').append(section);
  });
  expect(errors).toEqual([]);
});

test('form validation blocks missing consent/security without sending a request', async ({
  page,
}) => {
  let requests = 0;
  await start(page);
  await page.route('**/api/contact', (route) => {
    requests++;
    return route.fulfill({ status: 200, body: '{}' });
  });
  await page.locator('[name=email]').fill('team@example.test');
  await page
    .locator('.contact-form form')
    .evaluate((el) =>
      el.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })),
    );
  await expect(page.locator('.form-status')).toContainText('Datenschutzhinweise');
  await page.locator('[name=consent]').check();
  await page
    .locator('.contact-form form')
    .evaluate((el) =>
      el.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })),
    );
  await expect(page.locator('.form-status')).toContainText('Sicherheitsprüfung');
  expect(requests).toBe(0);
});

for (const success of [true, false])
  test(`simulated contact ${success ? 'success' : 'failure'} restores the correct form state`, async ({
    page,
  }) => {
    const errors = await start(page);
    let payload;
    await page.evaluate(() => {
      window.contactSuccessEvents = 0;
      document.addEventListener('eo:contact-success', () => window.contactSuccessEvents++);
    });
    await page.route('**/api/contact', (route) => {
      payload = route.request().postDataJSON();
      return route.fulfill({
        status: success ? 200 : 503,
        contentType: 'application/json',
        body: '{}',
      });
    });
    await page.locator('[name=email]').fill('team@example.test');
    await page.locator('[name=message]').fill('Nur eine lokale Testnachricht');
    await page.locator('[name=consent]').check();
    await page.locator('form').evaluate((el) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'cf-turnstile-response';
      input.value = 'simulated-token';
      el.append(input);
    });
    await page.locator('.widget-submit button').click();
    await expect(page.locator('.form-status')).toContainText(
      success ? 'angekommen' : 'nicht geklappt',
    );
    expect(payload.email).toBe('team@example.test');
    expect(payload.token).toBe('simulated-token');
    if (success) await expect(page.locator('[name=email]')).toHaveValue('');
    else await expect(page.locator('.widget-submit button')).toBeEnabled();
    expect(await page.evaluate(() => window.contactSuccessEvents)).toBe(success ? 1 : 0);
    await expect(page.locator('.widget-submit button .button-arrow')).toHaveCount(1);
    await expect(page.locator('.widget-submit button .button-label')).toHaveText(success ? 'Gesendet' : 'Senden');
    expect(errors).toEqual([]);
  });

test('shared buttons and Contao link wrappers use the same three variants', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/site.html');
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.id = 'variants';
    container.innerHTML =
      '<a class="button" href="#main">Direkt</a><div class="content-hyperlink button"><a href="#main">Contao</a></div><a class="btn btn--secondary">Outline</a><a class="btn btn--text">Text</a>';
    document.querySelector('main').append(container);
  });
  const direct = page.locator('#variants > .button').first(),
    wrapper = page.locator('#variants .content-hyperlink');
  const color = await direct.evaluate((el) => getComputedStyle(el).backgroundColor);
  await expect(wrapper).toHaveCSS('background-color', color);
  await expect(wrapper.locator('a')).toHaveCSS('font-size', '16px');
  await expect(page.locator('#variants .btn--secondary')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(page.locator('#variants .btn--secondary')).toHaveCSS(
    'border-top-width',
    '1px',
  );
  await expect(page.locator('#variants .btn--text')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
});

for (const width of [360, 760, 1440])
  test(`shared content grids fit the page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/tests/fixtures/site.html');
    const measurements = await page.evaluate(() => ({
      viewport: innerWidth,
      width: document.documentElement.scrollWidth,
      columns: getComputedStyle(
        document.querySelector('.grid-2-col'),
      ).gridTemplateColumns.split(' ').length,
    }));
    expect(measurements.width).toBeLessThanOrEqual(width + 1);
    expect(measurements.columns).toBe(width <= 760 ? 1 : 2);
  });

test('showreel playback remains available with reduced motion', async ({ page }) => {
  const errors = await start(page, () => {
    HTMLMediaElement.prototype.play = function () {
      this.dataset.played = 'true';
      return Promise.resolve();
    };
    const section = document.createElement('section');
    section.className = 'showreel-section';
    section.innerHTML =
      '<div class="showreel-stage"><div class="showreel-frame"><video></video><button class="showreel-action">Abspielen</button></div></div>';
    document.querySelector('main').append(section);
  });
  await page.locator('.showreel-action').click();
  await expect(page.locator('.showreel-frame video')).toHaveAttribute(
    'data-played',
    'true',
  );
  expect(
    await page
      .locator('.showreel-frame video')
      .evaluate((el) => el.controls && !el.muted),
  ).toBe(true);
  await expect(page.locator('.showreel-action')).toBeHidden();
  expect(errors).toEqual([]);
});

test('configurator scroll state and inline styles are restored on mobile', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = await start(page, () => {
    const section = document.createElement('section');
    section.className = 'configurator-scene';
    section.innerHTML =
      '<div class="configurator-scene-heading"><h2>Konfiguration</h2></div><div class="configurator-scene-media"><video class="configurator-scene-video"></video></div><div class="configurator-scene-cards"><article class="configurator-scene-card">Details</article></div>';
    const video = section.querySelector('video');
    Object.defineProperty(video, 'duration', { value: 8 });
    Object.defineProperty(video, 'readyState', { value: 1 });
    document.querySelector('main').append(section);
  });
  await expect(page.locator('.configurator-scene')).toHaveClass(/is-scroll-ready/);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.locator('.configurator-scene')).not.toHaveClass(/is-scroll-ready/);
  expect(
    await page.locator('.configurator-scene-video').evaluate((el) => el.style.cssText),
  ).toBe('');
  expect(errors).toEqual([]);
});

test('calendar script failure shows the configured fallback link', async ({ page }) => {
  const errors = await start(page, () => {
    const booking = document.createElement('div');
    booking.setAttribute('data-cal-inline', '');
    document.querySelector('main').append(booking);
  });
  await page
    .locator('head script[src*="/embed/embed.js"]')
    .evaluate((el) => el.dispatchEvent(new Event('error')));
  await expect(page.locator('[data-cal-inline] .button')).toHaveAttribute(
    'href',
    'https://cal.ertnerundso.de/eunds/30min',
  );
  await expect(page.locator('[data-cal-inline]')).toContainText(
    'momentan nicht erreichbar',
  );
  expect(errors).toEqual([]);
});

test('showreel scroll story is removed when reduced motion is enabled', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = await start(page, () => {
    HTMLMediaElement.prototype.play = function () {
      return Promise.resolve();
    };
    const section = document.createElement('section');
    section.className = 'showreel-section';
    section.innerHTML =
      '<div class="showreel-stage"><div class="showreel-lead"><h2>Showreel</h2></div><div class="showreel-frame"><video></video><div class="showreel-film-copy">Film</div><div class="showreel-phone-overlay">Telefon</div><button class="showreel-action">Abspielen</button></div></div>';
    document.querySelector('main').append(section);
  });
  await expect(page.locator('html')).toHaveClass(/showreel-motion/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/showreel-motion/);
  expect(
    await page.locator('.showreel-frame video').evaluate((el) => el.controls),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('manual video keeps native controls with reduced motion', async ({ page }) => {
  const errors = await start(page, () => {
    const section = document.createElement('section');
    section.className = 'manual-book';
    section.innerHTML = '<video></video>';
    document.querySelector('main').append(section);
  });
  expect(await page.locator('.manual-book video').evaluate((el) => el.controls)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('returning from the browser back cache retains menu listeners', async ({
  page,
}) => {
  await page.setViewportSize({ width: 760, height: 900 });
  const errors = await start(page);
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.menu-panel')).toHaveClass(/is-open/);
  await expect(page.locator('.menu-close')).toBeFocused();
  expect(errors).toEqual([]);
});

function addButtonVariants() {
  const section = document.createElement('section');
  section.id = 'arrow-variants';
  section.className = 'section shell';
  section.innerHTML = '<a class="btn btn--primary" href="#main">Projekt anfragen ↗</a><div class="content-hyperlink btn btn--secondary"><a href="#main"><strong>Mehr erfahren →</strong></a></div><div class="contact-form"><div class="widget-submit button"><button type="button">Speichern</button></div></div><a class="btn btn--text" href="#main">Arbeiten ansehen ↗</a>';
  document.querySelector('main').prepend(section);
}

async function buttonGeometry(button) {
  return button.evaluate(async (element) => {
    await document.fonts.ready;
    const rect = element.getBoundingClientRect();
    const arrow = element.querySelector('.button-arrow').getBoundingClientRect();
    const label = element.querySelector('.button-label').getBoundingClientRect();
    return { width: rect.width, arrow: arrow.left - rect.left, label: label.left - rect.left };
  });
}

test('arrow tiles slide left without resizing direct buttons or Contao wrappers', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = await start(page, addButtonVariants);
  for (const button of [page.locator('#arrow-variants > .btn--primary'), page.locator('#arrow-variants .content-hyperlink > a')]) {
    await page.mouse.move(0, 0);
    const before = await buttonGeometry(button);
    await button.hover();
    await expect.poll(async () => (await buttonGeometry(button)).arrow).toBeLessThan(6);
    const after = await buttonGeometry(button);
    expect(after.width).toBeCloseTo(before.width, 0);
    expect(after.label - before.label).toBeCloseTo(36, 0);
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await buttonGeometry(button)).arrow).toBeCloseTo(before.arrow, 0);
  }
  const button = page.locator('#arrow-variants > .btn--primary');
  await page.keyboard.press('Tab');
  await button.focus();
  await expect.poll(async () => (await buttonGeometry(button)).arrow).toBeLessThan(6);
  expect(errors).toEqual([]);
});

test('arrow tiles preserve accessible names, nested labels and plain text links', async ({ page }) => {
  await start(page, addButtonVariants);
  const primary = page.getByRole('link', { name: 'Projekt anfragen', exact: true });
  await expect(primary).toHaveCount(1);
  await expect(primary.locator('.button-arrow')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#arrow-variants .content-hyperlink .button-label strong')).toHaveText('Mehr erfahren');
  await expect(page.locator('#arrow-variants .widget-submit > .button-arrow')).toHaveCount(0);
  await expect(page.locator('#arrow-variants .widget-submit button .button-arrow')).toHaveCount(1);
  await expect(page.locator('#arrow-variants .btn--text .button-arrow')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Arbeiten ansehen ↗' })).toHaveCount(1);
  const before = await buttonGeometry(primary);
  await primary.hover();
  expect(await buttonGeometry(primary)).toEqual(before);
  await expect(primary).toHaveCSS('transition-duration', '0s');
});

test('touch buttons keep the arrow on the right', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3199', viewport: { width: 390, height: 844 },
    isMobile: true, hasTouch: true, reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await start(page, addButtonVariants);
  const button = page.locator('#arrow-variants > .btn--primary');
  const before = await buttonGeometry(button);
  await button.tap();
  expect(await buttonGeometry(button)).toEqual(before);
  await context.close();
});

function addCmsButtonContexts() {
  const section = document.createElement('section');
  section.id = 'cms-button-contexts';
  section.className = 'section shell';
  section.innerHTML = `
    <div class="hero-actions"><div class="content-hyperlink hero-contact"><a href="#main">Projekt anfragen ↗</a></div></div>
    <div class="contact-band-copy"><div class="content-hyperlink button"><a href="#main">Projekt anfragen ↗</a></div></div>
    <div class="questions-intro"><div class="content-hyperlink button"><a href="#main">Projekt anfragen ↗</a></div></div>
    <div class="contact-hero-actions"><div class="content-hyperlink button"><a href="#main">Projekt anfragen ↗</a></div></div>
    <div class="contact-form"><div class="widget-submit button"><button type="button">Projekt anfragen ↗</button></div></div>`;
  document.querySelector('main').prepend(section);
}

async function buttonSeparation(button, active = false) {
  return button.evaluate(async (element, active) => {
    await document.fonts.ready;
    const button = element.getBoundingClientRect();
    const label = element.querySelector('.button-label').getBoundingClientRect();
    const arrow = element.querySelector('.button-arrow').getBoundingClientRect();
    return {
      gap: active ? label.left - arrow.right : arrow.left - label.right,
      left: Math.min(label.left, arrow.left) - button.left,
      right: button.right - Math.max(label.right, arrow.right),
      width: button.width,
    };
  }, active);
}

for (const width of [390, 1440]) {
  for (const reduced of [true, false]) {
    test(`CMS buttons leave space between text and arrow at ${width}px, motion ${reduced ? 'reduced' : 'allowed'}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
      const errors = await start(page, addCmsButtonContexts);
      const buttons = page.locator('#cms-button-contexts .button--arrow');
      await expect(buttons).toHaveCount(5);
      for (const button of await buttons.all()) {
        const before = await buttonSeparation(button);
        expect(before.gap).toBeGreaterThanOrEqual(16);
        expect(before.left).toBeGreaterThanOrEqual(4);
        expect(before.right).toBeGreaterThanOrEqual(4);
        expect(before.width).toBeLessThan(width);
        await button.hover();
        if (!reduced) {
          await expect.poll(async () => (await buttonSeparation(button, true)).gap).toBeGreaterThanOrEqual(16);
          expect((await buttonSeparation(button, true)).width).toBeCloseTo(before.width, 0);
          await page.mouse.move(0, 0);
          await expect.poll(async () => (await buttonSeparation(button)).gap).toBeGreaterThanOrEqual(16);
          await page.keyboard.press('Tab');
          await button.focus();
          await expect.poll(async () => (await buttonSeparation(button, true)).gap).toBeGreaterThanOrEqual(16);
          await button.evaluate((element) => element.blur());
          await expect.poll(async () => (await buttonSeparation(button)).gap).toBeGreaterThanOrEqual(16);
        } else {
          expect(await buttonSeparation(button)).toEqual(before);
          await page.mouse.move(0, 0);
        }
      }
      expect(errors).toEqual([]);
    });
  }
}
