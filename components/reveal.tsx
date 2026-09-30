"use client";
import { motion } from "motion/react";

/** "!" und ein End-Punkt werden im Brand-Cyan gesetzt. */
function accent(text: string) {
  return text.split(/(!|\.$)/).map((part, i) => (part === "!" || part === "." ? <span key={i} className="text-cyan">{part}</span> : part));
}

const ease = [0.16, 1, 0.3, 1] as const;

/** Zeilenweiser Maskenreveal: jede Zeile fährt aus einer abgeschnittenen Box hoch. */
export function Lines({ lines, className = "", delay = 0, immediate = false }: { lines: string[]; className?: string; delay?: number; immediate?: boolean }) {
  return (
    <span className={`block ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className="block"
            initial={{ y: "105%" }}
            {...(immediate ? { animate: { y: 0 } } : { whileInView: { y: 0 }, viewport: { once: true, margin: "0px 0px -8% 0px" } })}
            transition={{ duration: 1.1, ease, delay: delay + i * 0.09 }}
          >{accent(l)}</motion.span>
        </span>
      ))}
    </span>
  );
}

export function Fade({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.9, ease, delay }}>
      {children}
    </motion.div>
  );
}
