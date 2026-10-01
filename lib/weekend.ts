import { isoToZurichLocal, zurichLocalToIso } from "./time.ts";

/**
 * Wochenende = Freitag 00:00 bis Montag 00:00 (Zürcher Zeit).
 * Mo–Do: das kommende Wochenende. Fr–So: das laufende.
 */
export function weekendRange(now: Date): { from: string; to: string } {
  const [date] = isoToZurichLocal(now.toISOString()).split("T");
  const [y, m, d] = date.split("-").map(Number);
  const base = Date.UTC(y, m - 1, d);
  const dow = new Date(base).getUTCDay(); // 0 So … 6 Sa
  const toFriday = dow === 0 ? -2 : 5 - dow; // So: -2, Sa: -1, Fr: 0, Mo–Do: +4…+1
  const day = (offset: number) => new Date(base + (toFriday + offset) * 86_400_000).toISOString().slice(0, 10);
  return { from: zurichLocalToIso(`${day(0)}T00:00`), to: zurichLocalToIso(`${day(3)}T00:00`) };
}
