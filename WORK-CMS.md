# Arbeiten in Contao bearbeiten

Die horizontale Arbeiten-Seite nutzt die vorhandenen Nachrichtenarchive **Arbeiten DE (1)** und **Work EN (2)**. Alle 15 Projekte der [alten Seite](https://ertnerundso.com/arbeiten/) sind übernommen; vorhandene Nachrichten und URLs werden weiterverwendet.

- Titel, Beschreibung, Vorschaubild und Veröffentlichungsdatum unter **Nachrichten → Arbeiten DE / Work EN** bearbeiten. Die Reihenfolge folgt dem Datum aufsteigend.
- Unter **Inhalt** stehen Einleitung, Bilder und Videos direkt als normale Contao-Inhaltselemente in einer flachen Liste. Die übernommenen Bilder behalten ihre Originalreihenfolge und lassen sich ersetzen, verschieben und ergänzen. Die Galerie wird vom Theme angeordnet; es gibt keine verschachtelte Elementgruppe mehr.
- Ein **Projektvideo (CDN)** ist ein natives Hyperlink-Element mit dem Template `content_element/hyperlink/eo_project_video`: Video-Adresse im URL-Feld, Beschriftung im Linktext, Vorschaubild über „Bildlink“ bearbeiten. Die vorhandenen fünf Videos bleiben auf dem bisherigen Bunny-CDN und starten erst bei Bedienung.
- Die deutschen und englischen Inhalte sind getrennt bearbeitbar; beide verwenden dieselben registrierten Mediendateien. Überschriften bleiben zentral als H3 Regular gestaltet.
- Neue veröffentlichte Projekte erscheinen automatisch in der Galerie. Projektanzahl und aktueller Titel werden aus den CMS-Einträgen ermittelt.

## Darstellung

Die Listenmodule **5 / 6** verwenden `news_work_eo`, `mod_newslist_work_eo` und die Klassen `work work-portfolio`. Die vorhandenen Lesermodule **1 / 2** verwenden weiter `news_full_eo`. Das zusätzliche englische Leserelement **2113** ist wie sein deutsches Gegenstück **2112** unsichtbar, da die Liste beim Aufruf einer Projektadresse bereits den Leser ausgibt.

Desktop: horizontale Scrollstrecke mit gestricheltem Raster, Kreuzen, sekundären Buttons, Projekttitel, Zähler, Fortschrittslinie und rechter Scroll-Skala. Handy, reduzierte Bewegung und deaktiviertes JavaScript: native horizontale Galerie. Mit JavaScript sind zusätzlich Pfeiltasten sowie Home/End nutzbar; Tab zeigt fokussierte Projekte vollständig an.

Die Detailgalerien verwenden außen `shell project-gallery`: erstes Bild und Videos über die gesamte gemeinsame Inhaltsbreite, weitere Bilder in zwei Spalten bzw. einer Spalte auf dem Handy.

## Dateien und Synchronisierung

- `assets/images/projects/manifest.json` dokumentiert die 15 Projekte und die 61 eindeutigen Originalbilder mit Quelle, Abmessungen und Prüfsumme. Die alte Seite enthält insgesamt 64 Bildplatzierungen und fünf Videos pro Sprachfassung; mehrfach verwendete Bilder werden nur einmal gespeichert.
- Die registrierten CMS-Dateien liegen unter `files/site/projects/`. Diese Dateien und die CMS-Einträge sind auf Staging bereits vorhanden; ein Git-Merge importiert keine Datenbankinhalte.
- Die Original-WebPs verwenden im CMS keine zusätzliche Bildgröße. Der aktuelle Staging-Image-Prozessor unterstützt kein WebP-Resizing; die vorhandenen komprimierten Originale werden direkt ausgeliefert und im gemeinsamen Raster angeordnet.
- `templates/` enthält die synchronisierten Template-Kopien. Nach einer freigegebenen Veröffentlichung müssen Templates, CSS und `dist/` zusammen verfügbar sein. Staging lädt seit der Veröffentlichung von PR #24 und #25 wieder `site.css` und `dist/site.js` aus dem veröffentlichten `main` auf GitHub Pages. Die frühere Vorschau unter `files/site/work-portfolio-20261006/` wird nicht mehr verwendet.

Die vorhandenen Texte, Übersetzungen, Testimonials und anderen Seitenbereiche bleiben erhalten. Die flache CMS-Struktur ist auf Staging aktiv. Hinweise zu Artikel-Templates und Layout-Rollen stehen in `CMS-STRUKTUR.md`; der Veröffentlichungsstand steht in `VEROEFFENTLICHUNG.md`.
