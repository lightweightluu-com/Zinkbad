import Link from "next/link";
import { flyerUrl } from "@/lib/events";
import { isoToZurichLocal } from "@/lib/time";
import { STATUSES, type ClubEvent } from "@/lib/types";
import { removeEvent, saveEvent } from "../actions";
import { DeleteButton, FormShell } from "./form-shell";

const label = "mb-2 block uppercase tracking-widest text-zinc";
const field = "w-full border border-line bg-graphite px-3 py-3 outline-none focus:border-cyan";

export function EventForm({ event }: { event?: ClubEvent }) {
  const save = saveEvent.bind(null, event?.id ?? null);
  const flyer = flyerUrl(event?.flyer_path ?? null);
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/admin" className="text-zinc hover:text-cyan">← Events</Link>
      <h1 className="mb-10 mt-6 text-3xl font-bold tracking-tight">{event ? "Event bearbeiten" : "Neues Event"}</h1>
      <FormShell action={save}>
        <div><label className={label} htmlFor="title">Titel</label>
          <input id="title" name="title" required maxLength={120} defaultValue={event?.title} className={field} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={label} htmlFor="starts_at">Start (Zürich)</label>
            <input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={event && isoToZurichLocal(event.starts_at)} className={field} /></div>
          <div><label className={label} htmlFor="ends_at">Ende (optional)</label>
            <input id="ends_at" name="ends_at" type="datetime-local" defaultValue={event?.ends_at ? isoToZurichLocal(event.ends_at) : ""} className={field} /></div>
        </div>
        <div><label className={label} htmlFor="description">Beschreibung</label>
          <textarea id="description" name="description" rows={5} defaultValue={event?.description ?? ""} className={field} /></div>
        <div><label className={label} htmlFor="lineup">Line-up (pro Zeile: Name | Instagram-URL)</label>
          <textarea id="lineup" name="lineup" rows={4} defaultValue={event?.lineup.map((l) => l.instagram_url ? `${l.name} | ${l.instagram_url}` : l.name).join("\n")} className={field} /></div>
        <div><label className={label} htmlFor="tickets">Tickets (pro Zeile: id | Label | Preis CHF | soldout)</label>
          <textarea id="tickets" name="tickets" rows={3} placeholder="earlybird | 1x EarlyBird | 45" defaultValue={event?.tickets.map((t) => `${t.id} | ${t.label} | ${t.price_chf}${t.sold_out ? " | soldout" : ""}`).join("\n")} className={field} /></div>
        <div><label className={label} htmlFor="ticket_url">Externer Ticket-Link (optional, ersetzt Payrexx)</label>
          <input id="ticket_url" name="ticket_url" type="url" defaultValue={event?.ticket_url ?? ""} className={field} /></div>
        <div><label className={label} htmlFor="flyer">Flyer (JPG/PNG/WebP, max. 6 MB)</label>
          {flyer && (<div className="mb-3 flex items-end gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flyer} alt="" className="h-32 border border-line" />
            <label className="text-zinc"><input type="checkbox" name="remove_flyer" /> Flyer entfernen</label></div>)}
          <input id="flyer" name="flyer" type="file" accept="image/jpeg,image/png,image/webp" className={field} />
          <input name="flyer_alt" placeholder="Alt-Text" defaultValue={event?.flyer_alt ?? ""} className={`${field} mt-3`} aria-label="Alt-Text" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={label} htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={event?.status ?? "draft"} className={field}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <label className="flex items-end gap-2 pb-3"><input type="checkbox" name="is_featured" defaultChecked={event?.is_featured} /> Hervorheben («Next up»)</label>
        </div>
      </FormShell>
      {event && (
        <form action={removeEvent.bind(null, event.id)} className="mt-16 border-t border-line pt-8">
          <DeleteButton />
        </form>
      )}
    </main>
  );
}
