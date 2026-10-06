# Statischer Hero: ursprüngliche Hand auf Weiß

Der Hero verwendet ausschließlich das ursprüngliche Bild `files/site/hero-sensor.jpg` (1920 × 1080). Es bleibt auf Desktop, Handy und bei reduzierter Bewegung zentriert auf weißem Hintergrund.

- Anordnung und Bildausschnitt: `css/hero.css`.
- Weißer Hintergrund und Aufhellung des Originalbilds: `css/surfaces.css`.
- Zentrierung ohne Skalierung oder Verschiebung: `css/motion.css`.
- Originaldatei im Repository: `assets/images/hero-sensor.jpg`; die aktiven CMS-Bilder werden in Contao gepflegt.

Der Hero lädt keinen Film und hat keine eigene Scroll-Fixierung, Parallax-Bewegung oder Fortschrittsanzeige. Der bisherige Hero-JavaScript-Baustein und seine ungenutzten Einstellungen wurden entfernt. Showreel, MacBook und Projekt-Slider behalten ihre Animationen und Scroll-Indikatoren.

## Contao-Einbindung

Die Hero-Bilder der deutschen und englischen Startseite (Inhalte 2181 und 2297) verwenden die ursprüngliche Datei und die Klassen `hero-media hero-media--centered`. Die übrigen CMS-Eigenschaften bleiben erhalten.

Die Vorschau liegt im persistenten Dateivolume unter `files/site/hero-white-hand/`. Das Staging-Seitentemplate lädt sie ausschließlich auf `/`, `/en` und `/en/`. Sie enthält den aktuellen main samt Abendkorrekturen und diesem statischen Hero. Unterseiten laden weiterhin GitHub Pages.

Nach freigegebenem Merge und erfolgreicher Pages-Veröffentlichung die beiden Vorschau-URLs im Staging-Template auf die regulären GitHub-Pages-URLs zurücksetzen. Zwischenzeitliche Template-Änderungen erhalten.

## Prüfung

Browser-Tests prüfen, dass keine Hero-Videos angefordert werden, das Bild beim Scrollen seine Position innerhalb des Hero behält, keine Scroll-Fixierung entsteht und der Ausschnitt von 360 bis 1920 Pixeln mittig bleibt. Bestehende Tests sichern die übrigen Scrollgeschichten und das gemeinsame Seitenraster ab.
