# Agora Produkt V0.1

## Produktidee

Agora verbindet einen realen Ort mit einem konkreten digitalen Beteiligungsthema.

```text
Physischer Ort -> QR/Link -> Topic -> Beteiligung -> Diskussion -> Ergebnis
```

Agora ist kein Social Network, Chat, offenes Forum, Vereinsverwaltungssystem,
Buchungssystem oder Veranstaltungsportal. V0.1 bildet einen kleinen, vollständigen
Beteiligungsprozess ab: Administratoren veröffentlichen Topics, Menschen erreichen
sie direkt, beteiligen sich und können die weitere Entwicklung nachvollziehen.

## Nutzer- und Vertrauensstufen

Agora unterscheidet drei konzeptionelle Nutzerzustände:

- **Gast:** nicht angemeldet; kann öffentliche Topics über einen Deeplink oder
  QR-Code lesen.
- **Registrierter Nutzer:** mit E-Mail registriert; kann in V0.1 an öffentlichen
  Topics reagieren und kommentieren.
- **Bestätigter Nutzer:** registrierter Nutzer, dessen tatsächliche Mitgliedschaft
  in einer konkreten Community bestätigt wurde.

Die Bestätigung ist immer communitybezogen. Ein Account kann deshalb in einer
Community bestätigt und in einer anderen nicht Mitglied sein. Für normale
Reaktionen und Kommentare auf öffentlichen Topics genügt in V0.1 die Registrierung.
Die Bestätigungsstufe ist bereits im Datenmodell enthalten, erhält im Pilot aber
keine zusätzlichen Standardrechte. Der Zugriff auf community-interne Inhalte folgt
aus der Community-Mitgliedschaft selbst, unabhängig von deren Bestätigung.

Administratoren werden über eine bestätigte Community-Mitgliedschaft mit der Rolle
`admin` autorisiert.

## Profile und öffentliche Namen

Ein Account besitzt:

- offiziellen Vornamen
- offiziellen Nachnamen
- einen eindeutigen Username
- optional einen frei wählbaren Anzeigenamen

Öffentlich erscheint ausschließlich der Anzeigename. Ist keiner gesetzt, wird er
nach folgendem Schema erzeugt:

```text
Vorname + Leerzeichen + erster Buchstabe des Nachnamens + "."
```

Beispiel: `Martin T.`

Der vollständige offizielle Name wird nicht automatisch öffentlich angezeigt.
Offizielle Namen sind personenbezogene Profildaten und nur für den Account selbst
und, soweit für die Bestätigung erforderlich, zuständige Community-Administratoren
zugänglich.

## URL- und Sichtbarkeitsmodell

Die kanonische Topic-URL ist multi-community-fähig:

```text
/c/[communitySlug]/t/[topicSlug]
```

Beispiel: `/c/ltc/t/neue-sitzbank`

Ein Topic-Slug muss nur innerhalb seiner Community eindeutig sein. QR-Codes und
geteilte Links verweisen unmittelbar auf diese URL.

Jedes Topic hat eine Sichtbarkeit:

- `public`: Das einzelne veröffentlichte Topic kann ohne Login über seine URL
  gelesen werden.
- `community`: Das Topic kann nur von angemeldeten Mitgliedern der
  zugehörigen Community gelesen werden.

Ein öffentliches Topic macht weder die Community-Seite noch andere Topics oder
Aktivitäten der Community öffentlich durchsuchbar. Die Community-Seite
`/c/[communitySlug]` ist in V0.1 registrierten Nutzern vorbehalten. Sie zeigt einem
Nutzer nur Inhalte, für die er gemäß Topic-Sichtbarkeit leseberechtigt ist.

## Gemeinsame Inhalte eines Topics

Jedes Topic enthält:

- Community
- Topic-Typ
- Sichtbarkeit
- Titel
- Inhalt beziehungsweise Kontext
- optional eine Leitfrage oder konkrete Aufgabe
- optional einen Ort
- optional ein Bild oder einen Anhang
- optional einen Beteiligungszeitraum oder Termin
- deutlich sichtbaren aktuellen Status
- Reaktionen oder Antwortoptionen entsprechend dem Topic-Typ
- Kommentare und Antworten
- gegebenenfalls ein offizielles Ergebnis oder Umsetzungsupdate

