import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hasSupabase, isMock, SUPABASE_URL } from "./env";
import { readAll, writeAll } from "./mock-store";
import { SEED_EVENTS } from "./seed-data";
import { imageRatio } from "./image-size";
import { anonClient, sessionClient } from "./supabase/server";
import type { ClubEvent, EventInput } from "./types";

const EVENT_TAIL_MS = 8 * 3_600_000; // Party läuft über Mitternacht hinaus

export function flyerUrl(p: string | null): string | null {
  if (!p) return null;
  if (p.startsWith("/")) return p; // statisches Bild aus /public
  if (isMock) return `/uploads/${p}`;
  return `${SUPABASE_URL}/storage/v1/object/public/flyers/${p}`;
}

const byStart = (a: ClubEvent, b: ClubEvent) => a.starts_at.localeCompare(b.starts_at);

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "event";
}

/** Kommende, nicht-Entwurf-Events, chronologisch. */
export async function listUpcoming(): Promise<ClubEvent[]> {
  const since = new Date(Date.now() - EVENT_TAIL_MS).toISOString();
  if (hasSupabase) {
    const { data, error } = await anonClient().from("events").select("*")
      .neq("status", "draft").gte("starts_at", since).order("starts_at");
    if (error) throw error;
    return data as ClubEvent[];
  }
  // Ohne Supabase in Produktion: nur lesbare Startdaten (Vorschau-Deploys)
  const all = isMock ? await readAll() : SEED_EVENTS;
  return all.filter((e) => e.status !== "draft" && e.starts_at >= since).sort(byStart);
}

export async function getPublicBySlug(slug: string): Promise<ClubEvent | null> {
  if (hasSupabase) {
    const { data } = await anonClient().from("events").select("*").eq("slug", slug).neq("status", "draft").maybeSingle();
    return (data as ClubEvent) ?? null;
  }
  const all = isMock ? await readAll() : SEED_EVENTS;
  return all.find((e) => e.slug === slug && e.status !== "draft") ?? null;
}

// ---------- Admin (Aufrufer müssen requireAdmin() bestanden haben) ----------

export async function adminList(): Promise<ClubEvent[]> {
  if (hasSupabase) {
    const { data, error } = await (await sessionClient()).from("events").select("*").order("starts_at", { ascending: false });
    if (error) throw error;
    return data as ClubEvent[];
  }
  return (await readAll()).sort(byStart).reverse();
}

export async function adminGet(id: string): Promise<ClubEvent | null> {
  if (hasSupabase) {
    const { data } = await (await sessionClient()).from("events").select("*").eq("id", id).maybeSingle();
    return (data as ClubEvent) ?? null;
  }
  return (await readAll()).find((e) => e.id === id) ?? null;
}

export interface StoredFlyer { path: string; ratio: number | null }

export async function createEvent(input: EventInput, flyer: StoredFlyer | null): Promise<ClubEvent> {
  const slugBase = `${slugify(input.title)}-${input.starts_at.slice(0, 10)}`;
  if (hasSupabase) {
    const sb = await sessionClient();
    for (let i = 0; i < 5; i++) {
      const slug = i === 0 ? slugBase : `${slugBase}-${randomUUID().slice(0, 4)}`;
      const { data, error } = await sb.from("events").insert({ ...input, slug, flyer_path: flyer?.path ?? null, flyer_ratio: flyer?.ratio ?? null }).select().single();
      if (!error) return data as ClubEvent;
      if (error.code !== "23505") throw error; // nur Slug-Kollision wiederholen
    }
    throw new Error("Slug-Kollision");
  }
  const all = await readAll();
  const slug = all.some((e) => e.slug === slugBase) ? `${slugBase}-${randomUUID().slice(0, 4)}` : slugBase;
  const now = new Date().toISOString();
  const ev: ClubEvent = { ...input, id: randomUUID(), slug, flyer_path: flyer?.path ?? null, flyer_ratio: flyer?.ratio ?? null, created_at: now, updated_at: now };
  await writeAll([...all, ev]);
  return ev;
}

export async function updateEvent(id: string, input: EventInput, flyer?: StoredFlyer | null): Promise<void> {
  const patch = { ...input, ...(flyer !== undefined ? { flyer_path: flyer?.path ?? null, flyer_ratio: flyer?.ratio ?? null } : {}), updated_at: new Date().toISOString() };
  if (hasSupabase) {
    const { error } = await (await sessionClient()).from("events").update(patch).eq("id", id);
    if (error) throw error;
    return;
  }
  const all = await readAll();
  const i = all.findIndex((e) => e.id === id);
  if (i < 0) throw new Error("Event nicht gefunden");
  all[i] = { ...all[i], ...patch };
  await writeAll(all);
}

export async function deleteEvent(id: string): Promise<void> {
  const ev = await adminGet(id);
  const ownFile = ev?.flyer_path && !ev.flyer_path.startsWith("/") ? ev.flyer_path : null; // /public-Bilder nie löschen
  if (hasSupabase) {
    const sb = await sessionClient();
    const { error } = await sb.from("events").delete().eq("id", id);
    if (error) throw error;
    if (ownFile) await sb.storage.from("flyers").remove([ownFile]);
    return;
  }
  await writeAll((await readAll()).filter((e) => e.id !== id));
  if (ownFile) await fs.rm(path.join(process.cwd(), "public", "uploads", ownFile), { force: true });
}

const MIME: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_FLYER = 6 * 1024 * 1024;

/** Validiert (Typ per Magic Bytes, Grösse) und speichert den Flyer. Gibt Pfad und Seitenverhältnis zurück. */
export async function uploadFlyer(file: File): Promise<StoredFlyer> {
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_FLYER) throw new Error("Flyer zu gross (max. 6 MB)");
  const type =
    buf.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? "image/jpeg" :
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? "image/png" :
    buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP" ? "image/webp" : null;
  if (!type) throw new Error("Nur JPG, PNG oder WebP erlaubt");
  const name = `${randomUUID()}.${MIME[type]}`;
  if (hasSupabase) {
    const { error } = await (await sessionClient()).storage.from("flyers").upload(name, buf, { contentType: type, cacheControl: "31536000" });
    if (error) throw error;
  } else {
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
  }
  return { path: name, ratio: imageRatio(buf) };
}

export async function removeFlyerFile(p: string) {
  if (hasSupabase) await (await sessionClient()).storage.from("flyers").remove([p]);
  else await fs.rm(path.join(process.cwd(), "public", "uploads", p), { force: true });
}
