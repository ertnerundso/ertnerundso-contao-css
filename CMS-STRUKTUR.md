# Wiederhergestellte Contao-Struktur

Am 06.10.2026 wurde die Umstellung auf flache Inhaltslisten auf ausdrücklichen Wunsch des Inhabers zurückgenommen. Die 223 ursprünglichen Elementgruppen ordnen die 876 vorhandenen Inhalte wieder an. Die acht betroffenen Artikel und die Inhaltsstruktur der Projektdetails entsprechen der Sicherung vor dem Umbau.

RockSolid Custom Elements, RockSolid Slider und Frontend Helper bleiben installiert. Die vorhandenen vier Leistungskarten und zwei Konfigurator-Szenen verwenden ihre ursprünglichen Templates. Die Ersatz-Templates für flache Artikel und deren globale Twig-Overrides wurden entfernt.

Texte, Medien, Inhaltselement-IDs und die bestehenden Design-Dateien bleiben erhalten. Die Wiederherstellung verwendet die nativen Contao-Kommandos für Undo, Inhaltsanordnung, Artikel und Templates. Vorher wurde der aktuelle Stand beider Installationen separat gesichert.

Produktion bedient weiterhin `ertnerundso.com` und `ertnerundso.de`; Staging bleibt getrennt und besitzt seinen Indexierungsschutz. Die Wiederherstellung ändert weder Domain-Routing noch E-Mail-Konfiguration.
