import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeSupabaseUrl as n } from "./supabase-url.ts";

test("korrekt bleibt korrekt", () => assert.equal(n("https://abc.supabase.co"), "https://abc.supabase.co"));
test("Schema fehlt", () => assert.equal(n("abc.supabase.co"), "https://abc.supabase.co"));
test("Leerzeichen und Slash", () => assert.equal(n("  https://abc.supabase.co/ \n"), "https://abc.supabase.co"));
test("leer", () => { assert.equal(n(""), ""); assert.equal(n(undefined), ""); });
