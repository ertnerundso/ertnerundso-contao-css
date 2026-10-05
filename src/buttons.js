/* GEMEINSAME BUTTONS: Ein dekoratives Pfeilfeld auf dem tatsächlich klickbaren Element.
   Bestehende Contao-Klassen bleiben erhalten; Textlinks erhalten kein Pfeilfeld.
   Farben, Form und Bewegung stehen in den CSS-Systemdateien. */
const variants = '.button, .btn, .hero-contact, .btn--primary, .btn--secondary';
const textVariants = '.btn--text, .text-link, .hero-work-link';

export function enhanceButton(button) {
  if (button.classList.contains('button--arrow')) return;
  const label = document.createElement('span');
  label.className = 'button-label';
  label.append(...button.childNodes);
  // Alte Pfeile am Textende durch genau ein dekoratives Pfeilfeld ersetzen.
  const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
  let lastText;
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.trim()) lastText = walker.currentNode;
  }
  if (lastText) lastText.textContent = lastText.textContent.replace(/\s*[↗→]\s*$/, '');
  const arrow = document.createElement('span');
  arrow.className = 'button-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  button.classList.add('button--arrow');
  button.append(label, arrow);
  // Erst nach der ersten Darstellung Übergänge aktivieren: kein Größen-Flackern beim Laden.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => button.classList.add('is-button-ready')),
  );
}

export function setButtonLabel(button, text) {
  const label = button.querySelector('.button-label');
  (label || button).textContent = text;
}

export function initButtons() {
  for (const button of document.querySelectorAll('a, button')) {
    const owner = button.matches(variants) ? button : button.parentElement;
    if (
      !owner?.matches(variants) ||
      owner.matches(textVariants) ||
      button.matches(textVariants)
    ) continue;
    if (owner !== button && !owner.matches('.content-hyperlink, .widget-submit'))
      continue;
    enhanceButton(button);
  }
}
