/* Kalenderintegration und lokaler Fehlerzustand.
   Verhalten: config.js; Gestaltung/Zeiten: motion.css und base.css. */
export function initBooking(runtime) {
  const { config, motion } = runtime;
  const booking = document.querySelector('[data-cal-inline]');
  if (booking) {
    const origin = config.booking.origin;
    const queue = (...args) => window.Cal.q.push(args);
    window.Cal = Object.assign(queue, { q: [], ns: {}, loaded: true });
    const namespace = (...args) => namespace.q.push(args);
    namespace.q = [];
    window.Cal.ns[config.booking.namespace] = namespace;
    namespace('init', config.booking.namespace, { origin });
    namespace('inline', {
      elementOrSelector: '[data-cal-inline]',
      calLink: config.booking.link,
      layout: 'month_view',
    });
    namespace('ui', {
      theme: 'light',
      styles: { branding: { brandColor: motion.value('color-primary') } },
      hideEventTypeDetails: false,
    });
    const script = document.createElement('script');
    script.src = `${origin}/embed/embed.js`;
    script.async = true;
    script.onerror = () => {
      const message = document.createElement('p');
      message.textContent =
        document.documentElement.lang === 'en'
          ? 'The calendar is unavailable. Please use the booking link.'
          : 'Der Kalender ist momentan nicht erreichbar. Bitte nutzen Sie den Buchungslink.';
      const link = document.createElement('a');
      link.className = 'button';
      link.href = new URL(config.booking.link, origin + '/').href;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent =
        document.documentElement.lang === 'en' ? 'Book a meeting' : 'Termin buchen';
      booking.replaceChildren(message, link);
    };
    const ready = new MutationObserver(() => {
      if (!booking.querySelector('iframe')) return;
      booking.querySelector('p')?.remove();
      ready.disconnect();
    });
    ready.observe(booking, { childList: true, subtree: true });
    document.head.append(script);
    runtime.cleanup(() => {
      ready.disconnect();
      script.remove();
    });
  }
}
