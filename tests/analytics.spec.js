import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const fixture = `<!doctype html><html><body>
  <a href="/kontakt/" id="contact">Kontakt</a>
  <a href="https://cal.ertnerundso.de/eunds/30min" id="booking">Termin</a>
  <button class="showreel-action" type="button">Video</button>
</body></html>`;

async function start(page, hostname, consent) {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/src/analytics.js') {
      return route.fulfill({
        contentType: 'text/javascript',
        body: await readFile(new URL('../src/analytics.js', import.meta.url), 'utf8'),
      });
    }
    if (url.pathname === '/src/config.js') {
      return route.fulfill({
        contentType: 'text/javascript',
        body: await readFile(new URL('../src/config.js', import.meta.url), 'utf8'),
      });
    }
    return route.fulfill({ contentType: 'text/html', body: fixture });
  });
  await page.goto(`https://${hostname}/`);
  await page.evaluate(async (accepted) => {
    document.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', (event) => event.preventDefault()),
    );
    window.CookieScript = {
      instance: {
        currentState: () => ({
          action: accepted ? 'accept' : 'reject',
          categories: accepted ? ['strict', 'performance'] : ['strict'],
        }),
      },
    };
    window.dataLayer = [];
    window.umamiEvents = [];
    window.umami = { track: (name) => window.umamiEvents.push(name) };
    const [{ config }, { initAnalytics }] = await Promise.all([
      import('/src/config.js'),
      import('/src/analytics.js'),
    ]);
    initAnalytics({
      config,
      listen: (target, type, callback) => target.addEventListener(type, callback),
    });
  }, consent);
}

test('consented live actions reach GTM and Umami without personal data', async ({ page }) => {
  await start(page, 'ertnerundso.de', true);
  await page.locator('#contact').click();
  await page.locator('#booking').click();
  await page.locator('.showreel-action').click();
  await page.evaluate(() => document.dispatchEvent(new Event('eo:contact-success')));
  const events = await page.evaluate(() => ({
    google: window.dataLayer.map((command) => Array.from(command)),
    umami: window.umamiEvents,
  }));
  expect(events.google).toEqual([
    ['event', 'contact_intent', { send_to: 'G-BFB4EHKRX2' }],
    ['event', 'booking_click', { send_to: 'G-BFB4EHKRX2' }],
    ['event', 'showreel_play', { send_to: 'G-BFB4EHKRX2' }],
    ['event', 'contact_submit_success', { send_to: 'G-BFB4EHKRX2' }],
  ]);
  expect(events.umami).toEqual(events.google.map(([, event]) => event));
});

test('rejected consent suppresses custom analytics events', async ({ page }) => {
  await start(page, 'ertnerundso.de', false);
  await page.locator('#contact').click();
  await page.evaluate(() => document.dispatchEvent(new Event('eo:contact-success')));
  expect(await page.evaluate(() => window.dataLayer)).toEqual([]);
  expect(await page.evaluate(() => window.umamiEvents)).toEqual([]);
});

test('staging never sends analytics events, even with a mock consent', async ({ page }) => {
  await start(page, 'staging.ertnerundso.de', true);
  await page.locator('#contact').click();
  await page.evaluate(() => document.dispatchEvent(new Event('eo:contact-success')));
  expect(await page.evaluate(() => window.dataLayer)).toEqual([]);
  expect(await page.evaluate(() => window.umamiEvents)).toEqual([]);
});
