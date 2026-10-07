/* PROJEKTE: Desktop-Scrollgeschichte und nativer mobiler Slider.
   Verhalten: config.js. Anordnung: work.css. Bewegung: motion.css. */
import { createScrollProgress } from './scroll-progress.js';
export function initWork(runtime) {
  const { gsap, config, listen, observer, motion } = runtime;
  const work = document.querySelector('.work');
  const viewport = work?.querySelector('.work-viewport');
  const track = viewport?.querySelector('.work-track');
  if (!viewport || !track) return;
  const progress = work.querySelector('.work-progress i');
  const count = work.querySelector('.work-count');
  const cards = [...track.querySelectorAll('.work-card')];
  const portfolio = work.classList.contains('work-portfolio');
  const current = work.querySelector('.work-current');
  let pinnedAnimation;
  let activeIndex = 0;
  const update = (fraction) => {
    const value = Math.max(0, Math.min(1, fraction));
    if (progress)
      progress.style.transform = `scaleX(${Math.max(motion.number('motion-work-minimum-progress'), value)})`;
    activeIndex = Math.max(0, Math.min(cards.length - 1, Math.round(value * (cards.length - 1))));
    if (count) count.textContent = String(activeIndex + 1).padStart(2, '0');
    if (current) current.textContent = cards[activeIndex]?.querySelector('h3')?.textContent.trim() || '';
  };
  const updateNative = () => {
    if (pinnedAnimation) return;
    update(
      viewport.scrollLeft / Math.max(1, viewport.scrollWidth - viewport.clientWidth),
    );
  };
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute(
    'aria-label',
    document.documentElement.lang === 'en' ? 'Projects' : 'Projekte',
  );
  listen(viewport, 'scroll', updateNative, { passive: true });
  // Tab zeigt auch außerhalb des sichtbaren Ausschnitts jede Projektkarte bzw. den Abschluss-Link.
  function revealCard(card) {
    if (!pinnedAnimation) return;
    viewport.scrollLeft = 0;
    const trigger = pinnedAnimation.scrollTrigger;
    const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const fraction = card.matches('.work-outro') ? 1
      : Math.max(0, Math.min(1, (card.offsetLeft - cards[0].offsetLeft) / Math.max(1, distance)));
    const top = trigger.start + (trigger.end - trigger.start) * fraction;
    if (runtime.lenis) runtime.lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: 'instant' });
    pinnedAnimation.progress(fraction);
    runtime.ScrollTrigger.update();
    update(fraction);
  }
  listen(viewport, 'focusin', (event) => {
    if (!pinnedAnimation) return;
    const card = event.target.closest('.work-card, .work-outro');
    if (!card) return;
    viewport.scrollLeft = 0;
    const bounds = card.getBoundingClientRect(), visible = viewport.getBoundingClientRect();
    if (card.matches('.work-outro') || bounds.left < visible.left || bounds.right > visible.right)
      revealCard(card);
    else viewport.scrollLeft = 0;
  });
  if (portfolio) {
    listen(viewport, 'keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const focused = cards.indexOf(event.target.closest('.work-card'));
      const index = focused >= 0 ? focused : activeIndex;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1
        : Math.max(0, Math.min(cards.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
      const link = cards[next]?.querySelector('.button') || cards[next]?.querySelector('a');
      link?.focus({ preventScroll: true });
      if (!pinnedAnimation) viewport.scrollTo({
        left: cards[next].offsetLeft - cards[0].offsetLeft, behavior: 'instant',
      });
    });
  }
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
        const progressIndicator = createScrollProgress(runtime, { de: 'Arbeiten', en: 'Projects' });
        const story = gsap.to(track, {
          x: () => -distance(),
          ease: motion.value('motion-work-ease'),
          scrollTrigger: {
            ...progressIndicator.callbacks,
            trigger: work,
            start: 'top top',
            end: () =>
              `+=${distance() + window.innerHeight * config.sliders.workScrollPadding}`,
            pin: true,
            scrub: motion.number('motion-work-scrub'),
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              update(self.progress);
              progressIndicator.update(self);
            },
          },
        });
        work.classList.add('is-work-pinned');
        progressIndicator.update(story.scrollTrigger);
        pinnedAnimation = story;
        return () => {
          pinnedAnimation = undefined;
          work.classList.remove('is-work-pinned');
          progressIndicator.destroy();
          track.style.transform = initialTransform;
        };
      },
    );
}
