/* Vorhandene mobile Vorteile-Animation.
   Verhalten: config.js; Gestaltung/Zeiten: motion.css und base.css. */
export function initBenefits(runtime) {
  if (runtime.reduceMotion) return;
  const { gsap, config, motion, media } = runtime;
  const benefits = document.querySelector('.benefits-section');
  if (benefits) {
    const impact = benefits.querySelector('.benefits-impact');
    const columns = benefits.querySelectorAll('.benefit-column');
    if (!impact || !columns.length) return;
    media().add(config.media.mobile, () => {
      gsap.fromTo(
        impact,
        { autoAlpha: 0, y: motion.pixels('motion-benefits-impact-offset') },
        {
          autoAlpha: 1,
          y: motion.pixels('motion-offset-none'),
          duration: motion.number('motion-benefits-impact-duration'),
          ease: motion.value('motion-ease-standard'),
          scrollTrigger: {
            trigger: impact,
            start: config.triggers.benefits.impactStart,
            once: true,
          },
        },
      );
      gsap.fromTo(
        columns,
        { autoAlpha: 0, y: motion.pixels('motion-benefits-columns-offset') },
        {
          autoAlpha: 1,
          y: motion.pixels('motion-offset-none'),
          duration: motion.number('motion-benefits-columns-duration'),
          stagger: motion.number('motion-benefits-columns-stagger'),
          ease: motion.value('motion-ease-standard'),
          scrollTrigger: {
            trigger: columns[0],
            start: config.triggers.benefits.columnsStart,
            once: true,
          },
        },
      );
    });
  }
}
