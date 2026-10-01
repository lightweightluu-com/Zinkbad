"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Mobile: feste Leiste mit Tickets / Member, sobald der Hero verlassen wurde (Scroll oder Fullpage-Wechsel). */
export function MobileCta() {
  const [scrolled, setScrolled] = useState(false);
  const [screen, setScreen] = useState(0);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    const fp = (e: Event) => setScreen((e as CustomEvent<{ index: number }>).detail.index);
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("fp-change", fp);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("fp-change", fp); };
  }, []);
  const show = scrolled || screen > 0;
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-px bg-line pb-[env(safe-area-inset-bottom)] md:hidden">
          <Link href="/tickets" className="bg-cyan py-4 text-center label font-bold text-ink">Tickets</Link>
          <Link href="/#member" className="bg-ink py-4 text-center label font-bold text-bone">Member</Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
