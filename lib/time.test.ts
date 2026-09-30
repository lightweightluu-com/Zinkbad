import { test } from "node:test";
import assert from "node:assert/strict";
import { zurichLocalToIso, isoToZurichLocal } from "./time.ts";

test("Sommerzeit (UTC+2)", () => {
  assert.equal(zurichLocalToIso("2026-07-03T23:00"), "2026-07-03T21:00:00.000Z");
});
test("Winterzeit (UTC+1)", () => {
  assert.equal(zurichLocalToIso("2026-12-04T23:00"), "2026-12-04T22:00:00.000Z");
});
test("Roundtrip", () => {
  for (const l of ["2026-03-28T23:30", "2026-03-29T04:00", "2026-10-24T23:00", "2026-10-25T04:00"]) {
    assert.equal(isoToZurichLocal(zurichLocalToIso(l)), l);
  }
});
