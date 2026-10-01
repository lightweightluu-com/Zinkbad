"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";

/** Button, der leicht zum Cursor zieht. Auf Touch / reduced motion ein normaler Link. */
export function MagneticLink({ href, children, className = "", external = false, variant = "solid" }: { href: string; children: React.ReactNode; className?: string; external?: boolean; variant?: "solid" | "outline" }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 }), sy = useSpring(y, { stiffness: 220, damping: 18 });
  const move = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => { x.set(0); y.set(0); };
  const look = variant === "solid" ? "bg-cyan text-ink hover:bg-bone" : "border border-bone/40 text-bone hover:border-cyan hover:text-cyan";
  const cls = `inline-flex items-center gap-3 px-6 py-4 label font-bold transition-colors ${look} ${className}`;
  return (
    <motion.span style={{ x: sx, y: sy }} onPointerMove={move} onPointerLeave={reset} className="inline-block">
      {external
        ? <a href={href} className={cls}>{children}</a>
        : <Link href={href} prefetch={false} className={cls}>{children}</Link>}
    </motion.span>
  );
}
