import { randomBytes } from "node:crypto";

const BASE = process.env.PAYREXX_VPOS_BASE ?? "https://zinkbad.payrexx.com/de/vpos";

/**
 * Baut den Payrexx-vPOS-Link. Der Preis stammt immer aus unserer Datenquelle
 * (DB / Konstanten), nie aus Client-Parametern. Der Kauf selbst läuft auf Payrexx.
 */
export function buildCheckoutUrl(opts: { purpose: string; amountChf: number }): string {
  const url = new URL(BASE);
  url.searchParams.set("purpose", opts.purpose);
  url.searchParams.set("amount", opts.amountChf.toFixed(2));
  url.searchParams.set("currency", "CHF");
  url.searchParams.set("referenceId", randomBytes(18).toString("base64url"));
  return url.toString();
}
