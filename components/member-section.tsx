import { MEMBER_TIERS } from "@/lib/membership";
import { MagneticLink } from "./magnetic";
import { Fade } from "./reveal";

export function MemberSection() {
  return (
    <section id="member" className="scroll-mt-16 border-t border-line px-5 py-20 md:px-10 md:py-28">
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line pb-4">
        <h2 className="display text-[clamp(2.5rem,6vw,5rem)]">Zinkbad Member<span className="text-cyan">.</span></h2>
        <p className="label text-zinc">Gültig 1 Jahr ab Kaufdatum</p>
      </div>
      <ul className="grid gap-px bg-line md:grid-cols-3">
        {MEMBER_TIERS.map((t, i) => (
          <li key={t.id} className="bg-ink">
            <Fade delay={i * 0.07} className="flex h-full flex-col p-6 md:p-8">
              <h3 className="display text-[clamp(2.5rem,5vw,4.5rem)]">{t.name}</h3>
              <p className="label mt-2 text-cyan">CHF {t.price_chf}.–</p>
              <ul className="mt-8 space-y-2 text-zinc">{t.perks.map((p) => <li key={p}>+ {p}</li>)}</ul>
              <div className="mt-auto pt-10"><MagneticLink href={`/api/checkout?member=${t.id}`} external>{t.name} kaufen</MagneticLink></div>
            </Fade>
          </li>
        ))}
      </ul>
    </section>
  );
}
