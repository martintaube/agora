# Datumslogik in Agora

Diese Notiz definiert die kontextuelle Datumsdarstellung für Topics und
Beteiligungszeiträume. Datumsangaben sollen natürlich lesbar sein, ohne die
exakte Zeit dort zu verstecken, wo sie für eine Aktion relevant ist.

## Allgemeine Datumsdarstellung

Für vergangene Zeitpunkte gilt:

- unter 60 Minuten: relative Minuten, zum Beispiel `vor 12 Minuten`
- unter 24 Stunden: relative Stunden, zum Beispiel `vor 3 Stunden`
- am Vortag: `gestern`
- in derselben Kalenderwoche: nur der Wochentag, zum Beispiel `Montag`
- in der vorherigen Kalenderwoche: `letzten Freitag`
- im laufenden Monat außerhalb dieser Wochen: konkretes Datum, zum Beispiel
  `2. April`
- ab mehr als 30 Tagen im selben Jahr: nur der Monat, zum Beispiel `März`
- in einem anderen Jahr: Monat plus Jahr, zum Beispiel `Oktober 2025`

Diese Staffelung ist die Zieldefinition. Sie wird schrittweise überall dort
eingesetzt, wo Agora vergangene Aktivität oder Updates anzeigt.

## Beteiligungsende

Bei einer Beteiligungsfrist werden immer zwei Informationen angeboten:

1. der exakte Zeitpunkt mit Datum, Uhrzeit und Zeitzone der Community
2. eine leicht erfassbare Restlaufzeit

Für die Restlaufzeit gilt:

- unter 60 Minuten: `noch 12 Minuten`
- unter 24 Stunden: `noch 3 Stunden`
- unter 14 Tagen: `noch 2 Tage`
- unter 30 Tagen: `noch 3 Wochen`
- ab 30 Tagen: `noch über einen Monat`, `noch über zwei Monate` und so weiter
- nach Fristende: `Beteiligung beendet`

Angefangene Einheiten werden aufgerundet, damit eine noch laufende Beteiligung
nicht zu früh als abgelaufen wirkt. Nach Fristende verschwindet das
Beteiligungsformular. Stattdessen erscheint oberhalb der Ergebnisse eine
deutsche Hinweisbox mit dem exakten Endzeitpunkt.

Für V0.1 wird `Europe/Berlin` als Anzeigezeitzone verwendet. Die Datenbank
speichert Zeitpunkte weiterhin als `timestamptz`. Werte aus `datetime-local`
werden vor dem Speichern ausdrücklich von Berliner Ortszeit nach UTC konvertiert;
beim Bearbeiten erfolgt die inverse Konvertierung.

## Frist und manueller Status

Die Frist ist der geplante automatische Endzeitpunkt. Der Status `Geschlossen`
ist zusätzlich eine manuelle Sofortsperre, etwa wenn eine Beteiligung vorzeitig
beendet werden muss oder ohne Frist angelegt wurde. Eine manuelle Schließung hat
Vorrang vor einer zukünftigen Frist. In diesem Fall zeigt die Nutzeransicht keine
Restlaufzeit, sondern den Hinweis, dass die Beteiligung vorzeitig geschlossen
wurde.
