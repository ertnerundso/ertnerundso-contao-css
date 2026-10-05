import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const smallScreen = window.matchMedia('(max-width: 760px)').matches;

const menuButton = document.querySelector('.menu-toggle');
const menuPanel = document.querySelector('.menu-panel');
const menuClose = document.querySelector('.menu-close');
let lenis;
const setMenu = (open) => {
  menuPanel?.classList.toggle('is-open', open);
  menuPanel?.toggleAttribute('inert', !open);
  menuPanel?.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  const english = document.documentElement.lang === 'en';
  menuButton.setAttribute('aria-label', open ? (english ? 'Close menu' : 'Menü schließen') : (english ? 'Open menu' : 'Menü öffnen'));
  if (open) { lenis?.stop(); menuClose?.focus(); }
  else { lenis?.start(); menuButton?.focus(); }
};
menuButton?.addEventListener('click', () => setMenu(!menuPanel?.classList.contains('is-open')));
menuClose?.addEventListener('click', () => setMenu(false));
menuPanel?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (!menuPanel?.classList.contains('is-open')) return;
  if (event.key === 'Escape') { setMenu(false); return; }
  if (event.key !== 'Tab') return;
  const focusable = [...menuPanel.querySelectorAll('a,button')];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
if (header && hero) {
  const observer = new IntersectionObserver(([entry]) => header.classList.toggle('is-compact', !entry.isIntersecting), { rootMargin: '-76px 0px 0px 0px', threshold: 0 });
  observer.observe(hero);
} else header?.classList.add('is-compact');

