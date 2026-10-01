"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { LaserCanvas } from "./laser-canvas";
import { MagneticLink } from "./magnetic";
import { Lines } from "./reveal";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const video = process.env.NEXT_PUBLIC_HERO_VIDEO;

  return (
    <section ref={ref} className="relative flex min-h-[58svh] items-end overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(0,204,255,0.16),transparent_70%),radial-gradient(ellipse_80%_45%_at_50%_105%,rgba(0,204,255,0.14),transparent_70%)]" />
        <LaserCanvas className="absolute inset-0" />
        {video && <video src={video} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />}
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />

      <motion.div style={{ y: titleY, opacity: fade }} className="relative w-full px-5 pb-8 pt-28 md:px-10 md:pb-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <span className="label text-bone">Club — Zürich<br />Geerenweg 2</span>
          <div className="flex flex-wrap gap-3">
            <MagneticLink href="/tickets">Tickets</MagneticLink>
            <MagneticLink href="/#member" variant="outline">Member werden</MagneticLink>
          </div>
        </div>
        <h1 className="display text-[29vw] md:[font-size:min(30.5vw,46svh)] leading-[0.8]">
          <Lines lines={["Z!NKBAD"]} delay={0.15} immediate />
        </h1>
      </motion.div>
    </section>
  );
}
