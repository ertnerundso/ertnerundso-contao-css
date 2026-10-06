# Stand der Veröffentlichung am 06.10.2026

## Erledigt

- Alle 223 Elementgruppen sind auf Staging aufgelöst. Die acht betroffenen Seiten verwenden flache Inhalte in normalen Abschnittsartikeln; alle 30 Projektdetails behalten ihre Bilder und Videos in flachen Nachrichten-Inhaltslisten. Die 876 verbleibenden Inhaltselemente behalten ihre Inhaltswerte und IDs. RockSolid bleibt ausdrücklich zugelassen; vier Leistungskarten und zwei Konfigurator-Szenen sind erhalten. Details stehen in `CMS-STRUKTUR.md`.
- Der Stand vor dem Umbau ist zusätzlich privat als Datenbank- und Theme-Sicherung abgelegt und auf gzip-Integrität geprüft. Die bestehende vollständige Sicherung einschließlich Dateien und alter Produktions-Konfiguration bleibt erhalten.

- PR #24 (Originalbilder Mikroskop und Platine) und PR #25 (15 übernommene Arbeiten und kleinere statische Hand) sind in `main`. Die zugehörigen Frontend-Prüfungen und GitHub-Pages-Veröffentlichungen sind erfolgreich.
- Staging lädt die veröffentlichten Frontend-Dateien aus `main`. Die Contao-Templates und CMS-Inhalte sind separat synchronisiert; ein Git-Merge überträgt keine Datenbank und keine CMS-Dateien.
- Der englische Kontaktbutton im Abschluss der Montageanleitungen verwendet jetzt `/en/kontakt/#anfrage` statt des nicht vorhandenen `/en/contact/#request` (Inhaltselement 2643).
- Alle 13 Seiten einschließlich beider Sprachwurzeln erzeugen Canonical-Adressen automatisch. Die manuell eingetragenen alten Domain-Verweise wurden aus `canonicalLink` entfernt; `enableCanonical` ist aktiviert. Die Änderung wurde über die native Contao-Schnittstelle versioniert.
- `fe_page.html.twig` setzt ausschließlich für `staging.ertnerundso.de` die Robots-Angabe `noindex,nofollow`. Andere Domains behalten die in Contao eingestellten Robots-Angaben. Diese Template-Änderung ist auf Staging bereits aktiv und auf Twig-Syntax geprüft.

## Geprüft

- Nach dem Auflösen liefern 41 deutsche/englische Seitenadressen einschließlich aller 30 Projektdetails dieselben Texte, Überschriften, Medien, Links und funktionalen Layout-Container. Contao meldet null Elementgruppen und null unter anderen Inhaltselementen gespeicherte Inhalte. Alle 48 Twig-Templates, CSS-/JavaScript-Prüfung, Build und 116 lokale Frontend-Prüfungen sind erfolgreich.

- 49 interne Seiten- und Projektlinks liefern HTTP 200. 13 gerenderte Seiten in Deutsch/Englisch einschließlich Projektleser liefern passende Canonical-Adressen und den Staging-Indexierungsschutz.
- Der Kontaktservice antwortet auf seinen Healthcheck; die erlaubten Origins enthalten Staging sowie `.com` und `.de` mit und ohne `www`.
- SMTP-Anmeldung und verschlüsselte Verbindung funktionieren. Eine ausdrücklich als Website-Test gekennzeichnete interne Mail wurde vom SMTP-Server für `info@ertnerundso.com` angenommen. Der Eingang im Postfach muss noch bestätigt werden; SMTP-Annahme allein bestätigt keine Zustellung in den Posteingang.
- Der eingebettete Kalender lädt den vorhandenen Termin „30 min meeting“, Zeitzone Europe/Berlin und freie Uhrzeiten. Ein tatsächlich angelegter Termin einschließlich Bestätigung und Stornierung ist noch nicht geprüft. Es wurde keine echte Buchung erzeugt.
- Kontaktvalidierung, simulierte erfolgreiche/fehlgeschlagene Formularübertragung und Kalender-Fallback werden durch die vorhandenen lokalen Browserprüfungen abgedeckt. Die tatsächliche Cloudflare-Sicherheitsprüfung lieferte im automatisierten Browser keinen fertigen Token; die abschließende manuelle Prüfung bleibt erforderlich. Der Schutz wurde nicht umgangen oder deaktiviert.

## Vor der Umschaltung

1. Hauptdomain mit dem Inhaber festlegen: bisherige `.com` ersetzen oder `.de` verwenden. Bis dahin bleibt die bestehende Produktion unverändert.
2. Sicherung von Contao-Datenbank, Dateien, Templates und Konfiguration sowie der bisherigen Produktions-Konfiguration vollständig prüfen. Sicherungen enthalten vertrauliche Daten und gehören nicht in dieses Repository oder einen öffentlichen Webpfad.
3. Den geprüften CMS-Stand mit seinen registrierten Dateien und synchronisierten Templates in eine getrennte Produktionsinstallation übernehmen. Persistente Datenvolumes und die getrennte Staging-Installation erhalten.
4. Contao-Sprachwurzeln auf die gewählte Hauptdomain setzen. Alte Domains und `www` auf die Hauptdomain umleiten; bestehende Projekt- und Journaladressen erhalten.
5. Auf der Zielinstallation Cache/Sitemap neu erzeugen und HTTPS, Robots-Angaben, Canonical-Adressen, Sitemap-Domain, Sprachwechsel und alte URLs prüfen. Staging behält `noindex,nofollow`; Produktion darf diese Staging-Angabe nicht übernehmen.
6. Sicherheitsprüfung und Formularübertragung im normalen Browser abschließen, Eingang der Testmail bestätigen und den Buchungsabschluss prüfen. Bei einem ausdrücklich freigegebenen echten Buchungstest den Testtermin anschließend stornieren.
7. Erst nach diesen Prüfungen den Webverkehr auf die neue Installation umschalten. Die bisherige Installation für einen Rückwechsel erhalten und danach die wichtigsten Seiten und Integrationen erneut prüfen.

Die Domain-Umschaltung ist mit dem Stand dieser Vorbereitung noch nicht erfolgt.
