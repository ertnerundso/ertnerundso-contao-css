/* SCROLLEN: Lenis und interne Sprunglinks. Verhalten in config.js; Zeit in motion.css. */
import Lenis from 'lenis';
export function initScroll(runtime) {
  const { gsap, ScrollTrigger, config, motion, listen } = runtime;
  if (runtime.reduceMotion || runtime.coarsePointer) return;
  const lenis = new Lenis({
    duration: motion.number('motion-smooth-scroll-duration'),
    smoothWheel: config.scroll.smoothWheel,
    wheelMultiplier: config.scroll.wheelMultiplier,
  });
  runtime.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  runtime.cleanup(() => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    if (runtime.lenis === lenis) runtime.lenis = null;
  });
  document.querySelectorAll('a[href^="#"]').forEach((anchor) =>
    listen(anchor, 'click', (event) => {
      let id;
      try {
        id = decodeURIComponent(anchor.getAttribute('href').slice(1));
      } catch {
        return;
      }
      const target = id && document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, {
        offset: target.classList.contains('work') ? 0 : -runtime.headerHeight,
      });
    }),
  );
}
