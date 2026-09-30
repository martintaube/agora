# Agora Architektur V0.1

## Aktueller Projektstand

Das Repository enthält eine lauffähige Next.js-Anwendung, Supabase-Migrationen,
synthetische Pilotdaten sowie Unit- und pgTAP-Tests. Dieses Dokument beschreibt
die verbindliche V0.1-Architektur; die Cloud-Inbetriebnahme ist separat in
`docs/supabase-cloud.md` dokumentiert.

## Architekturprinzipien

- Öffentliche Topic-Seiten sind ohne Login direkt per QR-Code oder Link lesbar.
- Authentifizierung erscheint erst bei einer geschützten Seite oder konkreten Aktion.
- Community-Zugehörigkeit, Rollen und Bestätigung sind communitybezogen.
- Autorisierung wird serverseitig und zusätzlich durch Supabase Row Level Security
  (RLS) erzwungen.
- Öffentliche Auswertungen geben Aggregationen, aber keine individuellen Stimmen
  oder offiziellen Profildaten preis.
- Topic-Typen teilen sich ein generisches Options- und Auswahlmodell.
- Statusdimensionen werden getrennt gespeichert; sichtbare Begriffe werden daraus
  typabhängig abgeleitet.

## Informationsarchitektur

Zentrale Objekte:

- **Community:** reale Gruppe wie Verein, Nachbarschaft oder Genossenschaft
- **Profil:** Accountdaten und kontrollierter öffentlicher Anzeigename
- **Membership:** Community-Zugehörigkeit, Bestätigung und Rolle eines Accounts
- **Place:** optionaler realer Ort innerhalb einer Community
- **Topic:** konkreter Inhalt oder Beteiligungsanlass innerhalb einer Community
- **Topic option:** auswählbare Reaktion oder frei definierte Abstimmungsantwort
- **Topic selection:** Auswahl einer Option durch einen Nutzer
- **Comment:** themengebundener Kommentar oder Antwort
- **Topic attachment:** optionales Bild oder Dokument
- **Topic update:** offizielles Ergebnis oder Umsetzungsupdate

## User Flows

### Öffentliches Topic lesen

1. Ein Gast scannt einen QR-Code oder öffnet einen Deeplink.
2. Die App öffnet direkt `/c/[communitySlug]/t/[topicSlug]`.
3. Ein veröffentlichtes Topic mit Sichtbarkeit `public` wird ohne Login angezeigt.
4. Der Gast sieht Inhalt, Status, sichtbare Kommentare, aggregierte Beteiligung und
   offizielle Updates.

### Registrieren und beteiligen

1. Der Gast wählt eine Reaktion, Abstimmungsoption oder die Kommentarfunktion.
2. Die App öffnet die E-Mail-Anmeldung, sendet einen sechsstelligen OTP und erhält
   die vollständige Topic-URL sowie die beabsichtigte Aktion als sicheren
   Rücksprungzustand.
3. Nach erfolgreicher OTP-Prüfung vervollständigt ein neuer Nutzer einmalig sein
   Profil und kehrt anschließend zum Topic zurück.
4. Die ursprünglich beabsichtigte Aktion kann fortgesetzt werden.
5. Solange die Beteiligung offen ist, kann der Nutzer seine Auswahl gemäß dem
   Topic-Typ ändern oder entfernen.

### Community-Inhalte lesen

1. Ein Nutzer öffnet `/c/[communitySlug]`.
2. Ohne Session wird er zur Anmeldung und danach zur ursprünglichen URL geführt.
3. Jeder registrierte Nutzer kann die Community-Seite öffnen. Die Topic-Liste zeigt
   öffentliche Topics und zusätzlich nur dann community-interne Topics, wenn eine
   Membership für diese Community besteht.
4. Beim direkten Aufruf eines Topics mit Sichtbarkeit `community` ist ebenfalls
   eine Membership erforderlich. Ob sie bereits bestätigt ist, verändert die
   Standardrechte in V0.1 nicht.

### Topic administrieren

1. Ein bestätigter Community-Admin öffnet den geschützten Adminbereich.
2. Er erstellt das Topic, Optionen, Anhänge und Beteiligungsregeln als Entwurf.
3. Er veröffentlicht das Topic und erzeugt beziehungsweise kopiert die kanonische
   QR-URL.
