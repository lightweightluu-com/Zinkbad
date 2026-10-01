import type { ClubEvent } from "@/lib/types";
import { MagneticLink } from "./magnetic";

/** Kaufbuttons eines Events: externer Link, Payrexx-Tickets oder Hinweis. */
export function TicketActions({ event: e, detailHref }: { event: ClubEvent; detailHref?: string }) {
  if (e.status === "cancelled") return <span className="label text-danger">Abgesagt</span>;
  if (e.status === "sold_out") return <span className="label text-danger">Sold out</span>;
  if (e.ticket_url) return <MagneticLink href={e.ticket_url} external>Tickets ↗</MagneticLink>;
  if (e.tickets.length === 0) {
    return detailHref
      ? <MagneticLink href={detailHref} variant="outline">Infos →</MagneticLink>
      : <span className="label text-zinc">Ticketlink folgt</span>;
  }
  return (
    <>
      {e.tickets.map((t) => t.sold_out
        ? <span key={t.id} className="label border border-line px-6 py-4 text-zinc line-through">{t.label}</span>
        : <MagneticLink key={t.id} href={`/api/checkout?event=${e.slug}&ticket=${t.id}`} external>{t.label} — CHF {t.price_chf}</MagneticLink>)}
    </>
  );
}
