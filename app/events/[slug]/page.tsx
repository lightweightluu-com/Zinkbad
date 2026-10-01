import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { TicketActions } from "@/components/ticket-actions";
import { flyerUrl, getPublicBySlug } from "@/lib/events";
import { fmtLong, fmtTime } from "@/lib/format";

export const revalidate = 60;

const MAPS = "https://www.google.com/maps/search/?api=1&query=Geerenweg+2+8048+Z%C3%BCrich";
const TAIL_MS = 8 * 3_600_000; // Party läuft über Mitternacht

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getPublicBySlug((await params).slug);
  if (!e) return { title: "Event nicht gefunden — Z!NKBAD" };
  const flyer = flyerUrl(e.flyer_path);
  const description = (e.description ?? `${fmtLong(e.starts_at)}, ${fmtTime(e.starts_at)} im Z!NKBAD, Geerenweg 2, Zürich.`).replace(/\s+/g, " ").slice(0, 160);
  return { title: `${e.title} — Z!NKBAD`, description, openGraph: { title: e.title, description, images: flyer ? [flyer] : undefined } };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getPublicBySlug((await params).slug);
  if (!e) notFound();
  const flyer = flyerUrl(e.flyer_path);
  const over = new Date(e.ends_at ?? e.starts_at).getTime() + (e.ends_at ? 0 : TAIL_MS) < Date.now();

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Event", name: e.title, startDate: e.starts_at, endDate: e.ends_at ?? undefined,
    eventStatus: e.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "Z!NKBAD", address: { "@type": "PostalAddress", streetAddress: "Geerenweg 2", postalCode: "8048", addressLocality: "Zürich", addressCountry: "CH" } },
    image: flyer ?? undefined, description: e.description ?? undefined,
    performer: e.lineup.map((l) => ({ "@type": "PerformingGroup", name: l.name })),
  };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-5 pb-32 pt-28 md:px-10">
        <Link href="/#events" className="label text-zinc hover:text-cyan">← Alle Events</Link>

        {flyer && <Image src={flyer} alt={e.flyer_alt ?? e.title} width={1600} height={Math.round(1600 / (e.flyer_ratio ?? 2.35))} priority sizes="(max-width: 1024px) 100vw, 1024px" className="mt-8 h-auto w-full" />}

        <p className="label mt-10 text-cyan">{fmtLong(e.starts_at)} · {fmtTime(e.starts_at)}{e.ends_at ? ` – ${fmtTime(e.ends_at)}` : ""}</p>
        <h1 className="display mt-3 text-[clamp(2.5rem,7vw,6rem)]">{e.title}</h1>
        {e.lineup.length > 0 && (
          <ul className="label mt-6 flex flex-wrap gap-x-4 gap-y-1 text-zinc">
            {e.lineup.map((l) => <li key={l.name}>{l.instagram_url ? <a href={l.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan">{l.name} ↗</a> : l.name}</li>)}
          </ul>
        )}
        {e.description && <p className="mt-10 max-w-2xl whitespace-pre-line text-lg text-zinc">{e.description}</p>}

        <div className="mt-12 flex flex-wrap gap-3">
          {over ? <span className="label text-zinc">Dieses Event ist vorbei.</span> : <TicketActions event={e} />}
        </div>

        <dl className="mt-16 grid gap-8 border-t border-line pt-8 md:grid-cols-2">
          <div><dt className="label text-zinc">Ort</dt><dd className="mt-2 text-lg">Z!NKBAD<br />Geerenweg 2, 8048 Zürich<br /><a href={MAPS} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cyan">In Google Maps öffnen ↗</a></dd></div>
          <div><dt className="label text-zinc">Kontakt</dt><dd className="mt-2 text-lg"><a href="mailto:booking@zinkbad.ch" className="underline underline-offset-4 hover:text-cyan">booking@zinkbad.ch</a></dd></div>
        </dl>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </main>
      <Footer />
    </>
  );
}
