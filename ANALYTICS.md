# Analytics auf ERTNER&SO

Die Live-Domains `ertnerundso.de` und `ertnerundso.com` laden den bestehenden
GTM-Container `GTM-M2FZPTG2` aus `templates/fe_page.html.twig`. Staging laedt
keine Tracking-Skripte. Der Container enthaelt CookieScript, die GA4-Kennung
`G-BFB4EHKRX2` und den Umami-Tracker. Diese Skripte nicht noch einmal direkt
in Contao einbinden, sonst werden Seitenaufrufe doppelt gezaehlt.

`src/analytics.js` sendet nur nach CookieScripts Performance-Einwilligung
an GA4 und Umami. Es werden keine Namen, E-Mail-Adressen, Formularfelder oder
vollstaendigen URLs uebergeben. Die Ereignisse sind:

| Ereignis | Zeitpunkt |
| --- | --- |
| `contact_intent` | Klick auf einen Kontaktlink |
| `contact_submit_success` | Kontaktservice bestaetigt die Anfrage |
| `booking_click` | Klick auf einen Cal-Terminlink |
| `email_click` | Klick auf einen E-Mail-Link |
| `showreel_play` | Bewusster Start ueber die Wiedergabeschaltflaeche |

Seitenaufrufe erfassen GA4 und Umami bereits selbst; keine eigenen
`page_view`-Ereignisse hinzufuegen. Die Kennungen und Ereignisnamen stehen
zentral in `src/config.js`.

## Vor der Live-Freigabe

- In GTM pruefen, ob Umami und andere nicht notwendige Tags erst nach
  Performance-Einwilligung geladen werden. Der aktuell veroeffentlichte
  Container enthaelt mindestens einen Umami-Tag im Initialisierungs-Trigger;
  das ist durch Frontend-Code allein nicht korrigierbar.
- In GA4 DebugView und Umami mit einer Testeinwilligung je ein Ereignis
  pruefen; nach Ablehnung duerfen keine Ereignisse ankommen.
- Den aktiven Contao-Template-Stand kontrolliert mit diesem Repository
  synchronisieren. Die Repository-Vorlage bewahrt den aktuellen GitHub-Stand
  und ergaenzt nur die Tracking-Teile der aktiven Vorlage.
