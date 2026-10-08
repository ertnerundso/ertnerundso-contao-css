/* ARTIKEL-SLIDER: Native horizontale Bewegung mit optionalen Pfeilen.
   Ohne JavaScript bleiben alle weiteren Artikel per Touchpad und Wischen erreichbar. */
export function initJournalRelated(runtime) {
  for (const section of document.querySelectorAll('[data-journal-related]')) {
    const track = section.querySelector('.mod_newslist');
    const cards = [...(track?.querySelectorAll(':scope > .journal-related-card') || [])];
    if (!track || cards.length < 2) continue;

    const english = document.documentElement.lang === 'en';
    const controls = document.createElement('div');
    controls.className = 'journal-related-controls';
    const status = document.createElement('span');
    status.className = 'micro journal-related-status';
    status.setAttribute('aria-live', 'polite');
    controls.append(status);
    const buttons = [-1, 1].map((direction) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'journal-related-control';
      button.textContent = direction < 0 ? '←' : '→';
      button.title = direction < 0
        ? (english ? 'Previous articles' : 'Vorherige Artikel')
        : (english ? 'Next articles' : 'Nächste Artikel');
      button.setAttribute('aria-label', button.title);
      controls.append(button);
      runtime.listen(button, 'click', () => {
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const step = cards[0].getBoundingClientRect().width + gap;
        track.scrollBy({ left: direction * step, behavior: runtime.reduceMotion ? 'auto' : 'smooth' });
      });
      return button;
    });
    section.append(controls);
    track.tabIndex = 0;
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', english ? 'More articles' : 'Weitere Artikel');

    const update = () => {
      const left = track.scrollLeft;
      const last = Math.max(0, track.scrollWidth - track.clientWidth);
      const position = cards.findLastIndex((card) => card.offsetLeft - cards[0].offsetLeft <= left + 2);
      status.textContent = `${String(Math.max(1, position + 1)).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      buttons[0].disabled = left <= 2;
      buttons[1].disabled = left >= last - 2;
      controls.hidden = last <= 2;
    };
    runtime.listen(track, 'scroll', update, { passive: true });
    runtime.observer(new ResizeObserver(update), track);
    update();
    runtime.cleanup(() => {
      controls.remove();
      track.removeAttribute('tabindex');
      track.removeAttribute('role');
      track.removeAttribute('aria-label');
    });
  }
}
