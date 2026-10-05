/* NAVIGATION: Menü, Fokusführung und Tastaturbedienung. Keine Gestaltungswerte. */
export function initNavigation(runtime) {
  const { listen } = runtime;
  const button = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.menu-panel');
  const close = document.querySelector('.menu-close');
  if (!button || !panel) return;
  const english = document.documentElement.lang === 'en';
  let focusFrame;
  const setOpen = (open) => {
    cancelAnimationFrame(focusFrame);
    panel.classList.toggle('is-open', open);
    panel.toggleAttribute('inert', !open);
    panel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute(
      'aria-label',
      open
        ? english
          ? 'Close menu'
          : 'Menü schließen'
        : english
          ? 'Open menu'
          : 'Menü öffnen',
    );
    document.dispatchEvent(new Event('navigation:change'));
    if (open) {
      runtime.lenis?.stop();
      // Nach Entfernen von inert und Aktualisieren der Sichtbarkeit fokussieren.
      focusFrame = requestAnimationFrame(() => {
        if (panel.classList.contains('is-open'))
          (close || panel.querySelector('a,button'))?.focus({ preventScroll: true });
      });
    } else {
      runtime.lenis?.start();
      button.focus();
    }
  };
  listen(button, 'click', () => setOpen(!panel.classList.contains('is-open')));
  listen(close, 'click', () => setOpen(false));
  panel
    .querySelectorAll('a')
    .forEach((link) => listen(link, 'click', () => setOpen(false)));
  listen(document, 'keydown', (event) => {
    if (!panel.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [
      ...panel.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]'),
    ].filter((el) => !el.hidden && el.getClientRects().length);
    const first = focusable[0],
      last = focusable.at(-1);
    if (!first) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  runtime.cleanup(() => {
    cancelAnimationFrame(focusFrame);
    panel.classList.remove('is-open');
    panel.setAttribute('inert', '');
    panel.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
}
