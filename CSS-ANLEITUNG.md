# CSS und JavaScript einfach bearbeiten

Die kurze `site.css` lädt alle Dateien in `css/`. Ändere die zuständige Einstellung, statt am Dateiende eine neue Überschreibung anzuhängen. CSS braucht keinen Build.

| Was ändern? | Wo? |
| --- | --- |
| Schrift, Schnitt, Größe oder Zeilenhöhe von h1–h6 | `css/typography.css`, im jeweiligen H1–H6-Block |
| Normaler Text und Textvarianten | `css/typography.css`, bei LESEN / TEXTVARIANTEN |
| Gemeinsame Farben, Abstände, Rundungen, Schatten | `css/base.css` |
| Farbe, Hintergrund, Rand, Schatten eines Elements | `css/surfaces.css` |
| Animationen, Übergänge und Bewegungswerte | `css/motion.css` |
| Maximale Inhaltsbreite, gemeinsame Raster, Header-Höhe | `css/layout.css` |
| Höhe des aufgeklappten Menüs / Größe des runden Knopfs | `--layout-menu-height` / `--layout-menu-control-size` in `css/layout.css` |
| Menüfarbe / Geschwindigkeit / Verkleinerung der Seite | `--color-menu-*` in `css/base.css` / `--motion-menu-*` in `css/motion.css` |
| Seitenränder und Abstand zwischen Bereichen | `--space-gutter` / `--space-section` in `css/base.css` |
| Anordnung eines Bereichs, auch auf dem Handy | Etwa `css/hero.css`, `css/cards.css`, `css/contact.css` |
| Allgemeine responsive Raster | `css/responsive.css` |
| Scroll-Schwellen, Slider-Verhalten, Formular-/Kalender-Adressen | `src/config.js` |
| Funktion eines JavaScript-Bereichs | Etwa `src/navigation.js`, `src/work.js`, `src/forms.js` |

## Beispiel: h1 bearbeiten

Suche in `typography.css` **H1**. Diese Einstellungen gelten für **jede h1 auf der Website**:

```css
--font-h1-family: "SK Modernist", Arial, sans-serif;
--font-h1-weight: 700;
--font-h1-min: 2.375rem;
--font-h1-max: var(--font-step-1);
--font-h1-size: clamp(var(--font-h1-min), var(--font-fluid-1), var(--font-h1-max));
--font-h1-line-height: 1.06;
```

`family` wählt die Schrift. SK Modernist ist mit 300 (Light), 400 (Regular) und 700 (Bold) eingebunden. `min` / `max` begrenzen die Größe; für eine eigene Höchstgröße etwa `--font-h1-max: 4.5rem;` einsetzen. Für eine feste Größe kannst du `size` direkt auf `3rem` setzen. `line-height` ist die Zeilenhöhe ohne Einheit. h2–h6 haben gleich aufgebaute Blöcke.

`--font-scale: 1.33` steuert die Desktop-Abstufung. Mobile Mindestgrößen halten kleine Überschriften lesbar. Lesetext startet bei `1.0625rem` (17px bei 16px Browser-Grundschrift). Alle Größen berücksichtigen die Browser-Einstellungen.

Für neue Textvarianten: `text-lead` (Einleitung), `text-small`, `text-caption` (Beschriftung), `text-label`. Eine echte Überschrift behält immer ihre h1–h6-Einstellungen.

## Beispiel: Abstände und Anordnung

```css
/* Etwa in hero.css: nur Anordnung */
.hero-actions {
  display: flex;
  gap: var(--space-lg);
}
```

`xs`, `sm`, `md`, `lg`, `xl`, `2xl` bis `7xl` sind gemeinsame Abstände. An dieser Stelle einen anderen Token wählen, um nur diesen Abstand zu ändern. Den Wert in `base.css` ändern, um alle Verwendungen anzupassen. Die zusätzlich benannten Positionswerte gehören zu besonderen Medien-/Scroll-Anordnungen.

Optionale Raster: `grid-2-col`, `grid-3-col`, `grid-sidebar` (1:2), `grid-feature` (2:3). Auf dem Handy stehen sie untereinander. Buttons: `btn btn--primary`, `btn btn--secondary` (Outline), `btn btn--text`. Karten: `card`, optional `card--dark` / `card--plain`. Vorhandene Contao-Klassen bleiben nutzbar; keine Pflicht zum Umbauen.

Schriften stehen immer in `typography.css`, Flächen in `surfaces.css`, Effekte in `motion.css`. Komponenten enthalten nur Struktur und Abstände. Bildschirmgrenzen stehen direkt in `@media`, weil normale CSS-Variablen dort nicht funktionieren.

## JavaScript, Dateien und Freigabe

`src/site.js` startet die Module. Für Verhalten zuerst `src/config.js` öffnen; etwa `header.hideAfter` für die Scroll-Schwelle. Dauer, Bewegung und Gestaltungswerte stehen in `motion.css`. Benannte Werte wie `--motion-showreel-film-copy-start` sind Zeitpunkte in den vorhandenen Scrollgeschichten. Änderungen an JavaScript anschließend mit `npm run build:js` nach `dist/` übernehmen.

Die Navigation liegt transparent über der Seite, verschwindet beim Herunterscrollen und kehrt beim Hochscrollen zurück. Der Menüknopf öffnet oben einen Bereich im gemeinsamen Button-Blau und verschiebt/verkleinert den gesamten Seiteninhalt darunter. Die nötige `.page-shell` ergänzt JavaScript automatisch im bestehenden Seitentemplate. Die Menüpunkte verwenden die gemeinsamen h2-Einstellungen. Escape, Schließen und ein Klick auf die verschobene Seite schließen das Menü; die Scrollposition bleibt erhalten.

Schriften liegen in `assets/fonts/`, Bilder in `assets/images/`, Videos in `assets/videos/`. Schriftdateien werden direkt aus dem Repository geladen. CMS-Uploads bleiben bei Contao.

Prüfen: einmal `npm ci` und `npx playwright install chromium`; danach `npm run check:css`, `npm run check:js`, `npm run build:js`, `npm run test:browser`. Die Tests verwenden simulierte Kontakt-/Kalenderdienste.

Auf eigenen Branches arbeiten. **Merge nach main und Veröffentlichung erst nach ausdrücklicher Freigabe.** Template-Kopien müssen gesondert nach Contao synchronisiert werden. Verbindliche Regeln: `AGENTS.md`.
