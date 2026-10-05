/* Vorhandene Hero-Animation und Video-Scrubbing.
   Verhalten: config.js; Gestaltung/Zeiten: motion.css und base.css. */
export function initHero(runtime) {
  if (runtime.reduceMotion) return;
  const {
    gsap,
    ScrollTrigger,
    config,
    motion,
    listen,
    hero,
    coarsePointer,
    smallScreen,
    media,
  } = runtime;
  const heroMessage = hero?.querySelector('.hero-message');
  const heroImage = hero?.querySelector('.hero-media img');
  const heroActions = hero?.querySelector('.hero-actions');
  if (heroMessage && heroImage && heroActions) {
    gsap
      .timeline({ defaults: { ease: motion.value('motion-ease-entrance') } })
      .fromTo(
        heroImage,
        { autoAlpha: 0, y: motion.pixels('motion-hero-image-offset') },
        {
          autoAlpha: 1,
          y: motion.pixels('motion-offset-none'),
          duration: motion.number('motion-hero-image-duration'),
        },
        motion.number('motion-hero-image-start'),
      )
      .fromTo(
        heroMessage,
        { autoAlpha: 0, y: motion.pixels('motion-hero-message-offset') },
        {
          autoAlpha: 1,
          y: motion.pixels('motion-offset-none'),
          duration: motion.number('motion-hero-message-duration'),
        },
        motion.number('motion-hero-message-start'),
      )
      .fromTo(
        heroActions,
        { autoAlpha: 0, y: motion.pixels('motion-hero-actions-offset') },
        {
          autoAlpha: 1,
          y: motion.pixels('motion-offset-none'),
          duration: motion.number('motion-hero-actions-duration'),
        },
        motion.number('motion-hero-actions-start'),
      );
    const addHeroParallax = () => {
      if (!smallScreen)
        gsap.to(heroImage, {
          yPercent: motion.number('motion-hero-parallax-shift'),
          ease: motion.value('motion-ease-linear'),
          scrollTrigger: {
            trigger: hero,
            start: config.triggers.hero.parallaxStart,
            end: config.triggers.hero.parallaxEnd,
            scrub: true,
          },
        });
    };
    const canScrubVideo =
      !smallScreen &&
      !coarsePointer &&
      !navigator.connection?.saveData &&
      document.createElement('video').canPlayType('video/mp4');
    if (canScrubVideo) {
      const video = document.createElement('video');
      video.className = 'hero-motion-video';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');
      let lastFrame = 0;
      const heroLayers = [
        hero.querySelector('.hero-media'),
        hero.querySelector('.hero-inner'),
      ];
      const motionTrigger = ScrollTrigger.create({
        trigger: hero,
        start: () => `top top+=${runtime.headerHeight}`,
        end: () => `+=${Math.round(window.innerHeight * config.hero.scrollRange)}`,
        pin: hero,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(heroLayers, {
            y:
              -motion.number('motion-hero-layer-shift') *
              (self.end - self.start) *
              self.progress,
          });
          if (!video.classList.contains('is-ready')) return;
          video.style.opacity = String(
            Math.min(1, self.progress * motion.number('motion-hero-fade-progress')),
          );
          const frame = self.progress * lastFrame;
          if (Math.abs(video.currentTime - frame) > 1 / config.video.frameRate)
            video.currentTime = frame;
        },
      });
      listen(
        video,
        'loadeddata',
        () => {
          lastFrame = video.duration - 1 / config.video.frameRate;
          video.classList.add('is-ready');
          motionTrigger.update();
        },
        { once: true },
      );
      listen(
        video,
        'error',
        () => {
          motionTrigger.kill();
          gsap.set(heroLayers, { clearProps: 'transform' });
          video.remove();
          addHeroParallax();
          ScrollTrigger.refresh();
        },
        { once: true },
      );
      heroImage.parentElement.append(video);
      runtime.cleanup(() => {
        video.pause();
        video.remove();
      });
      video.src = runtime.asset(config.assets.heroVideo);
    } else addHeroParallax();
  }
}
