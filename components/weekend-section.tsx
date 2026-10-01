import Image from "next/image";
import { flyerUrl } from "@/lib/events";
import { fmtDay, fmtTime, fmtWeekday } from "@/lib/format";
import type { ClubEvent } from "@/lib/types";
import { Fade } from "./reveal";
import { TicketActions } from "./ticket-actions";

/** Partys dieses Wochenendes (oder, falls keine, die nächste) mit direkten Kaufbuttons. */
export function WeekendSection({ events, isWeekend }: { events: ClubEvent[]; isWeekend: boolean }) {
  if (events.length === 0) return null;
  const cols = events.length;
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-6 pb-2">
        <h2 data-split className="display text-[clamp(2.25rem,4.5vw,3.75rem)]">{isWeekend ? "Dieses Wochenende" : "Nächste Party"}<span className="text-cyan">.</span></h2>
        <a href="#events" className="label hidden text-zinc hover:text-cyan md:block">Alle Events ↓</a>
      </div>
      {/* 1 Event: Zeile (Flyer links, Info rechts). 2-3 Events: Spalten, damit alles auf einen Bildschirm passt. */}
      <div className={`border-t border-line ${cols > 1 ? "grid gap-x-8 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]" : ""}`} style={{ "--cols": Math.min(cols, 3) } as React.CSSProperties}>
        {events.map((e, i) => {
          const flyer = flyerUrl(e.flyer_path);
          return (
            <Fade key={e.id} delay={i * 0.08} className="border-b border-line">
              <article className={`grid gap-x-10 gap-y-3 py-4 md:gap-y-5 md:py-8 ${cols > 1 ? "" : "md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]"}`}>
                {flyer
                  ? <Image src={flyer} alt={e.flyer_alt ?? e.title} width={1200} height={Math.round(1200 / (e.flyer_ratio ?? 2.35))} priority={i === 0} sizes={cols > 1 ? "(max-width: 1024px) 100vw, 33vw" : "(max-width: 768px) 100vw, 55vw"} className="h-auto w-full" />
                  : <div className="hidden bg-graphite md:block" />}
                <div className="flex flex-col">
                  <p className="label text-cyan">{fmtWeekday(e.starts_at)} {fmtDay(e.starts_at)} · {fmtTime(e.starts_at)}{e.ends_at ? ` – ${fmtTime(e.ends_at)}` : ""}</p>
                  <h3 className="display mt-3 text-[clamp(1.6rem,3vw,2.75rem)]">{e.title}</h3>
                  {e.lineup.length > 0 && <p className="label mt-3 text-zinc">{e.lineup.map((l) => l.name).join(" · ")}</p>}
                  {e.description && <p className="mt-3 max-w-md text-zinc">{e.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-3 md:mt-5"><TicketActions event={e} detailHref={`/tickets#${e.slug}`} /></div>
                </div>
              </article>
            </Fade>
          );
        })}
      </div>
    </div>
  );
}
