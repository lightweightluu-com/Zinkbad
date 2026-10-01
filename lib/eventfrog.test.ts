import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isEventfrogPageUrl, parseEventfrogHtml } from "./eventfrog.ts";

const fx = (n: string) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8");
const U = "https://eventfrog.ch/en/p/parties/goa/15-years-sangoma-records-7500222088084518042.html";

test("Sangoma: Titel, Zeiten (Offset ohne Doppelpunkt), Ort, Bild", () => {
  const d = parseEventfrogHtml(fx("eventfrog-sangoma.html"), U)!;
  assert.equal(d.title, "15 Years Sangoma Records");
  assert.equal(d.startsAt, "2026-10-02T21:00:00.000Z"); // 23:00 +02:00
  assert.equal(d.endsAt, "2026-10-03T06:00:00.000Z");
  assert.equal(d.venue, "Zinkbad");
  assert.match(d.flyerUrl!, /^https:\/\/res\.eventfrog\.net\/[^?]+\.webp$/); // Cache-Parameter entfernt
  assert.ok(d.description!.length > 200);
  assert.ok(d.offers.length >= 2);
  assert.equal(d.offers[0].price, 23);
});
test("Hardcore: Angebote mit Ausverkauft-Flag", () => {
  const d = parseEventfrogHtml(fx("eventfrog-hardcore.html"), "https://eventfrog.ch/x.html")!;
  assert.equal(d.title, "HARDCORE REUNION");
  assert.equal(d.offers[0].name, "Blind Ticket");
  assert.equal(d.offers[0].soldOut, true);
});
test("Status: alle Angebote ausverkauft -> sold_out", () => {
  const html = `<script type="application/ld+json">${JSON.stringify({ "@type": "Event", name: "X", startDate: "2027-01-01T20:00:00+0100", offers: [{ name: "a", price: "5", availability: "https://schema.org/SoldOut" }] })}</script>`;
  assert.equal(parseEventfrogHtml(html, "https://eventfrog.ch/x")!.suggestedStatus, "sold_out");
});
test("Status: abgesagt", () => {
  const html = `<script type="application/ld+json">${JSON.stringify({ "@type": "Event", name: "X", startDate: "2027-01-01T20:00:00+01:00", eventStatus: "https://schema.org/EventCancelled" })}</script>`;
  assert.equal(parseEventfrogHtml(html, "https://eventfrog.ch/x")!.suggestedStatus, "cancelled");
});
test("Bild von fremdem Host wird verworfen", () => {
  const html = `<script type="application/ld+json">${JSON.stringify({ "@type": "Event", name: "X", startDate: "2027-01-01T20:00:00+01:00", image: ["https://evil.example/a.png"] })}</script>`;
  assert.equal(parseEventfrogHtml(html, "https://eventfrog.ch/x")!.flyerUrl, null);
});
test("@graph und Entities", () => {
  const html = `<script type="application/ld+json">${JSON.stringify({ "@graph": [{ "@type": "Organization" }, { "@type": "Event", name: "Tom &amp; Jerry", startDate: "2027-01-01T20:00:00+01:00" }] })}</script>`;
  assert.equal(parseEventfrogHtml(html, "https://eventfrog.ch/x")!.title, "Tom & Jerry");
});
test("Keine Event-Daten -> null", () => assert.equal(parseEventfrogHtml("<html></html>", "https://eventfrog.ch/x"), null));
test("URL-Allowlist", () => {
  assert.ok(isEventfrogPageUrl(U));
  assert.ok(isEventfrogPageUrl("https://www.eventfrog.de/de/p/x.html"));
  for (const bad of ["http://eventfrog.ch/x", "https://eventfrog.ch.evil.com/x", "https://evil.com/eventfrog.ch", "https://user:pw@eventfrog.ch/x", "file:///etc/passwd", "https://127.0.0.1/", "https://eventfrog.ch@evil.com/", "nonsense"]) {
    assert.equal(isEventfrogPageUrl(bad), null, bad);
  }
});