document.querySelectorAll('.journal .journal-list').forEach((list) => {
  const controls = document.createElement('div');
  controls.className = 'journal-slider-controls';
  const english = document.documentElement.lang === 'en';
  const buttons = [
    { direction: -1, symbol: '←', label: english ? 'Previous articles' : 'Vorherige Beiträge' },
    { direction: 1, symbol: '→', label: english ? 'Next articles' : 'Nächste Beiträge' },
  ].map(({ direction, symbol, label }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = symbol;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.addEventListener('click', () => {
      const card = list.querySelector('.journal-row');
      const gap = parseFloat(getComputedStyle(list).gap) || 0;
      list.scrollBy({ left: direction * ((card?.getBoundingClientRect().width || list.clientWidth) + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    controls.append(button);
    return button;
  });
  list.before(controls);
  list.tabIndex = 0;
  list.setAttribute('role', 'region');
  list.setAttribute('aria-label', english ? 'Journal articles' : 'Journalbeiträge');
  const updateControls = () => {
    const maxScroll = list.scrollWidth - list.clientWidth;
    controls.hidden = maxScroll < 2;
    buttons[0].disabled = list.scrollLeft < 2;
    buttons[1].disabled = list.scrollLeft >= maxScroll - 2;
  };
  list.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(list);
  updateControls();
});

const showreelSection = document.querySelector('.showreel-section');
const showreelStage = showreelSection?.querySelector('.showreel-stage');
const showreelFrame = showreelSection?.querySelector('.showreel-frame');
const showreelVideo = showreelFrame?.querySelector('video');
const showreelAction = showreelFrame?.querySelector('.showreel-action');
const benefits = showreelStage?.querySelector('.benefits-section');
if (showreelVideo && showreelAction) showreelVideo.controls = false;
showreelAction?.addEventListener('click', () => {
  showreelVideo.controls = true;
  showreelVideo.muted = false;
  showreelVideo.loop = false;
  showreelVideo.currentTime = 0;
  showreelVideo.play().catch(() => {});
  showreelAction.hidden = true;
});

const manualBook = document.querySelector('.manual-book');
const manualBookVideo = manualBook?.querySelector('video');
if (manualBookVideo) {
  manualBookVideo.controls = false;
  manualBookVideo.muted = true;
  manualBookVideo.playsInline = true;
  manualBookVideo.poster = '/files/site/montage-book-poster.jpg';
  manualBookVideo.removeAttribute('controls');
  if (!reduceMotion && !navigator.connection?.saveData) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      manualBookVideo.currentTime = 0;
      manualBookVideo.play().catch(() => {});
    }, { threshold: 0.45 });
    observer.observe(manualBookVideo);
  }
}

if (!reduceMotion) {
  if (!coarsePointer) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if (lenis) document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: target.classList.contains('work') ? 0 : -75 });
    });
  });

  document.documentElement.classList.add('js-ready');
  const heroMessage = hero?.querySelector('.hero-message');
  const heroImage = hero?.querySelector('.hero-media img');
  const heroActions = hero?.querySelector('.hero-actions');
  if (heroMessage && heroImage && heroActions) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(heroImage, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 1.25 }, 0)
      .fromTo(heroMessage, { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, duration: 1.1 }, 0.16)
      .fromTo(heroActions, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.48);
    const addHeroParallax = () => {
      if (!smallScreen) gsap.to(heroImage, {
        yPercent: -3,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    };
    const canScrubVideo = !smallScreen && !coarsePointer && !navigator.connection?.saveData
      && document.createElement('video').canPlayType('video/mp4');
    if (canScrubVideo) {
      const video = document.createElement('video');
      video.className = 'hero-motion-video';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');
      let lastFrame = 0;
      const heroLayers = [hero.querySelector('.hero-media'), hero.querySelector('.hero-inner')];
      const motionTrigger = ScrollTrigger.create({
        trigger: hero,
        start: () => `top top+=${header?.offsetHeight || 76}`,
        end: () => `+=${Math.round(window.innerHeight * 1.25)}`,
        pin: hero,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(heroLayers, { y: -0.25 * (self.end - self.start) * self.progress });
          if (!video.classList.contains('is-ready')) return;
          video.style.opacity = String(Math.min(1, self.progress * 8));
          const frame = self.progress * lastFrame;
          if (Math.abs(video.currentTime - frame) > 1 / 24) video.currentTime = frame;
        },
      });
      video.addEventListener('loadeddata', () => {
        lastFrame = video.duration - 1 / 24;
        video.classList.add('is-ready');
        motionTrigger.update();
      }, { once: true });
      video.addEventListener('error', () => {
        motionTrigger.kill();
        gsap.set(heroLayers, { clearProps: 'transform' });
        video.remove();
        addHeroParallax();
        ScrollTrigger.refresh();
      }, { once: true });
      heroImage.parentElement.append(video);
      video.src = '/clean/assets/hero-release.mp4';
    } else addHeroParallax();
  }

  if (showreelStage && showreelVideo) gsap.matchMedia().add('(min-width: 761px)', () => {
    const lead = showreelStage.querySelector('.showreel-lead');
    const filmCopy = showreelStage.querySelector('.showreel-film-copy');
    const phoneOverlay = showreelStage.querySelector('.showreel-phone-overlay');
    const benefitsLead = benefits?.querySelector('.benefits-lead');
    const benefitsHeading = benefits?.querySelector('.benefits-impact h3');
    const benefitsTable = benefits?.querySelector('.benefits-table');
    const benefitColumns = benefits?.querySelectorAll('.benefit-column');
    const phoneWidth = () => Math.min(window.innerWidth * 0.34, window.innerHeight * 0.58, 600);
    showreelVideo.controls = false;
    document.documentElement.classList.add('showreel-motion');
    if (benefitsLead && benefitsHeading && benefitsTable) {
      gsap.set([benefitsLead, benefitsHeading, benefitsTable], { autoAlpha: 0 });
      gsap.set(benefitColumns, { autoAlpha: 0, y: 18 });
    }
    const story = gsap.timeline({
      scrollTrigger: {
        trigger: showreelSection,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * (benefits ? 5.3 : 2.8))}`,
        pin: showreelStage,
        scrub: 0.65,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
      .to(lead, { autoAlpha: 0, y: -80, duration: 0.23, ease: 'none' }, 0.07)
      .to(showreelFrame, {
        top: 76,
        width: () => window.innerWidth,
        height: () => window.innerHeight - 76,
        borderRadius: 0,
        duration: 0.43,
        ease: 'none',
      }, 0.1)
      .to(filmCopy, { autoAlpha: 1, duration: 0.17, ease: 'none' }, 0.38)
      .to(showreelFrame, { '--showreel-scrim': 0.28, duration: 0.17, ease: 'none' }, 0.38)
      .to(filmCopy, { autoAlpha: 0, duration: 0.14, ease: 'none' }, 0.6)
      .to(showreelFrame, { '--showreel-scrim': 0, duration: 0.14, ease: 'none' }, 0.6)
      .to(showreelFrame, {
        top: () => window.innerHeight * 0.42,
        width: phoneWidth,
        height: () => phoneWidth() / 2.169,
        borderRadius: 36,
        duration: 0.4,
        ease: 'none',
      }, 0.69)
      .to(phoneOverlay, { autoAlpha: 1, duration: 0.08, ease: 'none' }, 1.09)
      .to(showreelAction, { autoAlpha: 1, duration: 0.12, ease: 'none' }, 1.17);
    if (benefitsLead && benefitsHeading && benefitsTable) story
      .to(showreelFrame, { top: () => window.innerHeight * 0.34, duration: 0.28, ease: 'none' }, 1.48)
      .to(benefitsLead, { autoAlpha: 1, duration: 0.25, ease: 'none' }, 1.62)
      .to(benefitsLead, { autoAlpha: 0, duration: 0.18, ease: 'none' }, 2.22)
      .to(benefitsHeading, { autoAlpha: 1, duration: 0.22, ease: 'none' }, 2.43)
      .to(benefitsTable, { autoAlpha: 1, duration: 0.18, ease: 'none' }, 2.64)
      .to(benefitColumns, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.23, ease: 'none' }, 2.69)
      .to({}, { duration: 0.45 });

    let playbackObserver;
    if (!navigator.connection?.saveData) {
      playbackObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) showreelVideo.play().catch(() => {
          showreelVideo.controls = true;
          showreelAction.hidden = true;
        });
        else showreelVideo.pause();
      }, { rootMargin: '250px 0px' });
      playbackObserver.observe(showreelStage);
    }
    return () => {
      playbackObserver?.disconnect();
      showreelVideo.pause();
      showreelVideo.controls = true;
      document.documentElement.classList.remove('showreel-motion');
      requestAnimationFrame(() => {
        if (!window.matchMedia('(max-width: 760px)').matches) return;
        for (const property of ['top', 'width', 'height', 'border-radius', '--showreel-scrim']) {
          showreelFrame.style.removeProperty(property);
        }
        ScrollTrigger.refresh();
      });
    };
  });

  if (benefits) {
    const impact = benefits.querySelector('.benefits-impact');
    const columns = benefits.querySelectorAll('.benefit-column');
    gsap.matchMedia().add('(max-width: 760px)', () => {
      gsap.fromTo(impact, { autoAlpha: 0, y: 36 }, {
        autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: impact, start: 'top 85%', once: true },
      });
      gsap.fromTo(columns, { autoAlpha: 0, y: 28 }, {
        autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: columns[0], start: 'top 86%', once: true },
      });
    });
  }

  const configuratorScene = document.querySelector('.configurator-scene');
  const configuratorVideo = configuratorScene?.querySelector('.configurator-scene-video');
  if (configuratorVideo && !smallScreen && !navigator.connection?.saveData) {
    const heading = configuratorScene.querySelector('.configurator-scene-heading');
    const media = configuratorScene.querySelector('.configurator-scene-media');
    const cards = configuratorScene.querySelector('.configurator-scene-cards');
    let trigger;
    const clamp = (value) => Math.max(0, Math.min(1, value));
    const smooth = (value) => value * value * (3 - 2 * value);
    const enable = () => {
      if (!Number.isFinite(configuratorVideo.duration) || configuratorVideo.duration <= 0) return;
      configuratorVideo.pause();
      configuratorVideo.style.transform = 'translate(-50%, -50%) scale(2)';
      configuratorScene.classList.add('is-scroll-ready');
      trigger = ScrollTrigger.create({
        trigger: configuratorScene,
        start: 'top top+=76',
        end: 'bottom bottom',
        refreshPriority: -1,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const frame = clamp(progress / 0.68) * (configuratorVideo.duration - 0.05);
          if (Math.abs(configuratorVideo.currentTime - frame) > 0.04) configuratorVideo.currentTime = frame;
          const reveal = smooth(clamp((progress - 0.68) / 0.27));
          const videoScale = 2 - 0.75 * smooth(clamp(progress / 0.3));
          configuratorVideo.style.transform = `translate(-50%, -50%) scale(${videoScale})`;
          heading.style.opacity = String(1 - smooth(clamp(progress / 0.54)));
          heading.style.transform = `translateY(${-progress * 190}px)`;
          media.style.height = `${65 - reveal * 17}svh`;
          media.style.marginTop = `${8 * (1 - reveal)}svh`;
          cards.style.maxHeight = `${reveal * cards.scrollHeight}px`;
          cards.style.opacity = String(reveal);
          cards.style.transform = `translateY(${(1 - reveal) * 24}px)`;
        },
      });
      ScrollTrigger.refresh();
    };
    if (configuratorVideo.readyState >= 1) enable();
    else configuratorVideo.addEventListener('loadedmetadata', enable, { once: true });
    configuratorVideo.addEventListener('error', () => {
      trigger?.kill();
      configuratorScene.classList.remove('is-scroll-ready');
      ScrollTrigger.refresh();
    }, { once: true });
  }

  const revealOnce = (element, options = {}) => gsap.from(element, {
    autoAlpha: 0,
    y: 42,
    duration: 0.85,
    ease: 'power2.out',
    scrollTrigger: { trigger: element, start: 'top 88%', once: true },
    ...options,
  });
  const statementImage = document.querySelector('.statement-image');
  if (statementImage) {
    gsap.timeline({
      scrollTrigger: { trigger: statementImage, start: 'top 85%', once: true },
    })
      .fromTo(statementImage,
        { autoAlpha: 0.6, clipPath: 'inset(7% 0% 7% 0% round 8px)' },
        { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0% round 8px)', duration: 1.25, ease: 'power2.out' })
      .fromTo(statementImage.querySelector('img'),
        { scale: 1.09 },
        { scale: 1, duration: 1.45, ease: 'power2.out' }, 0);
  }
  document.querySelectorAll('.contact-band-copy,.contact-band-image').forEach((element) => revealOnce(element));
  document.querySelectorAll('.manual-book-header,.manual-book-copy').forEach((element) => revealOnce(element, { y: 28 }));
  document.querySelectorAll('.index-card,.journal-row,.question').forEach((element) => revealOnce(element, { y: 28, duration: 0.7 }));
  if (document.querySelector('.service-grid')) gsap.from('.service-card', {
    autoAlpha: 0,
    y: 52,
    duration: 0.85,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.service-grid', start: 'top 82%', once: true },
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  document.querySelectorAll('.question').forEach((element) => element.addEventListener('toggle', () => ScrollTrigger.refresh()));
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.95,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 90%', once: true },
    });
  });

  // Splitting is visual only; the heading keeps a complete accessible label.
  document.querySelectorAll('[data-split]').forEach((heading) => {
    const original = heading.textContent.trim();
    heading.setAttribute('aria-label', original);
    heading.textContent = '';
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    original.split(/\s+/).forEach((word, index) => {
      const mask = document.createElement('span');
      mask.className = 'split-line';
      mask.style.display = 'inline-block';
      mask.style.verticalAlign = 'bottom';
      const inner = document.createElement('span');
      inner.className = 'split-line-inner';
      inner.textContent = word;
      mask.append(inner);
      visual.append(mask);
      if (index < original.split(/\s+/).length - 1) visual.append(' ');
    });
    heading.append(visual);
    gsap.from(heading.querySelectorAll('.split-line-inner'), {
      yPercent: 108,
      duration: 1.05,
      stagger: 0.055,
      ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
    });
  });

  const parallax = document.querySelectorAll('[data-parallax]');
  if (!smallScreen) parallax.forEach((element) => {
    gsap.fromTo(element, { yPercent: -6 }, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  const work = document.querySelector('.work');
  const viewport = document.querySelector('.work-viewport');
  const track = document.querySelector('.work-track');
  const progress = document.querySelector('.work-progress i');
  const count = document.querySelector('.work-count');
  if (work && viewport && track && !smallScreen) {
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: work,
        start: 'top top',
        end: () => `+=${distance() + window.innerHeight * 0.25}`,
        pin: true,
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progress) progress.style.transform = `scaleX(${Math.max(0.06, self.progress)})`;
          if (count) count.textContent = String(Math.min(6, 1 + Math.floor(self.progress * 6))).padStart(2, '0');
        },
      },
    });
  } else if (viewport) {
    viewport.addEventListener('scroll', () => {
      const fraction = viewport.scrollLeft / Math.max(1, viewport.scrollWidth - viewport.clientWidth);
      if (progress) progress.style.transform = `scaleX(${Math.max(0.06, fraction)})`;
      if (count) count.textContent = String(Math.min(6, 1 + Math.round(fraction * 5))).padStart(2, '0');
    }, { passive: true });
  }

  if (!coarsePointer) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, { rotateX: -y * 3, rotateY: x * 3, duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5 }));
    });
    const dot = document.querySelector('.cursor-dot');
    if (dot) {
      window.addEventListener('pointermove', (event) => gsap.to(dot, { x: event.clientX - 9, y: event.clientY - 9, duration: 0.2, ease: 'power2.out' }), { passive: true });
      document.querySelectorAll('a,button,[data-tilt]').forEach((element) => {
        element.addEventListener('pointerenter', () => dot.classList.add('is-active'));
        element.addEventListener('pointerleave', () => dot.classList.remove('is-active'));
      });
    }
  }
}

if (document.getElementById('hero-scene') && !reduceMotion && !smallScreen && !navigator.connection?.saveData) {
  import('./scene.js').then(({ startHeroScene }) => startHeroScene());
}

const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
  const loadedAt = Date.now();
  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.hidden = true;
  const submit = contactForm.querySelector('button[type="submit"]');
  const initialLabel = submit.textContent;
  const english = document.documentElement.lang === 'en';
  const formBody = contactForm.querySelector('.formbody') || contactForm;
  const company = document.createElement('input');
  company.type = 'text';
  company.name = 'company';
  company.autocomplete = 'off';
  company.tabIndex = -1;
  company.className = 'form-honeypot';
  company.setAttribute('aria-hidden', 'true');
  formBody.append(company);
  const consentLabel = contactForm.querySelector('input[type="checkbox"][name="consent"] + label');
  if (consentLabel) {
    const privacy = document.createElement('a');
    privacy.href = '/datenschutz/';
    privacy.textContent = english ? ' Privacy policy' : ' Datenschutzerklärung';
    consentLabel.append(privacy);
  }
  const security = document.createElement('div');
  security.className = 'cf-turnstile';
  security.dataset.sitekey = '0x4AAAAAADqKNDGl_9CgNW_W';
  security.dataset.theme = 'light';
  security.dataset.language = english ? 'en' : 'de';
  submit.closest('.widget')?.before(security);
  submit.closest('.widget')?.after(status);
  const turnstile = document.createElement('script');
  turnstile.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  turnstile.async = true;
  document.head.append(turnstile);
  const showStatus = (message, error = false) => {
    status.hidden = false;
    status.textContent = message;
    if (error) {
      status.setAttribute('data-error', '');
      submit.disabled = false;
      requestAnimationFrame(() => { submit.disabled = false; });
    }
    else status.removeAttribute('data-error');
  };
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const email = contactForm.querySelector('[name="email"]');
    const consent = contactForm.querySelector('input[type="checkbox"][name="consent"]');
    const token = contactForm.querySelector('[name="cf-turnstile-response"]')?.value;
    if (!email.checkValidity()) {
      showStatus(english ? 'Please enter a valid email address.' : 'Bitte geben Sie eine gültige E-Mail-Adresse an.', true);
      email.focus();
      return;
    }
    if (!consent.checked) {
      showStatus(english ? 'Please confirm the privacy notice.' : 'Bitte bestätigen Sie die Datenschutzhinweise.', true);
      consent.focus();
      return;
    }
    if (!token) {
      showStatus(english ? 'The security check is still loading. Please try again shortly.' : 'Die Sicherheitsprüfung lädt noch. Bitte versuchen Sie es gleich erneut.', true);
      return;
    }
    submit.disabled = true;
    submit.textContent = english ? 'Sending …' : 'Wird gesendet …';
    status.hidden = true;
    try {
      const response = await fetch('https://forms.ertnerundso.de/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value.trim(),
          message: contactForm.querySelector('[name="message"]').value.trim(),
          company: contactForm.querySelector('[name="company"]').value,
          token,
          elapsed: Date.now() - loadedAt,
        }),
      });
      if (!response.ok) throw new Error(`Contact service returned ${response.status}`);
      contactForm.reset();
      window.turnstile?.reset();
      showStatus(english ? 'Thank you. Your enquiry has arrived.' : 'Danke! Ihre Anfrage ist angekommen.');
      submit.textContent = english ? 'Sent' : 'Gesendet';
    } catch {
      window.turnstile?.reset();
      showStatus(english ? 'Sending failed. Please write to projects@ertnerundso.com.' : 'Das Senden hat nicht geklappt. Schreiben Sie bitte an projects@ertnerundso.com.', true);
      submit.disabled = false;
      submit.textContent = initialLabel;
    }
  }, { capture: true });
}

// The self-hosted embed is loaded only where booking is visible.
const booking = document.querySelector('[data-cal-inline]');
if (booking) {
  const origin = 'https://cal.ertnerundso.de';
  const queue = (...args) => window.Cal.q.push(args);
  window.Cal = Object.assign(queue, { q: [], ns: {}, loaded: true });
  const namespace = (...args) => namespace.q.push(args);
  namespace.q = [];
  window.Cal.ns.ertner = namespace;
  namespace('init', 'ertner', { origin });
  namespace('inline', { elementOrSelector: '[data-cal-inline]', calLink: 'eunds/30min', layout: 'month_view' });
  namespace('ui', { theme: 'light', styles: { branding: { brandColor: '#2455ed' } }, hideEventTypeDetails: false });
  const script = document.createElement('script');
  script.src = `${origin}/embed/embed.js`;
  script.async = true;
  script.onerror = () => {
    booking.innerHTML = '<p>Der Kalender ist momentan nicht erreichbar. Bitte nutzen Sie den Buchungslink.</p><p><a class="button" href="https://cal.ertnerundso.de/eunds/30min" target="_blank" rel="noopener">Termin buchen</a></p>';
  };
  const ready = new MutationObserver(() => {
    if (!booking.querySelector('iframe')) return;
    booking.querySelector('p')?.remove();
    ready.disconnect();
  });
  ready.observe(booking, { childList: true, subtree: true });
  document.head.append(script);
}
