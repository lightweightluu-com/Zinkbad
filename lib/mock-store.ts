import { promises as fs } from "node:fs";
import path from "node:path";
import type { ClubEvent } from "./types";

const FILE = path.join(process.cwd(), ".data", "events.json");

function seed(): ClubEvent[] {
  const day = 86_400_000;
  const at = (days: number, hour: number) => {
    const d = new Date(Date.now() + days * day);
    d.setUTCHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  const base = { ends_at: null, flyer_path: null, flyer_alt: null, ticket_url: null, is_featured: false };
  const now = new Date().toISOString();
  return [
    { ...base, id: "seed-1", slug: "demo-opening-night", title: "DEMO — Opening Night", starts_at: at(6, 21),
      description: "Platzhalter-Event (Seed-Daten). Im Admin ersetzen.", is_featured: true,
      lineup: [{ name: "Headliner TBA" }, { name: "Support TBA" }],
      tickets: [{ id: "earlybird", label: "1x EarlyBird", price_chf: 45, sold_out: false }, { id: "regular", label: "1x Regular", price_chf: 60, sold_out: false }],
      status: "published", created_at: now, updated_at: now },
    { ...base, id: "seed-2", slug: "demo-member-night", title: "DEMO — Member Night", starts_at: at(13, 21),
      description: "Platzhalter-Event (Seed-Daten).", lineup: [{ name: "Resident TBA" }],
      tickets: [], status: "published", created_at: now, updated_at: now },
  ];
}

export async function readAll(): Promise<ClubEvent[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    const s = seed();
    await writeAll(s);
    return s;
  }
}

export async function writeAll(events: ClubEvent[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(events, null, 2));
}
