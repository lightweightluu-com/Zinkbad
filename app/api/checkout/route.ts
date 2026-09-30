import { NextResponse, type NextRequest } from "next/server";
import { getPublicBySlug } from "@/lib/events";
import { MEMBER_TIERS } from "@/lib/membership";
import { buildCheckoutUrl } from "@/lib/payrexx";

/**
 * GET /api/checkout?member=gold
 * GET /api/checkout?event=<slug>&ticket=<id>
 * Preis und Verwendungszweck kommen serverseitig aus DB/Konstanten. Weiterleitung zu Payrexx.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const member = q.get("member");
  if (member) {
    const tier = MEMBER_TIERS.find((t) => t.id === member);
    if (!tier) return NextResponse.json({ error: "Unbekannte Stufe" }, { status: 404 });
    return redirect(buildCheckoutUrl({ purpose: `Zinkbad Member ${tier.name} (1 Jahr)`, amountChf: tier.price_chf }));
  }

  const ev = await getPublicBySlug(q.get("event") ?? "");
  if (!ev) return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
  if (ev.status === "cancelled" || ev.status === "sold_out") {
    return NextResponse.json({ error: "Kein Ticketverkauf" }, { status: 409 });
  }
  const ticket = ev.tickets.find((t) => t.id === q.get("ticket"));
  if (!ticket || ticket.sold_out) return NextResponse.json({ error: "Ticket nicht verfügbar" }, { status: 409 });
  return redirect(buildCheckoutUrl({ purpose: `${ticket.label} – ${ev.title}`, amountChf: ticket.price_chf }));
}

const redirect = (url: string) => NextResponse.redirect(url, { status: 303, headers: { "Cache-Control": "no-store" } });
