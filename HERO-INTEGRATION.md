# Weißes Industriemotiv im Hero

Die freigegebene Higgsfield-Version mit mittiger Hand, stark unscharfer Industrieumgebung und Kamerabewegung ersetzt den bisherigen Hero-Film. Das Showreel bleibt unverändert.

- Film: `assets/videos/hero-industrial-soft.mp4`, 1276 × 720, ca. 10 Sekunden, ohne Ton. Einzelbild-Kompression ermöglicht direktes Vor- und Zurückscrollen.
- Passendes Standbild: `assets/images/hero-industrial-soft.jpg`, erster Frame desselben Films.
- Film und Poster einstellen: `src/config.js` → `assets.heroVideo` / `assets.heroPoster`.
- Bildausschnitt und Textabstände: `css/hero.css`. Gestaltung bleibt in `surfaces.css`, Bewegung in `motion.css`.

Der bestehende Desktop-Film wird weiter durch Scrollen gesteuert. Kleine Bildschirme, Touch-Geräte, Datensparen und reduzierte Bewegung behalten ein Standbild. Ein Videofehler löst die Fixierung und lässt das Standbild sichtbar. Die Klasse `hero-media--industrial` entfernt ausschließlich für dieses Motiv die alten Verschiebungen, Skalierungen, Filter und Masken.

Sobald der Film geladen ist, ersetzt er das Standbild vollständig. Beide Bilder werden nicht überblendet, damit beim Scrollen keine Doppelkonturen entstehen.

## Staging-Einbindung vom 06.10.2026

Der Inhaber hat die Einbindung auf Staging freigegeben. Die Hero-Bilder der deutschen und englischen Startseite (Contao-Inhalte 2181 und 2297) verwenden jetzt das neue Standbild und die Klassen `hero-media hero-media--industrial`. Ihre übrigen Eigenschaften und Texte bleiben erhalten.

Die geprüften Frontend-Dateien liegen im persistenten Contao-Dateivolume unter `files/site/hero-industrial/`. Das Staging-Seitentemplate lädt nur auf `/`, `/en` und `/en/` CSS und JavaScript von diesem Pfad. Unterseiten nutzen weiterhin GitHub Pages. Die Vorschau basiert auf dem aktuellen `main` plus dieser Hero-Änderung; sie veröffentlicht keine Änderungen aus dem anderen offenen PR.

`main` und Produktion wurden nicht verändert. Nach einem freigegebenen Merge und erfolgreicher Pages-Veröffentlichung kann das normale versionierte `templates/fe_page.html.twig` wieder nach Staging synchronisiert werden. Die CMS-Bilder und Zusatzklasse bleiben dabei bestehen. Vor der Synchronisierung aktuelle Änderungen am Staging-Template vergleichen und erhalten.

## Prüfung

CSS-/JavaScript-Prüfungen, JavaScript-Build und 69 Browser-Tests bestanden. Hero-Tests prüfen das echte Video-Scrubbing, denselben mittigen Ausschnitt von Film und Poster, Größen von 360 bis 1920 Pixeln, reduzierte Bewegung und Videofehler. Der lokale Testserver unterstützt dafür HTTP-Teilanfragen wie der Staging-Webserver.

Beide tatsächlichen Staging-Startseiten wurden zusätzlich im Browser geprüft: Film wird geladen und beim Scrollen vorwärts gesucht, mobile/reduzierte Darstellung bleibt mittig und ohne horizontales Überlaufen. Der Webserver liefert Video-Teilanfragen mit HTTP 206. Nach der Korrektur der Überblendung bestanden die sieben Hero-Tests erneut.
