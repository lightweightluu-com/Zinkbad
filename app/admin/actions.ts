"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MOCK_COOKIE, mockPasswordOk, mockSessionValue, requireAdmin } from "@/lib/auth";
import { hasSupabase, isMock } from "@/lib/env";
import { adminGet, createEvent, deleteEvent, removeFlyerFile, updateEvent, uploadFlyer, type StoredFlyer } from "@/lib/events";
import { sessionClient } from "@/lib/supabase/server";
import { zurichLocalToIso } from "@/lib/time";
import { eventInput, type EventInput } from "@/lib/types";

export interface FormState { error?: string }

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get("password") ?? "");
  if (hasSupabase) {
    const { error } = await (await sessionClient()).auth.signInWithPassword({ email: String(fd.get("email") ?? ""), password });
    if (error) return { error: "Login fehlgeschlagen" };
  } else if (isMock && mockPasswordOk(password)) {
    (await cookies()).set(MOCK_COOKIE, mockSessionValue(), { httpOnly: true, sameSite: "lax", path: "/admin", maxAge: 60 * 60 * 8 });
  } else {
    return { error: "Login fehlgeschlagen" };
  }
  redirect("/admin");
}

export async function logout() {
  if (hasSupabase) await (await sessionClient()).auth.signOut();
  (await cookies()).delete(MOCK_COOKIE);
  redirect("/admin/login");
}

function parse(fd: FormData): { ok: true; data: EventInput } | { ok: false; error: string } {
  try {
    const local = (k: string) => { const v = String(fd.get(k) ?? "").trim(); return v ? zurichLocalToIso(v) : null; };
    const text = (k: string) => String(fd.get(k) ?? "").trim() || null;
    const json = (k: string) => { try { const v = JSON.parse(String(fd.get(k) ?? "[]")); return Array.isArray(v) ? v : []; } catch { return []; } };
    const lineup = json("lineup_json");
    const tickets = json("tickets_json");
    const res = eventInput.safeParse({
      title: fd.get("title"), starts_at: local("starts_at"), ends_at: local("ends_at"),
      description: text("description"), flyer_alt: text("flyer_alt"), lineup, tickets,
      ticket_url: text("ticket_url"), status: fd.get("status"), is_featured: fd.get("is_featured") === "on",
    });
    if (!res.success) return { ok: false, error: res.error.issues.map((i) => `${i.path.join(".") || "Formular"}: ${i.message}`).join(" · ") };
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ungültige Eingabe" };
  }
}

export async function saveEvent(id: string | null, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parse(fd);
  if (!parsed.ok) return { error: parsed.error };

  const file = fd.get("flyer");
  const existing = id ? await adminGet(id) : null;
  if (id && !existing) return { error: "Event nicht gefunden" };

  let newFlyer: StoredFlyer | undefined;
  try {
    if (file instanceof File && file.size > 0) newFlyer = await uploadFlyer(file);
    if (id) {
      const removing = fd.get("remove_flyer") === "on" && !newFlyer;
      await updateEvent(id, parsed.data, newFlyer ?? (removing ? null : undefined));
      if (existing?.flyer_path && (newFlyer || removing) && !existing.flyer_path.startsWith("/")) await removeFlyerFile(existing.flyer_path);
    } else {
      await createEvent(parsed.data, newFlyer ?? null);
    }
  } catch (e) {
    if (newFlyer && !id) await removeFlyerFile(newFlyer.path).catch(() => {});
    return { error: e instanceof Error ? e.message : "Speichern fehlgeschlagen" };
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function removeEvent(id: string) {
  await requireAdmin();
  await deleteEvent(id);
  revalidatePath("/", "layout");
  redirect("/admin");
}
