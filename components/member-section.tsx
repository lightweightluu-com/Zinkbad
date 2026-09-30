import { MEMBER_TIERS } from "@/lib/membership";
import { MagneticLink } from "./magnetic";
import { Fade, Lines } from "./reveal";

export function MemberSection() {
  return (
    <section id="member" className="px-5 py-40 md:px-10 md:py-56">
      <p className="label mb-10 text-zinc">03 — Membership</p>
      <h2 className="display text-[clamp(3.5rem,13vw,13rem)]"><Lines lines={["Zinkbad", "Member."]} /></h2>
      <p className="mt-10 max-w-md text-lg text-zinc">Gültig für 1 Jahr ab Kaufdatum. Hol dir jetzt deine Membercard.</p>

      <ul className="mt-24 border-t border-line">
        {MEMBER_TIERS.map((t, i) => (
          <li key={t.id} className="border-b border-line">
            <Fade delay={i * 0.06} className="grid gap-x-10 gap-y-6 py-10 md:grid-cols-[1fr_1.4fr_auto] md:items-center md:py-14">
              <div>
                <h3 className="display text-[clamp(3rem,7vw,6.5rem)]">{t.name}</h3>
                <p className="label mt-3 text-cyan">CHF {t.price_chf}.–</p>
              </div>
              <ul className="space-y-1 text-lg text-zinc">{t.perks.map((p) => <li key={p}>+ {p}</li>)}</ul>
              <div><MagneticLink href={`/api/checkout?member=${t.id}`} external>Kaufen</MagneticLink></div>
            </Fade>
          </li>
        ))}
      </ul>
    </section>
  );
}
