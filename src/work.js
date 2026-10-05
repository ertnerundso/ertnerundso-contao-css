/* PROJEKTE: Desktop-Scrollgeschichte und nativer mobiler Slider.
   Verhalten: config.js. Anordnung: work.css. Bewegung: motion.css. */
export function initWork(runtime) {
  const { gsap, config, listen, observer, motion } = runtime;
  const work = document.querySelector('.work');
  const viewport = work?.querySelector('.work-viewport');
  const track = viewport?.querySelector('.work-track');
  if (!viewport || !track) return;
  const progress = work.querySelector('.work-progress i');
  const count = work.querySelector('.work-count');
  const cards = [...track.querySelectorAll('.work-card')];
  const update = (fraction) => {
    const value = Math.max(0, Math.min(1, fraction));
    if (progress)
      progress.style.transform = `scaleX(${Math.max(motion.number('motion-work-minimum-progress'), value)})`;
    if (count)
      count.textContent = String(
        Math.max(1, Math.min(cards.length, 1 + Math.round(value * (cards.length - 1)))),
      ).padStart(2, '0');
  };
  const updateNative = () =>
    update(
      viewport.scrollLeft / Math.max(1, viewport.scrollWidth - viewport.clientWidth),
    );
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute(
    'aria-label',
    document.documentElement.lang === 'en' ? 'Projects' : 'Projekte',
  );
  listen(viewport, 'scroll', updateNative, { passive: true });
  observer(new ResizeObserver(updateNative), viewport);
  updateNative();
  runtime
    .media()
    .add(
      { desktop: config.media.desktop, reduced: config.media.reducedMotion },
      (context) => {
        if (!context.conditions.desktop || context.conditions.reduced) return;
        const initialTransform = track.style.transform;
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        gsap.to(track, {
          x: () => -distance(),
          ease: motion.value('motion-work-ease'),
          scrollTrigger: {
            trigger: work,
            start: 'top top',
            end: () =>
              `+=${distance() + window.innerHeight * config.sliders.workScrollPadding}`,
            pin: true,
            scrub: motion.number('motion-work-scrub'),
            invalidateOnRefresh: true,
            onUpdate: (self) => update(self.progress),
          },
        });
        return () => {
          track.style.transform = initialTransform;
        };
      },
    );
}
