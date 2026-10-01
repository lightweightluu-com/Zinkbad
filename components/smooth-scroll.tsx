"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Weiches Scrollen auf normalen Seiten. Die Startseite nutzt den Fullpage-Modus und braucht es nicht. */
export function SmoothScroll() {
  const path = usePathname();
  useEffect(() => {
    if (path === "/" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09 });
    let raf = requestAnimationFrame(function tick(t) { lenis.raf(t); raf = requestAnimationFrame(tick); });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, [path]);
  return null;
}