4. Er schließt die Beteiligung, veröffentlicht ein Ergebnis und kann einen
   Umsetzungsstatus sowie weitere Updates pflegen.
5. Er kann problematische Kommentare ausblenden.

## Routes

Topic und Community:

- `/c/[communitySlug]/t/[topicSlug]` - kanonische Topic-Seite; je nach Sichtbarkeit
  öffentlich oder nur für angemeldete Community-Mitglieder
- `/c/[communitySlug]` - Login-geschützte Community-Übersicht; Topics werden nach
  Sichtbarkeit und Membership gefiltert

Authentifizierung und Profil:

- `/auth/sign-in` - E-Mail-Anmeldung mit geprüftem `next`-Parameter
- `/auth/callback` - Abschluss des Supabase-Auth-Flows
- `/profile` - eigenes Profil und öffentlicher Anzeigename

Administration:

- `/c/[communitySlug]/admin` - Topic-Übersicht der Community
- `/c/[communitySlug]/admin/topics/new` - Topic erstellen
- `/c/[communitySlug]/admin/topics/[topicSlug]` - Topic, Optionen, Status und Updates
  bearbeiten

Schreiboperationen sollten bevorzugt als Next.js Server Actions umgesetzt werden.
Route Handler sind sinnvoll für Auth-Callbacks, Uploads oder Endpunkte, die nicht an
eine konkrete React-Ansicht gebunden sind.

## Komponenten

Topic-Seite:

- `TopicHeader`, `TopicTypeBadge`, `TopicStatusBadge`, `ImplementationStatusBadge`
- `TopicMeta`, `TopicContent`, `TopicAttachments`
- `ParticipationPanel`
- `TopicOptionList` für vordefinierte Reaktionen und Abstimmungsoptionen
- `LiveResults`
- `CommentComposer`, `CommentThread`, `CommentItem`, `CommentActions`
- `OfficialUpdateList`
- `ActionAuthGate` für eine konkrete Beteiligungsaktion

Administration:

- `AdminShell`, `TopicTable`, `TopicForm`
- `TopicTypeFields`, `OptionEditor`, `SelectionModeControl`
- `PublicationControl`, `ParticipationControl`, `ImplementationStatusControl`
- `OfficialUpdateForm`, `CommentModerationActions`, `QrLinkPanel`

Gemeinsame UI-Bausteine werden erst extrahiert, wenn mehrere konkrete Ansichten sie
benötigen.

## Supabase-Datenmodell

### Enums

Das bisher vorgeschlagene feste `reaction_value`-Enum entfällt. Reaktionswerte und
Abstimmungsantworten sind Daten in `topic_options` und können dadurch typabhängig
und bei Abstimmungen frei definiert werden.

Empfohlene kleine, stabile Enums:

```sql
create type community_role as enum ('member', 'admin');
create type topic_type as enum ('information', 'opinion', 'vote', 'collaboration');
create type topic_visibility as enum ('public', 'community');
create type publication_status as enum ('draft', 'published', 'archived');
create type participation_status as enum ('open', 'closed');
create type selection_mode as enum ('single', 'multiple');
create type implementation_status as enum ('planned', 'in_progress', 'implemented');
create type topic_update_kind as enum ('result', 'implementation');
```

Es gibt bewusst kein Enum für sichtbare Statuslabels wie `Ausgewertet` oder
`Entschieden`. Diese Begriffe hängen vom Topic-Typ ab und werden aus stabilen
Zustandsfeldern abgeleitet.

### `profiles`

Ergänzt `auth.users`; offizielle Namen dürfen nicht über öffentliche Abfragen
ungefiltert lesbar sein.

