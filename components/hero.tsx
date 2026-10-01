"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { LaserCanvas, type Emitter } from "./laser-canvas";
import { MagneticLink } from "./magnetic";
import { Lines } from "./reveal";

/** Clubfoto (2000×1116). Die Laser starten an den echten Moving-Heads an der Rückwand. */
const PHOTO = { width: 2000, height: 1116 };
const EMITTERS: Emitter[] = [
  { x: 455, y: 340, bias: 0.55, beams: 5, range: 0.5, speed: 0.31, phase: 0.0 },
  { x: 1090, y: 347, bias: 0.05, beams: 6, range: 0.6, speed: 0.23, phase: 1.7 },
  { x: 1305, y: 340, bias: -0.2, beams: 5, range: 0.5, speed: 0.37, phase: 3.1 },
  { x: 1545, y: 338, bias: -0.55, beams: 5, range: 0.5, speed: 0.27, phase: 4.4 },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const video = process.env.NEXT_PUBLIC_HERO_VIDEO;

  return (
    <section ref={ref} className="relative flex min-h-[58svh] items-end overflow-hidden fp:h-full fp:min-h-0">
      <motion.div style={{ scale }} className="absolute inset-0">
        <picture>
          <source media="(max-width: 767px)" srcSet="/hero/club-1000.webp" />
          <img src="/hero/club-2000.webp" alt="Blick in den Club: DJ-Pult, Lautsprecher und beleuchtete Glasbausteinwand" width={2000} height={1116}
            fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        </picture>
        {/* Bildbearbeitung per CSS: Vignette, abgedunkelter Grund, Scrims für Navigation und Titel */}
        <div className="absolute inset-0 bg-ink/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_75%_at_50%_45%,transparent_35%,rgba(10,10,11,0.6)_72%,rgba(10,10,11,0.95)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ink/80 to-transparent" />
        <LaserCanvas image={PHOTO} emitters={EMITTERS} className="absolute inset-0" />
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
        <h1 className="display text-[29vw] md:[font-size:min(30.5vw,46svh)] fp:md:[font-size:min(30.5vw,58svh)] leading-[0.8]">
          <Lines lines={["Z!NKBAD"]} delay={0.15} immediate />
        </h1>
        <p className="label mt-6 hidden text-zinc fp:block">Scrollen ↓</p>
      </motion.div>
    </section>
  );
}
