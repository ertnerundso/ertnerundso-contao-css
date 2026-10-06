# Originale Hand auf weißem Hintergrund

Das ursprüngliche Handmotiv ersetzt auf Wunsch des Inhabers die Industrieaufnahme. Die aktuelle Zentrierung und die Scroll-Steuerung bleiben bestehen.

- Film: `assets/videos/hero-release.mp4`, 1280 × 720, ca. fünf Sekunden, ohne Ton.
- Standbild: `assets/images/hero-sensor.jpg`, 1920 × 1080.
- Quellen ändern: `src/config.js` → `assets.heroVideo` / `assets.heroPoster`.
- Anordnung: `css/hero.css`; Darstellung: `css/surfaces.css`; Bewegungen: `css/motion.css`.

Die Klasse `hero-media--centered` erhält den mittigen Bildausschnitt, dieselben Textabstände und die aktuelle Medienfläche. Die vorherige Klasse `hero-media--industrial` bleibt als kompatible Variante bestehen. Der helle Hintergrund des Originalmotivs wird per CSS an den weißen Seitenhintergrund angeglichen.

Desktop-Nutzer steuern den vorhandenen Film durch Scrollen. Kleine Bildschirme, Touch-Geräte, Datensparen und reduzierte Bewegung verwenden das Standbild. Ein geladener Film ersetzt das Bild vollständig, um Doppelkonturen zu vermeiden. Bei Videofehlern bleiben Standbild und normale Seitennavigation erhalten.

## Contao-Einbindung

Die Hero-Bilder der deutschen und englischen Startseite (Inhalte 2181 und 2297) verwenden wieder die ursprüngliche Datei `files/site/hero-sensor.jpg` und die Klassen `hero-media hero-media--centered`. Die weiteren CMS-Eigenschaften und Texte werden erhalten.

Für die Vorschau dieser Korrektur liegen die Frontend-Dateien im persistenten Dateivolume unter `files/site/hero-white-hand/`. Das Staging-Seitentemplate lädt sie ausschließlich auf `/`, `/en` und `/en/`. Diese Vorschau enthält den aktuellen `main` samt den Abendkorrekturen und den Austausch des Hero-Motivs. Unterseiten laden weiterhin den veröffentlichten Stand von GitHub Pages.

Nach einem freigegebenen Merge und erfolgreicher Pages-Veröffentlichung nur die beiden Vorschau-URLs im Staging-Template zurück auf die regulären GitHub-Pages-URLs setzen. Dabei zwischenzeitliche Template-Änderungen erhalten. Das ursprüngliche CMS-Bild und die Zentrierung bleiben bestehen.

## Prüfung

Hero-Tests prüfen den tatsächlichen Originalfilm, Scroll-Scrubbing, Bildausschnitte von 360 bis 1920 Pixeln, reduzierte Bewegung und Videofehler. Die Tests für Scroll-Indikatoren und gemeinsame Layoutbreiten werden bei diesem Motivwechsel ebenfalls ausgeführt. Showreel, MacBook, Footer, Kundenstimmen und das gemeinsame Seitenraster bleiben unverändert.
