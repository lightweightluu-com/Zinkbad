"use client";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";

/**
 * Fullscreen-Sektionen mit Wipe-Übergang (GSAP Observer + SplitText).
 * Ein Wheel-/Touch-Impuls springt zur nächsten Sektion. Ist eine Sektion höher als der
 * Bildschirm, scrollt zuerst ihr Inhalt, erst am Rand folgt der Wechsel.
 * Reduzierte Bewegung / kein JS: normale, gestapelte Seite.
 */
export function Fullpage({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const api = useRef<{ go: (i: number) => void } | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [hint, setHint] = useState(true); // Scroll-Hinweis nur, wenn unter dem sichtbaren Inhalt nichts mehr folgt

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(Observer, SplitText);

    const html = document.documentElement;
    html.classList.add("fp");
    const sections = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-screen]"));
    const n = sections.length;
    const q = (s: HTMLElement, sel: string) => s.querySelector<HTMLElement>(sel)!;
    const outer = sections.map((s) => q(s, ".fp-outer"));
    const inner = sections.map((s) => q(s, ".fp-inner"));
    const bg = sections.map((s) => q(s, ".fp-bg"));
    const splits = sections.map((s) => {
      const h = s.querySelector<HTMLElement>("[data-split]");
      return h ? new SplitText(h, { type: "chars,words,lines", linesClass: "fp-clip" }) : null;
    });
    setLabels(sections.map((s) => s.dataset.label ?? ""));

    const hashIdx = sections.findIndex((s) => s.id === location.hash.slice(1));
    let current = Math.max(0, hashIdx);
    let animating = false;
    let lockUntil = 0;
    let lastScroll = 0;
    const updateHint = () => {
      const el = bg[current];
      setHint(el.scrollHeight - el.clientHeight - el.scrollTop <= 24);
    };

    gsap.set(sections, { autoAlpha: 0, zIndex: 0 });
    gsap.set(outer, { yPercent: 100 });
    gsap.set(inner, { yPercent: -100 });
    gsap.set(sections[current], { autoAlpha: 1, zIndex: 1 });
    gsap.set([outer[current], inner[current]], { yPercent: 0 });
    setActive(current);
    updateHint();
    window.addEventListener("resize", updateHint);
    // Inhaltshöhe ändert sich (z. B. Filter in der Eventliste): Hinweis neu bewerten
    const sizeObserver = new ResizeObserver(updateHint);
    bg.forEach((el) => { if (el.firstElementChild) sizeObserver.observe(el.firstElementChild); });
    window.dispatchEvent(new CustomEvent("fp-change", { detail: { index: current } }));

    const go = (to: number, dir: 1 | -1) => {
      if (animating || to === current || to < 0 || to >= n) return;
      animating = true;
      const from = current;
      current = to;
      setActive(to);
      window.dispatchEvent(new CustomEvent("fp-change", { detail: { index: to } }));

      const tl = gsap.timeline({
        defaults: { duration: 1.1, ease: "power1.inOut" },
        onComplete: () => { animating = false; lockUntil = performance.now() + 250; updateHint(); },
      });
      gsap.set(sections[from], { zIndex: 0 });
      tl.to(bg[from], { yPercent: -15 * dir }).set(sections[from], { autoAlpha: 0 });

      gsap.set(sections[to], { autoAlpha: 1, zIndex: 1 });
      bg[to].scrollTop = dir === -1 ? bg[to].scrollHeight : 0; // von unten kommend am Ende einsteigen
      updateHint();
      tl.fromTo([outer[to], inner[to]], { yPercent: (i: number) => (i ? -100 * dir : 100 * dir) }, { yPercent: 0 }, 0)
        .fromTo(bg[to], { yPercent: 15 * dir }, { yPercent: 0 }, 0);
      const chars = splits[to]?.chars;
      if (chars?.length) {
        tl.fromTo(chars, { autoAlpha: 0, yPercent: 150 * dir },
          { autoAlpha: 1, yPercent: 0, duration: 1, ease: "power2", stagger: { each: 0.02, from: "random" } }, 0.2);
      }
    };
    api.current = { go: (i) => go(i, i > current ? 1 : -1) };

    const canScroll = (dir: 1 | -1) => {
      const el = bg[current];
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 2) return false;
      return dir === 1 ? el.scrollTop < max - 2 : el.scrollTop > 2;
    };
    const attempt = (dir: 1 | -1) => {
      const now = performance.now();
      if (canScroll(dir) || now - lastScroll < 200 || now < lockUntil) return; // Trägheit am Rand nicht als Sprung werten
      go(current + dir, dir);
    };
    const onScroll = () => { lastScroll = performance.now(); updateHint(); };
    bg.forEach((el) => el.addEventListener("scroll", onScroll, { passive: true }));

    const observer = Observer.create({
      target: window, type: "wheel,touch", wheelSpeed: -1, tolerance: 10, preventDefault: false,
      onUp: () => attempt(1), onDown: () => attempt(-1),
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input,textarea,select")) return;
      const k = e.key;
      if (k === "Home") { e.preventDefault(); go(0, -1); return; }
      if (k === "End") { e.preventDefault(); go(n - 1, 1); return; }
      const isSpace = k === " ";
      if (isSpace && t.closest("a,button")) return;
      const dir = k === "ArrowDown" || k === "PageDown" || (isSpace && !e.shiftKey) ? 1
        : k === "ArrowUp" || k === "PageUp" || (isSpace && e.shiftKey) ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      if (canScroll(dir)) bg[current].scrollBy({ top: dir * window.innerHeight * 0.8, behavior: "smooth" });
      else attempt(dir);
    };
    document.addEventListener("keydown", onKey);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== "/" || !url.hash) return;
      const idx = sections.findIndex((s) => s.id === url.hash.slice(1));
      if (idx < 0) return;
      e.preventDefault(); // Capture-Phase: läuft vor dem Next-Link-Handler
      history.replaceState(null, "", url.hash);
      go(idx, idx > current ? 1 : -1);
    };
    document.addEventListener("click", onClick, true);

    const onHash = () => {
      const idx = sections.findIndex((s) => s.id === location.hash.slice(1));
      if (idx >= 0) go(idx, idx > current ? 1 : -1);
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);

    return () => {
      observer.kill();
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
      bg.forEach((el) => el.removeEventListener("scroll", onScroll));
      window.removeEventListener("resize", updateHint);
      sizeObserver.disconnect();
      gsap.killTweensOf([sections, outer, inner, bg]);
      splits.forEach((s) => s?.revert());
      gsap.set([sections, outer, inner, bg], { clearProps: "all" });
      html.classList.remove("fp");
      api.current = null;
    };
  }, []);

  return (
    <>
      <main ref={root}>{children}</main>
      {labels.length > 1 && (
        <button type="button" onClick={() => api.current?.go(active >= labels.length - 1 ? 0 : active + 1)}
          aria-label={active >= labels.length - 1 ? "Zurück zum Anfang" : "Zur nächsten Sektion"}
          tabIndex={hint ? 0 : -1} aria-hidden={!hint}
          className={`group fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 border border-bone/25 bg-ink/70 px-4 py-2.5 label text-bone transition-[opacity,color,border-color] duration-300 hover:border-cyan hover:text-cyan ${hint ? "opacity-100" : "pointer-events-none opacity-0"} ${active > 0 ? "bottom-[4.5rem] md:bottom-6" : "bottom-6"}`}>
          {active >= labels.length - 1 ? "Nach oben" : "Scrollen"}
          <span aria-hidden className={`text-cyan ${active >= labels.length - 1 ? "" : "animate-[fp-bob_1.6s_ease-in-out_infinite]"}`}>{active >= labels.length - 1 ? "↑" : "↓"}</span>
        </button>
      )}
      {labels.length > 1 && (
        <nav aria-label="Abschnitte" className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-1 md:flex">
          {labels.map((l, i) => (
            <button key={l} type="button" aria-label={l} aria-current={i === active} onClick={() => api.current?.go(i)}
              className="group flex h-6 w-6 items-center justify-center">
              <span className={`block rounded-full transition-all ${i === active ? "h-2.5 w-2.5 bg-cyan" : "h-1.5 w-1.5 bg-bone/50 group-hover:bg-bone"}`} />
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
