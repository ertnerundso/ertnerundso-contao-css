/* SCROLL-SKALA: Eine Anzeige pro echter Scrollgeschichte, ohne zusätzliche Scrollstrecke.
   Länge/Position: CSS; Anzahl Striche: config.js. Vorhandene Trigger bleiben die Quelle. */
export function createScrollProgress(runtime, labels) {
  const { config, motion } = runtime;
  const indicator = document.createElement('div');
  indicator.className = 'section-scroll-progress';
  indicator.hidden = true;
  indicator.setAttribute('role', 'progressbar');
  indicator.setAttribute('aria-label', document.documentElement.lang.startsWith('en')
    ? `Scroll progress: ${labels.en}` : `Scrollfortschritt: ${labels.de}`);
  indicator.setAttribute('aria-valuemin', '0');
  indicator.setAttribute('aria-valuemax', '100');
  const ticks = Array.from({ length: config.scrollProgress.ticks }, () => {
    const tick = document.createElement('span');
    tick.className = 'section-scroll-progress-tick';
    tick.setAttribute('aria-hidden', 'true');
    indicator.append(tick);
    return tick;
  });
  // Außerhalb der gepinnten/transformierten Container bleibt die Skala am Bildschirmrand.
  document.body.append(indicator);
  let disposed = false;
  const update = (trigger) => {
    if (disposed) return;
    const progress = Math.max(0, Math.min(1, trigger.progress || 0));
    indicator.hidden = !trigger.isActive;
    indicator.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    if (indicator.hidden) return;
    const position = progress * (ticks.length - 1);
    const radius = motion.number('motion-scroll-progress-radius');
    const scale = motion.number('motion-scroll-progress-min-scale');
    const opacity = motion.number('motion-scroll-progress-min-opacity');
    ticks.forEach((tick, index) => {
      const proximity = Math.max(0, 1 - Math.abs(index - position) / radius);
      const emphasis = proximity * proximity * (3 - 2 * proximity);
      tick.style.transform = `scaleX(${scale + (1 - scale) * emphasis})`;
      tick.style.opacity = String(opacity + (1 - opacity) * emphasis);
    });
  };
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    indicator.remove();
  };
  // Direkt beim Erstellen des Triggers übergeben: ScrollTrigger speichert seine Callbacks intern.
  return { update, destroy, callbacks: { onUpdate: update, onToggle: update, onRefresh: update } };
}
