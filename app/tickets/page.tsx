import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { TicketActions } from "@/components/ticket-actions";
import { Lines } from "@/components/reveal";
import { flyerUrl, listUpcoming } from "@/lib/events";
import { fmtLong, fmtTime } from "@/lib/format";

export const revalidate = 60;
export const metadata: Metadata = { title: "Tickets — Z!NKBAD", description: "Tickets für kommende Z!NKBAD-Events. Bezahlung sicher über Payrexx." };

export default async function Tickets() {
  const events = await listUpcoming();
  return (
    <>
      <Nav />
      <main className="px-5 pb-40 pt-40 md:px-10">
        <p className="label mb-10 text-zinc">Tickets</p>
        <h1 className="display mb-24 text-[clamp(4rem,15vw,15rem)]"><Lines lines={["Tickets."]} /></h1>
        <p className="mb-24 max-w-md text-lg text-zinc">Der Kauf läuft sicher über Payrexx. Members haben Free Entry, siehe <a href="/#member" className="text-bone underline underline-offset-4 hover:text-cyan">Member</a>.</p>

        {events.length === 0 && <p className="text-lg text-zinc">Aktuell sind keine Events mit Vorverkauf geplant.</p>}
        <ul className="border-t border-line">
          {events.map((e, i) => {
            const flyer = flyerUrl(e.flyer_path);
                        return (
              <li key={e.id} id={e.slug} className="scroll-mt-24 border-b border-line py-14">
                {flyer && <Image src={flyer} alt={e.flyer_alt ?? e.title} width={1600} height={Math.round(1600 / (e.flyer_ratio ?? 2.35))} priority={i === 0} sizes="(max-width: 1024px) 100vw, 1024px" className="mb-10 h-auto w-full max-w-5xl" />}
                <div>
                  <p className="label text-zinc">{fmtLong(e.starts_at)} · {fmtTime(e.starts_at)}{e.ends_at ? ` – ${fmtTime(e.ends_at)}` : ""}</p>
                  <h2 className="display mt-4 text-[clamp(2.5rem,7vw,6.5rem)]">{e.title}</h2>
                  {e.lineup.length > 0 && <p className="label mt-6 text-zinc">{e.lineup.map((l) => l.name).join(" · ")}</p>}
                  {e.description && <p className="mt-6 max-w-xl text-lg text-zinc">{e.description}</p>}
                  <div className="mt-10 flex flex-wrap gap-3"><TicketActions event={e} /></div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </>
  );
}
