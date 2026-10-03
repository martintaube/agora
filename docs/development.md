# Agora Entwicklung und Betrieb

## Auth und OTP

Agora nutzt `signInWithOtp` und `verifyOtp` von Supabase Auth. Das E-Mail-Template
muss den sechsstelligen Token (`{{ .Token }}`) ausgeben; ein Bestätigungslink ist
nicht der primäre Loginweg. Der `next`-Parameter akzeptiert ausschließlich interne
relative Pfade, um Open Redirects zu verhindern.

Neue Accounts werden vor ihrer ersten Beteiligung nach `/profile/complete`
geleitet. Datenbankfunktionen für Auswahl und Kommentare prüfen zusätzlich, dass
ein Profil existiert.

## Supabase

- Migrationen liegen in `supabase/migrations`.
- `supabase/seed.sql` enthält ausschließlich synthetische Pilotdaten.
- pgTAP wird durch eine Migration im Schema `extensions` aktiviert, damit dieselbe
  Datenbank-Test-Suite lokal und gegen ein verknüpftes Testprojekt läuft.
- Das Cloud-Projekt wird ausschließlich per Supabase CLI mit diesen Migrationen
  aufgebaut; Schemaänderungen im Dashboard sind zu vermeiden.
- RLS schützt Community-Grenzen und offizielle Profildaten.
- Individuelle Auswahlen sind nur für den jeweiligen Nutzer lesbar.
- Öffentliche Ergebnis-RPCs geben ausschließlich Aggregationen zurück.
- Schreibvorgänge für Auswahl und Kommentare laufen über geprüfte RPCs.
- Funktionsausführung wird standardmäßig für `public`, `anon` und `authenticated`
  entzogen und nur pro freigegebener RPC explizit vergeben.
- Anhänge liegen im privaten Bucket `topic-attachments` und werden per zeitlich
  begrenzter Signed URL ausgeliefert.

Die vollständige einmalige Einrichtung und die Reihenfolge für Link, Migration,
Seed und Tests stehen in [Supabase Cloud einrichten](supabase-cloud.md).

Optionen einer Abstimmung können nur geändert werden, solange noch keine Auswahl
existiert. Single Choice wird innerhalb einer Datenbanktransaktion ersetzt;
Multiple Choice besitzt in V0.1 kein Maximum.

## Uploads

Next.js erlaubt für Server Actions 11 MB Request-Größe, damit Dateien bis zur
Produktgrenze von 10 MB inklusive Formulardaten verarbeitet werden können.
Datenbank, Storage Bucket und Server Action akzeptieren ausschließlich JPEG, PNG,
WebP und PDF. Der Datenbanktrigger begrenzt Topics auf fünf Anhänge, ein partieller
Unique Index auf genau ein Primärbild.

## Builds

Der Produktionsbuild verwendet `next build --webpack`. Turbopack benötigt in der
aktuellen lokalen Umgebung beim CSS-Build einen internen Port und ist dort durch
die Sandbox eingeschränkt. Diese Wahl verändert das Produktverhalten nicht.

## Lokale Entwicklung

`npm run dev` stellt dieselben Next.js-Routes wie Production bereit. Ist Port
3000 bereits belegt, wird ein freier Port explizit gewählt, zum Beispiel:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Die Werte in `.env.local` zeigen derzeit auf das Supabase-Cloud-Projekt. Dadurch
sind dieselben Communities und Topics verfügbar, lokale Schreibaktionen verändern
aber auch Cloud-Daten. Auth-Cookies gelten pro Origin: Eine Anmeldung auf der
Vercel-Domain meldet nicht automatisch auf `localhost` an. Für lokale Admin-Routes
ist daher eine separate lokale Anmeldung erforderlich.

Während einer Arbeitsphase werden Änderungen lokal entwickelt und geprüft.
Production-Deployments werden gebündelt und nur auf ausdrücklichen Wunsch oder an
einem vereinbarten Zwischenstand ausgeführt.

## Noch erforderliche externe Konfiguration

- Supabase-Projekt anlegen, CLI anmelden und Projekt verknüpfen
- Migrationen und synthetische Pilotdaten per CLI anwenden
- OTP-E-Mail-Templates auf den sechsstelligen Token konfigurieren
- Site URL, erlaubte Redirect URLs und produktive SMTP-Zustellung konfigurieren
- öffentliche Variablen aus `.env.example` lokal und in Vercel setzen
- RLS-Tests vor dem Pilotbetrieb gegen einen frischen Teststack ausführen

Einladungslinks, Allowlist und automatische Membership-Zuordnung bleiben bewusst
außerhalb von V0.1.
