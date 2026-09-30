"use client";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface StripItem { slug: string; title: string; when: string; flyer: string | null; ratio: number }

/** Scrollgesteuerter Horizontalstreifen. Bei reduced motion: normales horizontales Scrollen. */
export function FlyerStrip({ items }: { items: StripItem[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    const measure = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setPinned(!reduce);
      if (track.current) setShift(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [items]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -shift]);

  const cards = items.map((it) => (
    <Link key={it.slug} href={`/tickets#${it.slug}`} className="group relative block shrink-0 overflow-hidden bg-graphite" style={{ aspectRatio: it.ratio, width: `min(calc(min(42svh, 320px) * ${it.ratio}), 82vw, 820px)` }}>
      {it.flyer
        ? <Image src={it.flyer} alt={it.title} fill sizes="(max-width: 768px) 80vw, 640px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        : <span className="display absolute inset-0 flex items-start p-5 text-3xl text-bone">{it.title}</span>}
      <span className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/80 px-3 py-2 label text-bone">
        <span>{it.when}</span><span className="text-cyan">→</span>
      </span>
    </Link>
  ));

  if (!pinned) {
    return <section aria-label="Flyer" className="overflow-x-auto px-5 py-16 md:px-10"><div className="flex w-max items-center gap-4">{cards}</div></section>;
  }
  return (
    <section ref={section} aria-label="Flyer" style={{ height: `calc(100svh + ${shift}px)` }} className="relative border-t border-line">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <p className="label mb-8 px-5 text-zinc md:px-10">Programm — scrollen</p>
        <motion.div ref={track} style={{ x }} className="flex w-max items-center gap-4 px-5 md:px-10">{cards}</motion.div>
      </div>
    </section>
  );
}
