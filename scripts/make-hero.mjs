// Erzeugt die Hero-Varianten aus assets/club-original.jpg: node scripts/make-hero.mjs
import sharp from "sharp";

const src = "assets/club-original.jpg";
const meta = await sharp(src).metadata();
console.log("original", meta.width, "x", meta.height);
for (const [w, q] of [[2000, 72], [1000, 70]]) {
  const info = await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: q, effort: 6 }).toFile(`public/hero/club-${w}.webp`);
  console.log(`club-${w}.webp`, info.width, "x", info.height, Math.round(info.size / 1024), "KB");
}
