import { Countdown } from "@/components/countdown";
import { EventList, type EventRowData } from "@/components/event-list";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { InfoSection } from "@/components/info-section";
import { MagneticLink } from "@/components/magnetic";
import { MemberSection } from "@/components/member-section";
import { Nav } from "@/components/nav";
import { Fade, Lines } from "@/components/reveal";
import { flyerUrl, listUpcoming } from "@/lib/events";
import { fmtDay, fmtTime, fmtWeekday } from "@/lib/format";

export const revalidate = 60;

export default async function Home() {
  const events = await listUpcoming();
  const next = events.find((e) => e.status === "published" || e.status === "sold_out") ?? null;
  const rows: EventRowData[] = events.map((e) => ({
    slug: e.slug, title: e.title, weekday: fmtWeekday(e.starts_at), day: fmtDay(e.starts_at), time: fmtTime(e.starts_at),
    lineup: e.lineup.map((l) => l.name), flyer: flyerUrl(e.flyer_path), flyerAlt: e.flyer_alt ?? e.title,
    status: e.status, hasTickets: e.tickets.length > 0 || Boolean(e.ticket_url),
  }));

  return (
    <>
      <Nav />
      <main>
        <Hero nextLine={next ? `${fmtWeekday(next.starts_at)} ${fmtDay(next.starts_at)}` : null} />

        <section className="px-5 py-40 md:px-10 md:py-56">
          <p className="label mb-10 text-zinc">01 — Club</p>
          <p className="display max-w-[16ch] text-[clamp(2.75rem,9vw,9rem)]">
            <Lines lines={["Metall.", "Beton.", "Bass.", "Zürich."]} />
          </p>
          <Fade delay={0.2} className="mt-16 ml-auto max-w-md text-lg text-zinc">
            Geerenweg 2. Keine festen Öffnungszeiten, jede Nacht ein eigenes Programm. Mit der Membercard: Free Entry.
          </Fade>
        </section>

        {next && (
          <section className="border-t border-line px-5 py-24 md:px-10 md:py-32">
            <p className="label mb-10 text-zinc">Next up</p>
            <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h2 className="display text-[clamp(3.5rem,12vw,12rem)]"><Lines lines={[next.title]} /></h2>
                <p className="label mt-8 text-zinc">{fmtWeekday(next.starts_at)} {fmtDay(next.starts_at)} · {fmtTime(next.starts_at)} · <span className="text-bone"><Countdown to={next.starts_at} /></span></p>
              </div>
              <MagneticLink href={`/tickets#${next.slug}`}>Tickets →</MagneticLink>
            </div>
          </section>
        )}

        <section id="events" className="border-t border-line px-5 py-40 md:px-10 md:py-56">
          <p className="label mb-10 text-zinc">02 — Events</p>
          <h2 className="display mb-24 text-[clamp(3.5rem,13vw,13rem)]"><Lines lines={["Kommende."]} /></h2>
          {rows.length ? <EventList events={rows} /> : (
            <p className="max-w-md text-lg text-zinc">Aktuell sind keine Events geplant. Neue Partys posten wir auf <a className="text-bone underline underline-offset-4 hover:text-cyan" href="https://www.instagram.com/zinkbad.ch" target="_blank" rel="noopener noreferrer">Instagram</a>.</p>
          )}
        </section>

        <MemberSection />
        <InfoSection />
      </main>
      <Footer />
    </>
  );
}
