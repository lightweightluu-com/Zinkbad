import { test } from "node:test";
import assert from "node:assert/strict";
import { weekendRange } from "./weekend.ts";

const r = (iso: string) => weekendRange(new Date(iso));
// Oktober 2026: Do 1., Fr 2., Sa 3., So 4., Mo 5. (Sommerzeit, UTC+2)
const week = { from: "2026-10-01T22:00:00.000Z", to: "2026-10-04T22:00:00.000Z" };

test("Donnerstag: kommendes Wochenende", () => assert.deepEqual(r("2026-10-01T10:00:00Z"), week));
test("Montag: kommendes Wochenende", () => assert.deepEqual(r("2026-09-28T10:00:00Z"), { from: "2026-10-01T22:00:00.000Z", to: "2026-10-04T22:00:00.000Z" }));
test("Freitag", () => assert.deepEqual(r("2026-10-02T12:00:00Z"), week));
test("Samstag", () => assert.deepEqual(r("2026-10-03T12:00:00Z"), week));
test("Sonntag", () => assert.deepEqual(r("2026-10-04T12:00:00Z"), week));
test("Montag früh nach dem Wochenende: schon das nächste", () =>
  assert.deepEqual(r("2026-10-04T23:30:00Z"), { from: "2026-10-08T22:00:00.000Z", to: "2026-10-11T22:00:00.000Z" }));
test("Zeitumstellung (Okt 25): Fr 23. bis Mo 26.", () =>
  assert.deepEqual(r("2026-10-22T10:00:00Z"), { from: "2026-10-22T22:00:00.000Z", to: "2026-10-25T23:00:00.000Z" }));
