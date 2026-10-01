import { EventsBrowser, type EventCardData } from "@/components/events-browser";
import { Footer } from "@/components/footer";
import { Fullpage } from "@/components/fullpage";
import { Hero } from "@/components/hero";
import { InfoSection } from "@/components/info-section";
import { MemberSection } from "@/components/member-section";
import { MobileCta } from "@/components/mobile-cta";
import { Nav } from "@/components/nav";
import { Screen } from "@/components/screen";
import { WeekendSection } from "@/components/weekend-section";
import { flyerUrl, listUpcoming } from "@/lib/events";
import { fmtDayNum, fmtMonthChip, fmtMonthLong, fmtMonthShort, fmtTime, fmtWeekday } from "@/lib/format";
import { isoToZurichLocal } from "@/lib/time";
import { weekendRange } from "@/lib/weekend";

export const revalidate = 60;

export default async function Home() {
  const events = await listUpcoming();
  const { from, to } = weekendRange(new Date());
  const weekend = events.filter((e) => e.starts_at >= from && e.starts_at < to);
  // Kein Event am Wochenende: stattdessen die nächste nicht abgesagte Party zeigen
  const highlight = weekend.length ? weekend : events.filter((e) => e.status !== "cancelled").slice(0, 1);

  const nowMs = Date.now();
  const today = isoToZurichLocal(new Date(nowMs).toISOString()).slice(0, 10);
  const tomorrow = new Date(Date.parse(`${today}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  const rows: EventCardData[] = events.map((e) => {
    const day = isoToZurichLocal(e.starts_at).slice(0, 10);
    return {
      slug: e.slug, title: e.title, weekday: fmtWeekday(e.starts_at), day: fmtDayNum(e.starts_at), month: fmtMonthShort(e.starts_at),
      monthKey: day.slice(0, 7), monthChip: fmtMonthChip(e.starts_at), monthLabel: fmtMonthLong(e.starts_at), time: fmtTime(e.starts_at), endTime: e.ends_at ? fmtTime(e.ends_at) : null,
      lineup: e.lineup.map((l) => l.name), description: e.description ? e.description.slice(0, 400) : null,
      flyer: flyerUrl(e.flyer_path), flyerRatio: e.flyer_ratio ?? 2.35, flyerAlt: e.flyer_alt ?? e.title,
      status: e.status, hasTickets: e.tickets.length > 0 || Boolean(e.ticket_url),
      badge: Date.parse(e.starts_at) <= nowMs ? "Jetzt" : day === today ? "Heute" : day === tomorrow ? "Morgen" : null,
    };
  });

  return (
    <>
      <Nav />
      <Fullpage>
        <Screen id="top" label="Start" hero><Hero /></Screen>
        {highlight.length > 0 && (
          <Screen id="wochenende" label={weekend.length ? "Dieses Wochenende" : "Nächste Party"}>
            <WeekendSection events={highlight} isWeekend={weekend.length > 0} />
          </Screen>
        )}
        <Screen id="member" label="Member"><MemberSection /></Screen>
        <Screen id="events" label="Alle Events" top>
          {rows.length ? <EventsBrowser events={rows} /> : (
            <p className="max-w-md text-lg text-zinc">Aktuell sind keine Events geplant. Neue Partys posten wir auf <a className="text-bone underline underline-offset-4 hover:text-cyan" href="https://www.instagram.com/zinkbad.ch" target="_blank" rel="noopener noreferrer">Instagram</a>.</p>
          )}
        </Screen>
        <Screen id="info" label="Info">
          <InfoSection />
          <Footer />
        </Screen>
      </Fullpage>
      <MobileCta />
    </>
  );
}
