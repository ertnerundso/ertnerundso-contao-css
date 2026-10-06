/* KUNDENSTIMMEN: Alle redaktionellen Contao-Elemente bleiben bearbeitbar
   und werden im Frontend zu einer gemeinsamen, tastaturbedienbaren Ansicht.
   Automatischer Wechsel: Lesezeit in config.js; Pause bei Hover, Fokus und außerhalb des Bildes. */
export function initTestimonials({ listen, cleanup, observer, config }) {
  const main = document.querySelector('main');
  if (!main) return;

  const first = main.querySelector('.testimonial-feature');
  if (!first) return;
  const article = first.closest('.mod_article');
  const slides = [...main.querySelectorAll('.testimonial-feature')].filter(
    (slide) => slide.closest('.mod_article') === article,
  );
  if (slides.length < 2) return;
  const anchor = slides[0];
  const anchorParent = anchor.parentNode;

  const language = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'de';
  const section = document.createElement('section');
  section.className = 'testimonial-carousel';
  section.setAttribute('aria-label', language === 'en' ? 'Client voices' : 'Kundenstimmen');

  const inner = document.createElement('div');
  inner.className = 'testimonial-carousel-inner shell';
  const heading = document.createElement('p');
  heading.className = 'testimonial-carousel-label micro';
  heading.textContent = language === 'en' ? 'Client voices' : 'Kundenstimmen';
  const switcher = document.createElement('div');
  switcher.className = 'testimonial-switch';
  switcher.setAttribute('role', 'tablist');
  switcher.setAttribute('aria-label', heading.textContent);
  const panels = document.createElement('div');
  panels.className = 'testimonial-panels';
  const playback = document.createElement('button');
  playback.type = 'button';
  playback.className = 'testimonial-playback';
  const toolbar = document.createElement('div');
  toolbar.className = 'testimonial-controls';
  toolbar.append(switcher, playback);

  const reducedMotion = window.matchMedia(config.media.reducedMotion);
  let activeIndex = 0;
  let timer;
  let inView = false;
  let hovered = false;
  let focused = false;
  let paused = false;
  let pageHidden = false;

  function stopTimer() {
    window.clearTimeout(timer);
    timer = undefined;
  }

  function schedule() {
    stopTimer();
    if (paused || hovered || focused || !inView || pageHidden || document.hidden || reducedMotion.matches) return;
    timer = window.setTimeout(() => {
      select((activeIndex + 1) % slides.length);
      schedule();
    }, config.testimonials.autoplayDelay);
  }

  function updatePlayback() {
    const label = language === 'en'
      ? (paused ? 'Resume automatic rotation' : 'Pause automatic rotation')
      : (paused ? 'Automatischen Wechsel fortsetzen' : 'Automatischen Wechsel pausieren');
    playback.setAttribute('aria-label', label);
    playback.title = label;
    playback.textContent = paused ? '▶' : 'Ⅱ';
    playback.hidden = reducedMotion.matches;
  }

  // Platz sichern, bevor benachbarte CMS-Gruppen in die Panels verschoben werden.
  anchorParent.insertBefore(section, anchor);

  const controls = slides.map((slide, index) => {
    const number = String(index + 1).padStart(2, '0');
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = `testimonial-tab-${number}`;
    tab.className = 'testimonial-switch-button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `testimonial-panel-${number}`);
    tab.setAttribute('aria-label', `${heading.textContent} ${index + 1}`);
    tab.textContent = number;
    switcher.append(tab);

    slide.id = `testimonial-panel-${number}`;
    slide.setAttribute('role', 'tabpanel');
    slide.setAttribute('aria-labelledby', tab.id);
    slide.classList.add('testimonial-carousel-panel');
    panels.append(slide);
    return tab;
  });

  function select(index, focus = false) {
    activeIndex = index;
    controls.forEach((tab, item) => {
      const active = item === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      slides[item].hidden = !active;
    });
    if (focus) controls[index].focus();
  }

  controls.forEach((tab, index) => {
    listen(tab, 'click', () => {
      select(index);
      schedule();
    });
    listen(tab, 'keydown', (event) => {
      const directions = { ArrowRight: 1, ArrowLeft: -1 };
      if (event.key in directions) {
        event.preventDefault();
        select((index + directions[event.key] + controls.length) % controls.length, true);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        select(event.key === 'Home' ? 0 : controls.length - 1, true);
      }
      schedule();
    });
  });

  listen(playback, 'click', () => {
    paused = !paused;
    updatePlayback();
    schedule();
  });
  listen(section, 'pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    schedule();
  });
  listen(section, 'pointerleave', () => {
    hovered = false;
    schedule();
  });
  listen(section, 'focusin', () => {
    focused = true;
    schedule();
  });
  listen(section, 'focusout', (event) => {
    focused = section.contains(event.relatedTarget);
    schedule();
  });
  listen(document, 'visibilitychange', schedule);
  listen(reducedMotion, 'change', () => {
    updatePlayback();
    schedule();
  });
  listen(window, 'pagehide', () => {
    pageHidden = true;
    stopTimer();
  });
  listen(window, 'pageshow', () => {
    pageHidden = false;
    schedule();
  });
  cleanup(stopTimer);

  inner.append(heading, toolbar, panels);
  section.append(inner);
  select(0);
  updatePlayback();
  observer(new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= config.testimonials.visibilityThreshold;
    schedule();
  }, { threshold: config.testimonials.visibilityThreshold }), section);
}
