/* Showreel-Steuerung und vorhandene Scrollgeschichte.
   Verhalten: config.js; Gestaltung/Zeiten: motion.css und base.css. */
export function initShowreel(runtime) {
  const { gsap, ScrollTrigger, config, motion, listen, media } = runtime;
  const showreelSection = document.querySelector('.showreel-section');
  const showreelStage = showreelSection?.querySelector('.showreel-stage');
  const showreelFrame = showreelSection?.querySelector('.showreel-frame');
  const showreelVideo = showreelFrame?.querySelector('video');
  const showreelAction = showreelFrame?.querySelector('.showreel-action');
  const benefits = showreelStage?.querySelector('.benefits-section');
  if (showreelVideo && showreelAction) showreelVideo.controls = false;
  if (showreelVideo)
    listen(showreelAction, 'click', () => {
      showreelVideo.controls = true;
      showreelVideo.muted = false;
      showreelVideo.loop = false;
      showreelVideo.currentTime = 0;
      showreelVideo.play().catch(() => {});
      showreelAction.hidden = true;
    });

  if (showreelStage && showreelVideo)
    media().add(
      { desktop: config.media.desktop, motion: config.media.motionAllowed },
      (context) => {
        if (!context.conditions.desktop || !context.conditions.motion) return;
        const lead = showreelStage.querySelector('.showreel-lead');
        const filmCopy = showreelStage.querySelector('.showreel-film-copy');
        const phoneOverlay = showreelStage.querySelector('.showreel-phone-overlay');
        const benefitsLead = benefits?.querySelector('.benefits-lead');
        const benefitsHeading = benefits?.querySelector('.benefits-impact h3');
        const benefitsTable = benefits?.querySelector('.benefits-table');
        const benefitColumns = benefits?.querySelectorAll('.benefit-column');
        const phoneWidth = () =>
          Math.min(
            window.innerWidth * motion.number('motion-showreel-phone-width-ratio'),
            window.innerHeight * motion.number('motion-showreel-phone-height-ratio'),
            motion.pixels('motion-showreel-phone-max-width'),
          );
        showreelVideo.controls = false;
        document.documentElement.classList.add('showreel-motion');
        if (benefitsLead && benefitsHeading && benefitsTable) {
          gsap.set([benefitsLead, benefitsHeading, benefitsTable], {
            autoAlpha: 0,
          });
          gsap.set(benefitColumns, {
            autoAlpha: 0,
            y: motion.pixels('motion-showreel-benefit-columns-offset'),
          });
        }
        const story = gsap
          .timeline({
            scrollTrigger: {
              trigger: showreelSection,
              start: config.triggers.showreel.start,
              end: () =>
                `+=${Math.round(window.innerHeight * (benefits ? config.showreel.scrollRange : config.showreel.scrollRangeWithoutBenefits))}`,
              pin: showreelStage,
              scrub: motion.number('motion-showreel-scrub'),
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(
            lead,
            {
              autoAlpha: 0,
              y: motion.pixels('motion-showreel-lead-offset'),
              duration: motion.number('motion-showreel-lead-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-lead-end'),
          )
          .to(
            showreelFrame,
            {
              top: () => runtime.headerHeight,
              width: () => window.innerWidth,
              height: () => window.innerHeight - runtime.headerHeight,
              borderRadius: motion.pixels('motion-radius-none'),
              duration: motion.number('motion-showreel-expand-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-film-expand-start'),
          )
          .to(
            filmCopy,
            {
              autoAlpha: 1,
              duration: motion.number('motion-showreel-film-in-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-film-copy-start'),
          )
          .to(
            showreelFrame,
            {
              '--showreel-scrim': motion.number('motion-showreel-scrim-peak'),
              duration: motion.number('motion-showreel-film-in-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-film-copy-start'),
          )
          .to(
            filmCopy,
            {
              autoAlpha: 0,
              duration: motion.number('motion-showreel-film-out-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-film-copy-end'),
          )
          .to(
            showreelFrame,
            {
              '--showreel-scrim': 0,
              duration: motion.number('motion-showreel-film-out-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-film-copy-end'),
          )
          .to(
            showreelFrame,
            {
              top: () =>
                window.innerHeight * motion.number('motion-showreel-phone-top'),
              width: phoneWidth,
              height: () =>
                phoneWidth() / motion.number('motion-showreel-phone-aspect'),
              borderRadius: motion.pixels('motion-showreel-phone-radius'),
              duration: motion.number('motion-showreel-shrink-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-phone-shrink-start'),
          )
          .to(
            phoneOverlay,
            {
              autoAlpha: 1,
              duration: motion.number('motion-showreel-phone-overlay-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-phone-overlay-start'),
          )
          .to(
            showreelAction,
            {
              autoAlpha: 1,
              duration: motion.number('motion-showreel-playback-duration'),
              ease: motion.value('motion-ease-linear'),
            },
            motion.number('motion-showreel-playback-start'),
          );
        if (benefitsLead && benefitsHeading && benefitsTable)
          story
            .to(
              showreelFrame,
              {
                top: () =>
                  window.innerHeight * motion.number('motion-showreel-benefits-top'),
                duration: motion.number('motion-showreel-benefit-frame-duration'),
                ease: motion.value('motion-ease-linear'),
              },
              motion.number('motion-showreel-benefit-frame-start'),
            )
            .to(
              benefitsLead,
              {
                autoAlpha: 1,
                duration: motion.number('motion-showreel-benefit-lead-in-duration'),
                ease: motion.value('motion-ease-linear'),
              },
              motion.number('motion-showreel-benefit-lead-start'),
            )
            .to(
              benefitsLead,
              {
                autoAlpha: 0,
                duration: motion.number('motion-showreel-benefit-lead-out-duration'),
                ease: motion.value('motion-ease-linear'),
              },
              motion.number('motion-showreel-benefit-lead-end'),
            )
            .to(
              benefitsHeading,
              {
                autoAlpha: 1,
                duration: motion.number('motion-showreel-benefit-heading-duration'),
                ease: motion.value('motion-ease-linear'),
              },
              motion.number('motion-showreel-benefit-heading-start'),
            )
            .to(
              benefitsTable,
              {
                autoAlpha: 1,
                duration: motion.number('motion-showreel-benefit-lead-out-duration'),
                ease: motion.value('motion-ease-linear'),
              },
              motion.number('motion-showreel-benefit-table-start'),
            )
            .to(
              benefitColumns,
              {
                autoAlpha: 1,
                y: motion.pixels('motion-offset-none'),
                stagger: motion.number('motion-showreel-benefit-columns-stagger'),
                duration: motion.number('motion-showreel-lead-duration'),
                ease: motion.value('motion-ease-linear'),
              },
              motion.number('motion-showreel-benefit-columns-start'),
            )
            .to({}, { duration: motion.number('motion-showreel-pause-duration') });

        let playbackObserver;
        if (!navigator.connection?.saveData) {
          playbackObserver = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting)
                showreelVideo.play().catch(() => {
                  showreelVideo.controls = true;
                  showreelAction.hidden = true;
                });
              else showreelVideo.pause();
            },
            { rootMargin: config.video.preloadMargin },
          );
          playbackObserver.observe(showreelStage);
        }
        return () => {
          playbackObserver?.disconnect();
          showreelVideo.pause();
          showreelVideo.controls = true;
          document.documentElement.classList.remove('showreel-motion');
          requestAnimationFrame(() => {
            if (!window.matchMedia(config.media.mobile).matches) return;
            for (const property of [
              'top',
              'width',
              'height',
              'border-radius',
              '--showreel-scrim',
            ]) {
              showreelFrame.style.removeProperty(property);
            }
            ScrollTrigger.refresh();
          });
        };
      },
    );
}
