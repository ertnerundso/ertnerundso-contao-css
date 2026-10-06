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

## Live-Umschaltung am 06.10.2026

Der Inhaber hat beide Domains freigegeben. `https://ertnerundso.com` und `https://ertnerundso.de` bedienen dieselbe neue Contao-Installation. Die `.de` bleibt direkt erreichbar. `www` wird jeweils auf die entsprechende Adresse ohne `www` umgeleitet, HTTP auf HTTPS. DNS und E-Mail-Einträge bleiben erhalten; die Umschaltung erfolgt im bestehenden Reverseproxy.

Die Produktionsinstallation `ertnerundso-contao-live` hat eine eigene Datenbank, eigene persistente Dateispeicher und die flache CMS-Struktur. Die beiden Sprachwurzeln besitzen eine leere Domain-Zuordnung und SSL, sodass Contao beide freigegebenen Hosts bedienen kann. Die vorhandenen öffentlichen Router begrenzen die erreichbaren Domains. Die neue Installation verwendet getrennte Zugangsschlüssel und einen getrennten OAuth-/MCP-Zustand. Die MCP-/OAuth-Routen der Produktion bleiben am Proxy privat; der native Contao-Zugriff über die lokale CLI bleibt möglich.

Contao erzeugt weiterhin alle Canonical-Pfade einschließlich der Nachrichten- und Projektleser selbst. Das Seitentemplate vereinheitlicht nur den `.de`-Host auf `.com`. Die native `.com`-Sitemap enthält beide Sprachen, alle übernommenen Projekte und die Journalartikel. Nur die `.de`-Sitemap leitet auf die `.com`-Sitemap weiter. Staging bleibt in seiner getrennten Installation auf `staging.ertnerundso.de` und behält seinen Indexierungsschutz.

Vor der Umschaltung wurden Datenbank, Templates, Konfiguration, Produktions-Compose und die bisherige Proxy-Konfiguration zusätzlich privat gesichert und die gzip-Integrität geprüft. Alle 82 privaten Seitenaufrufe (41 Adressen je Domain) liefern HTTP 200, genau eine passende `.com`-Canonical-Adresse und keinen Staging-Indexierungsschutz. Alle vier Hostnamen besitzen gültige HTTPS-Zertifikate. Die Umschaltung erfolgte am 06.10.2026 um 15:26 Uhr Europe/Berlin; beide Startseiten liefern am HTTPS-Origin die neue Website. Nach der Umschaltung liefern alle 77 Sitemap-Seiten unter beiden Domains (154 HTTPS-Aufrufe) HTTP 200 mit genau einer passenden Canonical-Adresse, ohne Elementgruppen und ohne `noindex`. HTTP-/`www`-Weiterleitungen, die `.de`-Sitemap-Weiterleitung sowie die Sperre der öffentlichen MCP-Schnittstelle sind geprüft. Öffentliche Quellenabrufe der Arbeiten-Seite sind auf beiden Domains erreichbar.

Die dauerhafte Umschaltung liegt in einer separaten Traefik-Dateikonfiguration mit höherer Router-Priorität. Die Compose-Konfiguration und Router-Datei bleiben privat auf dem Server; sie enthalten keine öffentlichen Repository-Artefakte. Die bisherige Produktionsinstallation läuft für einen schnellen Rückwechsel weiter. Zum Rückwechsel wird ausschließlich die neue Router-Datei aus dem beobachteten Proxy-Verzeichnis entfernt; die bisherigen Docker-Router übernehmen danach wieder. Die geprüften vollständigen Sicherungen bleiben erhalten.

## Gemeinsame Abschlussprüfung

Der letzte echte Formularabschluss mit Cloudflare-Prüfung, der Eingang im Postfach sowie eine gegebenenfalls ausdrücklich freigegebene Testbuchung sind weiterhin im normalen Browser gemeinsam zu prüfen. Es wurden für die Veröffentlichung keine echten Kontaktanfragen oder Buchungen erzeugt. Der Schutz wurde nicht deaktiviert. Die gemeinsamen visuellen Feinprüfungen erfolgen auf den öffentlichen Domains.
