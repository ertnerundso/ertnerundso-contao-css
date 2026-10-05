/* NAVIGATION: Aufklappbares Menü, Seitenhülle und Fokusführung.
   Farben/Schrift bleiben in den Systemdateien, alle Bewegungswerte in motion.css. */
export function initNavigation(runtime) {
  const { listen } = runtime;
  const button = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.menu-panel');
  const close = document.querySelector('.menu-close');
  if (!button || !panel) return;
  const english = document.documentElement.lang === 'en';
  const headerActions = [
    ...document.querySelectorAll('.header-actions > .button, .header-actions > .lang-link'),
  ].map((element) => ({ element, hidden: element.hidden }));
  // Auch gemeinsame Button-Regeln dürfen ausgeblendete Header-Aktionen nicht wieder anzeigen.
  headerActions.forEach(({ element }) => { element.hidden = true; });
  const main = document.querySelector('.site-main');
  const footer = document.querySelector('.site-footer');
  let shell = document.querySelector('.page-shell');
  let createdShell = false;
  // Auch das bestehende Contao-Template funktioniert ohne neue HTML-Klassen.
  // Alle Geschwister bis zum Footer bleiben in derselben Reihenfolge erhalten.
  if (!shell && main?.parentElement === document.body) {
    shell = document.createElement('div');
    shell.className = 'page-shell';
    const start = panel.parentElement === document.body ? panel.nextSibling : main;
    const end = footer?.parentElement === document.body
      ? footer.nextSibling
      : main.nextSibling;
    document.body.insertBefore(shell, start);
    for (let node = start; node && node !== end;) {
      const next = node.nextSibling;
      shell.append(node);
      node = next;
    }
    createdShell = true;
  }
  const shellWasInert = shell?.inert;
  const skip = document.querySelector('.skip-link');
  const skipWasInert = skip?.inert;
  const label = document.createElement('span');
  label.className = 'menu-label';
  label.textContent = english ? 'Menu' : 'Menü';
  label.setAttribute('aria-hidden', 'true');
  button.prepend(label);
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'menu-dismiss';
  dismiss.tabIndex = -1;
  dismiss.setAttribute('aria-hidden', 'true');
  dismiss.setAttribute('aria-label', english ? 'Close menu' : 'Menü schließen');
  panel.after(dismiss);
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('data-lenis-prevent', '');
  if (!panel.hasAttribute('aria-label'))
    panel.setAttribute('aria-label', 'Navigation');
  // Versteckte Desktop-Links dürfen durch den Wechsel zum Menü nicht verloren gehen.
  const addedLinks = [];
  const navigation = panel.querySelector('.menu-panel-nav');
  document.querySelectorAll('.header-nav a[href]').forEach((link) => {
    if (!navigation || [...navigation.querySelectorAll('a')].some((item) => item.href === link.href))
      return;
    const copy = link.cloneNode(true);
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
    navigation.append(copy);
    addedLinks.push(copy);
  });
  let focusFrame;
  const setOpen = (open) => {
    cancelAnimationFrame(focusFrame);
    if (open) {
      shell?.style.setProperty('--menu-page-origin', `${window.scrollY}px`);
      panel.scrollTop = 0;
    }
    if (shell) shell.inert = open || shellWasInert;
    if (skip) skip.inert = open || skipWasInert;
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
      button.focus({ preventScroll: true });
    }
  };
  listen(button, 'click', () => setOpen(!panel.classList.contains('is-open')));
  listen(close, 'click', () => setOpen(false));
  listen(dismiss, 'click', () => setOpen(false));
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
    if (shell) {
      shell.inert = shellWasInert;
      shell.style.removeProperty('--menu-page-origin');
      if (createdShell) {
        shell.replaceWith(...shell.childNodes);
      }
    }
    if (skip) skip.inert = skipWasInert;
    label.remove();
    dismiss.remove();
    addedLinks.forEach((link) => link.remove());
    headerActions.forEach(({ element, hidden }) => { element.hidden = hidden; });
  });
}
