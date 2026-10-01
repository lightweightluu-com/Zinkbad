"use client";
import { useRef, useState } from "react";
import { importFromEventfrog } from "../actions";

const field = "w-full border border-line bg-graphite px-3 py-3 outline-none focus:border-cyan";
const isEventfrog = (v: string) => /^https:\/\/(www\.)?eventfrog\.(ch|de|at|fr|it)\//i.test(v.trim());

/** Setzt den Wert eines unkontrollierten Formularfelds. */
function setField(id: string, value: string) {
  const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  if (el) el.value = value;
}
const getField = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value ?? "";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "ok"; notes: string[] } | { kind: "error"; msg: string };

/**
 * Ticket-Link-Feld. Steht dort eine Eventfrog-Adresse (Einfügen oder Feld verlassen),
 * werden Titel, Zeiten, Beschreibung, Status und Flyer automatisch übernommen. Line-up bleibt manuell.
 */
export function TicketLinkField({ defaultValue, currentId }: { defaultValue: string; currentId: string | null }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [flyer, setFlyer] = useState<string | null>(null);
  const last = useRef(defaultValue);

  const run = async (url: string) => {
    setStatus({ kind: "loading" });
    const res = await importFromEventfrog(url, currentId);
    if (!res.ok) { setStatus({ kind: "error", msg: res.error }); return; }
    const d = res.data;
    const hasContent = getField("title").trim() !== "" && getField("title").trim() !== d.title;
    if (hasContent && !window.confirm("Das Formular enthält schon Angaben. Mit den Daten von Eventfrog überschreiben?")) { setStatus({ kind: "idle" }); return; }
    setField("title", d.title);
    setField("starts_at", d.starts_at);
    setField("ends_at", d.ends_at);
    setField("description", d.description);
    setField("status", d.status);
    setField("flyer_alt", d.title);
    setField("ticket_url", d.ticket_url);
    last.current = d.ticket_url;
    setFlyer(d.flyer_url);
    const notes = ["Titel", "Datum und Zeit", d.description ? "Beschreibung" : "", d.flyer_url ? "Flyer" : "", d.offers.length ? `Ticketpreise (in der Beschreibung)` : ""].filter(Boolean);
    const extra: string[] = [];
    if (d.status === "sold_out") extra.push("Alle Tickets sind ausverkauft, Status wurde auf «sold_out» gesetzt.");
    if (d.status === "cancelled") extra.push("Das Event ist auf Eventfrog abgesagt, Status wurde auf «cancelled» gesetzt.");
    if (d.venue && !/zinkbad/i.test(d.venue)) extra.push(`Achtung: Veranstaltungsort auf Eventfrog ist «${d.venue}».`);
    if (d.duplicate) extra.push(`Achtung: Es gibt schon ein Event mit diesem Link («${d.duplicate}»).`);
    extra.push("Das Line-up bitte manuell prüfen und eintragen.");
    setStatus({ kind: "ok", notes: [`Übernommen: ${notes.join(", ")}.`, ...extra] });
  };

  const maybe = (v: string) => {
    const t = v.trim();
    if (t && t !== last.current && isEventfrog(t)) { last.current = t; void run(t); }
  };

  return (
    <div>
      <input id="ticket_url" name="ticket_url" type="url" defaultValue={defaultValue} className={field} placeholder="https://eventfrog.ch/…"
        onPaste={(e) => maybe(e.clipboardData.getData("text"))} onBlur={(e) => maybe(e.currentTarget.value)} />
      <input type="hidden" name="flyer_remote_url" value={flyer ?? ""} />
      <div aria-live="polite" className="mt-2 space-y-1">
        {status.kind === "loading" && <p className="text-zinc">Lade Daten von Eventfrog…</p>}
        {status.kind === "error" && <p role="alert" className="text-danger">{status.msg}</p>}
        {status.kind === "ok" && status.notes.map((n, i) => <p key={i} className={i === 0 ? "text-cyan" : "text-zinc"}>{n}</p>)}
      </div>
      {flyer && (
        <div className="mt-3 flex items-end gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flyer} alt="" className="h-24 border border-line" />
          <div className="text-zinc">
            <p>Dieser Flyer wird beim Speichern übernommen (ein eigener Upload unten hat Vorrang).</p>
            <button type="button" onClick={() => setFlyer(null)} className="mt-1 underline hover:text-cyan">Flyer nicht übernehmen</button>
          </div>
        </div>
      )}
    </div>
  );
}
