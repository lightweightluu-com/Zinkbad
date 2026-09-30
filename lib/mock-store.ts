import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED_EVENTS } from "./seed-data";
import type { ClubEvent } from "./types";

const FILE = path.join(process.cwd(), ".data", "events.json");

export async function readAll(): Promise<ClubEvent[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    const s = SEED_EVENTS;
    await writeAll(s);
    return s;
  }
}

export async function writeAll(events: ClubEvent[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(events, null, 2));
}
