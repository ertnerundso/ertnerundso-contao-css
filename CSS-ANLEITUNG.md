# CSS und JavaScript einfach bearbeiten

Alle CSS-Dateien liegen direkt in `css/`. Die kurze `site.css` lädt sie automatisch; einen CSS-Build brauchst du nicht. Ändere die vorhandene zuständige Einstellung statt eine zusätzliche Überschreibung anzuhängen.

| Was ändern? | Welche Datei? |
| --- | --- |
| Schriftfamilie, Schriftschnitt, Größe oder Zeilenhöhe von h1–h6 | `css/typography.css`, beim jeweiligen H1–H6-Variablen-Block |
| Normaler Text, Einleitung, kleine Texte, Beschriftungen oder Button-Schrift | `css/typography.css`, bei LESEN oder TEXTVARIANTEN |
| Gemeinsame Farben, Abstände, Rundungen und Schatten | `css/base.css` |
| Farbe, Hintergrund, Rand oder Schatten für ein Element verwenden | `css/surfaces.css` |
| Animationen, Übergänge und ihre Gestaltungswerte | `css/motion.css` |
| Seitenbreite, Seitenränder und gemeinsame Raster | `css/layout.css` und die dort verwendeten Werte aus `base.css` |
| Anordnung eines Bereichs, auch auf dem Handy | Seine Datei, etwa `css/hero.css`, `css/cards.css` oder `css/contact.css` |
| Allgemeine responsive Seitenstruktur | `css/responsive.css` |

## Beispiel: h1 ändern

Suche in `typography.css` den Kommentar **H1**. Dort stehen:

```css
--font-h1-family: "SK Modernist", Arial, sans-serif;
--font-h1-weight: 700;
--font-h1-min: 2.375rem;
--font-h1-max: var(--font-step-1);
--font-h1-size: clamp(var(--font-h1-min), var(--font-fluid-1), var(--font-h1-max));
--font-h1-line-height: 1.06;
```

- `family`: Schriftfamilie; die passende Datei muss bei SCHRIFTDATEIEN eingebunden sein.
- `weight`: Schriftschnitt. SK Modernist ist mit 300 (Light), 400 (Regular) und 700 (Bold) eingebunden.
- `min` und `max`: kleinste und größte Schriftgröße. Für eine eigene Höchstgröße kannst du beispielsweise `--font-h1-max: 4.5rem;` einsetzen.
- `size`: verwendet die Grenzen und eine automatisch mitwachsende mittlere Größe. Für eine feste Größe könntest du hier direkt `3rem` einsetzen.
- `line-height`: Zeilenhöhe, ohne Einheit.

**Diese Einstellungen gelten für jede h1 auf der gesamten Website.** Für h2–h6 gibt es gleich aufgebaute Blöcke. Sondergrößen für Hero, News oder Kontakt sind nicht vorgesehen.

`--font-scale: 1.33` bestimmt die Desktop-Abstufung. Mobile Mindestgrößen halten kleine Überschriften mindestens so groß wie den normalen Lesetext; deshalb wird die Hierarchie auf schmalen Bildschirmen flacher. Alle Grenzen sind sichtbar in den H1–H6-Blöcken editierbar.

Lesetext startet mit `--font-body-size: 1.0625rem;`, entsprechend 17px bei einer Grundschrift von 16px. Die Größen bleiben von der Browser-Einstellung des Nutzers abhängig.

## Textvarianten

Vorhandene Klassen bleiben erhalten. Für neue Inhalte stehen `text-lead`, `text-small`, `text-caption` und `text-label` bereit. Sie dienen Einleitungen, kleineren Informationen, Bildbeschriftungen und Labels. Echte Überschriften behalten unabhängig von diesen Klassen ihre h1–h6-Einstellungen.

## Abstände und Gestaltung

`gap: var(--space-lg)` verwendet einen gemeinsamen Abstand aus `base.css`. Für eine Änderung nur an dieser Stelle wählst du einen anderen Wert. Änderst du die Definition in `base.css`, betrifft das alle Stellen, die sie benutzen.

Komponenten regeln ausschließlich Anordnung. Schriften gehören immer in `typography.css`, Gestaltung in `surfaces.css`, Bewegungen in `motion.css`. Normale CSS-Variablen funktionieren nicht in `@media`-Bedingungen; registrierte Bildschirmgrenzen stehen deshalb direkt in den Bedingungen.

## Dateien und Freigabe

Schriftdateien werden aus `assets/fonts/` dieses Repositorys geladen. Der zweite Umsetzungsschritt ergänzt Funktionsmodule in `src/`, gemeinsame Verhaltens-Einstellungen in `src/config.js` sowie die Unterordner `assets/images/` und `assets/videos/`.

Vor Änderungen Umfang abstimmen, dann auf einem eigenen Branch arbeiten. Pull Requests werden mit einer kurzen Änderungsliste geprüft. **Merge in main und Veröffentlichung erst nach ausdrücklicher Freigabe.** Die verbindlichen Regeln stehen in `AGENTS.md`.

Lokale Prüfung: einmal `npm ci`, danach `npm run check:css`. Browser-Tests: einmal `npx playwright install chromium`, danach `npm run test:browser`. Die Tests versenden keine Kontaktanfragen oder Buchungen. Verwende einen Webserver für lokale Vorschauen.
