"use client";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Fade } from "./reveal";

export interface EventRowData {
  slug: string; title: string; weekday: string; day: string; time: string;
  lineup: string[]; flyer: string | null; flyerRatio: number; flyerAlt: string; status: string; hasTickets: boolean;
}

const badge: Record<string, string> = { sold_out: "Sold out", cancelled: "Abgesagt" };

export function EventList({ events }: { events: EventRowData[] }) {
  const [hover, setHover] = useState<EventRowData | null>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30 }), sy = useSpring(y, { stiffness: 260, damping: 30 });

  const place = (e: React.PointerEvent, jump = false) => {
    if (e.pointerType !== "mouse") return;
    x.set(e.clientX + 28); y.set(e.clientY - 90);
    if (jump) { sx.jump(e.clientX + 28); sy.jump(e.clientY - 90); }
  };

  return (
    <div
      onPointerMove={(e) => place(e)}
      onPointerLeave={() => setHover(null)}
    >
      <ul className="border-t border-line">
        {events.map((e, i) => {
          const dead = e.status === "cancelled";
          return (
            <li key={e.slug} className="border-b border-line">
              <Fade delay={Math.min(i, 4) * 0.05}>
                <Link
                  href={`/tickets#${e.slug}`}
                  onPointerEnter={(ev) => { if (ev.pointerType === "mouse") { place(ev, true); setHover(e); } }}
                  className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 py-7 md:grid-cols-[9rem_1fr_minmax(0,18rem)_7rem] md:py-9"
                >
                  <span className="label text-zinc group-hover:text-cyan">{e.weekday} {e.day}<br /><span className="text-bone">{e.time}</span></span>
                  <span className={`display text-[clamp(2.25rem,6vw,5.5rem)] transition-transform duration-500 ease-out group-hover:translate-x-3 ${dead ? "line-through opacity-40" : ""}`}>{e.title}</span>
                  <span className="col-span-2 label text-zinc md:col-span-1">{e.lineup.join(" · ")}</span>
                  <span className="col-span-2 label text-right md:col-span-1">
                    {badge[e.status] ?? (e.hasTickets ? <span className="text-cyan">Tickets →</span> : "Info →")}
                  </span>
                </Link>
                {e.flyer && (
                  <Image src={e.flyer} alt={e.flyerAlt} width={1000} height={Math.round(1000 / e.flyerRatio)} sizes="(max-width: 768px) 100vw, 0px" className="mb-7 h-auto w-full md:hidden" />
                )}
              </Fade>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {hover?.flyer && (
          <motion.div key={hover.slug} style={{ x: sx, y: sy }} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25 }} className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[400px] md:block" aria-hidden>
            <Image src={hover.flyer} alt="" width={800} height={Math.round(800 / hover.flyerRatio)} sizes="400px" className="h-auto w-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
