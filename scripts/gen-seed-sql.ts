import { writeFileSync } from "node:fs";
import { SEED_EVENTS } from "../lib/seed-data.ts";

const q = (v: string | null) => (v === null ? "null" : `'${v.replace(/'/g, "''")}'`);
const rows = SEED_EVENTS.map((e) =>
  `(${q(e.slug)}, ${q(e.title)}, ${q(e.starts_at)}, ${q(e.ends_at)}, ${q(e.description)}, ${q(e.flyer_path)}, ${q(e.flyer_alt)}, ` +
  `${q(JSON.stringify(e.lineup))}::jsonb, ${q(JSON.stringify(e.tickets))}::jsonb, ${q(e.ticket_url)}, ${q(e.status)}, ${e.is_featured})`);
writeFileSync("supabase/seed.sql",
  `-- Generiert aus lib/seed-data.ts (npm run seed:sql). Vor Livegang prüfen.\n` +
  `insert into public.events (slug, title, starts_at, ends_at, description, flyer_path, flyer_alt, lineup, tickets, ticket_url, status, is_featured) values\n${rows.join(",\n")}\non conflict (slug) do nothing;\n`);
