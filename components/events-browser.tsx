"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export interface EventCardData {
  slug: string; title: string;
  weekday: string; day: string; month: string; monthKey: string; monthChip: string; monthLabel: string;
  time: string; endTime: string | null;
  lineup: string[]; description: string | null;
  flyer: string | null; flyerRatio: number; flyerAlt: string;
  status: string; hasTickets: boolean; badge: "Jetzt" | "Heute" | "Morgen" | null;
}

const ease = [0.16, 1, 0.3, 1] as const;

const hasChip = (e: EventCardData) => e.status === "cancelled" || e.status === "sold_out" || e.badge !== null;

function Chip({ e, className = "inline-flex" }: { e: EventCardData; className?: string }) {
  const base = `label items-center whitespace-nowrap px-2 py-1 ${className}`;
  if (e.status === "cancelled") return <span className={`${base} border border-danger text-danger`}>Abgesagt</span>;
  if (e.status === "sold_out") return <span className={`${base} border border-danger text-danger`}>Ausverkauft</span>;
  if (e.badge === "Jetzt" || e.badge === "Heute") return <span className={`${base} bg-cyan font-bold text-ink`}>{e.badge}</span>;
  if (e.badge === "Morgen") return <span className={`${base} border border-cyan text-cyan`}>Morgen</span>;
  return null;
}

/** Kleine Farbkachel (nur Handy): ganzer Flyer auf unscharfem Eigenhintergrund, damit man Events am Look wiedererkennt. */
function Tile({ e }: { e: EventCardData }) {
  if (!e.flyer) return null;
  return (
    <span aria-hidden className="relative block h-11 w-16 shrink-0 overflow-hidden bg-graphite md:hidden">
      <Image src={e.flyer} alt="" fill sizes="64px" className="scale-150 object-cover opacity-80 blur-md" />
      <Image src={e.flyer} alt="" fill sizes="64px" className="object-contain" />
    </span>
  );
}

/** Grosse Vorschau (nur Desktop): Flyer in voller Breite auf unscharfem Eigenhintergrund, damit jedes Format gut aussieht. */
function Preview({ e }: { e: EventCardData }) {
  return (
    <motion.article key={e.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28, ease }}
      className="border border-line bg-graphite">
      <div className="relative overflow-hidden bg-ink" style={{ aspectRatio: e.flyer ? Math.min(Math.max(e.flyerRatio, 1.5), 2.4) : 2 }}>
        {e.flyer ? (
          <>
            <Image src={e.flyer} alt="" aria-hidden fill sizes="26rem" className="scale-125 object-cover opacity-60 blur-2xl" />
            <Image src={e.flyer} alt={e.flyerAlt} fill sizes="26rem" className="object-contain" />
          </>
        ) : <div className="display absolute inset-0 flex items-end p-6 text-5xl text-line">Z!NKBAD</div>}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <p className="label text-cyan">{e.weekday} {e.day}. {e.month} · {e.time}{e.endTime ? ` – ${e.endTime}` : ""}</p>
          <Chip e={e} />
        </div>
        <h3 className="display mt-3 text-[clamp(1.75rem,2.4vw,2.5rem)] leading-[1.1]">{e.title}</h3>
        {e.lineup.length > 0 && <p className="label mt-4 leading-relaxed text-zinc">{e.lineup.join(" · ")}</p>}
        {e.description && <p className="mt-4 line-clamp-3 text-sm text-zinc">{e.description}</p>}
        <Link href={`/events/${e.slug}`} className="label mt-6 inline-flex items-center gap-3 bg-cyan px-5 py-3 font-bold text-ink transition-colors hover:bg-bone">
          {e.hasTickets ? "Details & Tickets" : "Details"} <span aria-hidden>→</span>
        </Link>
      </div>
    </motion.article>
  );
}

