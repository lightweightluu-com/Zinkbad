"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { LaserCanvas } from "./laser-canvas";
import { Lines } from "./reveal";

export function Hero({ nextLine }: { nextLine: string | null }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const video = process.env.NEXT_PUBLIC_HERO_VIDEO;

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(0,204,255,0.16),transparent_70%),radial-gradient(ellipse_80%_45%_at_50%_105%,rgba(0,204,255,0.14),transparent_70%)]" />
        <LaserCanvas className="absolute inset-0" />
        {video && <video src={video} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />}
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />

      <motion.div style={{ y: titleY, opacity: fade }} className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
        <div className="mb-6 flex items-end justify-between gap-6 label text-bone">
          <span>Club — Zürich<br />Geerenweg 2</span>
          {nextLine && <span className="text-right text-cyan">Next: {nextLine}</span>}
        </div>
        <h1 className="display text-[29vw] md:text-[30.5vw] leading-[0.8]">
          <Lines lines={["Z!NKBAD"]} delay={0.15} immediate />
        </h1>
      </motion.div>
    </section>
  );
}
