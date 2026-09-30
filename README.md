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
