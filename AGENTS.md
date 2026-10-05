# Verbindliche Projektregeln

Diese Regeln stammen aus dem Architektur-Interview mit dem Projektinhaber am 05.10.2026.

## Zusammenarbeit und Freigabe

- Vor neuen Aufgaben Umfang und Plan mit dem Inhaber abstimmen. Innerhalb des freigegebenen Umfangs selbstständig bis zum geprüften Ergebnis arbeiten.
- Auf eigenen Branches arbeiten und Änderungen als Pull Requests mit verständlicher Änderungsliste bereitstellen.
- `main` niemals ohne ausdrückliche Freigabe des Inhabers verändern oder einen PR mergen. Staging-Templates und CMS-Inhalte ebenfalls erst nach Freigabe veröffentlichen. Keine Produktion-Deployments aus dieser Aufgabe ableiten.
- Das aktuelle freigegebene Vorhaben umfasst zwei Schritte: Grundlagen/Typografie und anschließend Layout/Komponenten/JavaScript. Beide dürfen vorbereitet und geprüft, aber noch nicht gemergt werden.
- Keine zusätzlichen Funktionen, Designexperimente oder Änderungen außerhalb des vereinbarten Umfangs hinzufügen.

## CSS

- Alle CSS-Dateien liegen direkt in `css/`. Die kurze `site.css` importiert sie direkt; kein CSS-Build.
- `base.css` besitzt Farbpalette, Abstandsskala, Rundungen und Schatten.
- `typography.css` besitzt Font-Dateien und sämtliche Texteinstellungen. Jede Überschriftenstufe h1–h6 hat einen zentralen Variablen-Block und gilt überall gleich. Keine Schriftüberschreibungen für einzelne Bereiche.
- H1–h6 starten mit echtem SK Modernist Bold (700). Desktop-Größen folgen einer Skala von 1,33; `clamp()` begrenzt fließende Größen. Lesetext startet bei 1.0625rem (17px bei Standard-Grundschrift) in IBM Plex Sans. Wenige benannte Textvarianten sind erlaubt.
- `surfaces.css` besitzt sämtliche Flächen, Farben, Ränder und Schattenanwendungen. `motion.css` besitzt sämtliche Effekte, Übergänge und Bewegungswerte; JavaScript liest Gestaltungswerte daraus.
- `layout.css` besitzt Container, Seitenraster und gemeinsame Struktur. `responsive.css` enthält allgemeine responsive Struktur. Spezifische Anordnung auf Handy/Tablet bleibt in der jeweiligen Komponenten-Datei.
- Jede andere CSS-Datei enthält nur Struktur und Abstände über `--space-*`. Auch `font-size: var(...)`, Farben und Transitions gehören nicht in Komponenten.
- Gemeinsame Inhaltsbreite, gleiche Seitenränder, großzügige Abstände, wenige gleichmäßige/asymmetrische Raster sowie gemeinsame Button-, Karten- und Rundungssysteme verwenden.
- Die bisherige Gestaltung ist Ausgangspunkt; sie darf sich durch saubere gemeinsame Regeln verändern. Keine Garantie auf Pixelgleichheit mit dem alten Stand abgeben.

## JavaScript und Dateien

- `src/site.js` startet Funktionsmodule. Einstellungen für Verhalten und Integration liegen in `src/config.js`; keine verstreuten Konfigurationswerte in einzelnen Modulen.
- Vorhandene Animationen und Funktionen erhalten. Header beim Herunterscrollen ausblenden und beim Hochscrollen einblenden; Menü und Tastaturfokus haben Vorrang. Ausgewählte mobile Slider bleiben horizontal nutzbar.
- Reduced Motion, Tastaturbedienung, Formular-/Kalenderintegration und lokale Fehlerbehandlung erhalten.
- Englische Datei-/Variablennamen; kurze deutsche Erklärungen oben in Dateien und an zentralen Einstellungen.
- Dateien unter `assets/fonts/`, `assets/images/` und `assets/videos/` organisieren; zugehörige Verweise prüfen. Font-Dateien aus diesem Repository laden.
- Bestehende HTML-Klassen, JavaScript-Statusklassen und Datenattribute erhalten. Gezielte Template-Anpassungen sind erlaubt, müssen aber im PR nachvollziehbar sein.

## Prüfung und Dokumentation

- Eigentümerschaft und zentrale Überschriften über die CSS-Prüfung absichern. Passende Browser-/Funktionstests sowie den JavaScript-Build ausführen.
- Keine echten Kontaktanfragen oder Buchungen für Tests versenden; externe Dienste in Tests simulieren.
- Änderungen, Prüfungsergebnisse und erforderliche Template-/CMS-Synchronisierung im PR nennen.
- `CSS-ANLEITUNG.md` kurz halten: „Was ändern → welche Datei“, einfache Beispiele und wichtigste Regeln.
