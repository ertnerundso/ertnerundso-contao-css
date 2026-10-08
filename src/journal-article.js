/* JOURNAL-ARTIKEL: Inhaltsnavigation aus den bestehenden Contao-Abschnitten. */
export function initJournalArticle(runtime) {
  const english = document.documentElement.lang === 'en';

  document.querySelectorAll('[data-journal-article]').forEach((article) => {
    const intro = article.querySelector('.news-detail-body > .news-intro');
    const sections = [...article.querySelectorAll('.news-detail-body > .content-section')]
      .filter((section) => section.querySelector('h2'));
    if (!intro || !sections.length) return;

    const details = document.createElement('details');
    details.className = 'news-detail-toc';

    const summary = document.createElement('summary');
    summary.textContent = english ? 'In this article' : 'In diesem Artikel';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', english ? 'Article contents' : 'Artikelinhalt');
    const list = document.createElement('ol');

    sections.forEach((section, index) => {
      section.id ||= `journal-section-${index + 1}`;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      const number = document.createElement('span');
      number.className = 'news-detail-toc-number';
      number.textContent = String(index + 1).padStart(2, '0');
      const title = document.createElement('span');
      title.textContent = section.querySelector('h2').textContent.trim();
      link.append(number, title);
      item.append(link);
      list.append(item);
    });

    nav.append(list);
    details.append(summary, nav);
    intro.after(details);
    runtime.listen(nav, 'click', (event) => {
      if (event.target.closest('a')) details.open = false;
    });
    runtime.cleanup(() => details.remove());
  });
}
