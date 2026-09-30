"use client";
import { useState } from "react";

const input = "w-full border border-line bg-graphite px-3 py-3 outline-none focus:border-cyan";
const ghost = "border border-line px-3 py-3 text-zinc hover:border-cyan hover:text-cyan";

const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export interface LineupRow { name: string; instagram_url?: string }
export interface TicketRow { id: string; label: string; price_chf: number; sold_out: boolean }
interface TicketDraft { id: string; label: string; price: string; sold_out: boolean }

export function LineupEditor({ initial }: { initial: LineupRow[] }) {
  const [rows, setRows] = useState<LineupRow[]>(initial);
  const set = (i: number, patch: Partial<LineupRow>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) => setRows((r) => { const n = [...r]; const j = i + d; if (j < 0 || j >= n.length) return r; [n[i], n[j]] = [n[j], n[i]]; return n; });
  return (
    <div className="space-y-3">
      <input type="hidden" name="lineup_json" value={JSON.stringify(rows.filter((r) => r.name.trim()))} />
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2">
          <input aria-label={`Act ${i + 1}`} placeholder="Name" value={r.name} onChange={(e) => set(i, { name: e.target.value })} className={input} />
          <input aria-label={`Instagram ${i + 1}`} placeholder="Instagram-URL (optional)" value={r.instagram_url ?? ""} onChange={(e) => set(i, { instagram_url: e.target.value })} className={input} />
          <button type="button" aria-label="Nach oben" onClick={() => move(i, -1)} className={ghost}>↑</button>
          <button type="button" aria-label="Nach unten" onClick={() => move(i, 1)} className={ghost}>↓</button>
          <button type="button" aria-label="Entfernen" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className={ghost}>×</button>
        </div>
      ))}
      <button type="button" onClick={() => setRows((x) => [...x, { name: "" }])} className={ghost}>+ Act</button>
    </div>
  );
}

export function TicketEditor({ initial }: { initial: TicketRow[] }) {
  const [rows, setRows] = useState<TicketDraft[]>(() => initial.map((t) => ({ id: t.id, label: t.label, price: String(t.price_chf), sold_out: t.sold_out })));
  const set = (i: number, patch: Partial<TicketDraft>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const out = rows.filter((r) => r.label.trim() && r.price.trim() !== "").map((r, i) => ({ id: r.id || slug(r.label) || `t${i + 1}`, label: r.label.trim(), price_chf: Number(r.price.replace(",", ".")), sold_out: r.sold_out }));
  return (
    <div className="space-y-3">
      <input type="hidden" name="tickets_json" value={JSON.stringify(out)} />
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_7rem_auto_auto] items-center gap-2">
          <input aria-label={`Ticket ${i + 1}`} placeholder="z. B. 1x EarlyBird" value={r.label} onChange={(e) => set(i, { label: e.target.value })} className={input} />
          <input aria-label={`Preis ${i + 1} in CHF`} placeholder="CHF" inputMode="decimal" value={r.price} onChange={(e) => set(i, { price: e.target.value })} className={input} />
          <label className="flex items-center gap-2 whitespace-nowrap text-zinc"><input type="checkbox" checked={r.sold_out} onChange={(e) => set(i, { sold_out: e.target.checked })} /> Sold out</label>
          <button type="button" aria-label="Entfernen" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className={ghost}>×</button>
        </div>
      ))}
      <button type="button" onClick={() => setRows((x) => [...x, { id: "", label: "", price: "", sold_out: false }])} className={ghost}>+ Ticket</button>
    </div>
  );
}
