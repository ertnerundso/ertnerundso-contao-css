# ERTNER&SO Contao Frontend

Hier liegen CSS, JavaScript, feste Frontend-Dateien und versionierte Kopien der Contao-Templates. Inhalte, Datenbank und Kunden-Uploads bleiben in Contao.

Zum Bearbeiten zuerst [CSS-ANLEITUNG.md](CSS-ANLEITUNG.md) lesen. Die im Interview vereinbarten Regeln stehen in [AGENTS.md](AGENTS.md); technische Details in [ARCHITECTURE.md](ARCHITECTURE.md).

## Aufbau

```text
site.css             Einstieg: direkte Imports aller CSS-Dateien
css/                 Sechs Systemdateien und 24 Dateien für Anordnung
src/site.js          Kleiner Start für die JavaScript-Module
src/config.js        Einstellungen für Verhalten und Integrationen
src/*.js             Ein Modul je Funktion
assets/fonts/        Schriftdateien und zugehörige Originale/Lizenzen
assets/images/       Feste Bilder und Icons
assets/videos/       Feste Videos
templates/           Versionierte Contao-Template-Kopien
scripts/             Architekturprüfungen und JavaScript-Build
tests/              Lokale Browser-Prüfungen
dist/               Generiertes JavaScript für die Website
```

## Bearbeiten und prüfen

CSS wird direkt bearbeitet. Es gibt keinen CSS-Build, keine zweite `site.css` und keine verschachtelten Imports. Alle 30 Module liegen flach in `css/`. Sechs Systemdateien besitzen die Gestaltung; alle übrigen Dateien ausschließlich Anordnung und Abstände.

Alle h1–h6 verwenden ihre zentralen Einstellungen aus `typography.css`, zunächst echtes SK Modernist Bold. Die Desktop-Schriftgrößen folgen der 1,33-Skala. Körpertext startet mit IBM Plex Sans bei 17px. Die gemeinsame Abstandsskala und Layout-Regeln ersetzen bisherige Einzelwerte; Änderungen am bisherigen Erscheinungsbild sind dabei ausdrücklich erlaubt.

Vorhandene Klassen und JavaScript-Hooks bleiben erhalten. Neue Text-, Raster-, Button- und Kartenvarianten sind optional; es ist keine Umbenennung im vorhandenen HTML nötig.

Einmal installieren:

```sh
npm ci
npx playwright install chromium
```

Nach Änderungen:

```sh
npm run check:css
npm run check:js
npm run build:js
npm run test:browser
```

CI führt diese Prüfungen auf Pull Requests aus. Die Browser-Tests verwenden lokale Beispielstrukturen, echte Repository-Schriften und simulierte externe Dienste. Sie versenden keine Kontaktanfragen oder Buchungen und ersetzen keine Prüfung der vollständigen Contao-Seite nach der Freigabe.

## Veröffentlichung

Änderungen zuerst auf einem eigenen Branch als Pull Request prüfen. **Main, Merge und Veröffentlichung benötigen die ausdrückliche Freigabe des Inhabers.** Das vereinbarte Vorhaben wird in zwei aufeinander aufbauenden PRs geprüft: Grundlagen/Typografie und Layout/Komponenten/JavaScript.

Nach einer freigegebenen Änderung an `main` veröffentlicht GitHub Pages CSS, JavaScript und Repository-Assets. Die kurze `site.css` wird von Contao geladen; der Browser lädt ihre direkten Imports. JavaScript wird aus `src/` nach `dist/` gebündelt. Bei Moduländerungen baut die bestehende Aktion das JavaScript neu; veraltete Hash-Dateien werden entfernt.

Die Template-Kopien in `templates/` werden durch GitHub **nicht automatisch in Contao installiert**. Die geänderten Kopien laden Fonts, Logo/Favicon und Konfigurator-Medien aus den neuen Repository-Unterordnern. Sie müssen nach Freigabe gesondert nach Staging synchronisiert werden; anschließend den Contao-Cache leeren. Bestehende CMS-Medien unter `/files/` und `/clean/assets/` werden dadurch nicht migriert.

Für einen anderen Server `site.css`, `css/`, `assets/` und `dist/` gemeinsam kopieren und Template-URLs anpassen. Lokale Vorschauen über HTTP öffnen. Wegen der vereinbarten direkten Imports gibt es mehrere CSS-Anfragen; Pages- und Browser-Caches können Veröffentlichungen verzögern.

Dieses Repository ist öffentlich. Keine Zugangsdaten, Datenbankexporte oder Kunden-Uploads ablegen. Produktion wird aus dieser Aufgabe nicht veröffentlicht.
