# Z!NKBAD

Next.js 15 · Supabase (Postgres, Auth, Storage) · Payrexx-Checkout.

## Lokal starten
```
npm i && npm run dev
```
Ohne Supabase-Env läuft ein **Mock-Modus** (nur Dev): Daten in `.data/`, Uploads in `public/uploads/`,
Admin-Login unter `/admin/login` mit `MOCK_ADMIN_PASSWORD` (Default `zinkbad-dev`).

## Produktion (Supabase)
1. Projekt anlegen, `supabase/schema.sql` im SQL-Editor ausführen.
2. Auth → Users: Admin-User anlegen (Signups deaktivieren), dann Zeile in `public.admins` eintragen (Kommentar am Ende der Schema-Datei).
3. `.env.local` nach `.env.example` füllen.

## Kauf
`/api/checkout?member=black|silver|gold` bzw. `?event=<slug>&ticket=<id>` leitet auf Payrexx weiter.
Preise kommen serverseitig aus der DB bzw. `lib/membership.ts`.

## Hero
Das Hero-Bild ist ein generiertes Laser-Canvas (`components/laser-canvas.tsx`). Optional kann `NEXT_PUBLIC_HERO_VIDEO` ein Video darüberlegen.

## Deployment (Cloudflare Workers)
`.github/workflows/deploy.yml` baut mit OpenNext und deployt per Wrangler auf `zinkbad.lightweightluu.com` (siehe `wrangler.jsonc`).

Einmalig nötig:
1. GitHub → Settings → Secrets and variables → Actions: `CLOUDFLARE_API_TOKEN` (Vorlage «Edit Cloudflare Workers», plus Zone-DNS-Edit für lightweightluu.com) und `CLOUDFLARE_ACCOUNT_ID`.
2. Die Zone `lightweightluu.com` muss im selben Cloudflare-Account liegen. Für den Custom Domain legt Cloudflare den DNS-Eintrag selbst an.
3. Für Livegang `NEXT_PUBLIC_INDEXABLE=1` setzen, sonst `noindex`.

Ohne Supabase-Variablen zeigt die Seite nur die Startdaten (schreibgeschützt), der Admin ist dann gesperrt.
Lokal testen: `npm run cf:preview`.

### Build-Variablen für den Deploy (GitHub → Settings → Secrets and variables → Actions → **Variables**)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (beide öffentlich, gehören zu Supabase → Project Settings → API) und optional `NEXT_PUBLIC_INDEXABLE=1` für den Livegang.
Den `service_role`-Schlüssel nirgends eintragen, die App braucht ihn nicht.
