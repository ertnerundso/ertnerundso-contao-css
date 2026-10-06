# Statischer Hero: ursprüngliche Hand auf Weiß

Der Hero verwendet ausschließlich das ursprüngliche Bild `files/site/hero-sensor.jpg` (1920 × 1080). Es bleibt auf Desktop, Handy und bei reduzierter Bewegung zentriert auf weißem Hintergrund.

- Anordnung und Bildausschnitt: `css/hero.css`.
- Weißer Hintergrund und Aufhellung des Originalbilds: `css/surfaces.css`.
- Zentrierung ohne Skalierung oder Verschiebung: `css/motion.css`.
- Originaldatei im Repository: `assets/images/hero-sensor.jpg`; die aktiven CMS-Bilder werden in Contao gepflegt.

Der Hero lädt keinen Film und hat keine eigene Scroll-Fixierung, Parallax-Bewegung oder Fortschrittsanzeige. Der bisherige Hero-JavaScript-Baustein und seine ungenutzten Einstellungen wurden entfernt. Showreel, MacBook und Projekt-Slider behalten ihre Animationen und Scroll-Indikatoren.

## Contao-Einbindung

Die Hero-Bilder der deutschen und englischen Startseite (Inhalte 2181 und 2297) verwenden die ursprüngliche Datei und die Klassen `hero-media hero-media--centered`. Die übrigen CMS-Eigenschaften bleiben erhalten.

Die Vorschau liegt im persistenten Dateivolume unter `files/site/hero-white-hand-20261006-scroll/`. Das Staging-Seitentemplate lädt sie ausschließlich auf `/`, `/en` und `/en/`. Sie enthält den aktuellen main samt Abendkorrekturen und diesem statischen Hero. Unterseiten laden weiterhin GitHub Pages.

Bei einer neuen Vorschau einen neuen Versionsordner verwenden und CSS, JavaScript sowie die relativ verlinkten Schriften und Bilder gemeinsam hochladen. Beide Pfade im Staging-Seitentemplate auf diesen Ordner setzen. Dadurch lädt auch ein Browser mit zwischengespeicherten CSS-Imports den zusammengehörigen neuen Stand.

Die rechte Scroll-Skala gehört weiterhin zu Showreel, Arbeiten und MacBook-Konfigurator. Sie erscheint nur während ihrer tatsächlichen Scrollstrecke auf Desktop; Mobile und reduzierte Bewegung behalten das normale Layout ohne diese Scrollgeschichten. Die Striche sind 2 Pixel dick und bis zu 32 Pixel breit bei Standard-Grundschrift, damit sie auf großen Bildschirmen erkennbar bleiben.

Nach freigegebenem Merge und erfolgreicher Pages-Veröffentlichung die beiden Vorschau-URLs im Staging-Template auf die regulären GitHub-Pages-URLs zurücksetzen. Zwischenzeitliche Template-Änderungen erhalten.

## Prüfung

Browser-Tests prüfen, dass keine Hero-Videos angefordert werden, das Bild beim Scrollen seine Position innerhalb des Hero behält, keine Scroll-Fixierung entsteht und der Ausschnitt von 360 bis 1920 Pixeln mittig bleibt. Bestehende Tests sichern die übrigen Scrollgeschichten und das gemeinsame Seitenraster ab.
