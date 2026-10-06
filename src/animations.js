/* Reveal, Textaufteilung und Parallax.
   Verhalten: config.js; Gestaltung/Zeiten: motion.css und base.css. */
export function initAnimations(runtime) {
  if (runtime.reduceMotion) return;
  document.documentElement.classList.add('js-ready');
  runtime.cleanup(() => document.documentElement.classList.remove('js-ready'));
  const { gsap, ScrollTrigger, config, motion, listen, header, smallScreen } = runtime;
  const revealOnce = (element, options = {}) =>
    gsap.from(element, {
      autoAlpha: 0,
      y: motion.pixels('motion-reveal-offset'),
      duration: motion.number('motion-reveal-duration'),
      ease: motion.value('motion-ease-standard'),
      scrollTrigger: {
        trigger: element,
        start: config.triggers.animations.revealStart,
        once: true,
      },
      ...options,
    });
  // Rahmen bleiben im Raster; nur der Karteninhalt wird nach oben eingeblendet.
  const cardContents = (card) => [...card.children].filter(
    element => !element.matches('.card-link-overlay'),
  );
  const statementImage = document.querySelector('.statement-image');
  if (statementImage) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: statementImage,
          start: config.triggers.animations.imageStart,
          once: true,
        },
      })
      .fromTo(
        statementImage,
        {
          autoAlpha: motion.number('motion-reveal-image-start-opacity'),
          clipPath: motion.value('motion-reveal-image-mask-start'),
        },
        {
          autoAlpha: 1,
          clipPath: motion.value('motion-reveal-image-mask-end'),
          duration: motion.number('motion-reveal-image-mask-duration'),
          ease: motion.value('motion-ease-standard'),
        },
      )
      .fromTo(
        statementImage.querySelector('img'),
        { scale: motion.number('motion-reveal-image-scale-start') },
        {
          scale: motion.number('motion-scale-default'),
          duration: motion.number('motion-reveal-image-scale-duration'),
          ease: motion.value('motion-ease-standard'),
        },
        motion.number('motion-position-zero'),
      );
  }
  document
    .querySelectorAll('.contact-band-copy,.contact-band-image')
    .forEach((element) => revealOnce(element));
  document
    .querySelectorAll('.manual-book-header,.manual-book-copy')
    .forEach((element) =>
      revealOnce(element, { y: motion.pixels('motion-reveal-card-offset') }),
    );
  document.querySelectorAll('.index-card,.journal-row,.question').forEach((card) => {
    const contents = cardContents(card);
    gsap.from(contents.length ? contents : card, {
      autoAlpha: 0,
      y: contents.length ? motion.pixels('motion-reveal-card-offset') : 0,
      ...(contents.length ? { clearProps: 'transform,opacity,visibility' } : {}),
      duration: motion.number('motion-reveal-card-duration'),
      ease: motion.value('motion-ease-standard'),
      scrollTrigger: {
        trigger: card,
        start: config.triggers.animations.revealStart,
        once: true,
      },
    });
  });
  document.querySelectorAll('.service-grid').forEach((grid) => {
    const sequence = gsap.timeline({
      scrollTrigger: { trigger: grid, start: config.triggers.animations.servicesStart, once: true },
    });
    [...grid.querySelectorAll('.service-card')].forEach((card, index) => {
      const contents = cardContents(card);
      sequence.from(contents.length ? contents : card, {
        autoAlpha: 0,
        y: contents.length ? motion.pixels('motion-reveal-services-offset') : 0,
        ...(contents.length ? { clearProps: 'transform,opacity,visibility' } : {}),
        duration: motion.number('motion-reveal-duration'),
        ease: motion.value('motion-ease-standard'),
      }, index * motion.number('motion-reveal-services-stagger'));
    });
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  document
    .querySelectorAll('.question')
    .forEach((element) => listen(element, 'toggle', () => ScrollTrigger.refresh()));
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      y: motion.pixels('motion-offset-none'),
      duration: motion.number('motion-reveal-data-duration'),
      ease: motion.value('motion-ease-standard'),
      scrollTrigger: {
        trigger: element,
        start: config.triggers.animations.dataStart,
        once: true,
      },
    });
  });

  // Splitting is visual only; the heading keeps a complete accessible label.
  document.querySelectorAll('[data-split]').forEach((heading) => {
    const nodes = [...heading.childNodes];
    const label = heading.getAttribute('aria-label');
    runtime.cleanup(() => {
      heading.replaceChildren(...nodes);
      if (label === null) heading.removeAttribute('aria-label');
      else heading.setAttribute('aria-label', label);
    });
    const original = heading.textContent.trim();
    heading.setAttribute('aria-label', original);
    heading.textContent = '';
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    original.split(/\s+/).forEach((word, index) => {
      const mask = document.createElement('span');
      mask.className = 'split-line';

      const inner = document.createElement('span');
      inner.className = 'split-line-inner';
      inner.textContent = word;
      mask.append(inner);
      visual.append(mask);
      if (index < original.split(/\s+/).length - 1) visual.append(' ');
    });
    heading.append(visual);
    gsap.from(heading.querySelectorAll('.split-line-inner'), {
      yPercent: motion.number('motion-reveal-split-offset'),
      duration: motion.number('motion-reveal-split-duration'),
      stagger: motion.number('motion-reveal-split-stagger'),
      ease: motion.value('motion-ease-entrance'),
      scrollTrigger: {
        trigger: heading,
        start: config.triggers.animations.splitStart,
        once: true,
      },
    });
  });

  const parallax = document.querySelectorAll('[data-parallax]');
  if (!smallScreen)
    parallax.forEach((element) => {
      gsap.fromTo(
        element,
        { yPercent: motion.number('motion-reveal-parallax-from') },
        {
          yPercent: motion.number('motion-reveal-parallax-to'),
          ease: motion.value('motion-ease-linear'),
          scrollTrigger: {
            trigger: element.parentElement,
            start: config.triggers.animations.parallaxStart,
            end: config.triggers.animations.parallaxEnd,
            scrub: true,
          },
        },
      );
    });
}
