import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { imageRatio } from "./image-size.ts";

const r = (f: string) => imageRatio(readFileSync(new URL(`../public/${f}`, import.meta.url)));
test("PNG", () => assert.equal(r("flyers/why-not.png"), 5));
test("JPEG", () => assert.equal(r("flyers/stellarpulse.jpg"), 5));
test("WebP lossy", () => assert.ok(Math.abs(r("flyers/hardcore.webp")! - 376 / 160) < 0.01));
test("Müll", () => assert.equal(imageRatio(new Uint8Array(40)), null));
