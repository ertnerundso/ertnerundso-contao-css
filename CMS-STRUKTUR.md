# Inhalte ohne Elementgruppen bearbeiten

Alle Seiten und Projektdetails besitzen flache Inhaltslisten. Die bisherigen 223 Elementgruppen sind aufgelöst. Die Startseite und Kontaktseiten sind in normale Contao-Artikel nach Abschnitten gegliedert, etwa Hero, Leistungen, Kundenstimmen und Kontakt. Rechtsseiten bleiben unverändert.

Texte, Bilder, Links, Nachrichtenlisten, Formulare und Medien bleiben native Contao-Inhaltselemente. Die vier RockSolid-Leistungskarten und die beiden RockSolid-Konfigurator-Szenen bleiben erlaubt und unverändert bearbeitbar. Es wurden keine HTML-Inhaltselemente als Ersatz für Gruppen angelegt.

## Redaktion

- Den passenden Abschnitt unter **Artikel** öffnen und die Inhalte direkt bearbeiten. Alle Kundenstimmen der Startseite stehen zusammen im Artikel **Kundenstimmen**.
- Neue Elemente am einfachsten von einem passenden bestehenden Element duplizieren und dessen Inhalt ersetzen. So bleibt die Layout-Zuordnung erhalten.
- Die Sortierung wirkt innerhalb des jeweiligen Layout-Bereichs. Die Reihenfolge der Seitenabschnitte folgt der Sortierung der Artikel.
- Projektbilder und Videos unter **Nachrichten → Arbeiten DE / Work EN → Inhalt** bearbeiten. Neue Elemente ohne Layout-Zuordnung bleiben in der Galerie sichtbar.
- Neue Standard-Elemente ohne Layout-Zuordnung in einem Seitenartikel bleiben am Ende des Abschnitts sichtbar. Für eine gezielte Position im Raster eine passende vorhandene Layout-Rolle verwenden.

## Theme

`templates/mod_article_eo_*.html.twig` ordnet bereits von Contao gerenderte Inhalte in den bestehenden Seitenabschnitten an. Die Templates enthalten Struktur und Klassen, keine CMS-Texte oder Datensatz-IDs. `news_full_eo` verwendet zwei gemeinsame Projektlayouts für Galerie beziehungsweise Galerie mit Kundenstimme.

Die Klasse `eo-slot-…` im Expertenfeld **CSS-ID/Klasse** bezeichnet die Position eines Elements im Layout. Projektinhalte tragen zusätzlich `eo-layout-…` für ihr gemeinsames Detail-Template. Die Partials unter `templates/layout/` geben diese Rollen als HTML-Kommentare weiter. Contao rendert weiterhin jedes Element mit seinen normalen Templates, Veröffentlichungsregeln und Metadaten. Klassische Nachrichtenmodule und Formulare werden ebenfalls berücksichtigt.

Listenmodule dürfen bei einer Projektadresse auf den nativen Nachrichtenleser wechseln. Die Artikelvarianten `mod_article_eo_modules*` geben ihre Ausgabe deshalb unverändert durch. Neue normale Projektinhalte werden auch ohne Rollenklasse ausgegeben.

Die Verschachtelung des CMS ist entfernt; die für Raster und Scrollfunktionen erforderliche HTML-Struktur bleibt im Theme erhalten. Artikel-Templates und Inhaltslisten sind getrennt: ein Git-Merge übernimmt Templates, aber keine CMS-Datenbank.

## Prüfung und Rückwechsel

Die Migration lief über die installierten Contao-Kommandos mit Versionierung und Lösch-Rücknahme innerhalb einer Datenbanktransaktion. Alle 876 verbleibenden Inhaltselemente behalten ihre IDs und Inhaltswerte. Nur Elternzuordnung, Sortierung, Zeitstempel und Layout-Klassen wurden angepasst. Vorher wurde eine private Datenbank- und Theme-Sicherung erstellt.

41 Seitenadressen in Deutsch und Englisch einschließlich aller 30 Projektdetails liefern nach dem Umbau dieselben Texte, Überschriften, Medien, Links und funktionalen Layout-Container. Signierte Medienadressen werden anhand ihrer Datei geprüft, da Ablaufzeit und Signatur pro Abruf wechseln. Die drei Konfigurator-Medien an den vorgesehenen Repository-Adressen besitzen dieselben SHA-256-Prüfsummen wie die bisherigen lokalen Dateien. Alle 48 Twig-Templates sind syntaxgültig; CSS-/JavaScript-Prüfung, Build und 116 lokale Frontend-Prüfungen sind erfolgreich.

Ein vollständiger visueller Live-Browsertest ist zusätzlich sinnvoll. Der automatisierte Staging-Browseraufruf wurde durch die URL-/Protokollrichtlinie der Browser-Sicherheitsprüfung blockiert; die Inhaltsverifikation erfolgte deshalb durch reine HTTP-Quelltextprüfung, ohne Formularübertragung oder Buchung.
