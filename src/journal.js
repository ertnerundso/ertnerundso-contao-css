/* Journal-Slider und Navigation.
   Verhalten: config.js; Gestaltung/Zeiten: motion.css und base.css. */
export function initJournal(runtime) {
  const { config, listen, reduceMotion, observer } = runtime;
  document.querySelectorAll('.journal .journal-list').forEach((list) => {
    const controls = document.createElement('div');
    controls.className = 'journal-slider-controls';
    const english = document.documentElement.lang === 'en';
    const buttons = [
      {
        direction: -1,
        symbol: '←',
        label: english ? 'Previous articles' : 'Vorherige Beiträge',
      },
      {
        direction: 1,
        symbol: '→',
        label: english ? 'Next articles' : 'Nächste Beiträge',
      },
    ].map(({ direction, symbol, label }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = symbol;
      button.setAttribute('aria-label', label);
      button.title = label;
      listen(button, 'click', () => {
        const card = list.querySelector('.journal-row');
        const gap = parseFloat(getComputedStyle(list).gap) || 0;
        list.scrollBy({
          left:
            direction *
            ((card?.getBoundingClientRect().width || list.clientWidth) + gap),
          behavior: runtime.reduceMotion ? 'auto' : 'smooth',
        });
      });
      controls.append(button);
      return button;
    });
    list.before(controls);
    runtime.cleanup(() => controls.remove());
    list.tabIndex = 0;
    list.setAttribute('role', 'region');
    list.setAttribute('aria-label', english ? 'Journal articles' : 'Journalbeiträge');
    const updateControls = () => {
      const maxScroll = list.scrollWidth - list.clientWidth;
      controls.hidden = maxScroll < config.sliders.edgeTolerance;
      buttons[0].disabled = list.scrollLeft < config.sliders.edgeTolerance;
      buttons[1].disabled = list.scrollLeft >= maxScroll - config.sliders.edgeTolerance;
    };
    listen(list, 'scroll', updateControls, { passive: true });
    observer(new ResizeObserver(updateControls), list);
    updateControls();
  });
}