## Topic-Typen

### Information

Eine Information besteht aus Titel, Inhalt sowie optional Bild oder Anhang. Nutzer
können kommentieren und mehrere der folgenden Reaktionen gleichzeitig setzen:

- `Gelesen`
- `Danke`
- `Interessiert mich`

Reaktionen können wieder entfernt werden.

### Meinung gefragt

Eine Meinungsabfrage besteht aus Titel, Leitfrage, Inhalt beziehungsweise Kontext
sowie optional Bild oder Anhang. Pro Nutzer ist genau eine der folgenden Reaktionen
gleichzeitig möglich:

- `Gute Idee`
- `Unentschieden`
- `Sehe ich kritisch`

Während der offenen Beteiligungsphase kann die Reaktion gesetzt, geändert oder
entfernt werden. Der aktuelle Stand wird live angezeigt und bleibt nach dem
Schließen nachvollziehbar.

### Abstimmung

Eine Abstimmung besteht aus Titel, Leitfrage, Inhalt beziehungsweise Kontext,
optional Bild oder Anhang und frei definierbaren Antwortoptionen. Der Administrator
legt beim Erstellen fest, ob die Abstimmung eine Einfach- oder Mehrfachauswahl ist.

Nutzer können ihre Auswahl während der offenen Beteiligungsphase ändern oder
entfernen. Die aktuellen Ergebnisse werden live angezeigt und bleiben nach dem
Schließen nachvollziehbar.

### Mitarbeit gesucht

Ein Mitarbeit-Topic besteht aus Titel, Inhalt beziehungsweise Kontext sowie
optional einer konkreten Aufgabe, einem Zeitraum oder Termin und einem Bild oder
Anhang. Nutzer können genau eine der folgenden Reaktionen setzen, ändern oder
entfernen:

- `Ich bin dabei`
- `Vielleicht`

V0.1 enthält ausdrücklich keine Einsatzplanung, Stundenverwaltung oder
Schichtplanung.

## Kommentare und Diskussion

- Kommentare sind einem konkreten Topic zugeordnet und erscheinen sofort.
- Angemeldete, zur Beteiligung berechtigte Nutzer können Kommentare beantworten.
- Nutzer können eigene Kommentare bearbeiten und löschen.
- Nach einer Bearbeitung zeigt die Oberfläche sichtbar `bearbeitet` an.
- Löschen ist eine inhaltliche Löschung: Autor und Text werden öffentlich nicht
  mehr angezeigt, der Datensatz bleibt zur Erhaltung des Threads bestehen.
- Existieren Antworten, erscheint an der ursprünglichen Position sinngemäß
  `Kommentar wurde gelöscht`.
- Administratoren der Community können problematische Kommentare ausblenden.
- Ein ausgeblendeter Kommentar bleibt für Moderationszwecke gespeichert, ist aber
  in der öffentlichen beziehungsweise Mitgliederansicht nicht sichtbar.

Kommentare sind eine themengebundene, verschachtelte Diskussion. Sie begründen
keinen allgemeinen Chat oder ein offenes Forum.

Die Datenstruktur unterstützt beliebig referenzierbare Antworten. Die Oberfläche
zeigt in V0.1 jedoch höchstens zwei visuelle Ebenen: Hauptkommentare und Antworten.
Antworten auf Antworten erscheinen im selben Antwortbereich und werden nicht weiter
eingerückt.

## Statusmodell

Technische Veröffentlichung, fachliche Beteiligung und spätere Umsetzung werden
getrennt gespeichert. In der Oberfläche wird daraus abhängig vom Topic-Typ genau
ein verständlicher Hauptstatus abgeleitet.

### Sichtbare Hauptstatus

| Topic-Typ | Statusfolge |
| --- | --- |
| Information | `Entwurf -> Aktuell -> Archiviert` |
| Meinung gefragt | `Entwurf -> Offen -> Geschlossen -> Ausgewertet` |
| Abstimmung | `Entwurf -> Offen -> Geschlossen -> Entschieden` |
| Mitarbeit gesucht | `Entwurf -> Offen -> Geschlossen` |

