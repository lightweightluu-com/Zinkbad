export const TZ = "Europe/Zurich";

/** Offset (ms) von Zürich gegenüber UTC zum gegebenen Zeitpunkt. */
function zurichOffsetMs(utc: Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(utc).map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(utc.getTime() / 1000) * 1000;
}

/** "2026-10-03T23:00" (Zürcher Wandzeit) -> ISO UTC. */
export function zurichLocalToIso(local: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) throw new Error("Ungültiges Datum");
  const naive = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let guess = naive - zurichOffsetMs(new Date(naive));
  guess = naive - zurichOffsetMs(new Date(guess)); // zweiter Durchgang für DST-Grenzen
  return new Date(guess).toISOString();
}

/** ISO UTC -> "YYYY-MM-DDTHH:mm" in Zürcher Wandzeit (für datetime-local). */
export function isoToZurichLocal(iso: string): string {
  const d = new Date(iso);
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
