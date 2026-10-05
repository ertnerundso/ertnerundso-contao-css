/* KUNDENSTIMMEN: Die zwei redaktionellen Contao-Elemente bleiben bearbeitbar
   und werden im Frontend zu einer gemeinsamen, tastaturbedienbaren Ansicht. */
export function initTestimonials({ listen }) {
  const main = document.querySelector('main');
  if (!main) return;

  const slides = [
    main.querySelector('.testimonial-feature--case'),
    main.querySelector('.testimonial-feature--closing'),
  ];
  if (slides.some((slide) => !slide)) return;
  if (slides[0].closest('.mod_article') !== slides[1].closest('.mod_article')) return;
  const anchor = slides[0];
  const anchorParent = anchor.parentNode;
  const anchorNextSibling = anchor.nextSibling;

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
    controls.forEach((tab, item) => {
      const active = item === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      slides[item].hidden = !active;
    });
    if (focus) controls[index].focus();
  }

  controls.forEach((tab, index) => {
    listen(tab, 'click', () => select(index));
    listen(tab, 'keydown', (event) => {
      const directions = { ArrowRight: 1, ArrowLeft: -1 };
      if (event.key in directions) {
        event.preventDefault();
        select((index + directions[event.key] + controls.length) % controls.length, true);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        select(event.key === 'Home' ? 0 : controls.length - 1, true);
      }
    });
  });

  anchorParent.insertBefore(section, anchorNextSibling);
  inner.append(heading, switcher, panels);
  section.append(inner);
  select(0);
}
