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
        // Die Maske wird beobachtet (nicht das versteckte Kind), sonst löst der Observer nie zuverlässig aus.
        <motion.span
          key={i}
          className="block overflow-hidden py-[0.12em] -my-[0.12em]"
          initial="hidden"
          {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "0px 0px -8% 0px" } })}
        >
          <motion.span
            className="block"
            variants={{ hidden: { y: "105%" }, show: { y: 0, transition: { duration: 1.1, ease, delay: delay + i * 0.09 } } }}
          >{accent(l)}</motion.span>
        </motion.span>
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
