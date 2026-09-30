"use client";
import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09 });
    let raf = requestAnimationFrame(function tick(t) { lenis.raf(t); raf = requestAnimationFrame(tick); });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return null;
}
