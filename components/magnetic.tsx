"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";

/** Button, der leicht zum Cursor zieht. Auf Touch / reduced motion ein normaler Link. */
export function MagneticLink({ href, children, className = "", external = false }: { href: string; children: React.ReactNode; className?: string; external?: boolean }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 }), sy = useSpring(y, { stiffness: 220, damping: 18 });
  const move = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => { x.set(0); y.set(0); };
  const cls = `inline-flex items-center gap-3 bg-cyan px-7 py-4 label font-bold text-ink transition-colors hover:bg-bone ${className}`;
  return (
    <motion.span style={{ x: sx, y: sy }} onPointerMove={move} onPointerLeave={reset} className="inline-block">
      {external
        ? <a href={href} className={cls}>{children}</a>
        : <Link href={href} prefetch={false} className={cls}>{children}</Link>}
    </motion.span>
  );
}
