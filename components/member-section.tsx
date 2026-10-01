import { MEMBER_TIERS } from "@/lib/membership";
import { MagneticLink } from "./magnetic";
import { Fade } from "./reveal";

export function MemberSection() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-4 md:mb-10">
        <h2 data-split className="display text-[clamp(2.25rem,4.5vw,3.75rem)]">Zinkbad Member<span className="text-cyan">.</span></h2>
        <p className="label text-zinc">Gültig 1 Jahr ab Kaufdatum</p>
      </div>
      <ul className="grid gap-px bg-line md:grid-cols-3">
        {MEMBER_TIERS.map((t, i) => (
          <li key={t.id} className="bg-ink">
            {/* Mobil: Name/Preis links, Kaufen rechts, Leistungen darunter. Ab md: Spalte mit Button unten. */}
            <Fade delay={i * 0.07} className="grid h-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-4 md:flex md:flex-col md:items-stretch md:p-8">
              <div>
                <h3 className="display text-[clamp(2.25rem,5vw,4.5rem)]">{t.name}</h3>
                <p className="label mt-1 text-cyan md:mt-2">CHF {t.price_chf}.–</p>
              </div>
              <ul className="order-last col-span-2 space-y-1 text-sm text-zinc md:order-none md:mt-8 md:space-y-2 md:text-base">{t.perks.map((p) => <li key={p}>+ {p}</li>)}</ul>
              <div className="md:mt-auto md:pt-10"><MagneticLink href={`/api/checkout?member=${t.id}`} external>{t.name} kaufen</MagneticLink></div>
            </Fade>
          </li>
        ))}
      </ul>
    </div>
  );
}
