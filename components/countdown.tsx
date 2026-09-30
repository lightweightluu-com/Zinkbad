"use client";
import { useEffect, useState } from "react";

export function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (now === null) return <span className="tabular-nums opacity-0">00T 00:00:00</span>;
  const s = Math.max(0, Math.floor((new Date(to).getTime() - now) / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  if (s === 0) return <span className="text-cyan">Jetzt live</span>;
  return <span className="tabular-nums">{p(Math.floor(s / 86400))}T {p(Math.floor(s / 3600) % 24)}:{p(Math.floor(s / 60) % 60)}:{p(s % 60)}</span>;
}
