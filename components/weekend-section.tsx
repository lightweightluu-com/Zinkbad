import Image from "next/image";
import { flyerUrl } from "@/lib/events";
import { fmtDay, fmtTime, fmtWeekday } from "@/lib/format";
import type { ClubEvent } from "@/lib/types";
import { Fade } from "./reveal";
import { TicketActions } from "./ticket-actions";

/** Partys dieses Wochenendes (oder, falls keine, die nächste) mit direkten Kaufbuttons. */
export function WeekendSection({ events, isWeekend }: { events: ClubEvent[]; isWeekend: boolean }) {
  if (events.length === 0) return null;
  return (
    <section id="wochenende" className="scroll-mt-16 px-5 pb-16 pt-8 md:px-10 md:pb-24 md:pt-10">
      <div className="mb-6 flex items-baseline justify-between gap-6 pb-2">
        <h2 className="display text-[clamp(2.25rem,4.5vw,3.75rem)]">{isWeekend ? "Dieses Wochenende" : "Nächste Party"}<span className="text-cyan">.</span></h2>
        <a href="#events" className="label hidden text-zinc hover:text-cyan md:block">Alle Events ↓</a>
      </div>
      <div className="border-t border-line">
        {events.map((e, i) => {
          const flyer = flyerUrl(e.flyer_path);
          return (
            <Fade key={e.id} delay={i * 0.08} className="border-b border-line">
              <article className="grid gap-x-10 gap-y-6 py-8 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] md:py-10">
                {flyer
                  ? <Image src={flyer} alt={e.flyer_alt ?? e.title} width={1200} height={Math.round(1200 / (e.flyer_ratio ?? 2.35))} priority={i === 0} sizes="(max-width: 768px) 100vw, 55vw" className="h-auto w-full" />
                  : <div className="hidden bg-graphite md:block" />}
                <div className="flex flex-col">
                  <p className="label text-cyan">{fmtWeekday(e.starts_at)} {fmtDay(e.starts_at)} · {fmtTime(e.starts_at)}{e.ends_at ? ` – ${fmtTime(e.ends_at)}` : ""}</p>
                  <h3 className="display mt-3 text-[clamp(2rem,3.6vw,3.25rem)]">{e.title}</h3>
                  {e.lineup.length > 0 && <p className="label mt-4 text-zinc">{e.lineup.map((l) => l.name).join(" · ")}</p>}
                  {e.description && <p className="mt-3 max-w-md text-zinc">{e.description}</p>}
                  <div className="mt-6 flex flex-wrap gap-3"><TicketActions event={e} detailHref={`/tickets#${e.slug}`} /></div>
                </div>
              </article>
            </Fade>
          );
        })}
      </div>
    </section>
  );
}
