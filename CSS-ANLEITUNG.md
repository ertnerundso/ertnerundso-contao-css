# CSS ändern – die einfache Anleitung

Du bearbeitest die kleine Datei des Bereichs, den du ändern möchtest.
`site.css` lädt diese Dateien automatisch. Du musst keine große CSS-Datei
zusammensetzen und keinen CSS-Build ausführen.

## Welche Datei öffne ich?

Alle Dateien liegen im Ordner `css/`.

| Was möchtest du ändern? | Datei |
| --- | --- |
| Schriftdateien und allgemeine Textregeln | `typography.css` |
| Gemeinsame Farben, Seitenbreite und Abstände | `base.css` |
| Hauptbereich der Startseite: große Überschrift und Bild | `hero.css` |
| Kopfbereich mit Logo und Desktop-Menü | `header.css` |
| Aufklappbares Menü | `navigation.css` |
| Buttons und Text-Links | `buttons.css` |
| Service- und Projektkarten | `cards.css` |
| Kontaktformular: Felder, Ränder und Fokus | `forms.css` |
| Contao-Kontaktformular: zusätzliche Beschriftungen und Anordnung | `contao-forms.css` |
| Projektgalerie und Montagevideo | `work.css` |
| Showreel | `showreel.css` |
| Konfigurator | `configurator.css` |
| Kundenstimmen und Referenzlogos | `testimonials.css` |
| Journal auf der Startseite | `journal.css` |
| Newslisten und Artikelseiten | `news.css` |
| Kontaktbereich und Fragen | `contact.css` |
| Fußbereich | `footer.css` |
| Impressum und Datenschutz | `legal.css` |

`typography.css` enthält Schriften und allgemeine Vorgaben. Einzelne Bereiche
haben eigene Schriftgrößen in ihrer Datei. Für die große Überschrift der
Startseite öffnest du deshalb `hero.css`, für den Konfigurator `configurator.css`.
Die Kommentare in `hero.css` zeigen dir die richtige Stelle.

## Die wichtigsten CSS-Wörter

| Eigenschaft | Bedeutung |
| --- | --- |
| `font-size` | Schriftgröße |
| `font-family` | Schriftfamilie |
| `font-weight` | Schriftstärke; 300 ist leicht, 400 normal |
| `line-height` | Abstand der Textzeilen |
| `color` | Textfarbe |
| `background` | Hintergrund |
| `padding` | Abstand innerhalb eines Elements |
| `margin` | Abstand zum nächsten Element |
| `gap` | Abstand zwischen Elementen eines Grids oder einer Reihe |
| `border-radius` | Rundung der Ecken |

`font:` ist eine Kurzschreibweise für mehrere Texteinstellungen. Zum Beispiel:

```css
font: 400 1rem/1.6 Plex, Arial, sans-serif;
```

Das bedeutet: normale Schriftstärke, Schriftgröße 1rem, Zeilenhöhe 1.6,
Schriftfamilie Plex. Für eine einzelne Größe kannst du eine `font-size`-Zeile
**darunter im selben Block** ändern oder ergänzen. Die spätere Zeile gilt.
Schaue außerdem auf einen passenden Handy- oder Desktop-Abschnitt.

## Beispiel: große Überschrift auf der Startseite ändern

Suche in `hero.css` den Kommentar „Hauptüberschrift auf großen Bildschirmen“.
Dort steht:

```css
@media (min-width: 1000px) {
  .hero h1 {
    font-size: clamp(3.25rem, 4vw, 4.375rem);
  }
}
```

`clamp()` hat drei Werte: kleinste Größe, Größe abhängig vom Bildschirm,
größte Größe. Ändere zunächst nur den ersten und dritten Wert, zum Beispiel
von `3.25rem` und `4.375rem` auf `3.5rem` und `4.5rem`. Der mittlere Wert
sorgt weiterhin dafür, dass die Schrift mit der Bildschirmbreite mitwächst.

Bei der üblichen Browser-Einstellung gilt: `1rem` = 16px, `1.5rem` = 24px,
`3rem` = 48px. Nutzer können diese Grundeinstellung selbst verändern.

## Handy-Regeln erkennen

```css
@media (max-width: 760px) {
  /* Diese Regeln gelten bis 760px Bildschirmbreite. */
}
```

Regeln außerhalb solcher Blöcke bilden die Grundlage. Regeln in einem
passenden `@media`-Block ergänzen oder überschreiben sie. Teste eine Änderung
auf einem großen Bildschirm und bei schmalem Browserfenster.

## Warum stehen noch einige Variablen in base.css?

Die zusätzlichen Schriftgrößen-Variablen und die Datei `variables.css` sind
entfernt. Schriftwerte stehen jetzt direkt bei ihren Regeln.

Gemeinsame Farben und Abstände bleiben oben in `base.css`, damit du eine
Einstellung an einem Ort ändern kannst. Beispiel:

```css
--color-primary: #2455ed;
```

`var(--color-primary)` bedeutet einfach: „Benutze diesen Farbwert aus
base.css“. Für eine Änderung nur an einer bestimmten Karte oder einem Button
öffnest du dessen eigene Datei. Einige Bereiche haben eigene Farbverläufe.

## Eine Änderung veröffentlichen

1. Öffne die passende Datei und ändere zunächst eine Einstellung.
2. Speichere sie.
3. Committe und pushe die Änderung auf `main` bzw. merge deinen Änderungs-Branch.
4. Warte auf die GitHub-Pages-Veröffentlichung und lade die Website neu.
5. Prüfe große und kleine Bildschirmbreiten.

Die CSS-Prüfung läuft automatisch auf GitHub. Für einen lokalen Check kannst
du nach einmaligem `npm ci` den Befehl `npm run check:css` verwenden.
Für eine lokale Vorschau brauchst du einen Webserver. Öffne die Website
nicht direkt als Datei mit `file://`.

Ändere die bestehenden Klassen wie `.hero`, `.is-open`, `.is-active` oder
`.js-ready` nicht einfach um: HTML und JavaScript benutzen diese Namen.
`site.css` brauchst du nur anzufassen, wenn du eine neue CSS-Datei einbindest.
