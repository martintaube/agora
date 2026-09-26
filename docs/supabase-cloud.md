# Supabase Cloud für Agora

Diese Anleitung verbindet ein neues Supabase-Cloud-Projekt mit dem Repository.
Sie setzt ein frisches Projekt ohne manuell angelegte Agora-Tabellen voraus.

## 1. Einmalig im Supabase-Dashboard

1. Ein neues Projekt in der gewünschten Organisation und Region anlegen.
2. Ein starkes Datenbankpasswort erzeugen und nur im Passwortmanager speichern.
3. Die Project Reference aus den Projekteinstellungen beziehungsweise der
   Dashboard-URL notieren. Sie ist kein Secret.

Es werden an dieser Stelle keine Tabellen, Policies oder Storage Buckets manuell
angelegt. Das erledigen die versionierten Migrationen.

## 2. CLI anmelden und Projekt verknüpfen

Im Projektordner ausführen:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

Der persönliche Access Token und das Datenbankpasswort werden nur in den
interaktiven CLI-Dialogen eingegeben. Sie gehören weder in `.env.local` noch in
Git oder in einen Chat. Die erzeugten Dateien unter `supabase/.temp/` sind durch
`.gitignore` ausgeschlossen.

Danach lässt sich die Verbindung prüfen:

```bash
npx supabase projects list
npx supabase migration list --linked
```

## 3. Migrationen und Pilotdaten

Vor dem ersten Schreiben zunächst den Plan kontrollieren:

```bash
npx supabase db push --linked --dry-run
```

Anschließend Schema und synthetische Pilotdaten anwenden:

```bash
npx supabase db push --linked --include-seed
npx supabase migration list --linked
```

`supabase/seed.sql` legt `Lichtenberger TC`, Orte, Beispiel-Topics und einen rein
synthetischen Platzhalter-Admin an. Die Adresse `demo-admin@example.invalid` kann
nicht zum Login verwendet werden. `db reset --linked` darf für ein Cloud-Projekt
nicht verwendet werden.

## 4. Auth im Dashboard

Unter **Authentication > Providers > Email**:

- E-Mail-Provider und neue Registrierungen aktivieren.
- E-Mail-Bestätigung aktivieren.
- Passwort ist nicht der primäre Agora-Flow; die Anwendung verwendet
  `signInWithOtp` und anschließend `verifyOtp`.

Unter **Authentication > Email Templates** sowohl das Template für neue
Registrierungen als auch das Passwordless-/Magic-Link-Template so konfigurieren,
dass der sechsstellige Code mit `{{ .Token }}` sichtbar ist. Ein Link mit
`{{ .ConfirmationURL }}` ist nicht der primäre Loginweg.

Unter **Authentication > URL Configuration**:

- Site URL auf die kanonische Produktions-URL setzen.
- `http://localhost:3000/**` für lokale Entwicklung erlauben.
- die kanonische Produktions-URL und nur tatsächlich verwendete Vercel-Preview-
  Muster als Redirect URLs ergänzen.

Für einen Pilotbetrieb muss ein eigener SMTP-Dienst konfiguriert und die
Zustellung mit realen Testkonten geprüft werden. OTP-Länge und Ablauf sind im
Repository mit sechs Stellen und 600 Sekunden dokumentiert; die effektiven
Cloud-Werte anschließend im Dashboard kontrollieren.

## 5. Storage

Die Migration erzeugt den privaten Bucket `topic-attachments` mit:

- maximal 10 MB pro Datei
- MIME-Typen `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- RLS-Policies entlang der Topic-Sichtbarkeit

Ein Datenbanktrigger begrenzt jedes Topic auf fünf Metadatensätze. Der Bucket darf
nicht auf `public` umgestellt werden. Dateien werden über kurzlebige Signed URLs
ausgeliefert; Upload, Änderung und Löschung sind nur für bestätigte Admins der
jeweiligen Community erlaubt.

## 6. Ersten echten Admin zuordnen

1. Mit der gewünschten Admin-Adresse den OTP-Flow der Anwendung durchlaufen.
2. Das Profil vollständig anlegen und den Benutzernamen notieren.
3. Einmalig im SQL Editor die Membership für den Pilotverein anlegen. Dabei nur
   den Platzhalter ersetzen:

```sql
insert into public.memberships (
  community_id, user_id, role, verified_at, verified_by
)
select c.id, p.id, 'admin', now(), p.id
from public.communities c
cross join public.profiles p
where c.slug = 'ltc'
  and p.username = '<ADMIN_USERNAME>'
on conflict (community_id, user_id) do update set
  role = excluded.role,
  verified_at = excluded.verified_at,
  verified_by = excluded.verified_by;
```

Dieser Bootstrap ist die einzige notwendige manuelle Datenoperation. Weitere
Memberships werden danach über die geprüfte Admin-Funktion verwaltet.

## 7. Variablen für lokale App und Vercel

Benötigt werden ausschließlich:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Beide Werte stehen im Dashboard unter **Connect** beziehungsweise in den
API-Einstellungen. Der Publishable Key ist für Browser-Anwendungen vorgesehen;
die eigentliche Autorisierung erfolgt über RLS.

Nicht in Vercel hinterlegen und nie committen:

- Datenbankpasswort
- persönlicher Supabase Access Token
- Secret Key beziehungsweise `service_role`-Key

`AGORA_DEMO_MODE` bleibt in Produktion ungesetzt oder `false`.

## 8. Verifikation vor dem Pilotbetrieb

Für reproduzierbare Datenbanktests ist ein frischer lokaler Supabase-Stack oder
ein separates Cloud-Testprojekt am saubersten:

```bash
npx supabase start
npx supabase db reset
npx supabase db lint --local
npx supabase test db
```

Alternativ können die transaktionalen pgTAP-Tests gegen das verknüpfte Projekt
ausgeführt werden:

```bash
npx supabase test db --linked
```

Dieser CLI-Befehl benötigt auch für ein Cloud-Projekt einen lokalen Docker- oder
Podman-Runner. Wenn stattdessen der Homebrew-PostgreSQL-Client vorhanden ist,
können dieselben Tests ohne Container direkt ausgeführt werden:

```bash
/opt/homebrew/opt/libpq/bin/psql "$(cat supabase/.temp/pooler-url)" \
  -X -q -A -t \
  -v ON_ERROR_STOP=1 \
  -f supabase/tests/database/schema.test.sql \
  -f supabase/tests/database/security_rls.test.sql
```

Das Datenbankpasswort nur am interaktiven Prompt eingeben. Vorher sicherstellen,
dass das Projekt keine produktiven Nutzerdaten enthält. Die Tests rollen ihre
eigenen Datensätze zurück, sollten aber trotzdem zuerst in einer dedizierten
Testumgebung laufen.

Die Security-Suite prüft insbesondere öffentliche und Community-Sichtbarkeit,
Teilnahme, Community-Grenzen von Admins, aggregierte Ergebnisse, Profildatenschutz
und Storage-Zugriffe. Zusätzlich ist ein manueller End-to-End-Test mit Gast,
Mitglied und zwei Admin-Accounts aus unterschiedlichen Communities erforderlich.
