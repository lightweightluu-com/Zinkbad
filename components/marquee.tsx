export function Marquee({ items }: { items: string[] }) {
  const row = items.map((t, i) => <span key={i} className="mx-8 shrink-0">{t}<span className="ml-16 text-cyan">!</span></span>);
  return (
    <div className="overflow-hidden whitespace-nowrap py-[0.1em]" aria-hidden>
      <div className="marquee-track flex w-max display text-[clamp(3rem,9vw,8rem)]">{row}{row}</div>
    </div>
  );
}