Für geeignete Topics kann zusätzlich ein separater Umsetzungsstatus angezeigt
werden:

```text
Geplant -> In Umsetzung -> Umgesetzt
```

Der Umsetzungsstatus ersetzt den Hauptstatus nicht. So kann eine geschlossene und
entschiedene Abstimmung beispielsweise zusätzlich `In Umsetzung` sein.

## Ergebnisse und Updates

- Bei `Meinung gefragt` und `Abstimmung` sind aggregierte Ergebnisse bereits
  während der offenen Beteiligungsphase sichtbar.
- Nach dem Schließen bleiben die Ergebnisse auf der Topic-Seite nachvollziehbar.
- Ein veröffentlichtes offizielles Ergebnis führt bei einer Meinungsabfrage zum
  sichtbaren Status `Ausgewertet` und bei einer Abstimmung zu `Entschieden`.
- Administratoren können offizielle Ergebnis- und Umsetzungsupdates veröffentlichen.
- Der aktuelle Hauptstatus und ein vorhandener Umsetzungsstatus sind auf der
  Topic-Seite deutlich sichtbar.

## V0.1-Umfang

Enthalten:

- multi-community-fähiges Datenmodell und URLs
- vier festgelegte Topic-Typen
- von Administratoren erstellte Topics
- öffentliches Lesen einzelner öffentlicher Topics per Deeplink oder QR-Code
- community-interne Topics für angemeldete Community-Mitglieder
- E-Mail-Registrierung erst bei einer konkreten Aktion
- typabhängige Einzel- und Mehrfachreaktionen
- frei definierbare Abstimmungsoptionen
- Live-Auswertungen für Meinung und Abstimmung
- Thread-Kommentare mit Antworten, Bearbeiten, Soft Delete und Moderation
- fachlicher Status, Ergebnis und optionaler Umsetzungsstatus
- Login-geschützte Community-Übersicht mit sichtbarkeitsgefilterten Topics

Nicht enthalten:

- Chat und Direktnachrichten
- Arbeitsstundenverwaltung
- Platzbuchung
- Veranstaltungen
- vollständige Mitgliederverwaltung
- freie Veröffentlichung neuer Topics durch Mitglieder
- Social Feed
- Einsatz- oder Schichtplanung

## Finale Detailentscheidungen

### Authentifizierung

- Supabase Auth per E-Mail und sechsstelligem Einmalcode (OTP)
- kein Passwort und kein Magic Link als primärer Flow
- sicherer Rücksprung zum ursprünglichen Topic und zur begonnenen Aktion
- einmalige Profilvervollständigung für neue Accounts

### Membership-Verwaltung

Community-Admins legen Memberships in V0.1 manuell an und bestätigen sie. Eine
minimale administrative Oberfläche genügt. Einladungslinks, Allowlist und
automatisierte Zuordnung sind spätere Erweiterungsmöglichkeiten und nicht Teil von
V0.1.

### Ergebnisdarstellung

`Meinung gefragt` und `Abstimmung` zeigen die Gesamtzahl teilnehmender Personen,
die absolute Auswahlzahl und den Prozentwert je Option. Bei Single Choice ist der
Prozentwert der Anteil an allen gültigen Stimmen. Bei Multiple Choice ist er der
Anteil der teilnehmenden Personen, die diese Option gewählt haben; die Prozentwerte
können sich deshalb auf mehr als 100 Prozent summieren. Individuelle Stimmen werden
nicht öffentlich angezeigt.

### Mehrfachauswahl

Multiple Choice erlaubt die Auswahl beliebig vieler vorhandener Optionen. Ein
konfigurierbares Maximum beziehungsweise `max_selections` ist nicht Teil von V0.1.

### Uploads

- erlaubte Typen: JPG, PNG, WebP und PDF
- maximal 10 MB pro Datei
- maximal fünf Anhänge pro Topic
- höchstens ein Anhang als primäres Bild
- keine Videos, Office-Dateien, ZIP-Dateien oder anderen Dateitypen
- Storage-Zugriff folgt immer der Sichtbarkeit des zugehörigen Topics
