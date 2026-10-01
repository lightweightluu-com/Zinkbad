"use client";
import { useEffect, useRef } from "react";

/** Lichtquelle in Bildkoordinaten des Hero-Fotos (px) plus Grundrichtung der Strahlen (rad, 0 = senkrecht nach oben, + = nach rechts). */
export interface Emitter { x: number; y: number; bias: number; beams: number; range: number; speed: number; phase: number }

/**
 * Laser im Brand-Cyan, die von den Lichtquellen des Fotos ausgehen. Die Quellen liegen in Bildkoordinaten
 * und werden wie `object-fit: cover` auf den Bildschirm abgebildet, bleiben also auf jedem Format am richtigen Licht.
 * Puls auf 124 BPM; pausiert ausserhalb des Viewports und bei hidden Tab, statisches Bild bei reduced motion.
 */
const BPM = 124;

export function LaserCanvas({ image, emitters, className = "" }: { image: { width: number; height: number }; emitters: Emitter[]; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true, running = false;
    let scale = 1, offX = 0, offY = 0;

    const resize = () => {
      const dpr = window.innerWidth < 768 ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.max(w / image.width, h / image.height); // object-fit: cover, zentriert
      offX = (w - image.width * scale) / 2;
      offY = (h - image.height * scale) / 2;
      if (reduce || !running) draw(3.2);
    };

    const draw = (t: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      const beat = 0.7 + 0.3 * Math.pow(Math.max(0, Math.sin(t * Math.PI * (BPM / 60))), 6);
      const reach = Math.hypot(w, h) * 1.1;

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (const f of emitters) {
        const ox = offX + f.x * scale, oy = offY + f.y * scale;
        for (let i = 0; i < f.beams; i++) {
          const k = f.beams === 1 ? 0 : i / (f.beams - 1) - 0.5;
          // 0 = senkrecht nach oben: Winkel in Canvas-Richtung = -π/2 + Abweichung
          const a = -Math.PI / 2 + f.bias + k * f.range * 1.6 + Math.sin(t * f.speed * 2 + f.phase + i * 0.6) * f.range * 0.45;
          const ex = ox + Math.cos(a) * reach, ey = oy + Math.sin(a) * reach;
          const rgb = i % 4 === 0 ? "236,235,230" : "0,204,255";
          const alpha = (i % 4 === 0 ? 0.55 : 0.9) * beat;
          const g = ctx.createLinearGradient(ox, oy, ex, ey);
          g.addColorStop(0, `rgba(${rgb},${alpha})`);
          g.addColorStop(0.5, `rgba(${rgb},${alpha * 0.4})`);
          g.addColorStop(1, `rgba(${rgb},0)`);
          ctx.strokeStyle = g;
          for (const [lw, m] of [[10, 0.16], [1.3, 1]] as const) {
            ctx.globalAlpha = m; ctx.lineWidth = lw;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = `rgba(236,235,230,${0.95 * beat})`;
        ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();
      }
    };

    const start = () => {
      if (reduce || running || !visible || document.hidden) return;
      running = true;
      const t0 = performance.now();
      let last = 0;
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (now - last < 33) return; // 30 fps reichen für Laser, halbiert die Last
        last = now; draw((now - t0) / 1000 + 3.2);
      };
      raf = requestAnimationFrame(tick);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
    io.observe(canvas);
    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", vis);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize(); start();
    return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, [image, emitters]);

  return <canvas ref={ref} className={`h-full w-full ${className}`} aria-hidden />;
}
