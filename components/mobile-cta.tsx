"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Mobile: feste Leiste mit Tickets / Member, sobald der Hero verlassen wurde. */
export function MobileCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.6);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
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
