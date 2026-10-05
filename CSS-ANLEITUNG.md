# CSS ändern – die einfache Anleitung

Es gibt zwei Gruppen: **System-Dateien bestimmen das Aussehen. Komponenten-Dateien bestimmen die Anordnung.** Alle liegen in `css/`. Die kurze `site.css` lädt sie automatisch; einen CSS-Build brauchst du nicht.

## Für das Aussehen: immer eine System-Datei öffnen

| Was möchtest du ändern? | Datei | Wonach suchst du? |
| --- | --- | --- |
| Schrift, Schriftstärke, Schriftgröße oder Zeilenhöhe – auch bei einzelnen Bereichen | `typography.css` | Bereichskommentar und Selektor, z. B. „Startseite / Hero“ und `.hero h1` |
| Gemeinsame Farben | `base.css` | „FARBPALETTE“ und den verwendeten `--color-*`-Wert |
| Gemeinsame Abstände | `base.css` | „ABSTÄNDE“ und den verwendeten `--space-*`-Wert |
| Gemeinsame Rundungen und Schatten | `base.css` | „ECKEN UND RADIEN“ bzw. „SCHATTEN“ |
| Farbe für ein Element, Hintergrund, Rand, Rundung, Schatten oder Überlagerung zuweisen | `surfaces.css` | Bereichskommentar und bestehender Selektor |
| Übergang, Animation, Geschwindigkeit oder Bildbewegung | `motion.css` | Bereichskommentar und `--motion-*`-Wert |
| Seitenbreite, Container oder allgemeines Raster | `layout.css` | `.shell`, `.container`, `.grid-2-col` |
| Gemeinsame Anordnung bei kleinen Bildschirmen | `responsive.css` | Den passenden `@media`-Block |

**Sämtliche Texteinstellungen stehen in `typography.css`.** Es gibt weiterhin die normalen Elemente `body`, `h1` bis `h6` und bestehende Text-Klassen. Dazu stehen die gezielten Regeln für einzelne Bereiche in derselben Datei. Eine gezielte Regel wie `.hero h1` kann die allgemeine `h1`-Regel überschreiben.

Die System-Dateien sind nach den bisherigen CSS-Prioritäten gegliedert. Die Kommentare benennen innerhalb dieser Abschnitte die Bereiche. Ändere die vorhandene Regel an der passenden Stelle, statt eine zusätzliche Regel ans Dateiende zu hängen.

## Beispiel: h1 der Startseite ändern

Öffne **`css/typography.css`** und suche „STARTSEITE / HERO: Hauptüberschrift“. Dort findest du:

```css
.hero h1 {
  font: 400 clamp(3rem, 5.3vw, 5.25rem)/1.06 Modernist, Arial, sans-serif;
  text-transform: none;
  text-wrap: balance;
}
```

Die `font:`-Zeile legt gemeinsam fest:

- `400`: Schriftstärke; 300 ist leicht, 400 normal. Für einen anderen Schnitt muss die passende Schriftdatei bei `@font-face` vorhanden sein.
- `clamp(3rem, 5.3vw, 5.25rem)`: kleinste Größe, mitwachsende Größe und größte Größe.
- `/1.06`: Zeilenhöhe.
- `Modernist, Arial, sans-serif`: Schriftfamilie und Ersatzschriften.

Direkt danach stehen die Einstellungen für Handy und große Bildschirme. Für Desktop ab 1000px gilt:

```css
@media (min-width: 1000px) {
  .hero h1 {
    font-size: clamp(3.25rem, 4vw, 4.375rem);
  }
}
```

Ändere für die Desktop-Größe diesen vorhandenen Block. Für Handy bis 760px ändere den benachbarten Handy-Block; bis 360px gibt es eine weitere Anpassung. Alle bleiben in `typography.css`.

Bei der üblichen Browser-Einstellung entspricht `1rem` 16px. Nutzer können ihre Grundeinstellung verändern. Die bestehenden Werte wurden bei dieser Aufteilung beibehalten.

## Für Anordnung: die Komponenten-Datei öffnen

