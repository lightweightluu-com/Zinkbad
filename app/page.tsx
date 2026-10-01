import { EventList, type EventRowData } from "@/components/event-list";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { InfoSection } from "@/components/info-section";
import { MemberSection } from "@/components/member-section";
import { MobileCta } from "@/components/mobile-cta";
import { Nav } from "@/components/nav";
import { WeekendSection } from "@/components/weekend-section";
import { flyerUrl, listUpcoming } from "@/lib/events";
import { fmtDay, fmtTime, fmtWeekday } from "@/lib/format";
import { weekendRange } from "@/lib/weekend";

export const revalidate = 60;

export default async function Home() {
  const events = await listUpcoming();
  const { from, to } = weekendRange(new Date());
  const weekend = events.filter((e) => e.starts_at >= from && e.starts_at < to);
  // Kein Event am Wochenende: stattdessen die nächste nicht abgesagte Party zeigen
  const highlight = weekend.length ? weekend : events.filter((e) => e.status !== "cancelled").slice(0, 1);

  const rows: EventRowData[] = events.map((e) => ({
    slug: e.slug, title: e.title, weekday: fmtWeekday(e.starts_at), day: fmtDay(e.starts_at), time: fmtTime(e.starts_at),
    lineup: e.lineup.map((l) => l.name), flyer: flyerUrl(e.flyer_path), flyerRatio: e.flyer_ratio ?? 2.35, flyerAlt: e.flyer_alt ?? e.title,
    status: e.status, hasTickets: e.tickets.length > 0 || Boolean(e.ticket_url),
  }));

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WeekendSection events={highlight} isWeekend={weekend.length > 0} />
        <MemberSection />

        <section id="events" className="scroll-mt-16 border-t border-line px-5 py-20 md:px-10 md:py-28">
          <div className="mb-10 border-b border-line pb-4">
            <h2 className="display text-[clamp(2.5rem,6vw,5rem)]">Alle Events<span className="text-cyan">.</span></h2>
          </div>
          {rows.length ? <EventList events={rows} /> : (
            <p className="max-w-md text-lg text-zinc">Aktuell sind keine Events geplant. Neue Partys posten wir auf <a className="text-bone underline underline-offset-4 hover:text-cyan" href="https://www.instagram.com/zinkbad.ch" target="_blank" rel="noopener noreferrer">Instagram</a>.</p>
          )}
        </section>

        <InfoSection />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
