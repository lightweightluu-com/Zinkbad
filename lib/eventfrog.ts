/**
 * Import von Event-Daten aus einer Eventfrog-Seite (schema.org/Event als JSON-LD).
 * Sicherheit: nur https auf eventfrog-Hosts, max. 3 Weiterleitungen (jede neu geprüft), Timeout, Grössenlimits.
 */
const PAGE_HOSTS = /^(www\.)?eventfrog\.(ch|de|at|fr|it)$/i;
const IMAGE_HOST = "res.eventfrog.net";
const MAX_HTML = 3 * 1024 * 1024;
const MAX_IMAGE = 6 * 1024 * 1024;
const UA = "Mozilla/5.0 (compatible; ZinkbadAdminImport/1.0)";

export interface EventfrogOffer { name: string; price: number | null; currency: string; soldOut: boolean }
export interface EventfrogData {
  title: string;
  startsAt: string;          // ISO UTC
  endsAt: string | null;
  description: string | null;
  flyerUrl: string | null;   // https://res.eventfrog.net/… ohne Cache-Parameter
  url: string;               // kanonische Eventfrog-URL
  venue: string | null;
  offers: EventfrogOffer[];
  suggestedStatus: "published" | "sold_out" | "cancelled";
}

export function isEventfrogPageUrl(raw: string): URL | null {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" && PAGE_HOSTS.test(u.hostname) && !u.username && !u.password ? u : null;
  } catch { return null; }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") { const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m; }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** "2026-10-02T23:00:00+0200" -> ISO UTC. Akzeptiert Offset mit und ohne Doppelpunkt. */
function toIso(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const fixed = v.trim().replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const d = new Date(fixed);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function findEvent(node: unknown): Record<string, unknown> | null {
  if (Array.isArray(node)) { for (const n of node) { const f = findEvent(n); if (f) return f; } return null; }
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    const t = o["@type"];
    if (t === "Event" || (Array.isArray(t) && t.includes("Event")) || (typeof t === "string" && /Event$/.test(t))) return o;
    if (o["@graph"]) return findEvent(o["@graph"]);
  }
  return null;
}

function cleanText(s: string): string {
  return decode(s).replace(/\r/g, "").replace(/[ \t ]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function parseEventfrogHtml(html: string, pageUrl: string): EventfrogData | null {
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  let ev: Record<string, unknown> | null = null;
  for (const b of blocks) {
    try { ev = findEvent(JSON.parse(b)); } catch { /* nächster Block */ }
    if (ev) break;
  }
  if (!ev || typeof ev.name !== "string") return null;
  const startsAt = toIso(ev.startDate);
  if (!startsAt) return null;

  const offersRaw = Array.isArray(ev.offers) ? ev.offers : ev.offers ? [ev.offers] : [];
  const offers: EventfrogOffer[] = offersRaw.flatMap((o): EventfrogOffer[] => {
    if (!o || typeof o !== "object") return [];
    const r = o as Record<string, unknown>;
    const price = Number(r.price);
    return [{
      name: typeof r.name === "string" ? cleanText(r.name) : "Ticket",
      price: Number.isFinite(price) ? price : null,
      currency: typeof r.priceCurrency === "string" ? r.priceCurrency : "CHF",
      soldOut: typeof r.availability === "string" && /SoldOut/i.test(r.availability),
    }];
  });

  const img = Array.isArray(ev.image) ? ev.image[0] : ev.image;
  let flyerUrl: string | null = null;
  if (typeof img === "string") {
    try { const u = new URL(img); if (u.protocol === "https:" && u.hostname === IMAGE_HOST) { u.search = ""; flyerUrl = u.toString(); } } catch { /* ungültig */ }
  }

  const place = ev.location && typeof ev.location === "object" ? (ev.location as Record<string, unknown>).name : null;
  const status = typeof ev.eventStatus === "string" && /Cancelled/i.test(ev.eventStatus) ? "cancelled"
    : offers.length > 0 && offers.every((o) => o.soldOut) ? "sold_out" : "published";
  const canonical = typeof ev.url === "string" && isEventfrogPageUrl(ev.url) ? ev.url : pageUrl;
  const description = typeof ev.description === "string" ? cleanText(ev.description).slice(0, 4000) : "";

  return {
    title: cleanText(ev.name).slice(0, 120),
    startsAt,
    endsAt: toIso(ev.endDate),
    description: description || null,
    flyerUrl,
    url: canonical,
    venue: typeof place === "string" ? cleanText(place) : null,
    offers,
    suggestedStatus: status,
  };
}

async function readCapped(res: Response, max: number): Promise<Uint8Array> {
  const reader = res.body?.getReader();
  if (!reader) return new Uint8Array(await res.arrayBuffer());
  const chunks: Uint8Array[] = []; let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) { await reader.cancel(); throw new Error("Antwort zu gross"); }
    chunks.push(value);
  }
  const out = new Uint8Array(total); let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

/** GET mit manuell geprüften Weiterleitungen: jede Station muss in der Allowlist liegen. */
async function safeGet(start: URL, allow: (u: URL) => boolean, max: number, accept: string): Promise<{ bytes: Uint8Array; type: string }> {
  let url = start;
  for (let hop = 0; hop < 4; hop++) {
    if (!allow(url)) throw new Error("Adresse nicht erlaubt");
    const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA, Accept: accept }, signal: AbortSignal.timeout(10_000) });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("Ungültige Weiterleitung");
      url = new URL(loc, url);
      continue;
    }
    if (!res.ok) throw new Error(`Eventfrog antwortet mit Status ${res.status}`);
    return { bytes: await readCapped(res, max), type: res.headers.get("content-type") ?? "" };
  }
  throw new Error("Zu viele Weiterleitungen");
}

export async function fetchEventfrog(rawUrl: string): Promise<EventfrogData> {
  const u = isEventfrogPageUrl(rawUrl);
  if (!u) throw new Error("Bitte eine https-Adresse von eventfrog.ch eingeben");
  const { bytes, type } = await safeGet(u, (x) => isEventfrogPageUrl(x.toString()) !== null, MAX_HTML, "text/html");
  if (!/html/i.test(type)) throw new Error("Keine HTML-Seite");
  const data = parseEventfrogHtml(new TextDecoder("utf-8").decode(bytes), u.toString());
  if (!data) throw new Error("Auf der Seite wurden keine Event-Daten gefunden");
  return data;
}

/** Lädt ein Eventfrog-Bild (nur res.eventfrog.net). Typprüfung und Speichern übernimmt uploadFlyer(). */
export async function fetchEventfrogImage(rawUrl: string): Promise<File> {
  const u = new URL(rawUrl);
  const { bytes } = await safeGet(u, (x) => x.protocol === "https:" && x.hostname === IMAGE_HOST, MAX_IMAGE, "image/*");
  return new File([bytes as BlobPart], "eventfrog-flyer");
}