| Bereich | Datei |
| --- | --- |
| Hauptbereich der Startseite | `hero.css` |
| Kopfbereich und Logo | `header.css` |
| Aufklappbares Menü | `navigation.css` |
| Fußbereich | `footer.css` |
| Buttons und Links | `buttons.css` |
| Service- und Projektkarten | `cards.css` |
| Gemeinsame Karten, Listen und Tabellen | `containers.css` |
| Formularfelder | `forms.css` |
| Cursor, Textzeilen und Projektmedien | `media.css` |
| Statement | `statement.css` |
| Projektgalerie und Montage | `work.css` |
| Prozess | `process.css` |
| Showreel | `showreel.css` |
| Contao-Bausteine und Contao-Formulare | `contao-components.css`, `contao-forms.css` |
| Vorteile | `benefits.css` |
| Kundenstimmen und Referenzlogos | `testimonials.css` |
| Journal auf der Startseite | `journal.css` |
| Konfigurator | `configurator.css` |
| Kontakt und Fragen | `contact.css` |
| Innenseiten und News | `pages.css`, `news.css` |
| Allgemeine Contao-Module | `contao.css` |
| Impressum und Datenschutz | `legal.css` |

Diese 24 Dateien enthalten nur Anordnung: beispielsweise `display`, Grid/Flex, Breite, Höhe, Position und Abstände. Schrift-, Farb-, Rand-, Schatten- und Bewegungsregeln gehören in die System-Dateien.

## Beispiel: Abstand ändern

In `hero.css` steht beispielsweise:

```css
.hero-actions {
  gap: var(--space-12);
}
```

`var(--space-12)` bedeutet: „Verwende den gemeinsamen Abstand aus base.css“. Dort steht `--space-12: 0.75rem;`. Die Zahl bezeichnet den Vergleichswert bei einer üblichen Grundschrift von 16px; der tatsächliche Wert bleibt in rem.

Für mehr Abstand nur zwischen diesen Elementen kannst du hier etwa `var(--space-md)` wählen. Für eine Änderung an allen Stellen, die denselben Wert nutzen, änderst du dessen Definition in `base.css`.

Besondere, mitwachsende Abstände haben Bereichsnamen. Beispielsweise ist `--space-hero-margin-2` der Abstand der Hero-Überschrift. Suche den Variablennamen in `base.css`, um seinen Wert zu ändern. Mehrere Namen mit derselben Zahl am Ende sind unterschiedliche Bestandswerte, keine neuen HTML-Klassen.

`0`, `auto` und Größen wie `width` oder `height` können direkt in Komponenten stehen. Farben, Schriften und Effekte stehen ausschließlich in den System-Dateien.

## Bildschirmgrößen

`@media (max-width: 760px)` gilt bis 760px; `@media (min-width: 1000px)` gilt ab 1000px. Die bestehenden Grenzen sind 360, 520, 760/761 und 1000px. Kurze Bildschirme verwenden zusätzlich die Höhen 720 und 800px.

Schrift-Anpassungen stehen in `typography.css`, Flächen-Anpassungen in `surfaces.css`, Bewegungs-Anpassungen in `motion.css`. Gemeinsame Struktur-Anpassungen stehen in `responsive.css`; die spezifische Struktur einer Komponente bleibt in deren Datei.

Normale CSS-Variablen funktionieren nicht in `@media`-Bedingungen. Deshalb stehen diese Grenzen dort direkt. Neue Grenzen müssen auch in `scripts/css-architecture.mjs` registriert werden.

## Eine Änderung veröffentlichen

1. Öffne die zuständige Datei und ändere zunächst eine Einstellung.
2. Speichere und prüfe große und kleine Bildschirmgrößen.
3. Committe und pushe auf `main` bzw. merge deinen Änderungs-Branch.
4. Warte auf die GitHub-Pages-Veröffentlichung und lade die Website neu.

Die Architektur-Prüfung läuft automatisch auf GitHub. Lokal: einmal `npm ci`, danach `npm run check:css`. Die Prüfung erklärt dir, wenn eine Eigenschaft in der falschen Datei steht oder ein Wert fehlt. Sie verändert deine Dateien nicht.

Ändere vorhandene Klassen wie `.hero`, `.is-open`, `.is-active`, `.js-ready` sowie Datenattribute nicht einfach um: HTML und JavaScript verwenden sie. Die bisherigen optionalen Einstellungen `--button-padding`, `--button-height`, `--stack-gap` und `--showreel-scrim` bleiben unterstützt. Neue Abstands-Einstellungen verwenden `--space-*`.

`site.css` brauchst du nur für neue Datei-Imports. Für die Vorschau benötigst du einen Webserver. Beim Kopieren auf einen anderen Server gehören `site.css` und der gesamte `css/`-Ordner zusammen.