```text
id uuid primary key references auth.users(id) on delete cascade
first_name text not null
last_name text not null
username text not null unique
display_name text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Der öffentliche Name wird serverseitig oder in einer eingeschränkten View/Funktion
berechnet: getrimmter `display_name`, andernfalls `first_name || ' ' ||
left(last_name, 1) || '.'`. Öffentliche Topic-Abfragen liefern nur Nutzer-ID und
diesen berechneten Namen, niemals automatisch den vollständigen offiziellen Namen.

### `communities`

```text
id uuid primary key
name text not null
slug text not null unique
member_visibility_label text not null default 'Community'
member_visibility_help_text text not null default 'nur für angemeldete Mitglieder dieser Gemeinschaft lesbar.'
created_at timestamptz not null default now()
```

`member_visibility_label` und `member_visibility_help_text` bilden die
mandantenspezifische UI-Bezeichnung und Erklärung für `visibility = 'community'`.
Beim LTC lauten sie `Nur für Mitglieder` und `nur für angemeldete Mitglieder des
LTC lesbar.`. Der stabile interne Enum-Wert und die RLS-Regeln bleiben davon
unberührt.

### `memberships`

```text
id uuid primary key
community_id uuid not null references communities(id) on delete cascade
user_id uuid not null references auth.users(id) on delete cascade
role community_role not null default 'member'
verified_at timestamptz
verified_by uuid references auth.users(id)
created_at timestamptz not null default now()
unique (community_id, user_id)
```

Ein registrierter Nutzer existiert in `auth.users` und `profiles`. Eine Membership
bildet die Beziehung zu genau einer Community ab. `verified_at is not null` bedeutet
`bestätigter Nutzer` in dieser Community, verleiht im Pilot aber noch keine
zusätzlichen Standardrechte. Eine Admin-Rolle ist nur zusammen mit einer bestätigten
Membership gültig; das wird beim Schreiben per Constraint, Trigger oder
ausschließlich kontrollierter Admin-Funktion erzwungen.

### `places`

```text
id uuid primary key
community_id uuid not null references communities(id) on delete cascade
name text not null
description text
created_at timestamptz not null default now()
unique (community_id, id)
```

### `topics`

```text
id uuid primary key
community_id uuid not null references communities(id) on delete cascade
place_id uuid
type topic_type not null
visibility topic_visibility not null default 'public'
title text not null
slug text not null
guiding_question text
content text not null
task text
selection_mode selection_mode
publication_status publication_status not null default 'draft'
participation_status participation_status
participation_starts_at timestamptz
participation_ends_at timestamptz
event_starts_at timestamptz
event_ends_at timestamptz
result_published_at timestamptz
implementation_status implementation_status
published_at timestamptz
created_by uuid not null references auth.users(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
unique (community_id, slug)
foreign key (community_id, place_id) references places(community_id, id)
```

Wichtige Regeln:

- `information` verwendet `selection_mode = 'multiple'`.
- `opinion` und `collaboration` verwenden `selection_mode = 'single'`.
- `vote` verlangt eine explizite Einzel- oder Mehrfachauswahl.
- `participation_status` ist für `information` nicht erforderlich; bei den drei
  Beteiligungstypen ist es `open` oder `closed`.
- `result_published_at` ist nur für `opinion` und `vote` relevant und darf erst bei
  geschlossener Beteiligung gesetzt werden.
- Zeitliche Felder allein öffnen oder schließen keine Beteiligung. Eine geplante
  Serveraktion kann den expliziten Status anhand der Zeiten umstellen; maßgeblich
  für Schreibrechte bleibt `participation_status`.
- Ein Topic darf nur einen Place derselben Community referenzieren.

Diese typabhängigen Regeln sollten zentral in validierten Server Actions und, wo
praktikabel, zusätzlich durch Datenbank-Constraints oder Trigger abgesichert werden.

### `topic_options`

Enthält sowohl die festgelegten Reaktionen als auch frei definierte
Abstimmungsoptionen.

```text
id uuid primary key
topic_id uuid not null references topics(id) on delete cascade
key text not null
label text not null
position integer not null
created_at timestamptz not null default now()
unique (topic_id, id)
unique (topic_id, key)
unique (topic_id, position)
```

Beispiele für `key`: `read`, `thanks`, `interested`, `positive`, `neutral`,
`critical`, `joining`, `maybe`. Bei Abstimmungen wird ein stabiler generierter Key
verwendet; der sichtbare Text liegt in `label`. Vordefinierte Optionen werden beim
Erstellen eines Topics serverseitig angelegt. Abstimmungen haben zwei bis sieben
Antwortoptionen; die Obergrenze wird im Formular und serverseitig durchgesetzt.
Optionen sollen nach der ersten Teilnahme nicht gelöscht oder semantisch verändert
werden, damit Ergebnisse nachvollziehbar bleiben.

### `topic_selections`

Jede Zeile bedeutet: Ein Nutzer hat eine Option gewählt.

```text
topic_id uuid not null references topics(id) on delete cascade
option_id uuid not null
user_id uuid not null references auth.users(id) on delete cascade
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
primary key (topic_id, option_id, user_id)
foreign key (topic_id, option_id)
  references topic_options(topic_id, id) on delete cascade
```

Damit sind mehrere gleichzeitige Reaktionen bei `information` und Mehrfachauswahl
bei `vote` ohne Sondertabellen möglich. Für `selection_mode = 'single'` muss eine
transaktionale Datenbankfunktion die bisherige Auswahl ersetzen und sicherstellen,
dass pro `(topic_id, user_id)` höchstens eine Zeile existiert. Ein partieller Unique
Index kann diese typabhängige Regel nicht allein ausdrücken. Dieselbe Funktion
prüft Authentifizierung, Topic-Sichtbarkeit, offene Beteiligung und Zugehörigkeit der
Option zum Topic.

Live-Ergebnisse werden per View oder `security definer`-RPC nach Option aggregiert.
Clients erhalten die Zahl unterschiedlicher teilnehmender Nutzer, absolute Counts
je Option und berechnete Prozentwerte, aber keine Liste der abstimmenden Nutzer.
Bei Single Choice ist der Nenner die Zahl aller gültigen Auswahlen. Bei Multiple
Choice ist der Nenner die Zahl unterschiedlicher teilnehmender Nutzer; dadurch darf
die Summe der Optionsprozente über 100 Prozent liegen. Multiple Choice hat in V0.1
keine Auswahlobergrenze und kein Feld `max_selections`.

### `topic_comments`

```text
id uuid primary key
topic_id uuid not null references topics(id) on delete cascade
user_id uuid references auth.users(id) on delete set null
parent_comment_id uuid
body text
edited_at timestamptz
deleted_at timestamptz
hidden_at timestamptz
hidden_by uuid references auth.users(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
unique (topic_id, id)
foreign key (topic_id, parent_comment_id)
  references topic_comments(topic_id, id)
```

Regeln für Kommentare:

- `parent_comment_id` ermöglicht Thread-Antworten und kann nur auf einen Kommentar
  desselben Topics zeigen.
- Die UI normalisiert die Darstellung auf zwei visuelle Ebenen. Antworten auf
  Antworten werden dem Antwortbereich des jeweiligen Hauptkommentars zugeordnet
  und nicht tiefer eingerückt; die Datenreferenz bleibt unverändert erhalten.
- Eine Bearbeitung aktualisiert `body` und setzt `edited_at`; der ursprüngliche Text
  wird in V0.1 nicht versioniert.
- Nutzer löschen eigene Kommentare über Soft Delete: `deleted_at` wird gesetzt und
  `body` auf `null` gesetzt. Die Zeile und ihre Antworten bleiben erhalten.
- Die Darstellung zeigt für gelöschte Knoten einen neutralen Platzhalter. Der Autor
  wird dabei öffentlich nicht mehr ausgegeben.
- Moderation ist davon getrennt: Admins setzen `hidden_at` und `hidden_by`.
- Antworten auf gelöschte Kommentare bleiben sichtbar; ausgeblendete Teilbäume
  benötigen vor Implementierung eine konkrete UI-Regel.

### `topic_attachments`

```text
id uuid primary key
topic_id uuid not null references topics(id) on delete cascade
storage_path text not null unique
file_name text not null
mime_type text not null
is_primary_image boolean not null default false
created_at timestamptz not null default now()
```

Supabase Storage Policies müssen dieselbe Sichtbarkeit wie das zugehörige Topic
erzwingen. Private Community-Anhänge dürfen nicht in einem öffentlichen Bucket mit
dauerhaft öffentlicher URL liegen. V0.1 akzeptiert ausschließlich JPEG, PNG, WebP
und PDF mit maximal 10 MB pro Datei und maximal fünf Anhängen pro Topic. Ein
partieller Unique Index stellt sicher, dass je Topic höchstens eine Zeile
`is_primary_image = true` besitzt. MIME-Typ, Dateiendung und Dateigröße werden
serverseitig geprüft; Videos, Office- und Archivdateien sind nicht zugelassen.

### `topic_updates`

```text
id uuid primary key
topic_id uuid not null references topics(id) on delete cascade
kind topic_update_kind not null
title text not null
body text not null
created_by uuid not null references auth.users(id)
published_at timestamptz not null default now()
created_at timestamptz not null default now()
```

Ein Update mit `kind = 'result'` dokumentiert das offizielle Ergebnis. Das erste
veröffentlichte Ergebnis setzt in derselben Transaktion `result_published_at` am
Topic. `implementation` dokumentiert Fortschritt unabhängig vom Hauptstatus.

## Ableitung der sichtbaren Status

Die UI verwendet eine zentrale Domain-Funktion statt eigener Statuslogik in jeder
Komponente:

| Bedingung | Sichtbarer Hauptstatus |
| --- | --- |
| alle Typen, `publication_status = draft` | `Entwurf` |
| Information, `publication_status = published` | `Aktuell` |
| Information, `publication_status = archived` | `Archiviert` |
| Meinung, veröffentlicht und Beteiligung offen | `Offen` |
| Meinung, geschlossen und kein Ergebnis veröffentlicht | `Geschlossen` |
| Meinung, geschlossen und Ergebnis veröffentlicht | `Ausgewertet` |
| Abstimmung, veröffentlicht und Beteiligung offen | `Offen` |
| Abstimmung, geschlossen und kein Ergebnis veröffentlicht | `Geschlossen` |
| Abstimmung, geschlossen und Ergebnis veröffentlicht | `Entschieden` |
| Mitarbeit, veröffentlicht und Beteiligung offen | `Offen` |
| Mitarbeit, veröffentlicht und Beteiligung geschlossen | `Geschlossen` |

`publication_status = archived` kann Beteiligungstypen aus aktiven Übersichten
entfernen, ohne deren zuletzt erreichten fachlichen Status und Ergebnisse zu
verlieren. Der optionale Umsetzungsstatus wird als zweites Label dargestellt.

## Rollen und Berechtigungen

| Fähigkeit | Gast | Registriert | Community-Mitglied | Bestätigtes Mitglied | Community-Admin |
| --- | ---: | ---: | ---: | ---: | ---: |
| Öffentliches Topic lesen | ja | ja | ja | ja | ja |
| Community-Seite öffnen | nein | ja | ja | ja | ja |
| Community-Topic lesen | nein | nein | eigene Community | eigene Community | eigene Community |
| Auf öffentlichem offenen Topic auswählen | nein | ja | ja | ja | ja |
| Auf Community-Topic auswählen | nein | nein | eigene Community | eigene Community | eigene Community |
| Sichtbaren Kommentar schreiben/antworten | nein | ja | ja | ja | ja |
| Eigenen Kommentar bearbeiten/soft löschen | nein | ja | ja | ja | ja |
| Topic erstellen und verwalten | nein | nein | nein | nein | eigene Community |
| Kommentar ausblenden | nein | nein | nein | nein | eigene Community |
| Membership bestätigen/Rolle vergeben | nein | nein | nein | nein | eigene Community |

`Community-Mitglied` bezeichnet hier einen registrierten Nutzer mit einer
Membership. `Bestätigtes Mitglied` besitzt in V0.1 dieselben normalen
Beteiligungsrechte; die Bestätigung ist bereits für spätere Vertrauensregeln
vorbereitet.

Zusätzliche Regeln:

- Nur `published` Topics sind für normale Nutzer lesbar.
- Beteiligungsschreibrechte gelten nur im zulässigen Zeitraum und bei fachlich
  offener Beteiligung; Informationsreaktionen bleiben möglich, solange die
  Information `published` ist.
- Ein registrierter Nutzer braucht für ein öffentliches Topic keine Membership.
- Die Service Role ist ausschließlich für vertrauenswürdige Backend-Operationen und
  darf nie an den Browser gelangen.

## RLS- und Datenschutzstrategie

- Öffentlicher Topic-Read: nur `publication_status = 'published'` und
  `visibility = 'public'`.
- Community-Read: zusätzlich aktive Session und Membership derselben Community;
  eine Bestätigung ist dafür in V0.1 nicht erforderlich.
- Topic-Write: bestätigte Membership mit `role = 'admin'` derselben Community.
- Selection-Write: authentifizierter Nutzer, lesbares Topic, gültige Option und
  erlaubter Beteiligungszustand; vorzugsweise ausschließlich über eine geprüfte RPC.
- Comment-Create: authentifizierter Nutzer mit Leserecht auf das Topic.
- Comment-Update/Delete: nur ursprünglicher Autor und nur über erlaubte Felder.
- Comment-Hide: bestätigter Community-Admin.
- Profile: Nutzer dürfen ihr eigenes vollständiges Profil lesen und ändern.
  Öffentliche Abfragen verwenden eine eingeschränkte View/RPC für Anzeigenamen.
- Ergebnisaggregation darf keine Rückschlüsse über öffentlich abrufbare
  Einzelstimmen ermöglichen.

## Authentifizierungsstrategie

- Supabase Auth verwendet E-Mail und einen sechsstelligen Einmalcode (OTP).
- Passwörter werden nicht angeboten; Magic Links sind nicht der primäre Flow.
- Lesen eines öffentlichen Topics erzeugt keinen Login-Zwang.
- Login erscheint bei Reaktion, Abstimmung, Kommentar, Profilzugriff,
  Community-Seite oder Adminbereich.
- Der Rücksprungpfad wird serverseitig auf interne relative URLs begrenzt, um Open
  Redirects zu vermeiden.
- Nach dem Auth-Callback wird bei neuen Accounts das erforderliche Profil
  vervollständigt, bevor die erste Beteiligungsaktion gespeichert wird.
- Adminrechte stammen nie aus Auth-Metadaten des Clients, sondern aus einer
  bestätigten `memberships`-Zeile.
- Community-Admins legen Memberships in V0.1 manuell an und bestätigen sie.
  Einladungslinks, Allowlist und automatisierte Zuordnung bleiben spätere Optionen.

## Vorgeschlagene Projektstruktur

```text
.
├── AGENTS.md
├── docs/
│   ├── product-v0.1.md
│   └── architecture-v0.1.md
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── (auth)/auth/
│   │   ├── (account)/profile/
│   │   └── c/[communitySlug]/
│   │       ├── page.tsx
│   │       ├── t/[topicSlug]/page.tsx
│   │       └── admin/
│   ├── components/
│   │   ├── admin/
│   │   ├── comments/
│   │   ├── participation/
│   │   ├── topic/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── participation/
│   │   └── topics/
│   ├── lib/
│   │   ├── auth/
│   │   └── supabase/
│   └── types/
└── tests/
    ├── integration/
    └── unit/
```

## Umsetzungsschritte

1. Next.js, TypeScript, Tailwind, Linting und Tests grundlegend einrichten.
2. Supabase lokal konfigurieren und die Schema-Migrationen inklusive Constraints
   und Seeds für alle vier Topic-Typen erstellen.
3. RLS-Policies und geprüfte Datenbankfunktionen für Auswahl, Kommentare,
   Anzeigenamen und Ergebnisaggregation implementieren und mit Datenbanktests
   absichern.
4. Die kanonische Topic-Route `/c/[communitySlug]/t/[topicSlug]` mit Sichtbarkeits-
   und Statuslogik bauen.
5. E-Mail-OTP mit sicherem Rücksprung und Profilvervollständigung integrieren.
6. Generische Einzel-/Mehrfachauswahl und Live-Ergebnisse umsetzen.
7. Thread-Kommentare mit Bearbeiten, Soft Delete und Admin-Moderation umsetzen.
8. Geschützte Community-Übersicht ergänzen.
9. Minimalen Admin-Flow für Topic, Optionen, Veröffentlichung, Ergebnis, Anhänge
    und QR-Link bauen.
10. Storage Policies, Upload-Grenzen und private Community-Anhänge umsetzen.
11. Tests für RLS, Rollen, Topic-Typ-Regeln, Statusableitung, Auth-Rücksprung,
    Selection-Konsistenz und Kommentar-Threads ergänzen.
12. Vercel-/Supabase-Konfiguration und Pilotbetrieb dokumentieren.

## Bewusst nicht Teil von V0.1

Chat, Direktnachrichten, Arbeitsstundenverwaltung, Platzbuchung, Veranstaltungen,
vollständige Mitgliederverwaltung, freie Topic-Veröffentlichung durch Mitglieder,
Social Feed sowie Einsatz- und Schichtplanung sind weder im Schema noch in den
Flows als versteckte Nebenfunktionen vorgesehen.
