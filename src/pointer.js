/* Vorhandener Cursor und Kartenneigung.
   Verhalten: config.js; Gestaltung/Zeiten: motion.css und base.css. */
export function initPointer(runtime) {
  if (runtime.reduceMotion) return;
  const { gsap, motion, listen, coarsePointer } = runtime;
  if (!coarsePointer) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      listen(card, 'pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateX: -y * motion.number('motion-tilt-angle'),
          rotateY: x * motion.number('motion-tilt-angle'),
          duration: motion.number('motion-tilt-duration'),
          ease: motion.value('motion-ease-standard'),
        });
      });
      listen(card, 'pointerleave', () =>
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: motion.number('motion-tilt-reset-duration'),
        }),
      );
    });
    const dot = document.querySelector('.cursor-dot');
    if (dot) {
      listen(
        window,
        'pointermove',
        (event) =>
          gsap.to(dot, {
            x: event.clientX - dot.offsetWidth / 2,
            y: event.clientY - dot.offsetHeight / 2,
            duration: motion.number('motion-cursor-follow-duration'),
            ease: motion.value('motion-ease-standard'),
          }),
        { passive: true },
      );
      document.querySelectorAll('a,button,[data-tilt]').forEach((element) => {
        listen(element, 'pointerenter', () => dot.classList.add('is-active'));
        listen(element, 'pointerleave', () => dot.classList.remove('is-active'));
      });
    }
  }
}
