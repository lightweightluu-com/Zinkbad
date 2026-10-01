import Image from "next/image";
import Link from "next/link";
import { Fade } from "./reveal";

export interface EventRowData {
  slug: string; title: string; weekday: string; day: string; time: string;
  lineup: string[]; flyer: string | null; flyerRatio: number; flyerAlt: string; status: string; hasTickets: boolean;
}

const badge: Record<string, string> = { sold_out: "Sold out", cancelled: "Abgesagt" };

export function EventList({ events }: { events: EventRowData[] }) {
  return (
    <ul className="border-t border-line">
      {events.map((e, i) => (
        <li key={e.slug} className="border-b border-line">
          <Fade delay={Math.min(i, 4) * 0.04}>
            <Link href={`/events/${e.slug}`} className="group grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-3 py-6 md:grid-cols-[6.5rem_11rem_1fr_minmax(0,16rem)_6.5rem] md:items-center">
              <span className="label text-zinc group-hover:text-cyan">{e.weekday} {e.day}<br /><span className="text-bone">{e.time}</span></span>
              {e.flyer
                ? <Image src={e.flyer} alt={e.flyerAlt} width={440} height={Math.round(440 / e.flyerRatio)} sizes="(max-width: 768px) 100vw, 176px" className="order-last col-span-2 h-auto w-full max-w-[240px] md:order-none md:col-span-1 md:max-w-none" />
                : <span className="hidden md:block" />}
              <span className={`display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[0.95] ${e.status === "cancelled" ? "line-through opacity-40" : ""}`}>{e.title}</span>
              <span className="col-span-2 label text-zinc md:col-span-1">{e.lineup.join(" · ")}</span>
              <span className="col-span-2 label whitespace-nowrap md:col-span-1 md:text-right">
                {badge[e.status] ?? (e.hasTickets ? <span className="text-cyan">Tickets →</span> : "Info →")}
              </span>
            </Link>
          </Fade>
        </li>
      ))}
    </ul>
  );
}
