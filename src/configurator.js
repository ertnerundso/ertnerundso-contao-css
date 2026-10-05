/* Vorhandenes Video-Scrubbing im Konfigurator.
   Verhalten: config.js; Gestaltung/Zeiten: motion.css und base.css. */
export function initConfigurator(runtime) {
  if (runtime.reduceMotion) return;
  const { ScrollTrigger, config, motion, listen, smallScreen, media } = runtime;
  const configuratorScene = document.querySelector('.configurator-scene');
  const configuratorVideo = configuratorScene?.querySelector(
    '.configurator-scene-video',
  );
  if (configuratorVideo && !smallScreen && !navigator.connection?.saveData) {
    const heading = configuratorScene.querySelector('.configurator-scene-heading');
    const media = configuratorScene.querySelector('.configurator-scene-media');
    const cards = configuratorScene.querySelector('.configurator-scene-cards');
    if (!heading || !media || !cards) return;
    const initialStyles = new Map(
      [configuratorVideo, heading, media, cards].map((element) => [
        element,
        element.getAttribute('style'),
      ]),
    );
    let trigger;
    let cardReveal;
    const restore = () => {
      trigger?.kill();
      configuratorScene.classList.remove('is-scroll-ready');
      for (const [element, style] of initialStyles) {
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
      }
      if (cardReveal?.parentNode) cardReveal.replaceWith(cards);
      cardReveal = null;
    };
    runtime.cleanup(restore);
    const clamp = (value) => Math.max(0, Math.min(1, value));
    const smooth = (value) => value * value * (3 - 2 * value);
    const enable = () => {
      if (
        !Number.isFinite(configuratorVideo.duration) ||
        configuratorVideo.duration <= 0
      )
        return;
      configuratorVideo.pause();
      configuratorVideo.style.transform = motion.value(
        'motion-configurator-transform-start',
      );
      cardReveal = document.createElement('div');
      cardReveal.className = 'configurator-scene-card-reveal';
      cards.before(cardReveal);
      cardReveal.append(cards);
      configuratorScene.classList.add('is-scroll-ready');
      trigger = ScrollTrigger.create({
        trigger: configuratorScene,
        start: () => `top top+=${runtime.headerHeight}`,
        end: config.triggers.configurator.end,
        refreshPriority: config.triggers.configurator.refreshPriority,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const frame =
            clamp(progress / config.configurator.videoProgress) *
            (configuratorVideo.duration - config.configurator.endMargin);
          if (
            Math.abs(configuratorVideo.currentTime - frame) >
            config.configurator.frameTolerance
          )
            configuratorVideo.currentTime = frame;
          const reveal = smooth(
            clamp(
              (progress - config.configurator.videoProgress) /
                config.configurator.revealProgress,
            ),
          );
          const videoScale =
            motion.number('motion-configurator-scale-start') -
            motion.number('motion-configurator-scale-range') *
              smooth(clamp(progress / config.configurator.scaleProgress));
          configuratorVideo.style.transform = `translate(-50%, -50%) scale(${videoScale})`;
          heading.style.opacity = String(
            1 - smooth(clamp(progress / config.configurator.headingProgress)),
          );
          heading.style.transform = `translateY(${-progress * motion.pixels('motion-configurator-heading-offset')}px)`;
          media.style.height = `${motion.number('motion-configurator-height-start') - reveal * motion.number('motion-configurator-height-range')}svh`;
          media.style.marginTop = `${motion.number('motion-configurator-margin-start') * (1 - reveal)}svh`;
          // Höhe einschließlich Rahmen und Kreuz-Abständen; der innere Rahmen bleibt unbeschnitten.
          const padding = getComputedStyle(cardReveal);
          const revealHeight = cards.getBoundingClientRect().height +
            parseFloat(padding.paddingTop) + parseFloat(padding.paddingBottom);
          cardReveal.style.maxHeight = reveal >= 1 ? 'none' : `${reveal * revealHeight}px`;
          cardReveal.style.opacity = String(reveal);
          cardReveal.style.transform = `translateY(${(1 - reveal) * motion.pixels('motion-configurator-card-offset')}px)`;
        },
      });
      ScrollTrigger.refresh();
    };
    if (configuratorVideo.readyState >= 1) enable();
    else
      listen(configuratorVideo, 'loadedmetadata', enable, {
        once: true,
      });
    listen(
      configuratorVideo,
      'error',
      () => {
        restore();
        ScrollTrigger.refresh();
      },
      { once: true },
    );
  }
}
