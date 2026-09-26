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
- RLS schützt Community-Grenzen und offizielle Profildaten.
- Individuelle Auswahlen sind nur für den jeweiligen Nutzer lesbar.
- Öffentliche Ergebnis-RPCs geben ausschließlich Aggregationen zurück.
- Schreibvorgänge für Auswahl und Kommentare laufen über geprüfte RPCs.
- Anhänge liegen im privaten Bucket `topic-attachments` und werden per zeitlich
  begrenzter Signed URL ausgeliefert.

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

## Noch erforderliche externe Konfiguration

- Supabase-Projekt anlegen oder lokalen Stack starten
- Umgebungsvariablen aus `.env.example` setzen
- OTP-E-Mail-Template auf den sechsstelligen Token konfigurieren
- gewünschte SMTP-Zustellung für Produktion konfigurieren
- Migrationen und Seeds anwenden
- Vercel-Projekt mit denselben öffentlichen Umgebungsvariablen verbinden

Einladungslinks, Allowlist und automatische Membership-Zuordnung bleiben bewusst
außerhalb von V0.1.
