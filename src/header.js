/* HEADER: Scrollrichtung steuert Sichtbarkeit; Fokus und geöffnetes Menü haben Vorrang.
   Schwellen: config.js. Höhe/Anordnung: header.css. Bewegung: motion.css. */
export function initHeader(runtime) {
  const { header, hero, config, listen, observer } = runtime;
  if (!header) return;
  let previous = window.scrollY;
  const show = () => {
    header.classList.remove('is-hidden');
    header.inert = false;
  };
  const update = () => {
    const position = Math.max(0, window.scrollY);
    const locked =
      document.body.classList.contains('menu-open') ||
      header.contains(document.activeElement);
    if (locked || position <= config.header.hideAfter) show();
    else if (Math.abs(position - previous) >= config.header.directionThreshold) {
      const hidden = position > previous;
      header.classList.toggle('is-hidden', hidden);
      header.inert = hidden;
    }
    if (
      Math.abs(position - previous) >= config.header.directionThreshold ||
      position <= config.header.hideAfter
    )
      previous = position;
  };
  listen(window, 'scroll', update, { passive: true });
  listen(document, 'navigation:change', show);
  listen(document, 'keydown', (event) => {
    if (['Tab', 'Home', 'Escape'].includes(event.key)) show();
  });
  listen(header, 'focusin', show);
  if (hero)
    observer(
      new IntersectionObserver(
        ([entry]) => header.classList.toggle('is-compact', !entry.isIntersecting),
        { rootMargin: `-${runtime.headerHeight}px 0px 0px 0px`, threshold: 0 },
      ),
      hero,
    );
  else header.classList.add('is-compact');
  runtime.cleanup(() => {
    show();
    header.classList.remove('is-compact');
  });
}