export function EventsBrowser({ events }: { events: EventCardData[] }) {
  const months = useMemo(() => {
    const m = new Map<string, { key: string; short: string; label: string; count: number }>();
    for (const e of events) { const x = m.get(e.monthKey); if (x) x.count++; else m.set(e.monthKey, { key: e.monthKey, short: e.monthChip, label: e.monthLabel, count: 1 }); }
    return [...m.values()];
  }, [events]);
  const [filter, setFilter] = useState("all");
  const [hover, setHover] = useState<string | null>(null);

  const shown = filter === "all" ? events : events.filter((e) => e.monthKey === filter);
  const groups = useMemo(() => {
    const g: { key: string; label: string; items: EventCardData[] }[] = [];
    for (const e of shown) { const last = g[g.length - 1]; if (last && last.key === e.monthKey) last.items.push(e); else g.push({ key: e.monthKey, label: e.monthLabel, items: [e] }); }
    return g;
  }, [shown]);
  const active = shown.find((e) => e.slug === hover) ?? shown[0];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <h2 data-split className="display text-[clamp(2.25rem,4.5vw,3.75rem)]">Alle Events<span className="text-cyan">.</span></h2>
        <div role="group" aria-label="Nach Monat filtern" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
          {[{ key: "all", short: "Alle", count: events.length }, ...months].map((m) => (
            <button key={m.key} type="button" aria-pressed={filter === m.key} onClick={() => { setFilter(m.key); setHover(null); }}
              className={`label shrink-0 border px-3 py-2 transition-colors ${filter === m.key ? "border-cyan bg-cyan font-bold text-ink" : "border-line text-zinc hover:border-bone hover:text-bone"}`}>
              {m.short} <span className={filter === m.key ? "opacity-70" : "text-zinc/70"}>({m.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <motion.div key={filter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
          {groups.map((g) => (
            <section key={g.key} aria-label={g.label} className="mb-8 last:mb-0">
              <h3 className="label sticky top-[4.4rem] z-10 flex items-baseline justify-between border-b border-bone/30 bg-ink pb-2 pt-3 text-bone">
                <span>{g.label}</span><span className="text-zinc">{g.items.length} {g.items.length === 1 ? "Event" : "Events"}</span>
              </h3>
              <ul>
                {g.items.map((e) => {
                  const isActive = active?.slug === e.slug;
                  return (
                    <li key={e.slug} className="border-b border-line">
                      <Link href={`/events/${e.slug}`} onMouseEnter={() => setHover(e.slug)} onFocus={() => setHover(e.slug)}
                        className="group relative grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-4 outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-cyan md:grid-cols-[4.25rem_minmax(0,1fr)_auto] md:gap-x-6 md:py-5">
                        <span aria-hidden className={`absolute inset-y-3 -left-3 hidden w-0.5 bg-cyan transition-opacity lg:block ${hover && isActive ? "opacity-100" : "opacity-0"}`} />
                        <span className="text-center leading-none">
                          <span className="label block text-zinc">{e.weekday}</span>
                          <span className="display mt-1 block text-[2rem] md:text-[2.5rem]">{e.day}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="display block text-[clamp(1.35rem,2.2vw,2rem)] leading-[1.2] transition-colors md:leading-[1.1] group-hover:text-cyan group-focus-visible:text-cyan">{e.title}</span>
                          <span className="label mt-2 block truncate text-zinc">
                            <span className="text-bone">{e.time}{e.endTime ? ` – ${e.endTime}` : ""}</span>
                            {e.lineup.length > 0 && <> · {e.lineup.join(" · ")}</>}
                          </span>
                          <Chip e={e} className="mt-2 inline-flex md:hidden" />
                        </span>
                        <span className="flex items-center gap-3">
                          <Tile e={e} />
                          <Chip e={e} className="hidden md:inline-flex" />
                          <span aria-hidden className="text-zinc transition-transform group-hover:translate-x-1 group-hover:text-cyan">→</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </motion.div>

        <aside aria-label="Vorschau" className="hidden lg:block">
          <div className="sticky top-28">
            <AnimatePresence mode="wait">{active && <Preview key={active.slug} e={active} />}</AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}
