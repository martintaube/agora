# Agora

Agora ist eine Open-Source-Plattform für digitale Beteiligung in realen
Gemeinschaften. V0.1 verbindet einen QR-Code oder Deeplink unmittelbar mit einem
konkreten Topic, Beteiligung, Diskussion und Ergebnis.

## Lokaler Start

Voraussetzungen:

- Node.js 22 oder neuer
- Docker Desktop für den lokalen Supabase-Stack

```bash
npm install
npx supabase start
npx supabase db reset
cp .env.example .env.local
npm run dev
```

Die von `supabase start` ausgegebene lokale API-URL und den Publishable Key in
`.env.local` eintragen. `.env`-Dateien und Schlüssel werden nicht committed.

Die Pilot-Topicseite ist anschließend unter
`/c/ltc/t/neue-sitzbank` erreichbar. Lokale OTP-E-Mails erscheinen in Inbucket,
dessen URL `supabase start` ausgibt.

## Read-only Demo

Wenn kein Supabase-Dienst verfügbar ist, kann ausschließlich die öffentliche
Beispiel-Topicseite mit synthetischen Daten gerendert werden:

```bash
AGORA_DEMO_MODE=true npm run dev
```

Schreibaktionen und geschützte Seiten benötigen weiterhin Supabase. Der Demo-Modus
ist opt-in und im Produktionsbetrieb standardmäßig deaktiviert.

## Prüfungen

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx supabase db lint --local --schema public
npx supabase test db
```

Die beiden letzten Befehle setzen einen laufenden lokalen Supabase-Stack voraus.

## Dokumentation

- [Produkt V0.1](docs/product-v0.1.md)
- [Architektur V0.1](docs/architecture-v0.1.md)
- [Entwicklung und Betrieb](docs/development.md)
- [Supabase Cloud einrichten](docs/supabase-cloud.md)
