/** Seitenverhältnis (Breite/Höhe) aus PNG-, JPEG- oder WebP-Header. null, wenn nicht lesbar. */
export function imageRatio(b: Uint8Array): number | null {
  const buf = Buffer.from(b.buffer, b.byteOffset, b.byteLength);
  const ok = (w: number, h: number) => (w > 0 && h > 0 ? w / h : null);

  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return ok(buf.readUInt32BE(16), buf.readUInt32BE(20));

  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return ok(buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5));
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }

  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const t = buf.toString("ascii", 12, 16);
    if (t === "VP8X") return ok(buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1);
    if (t === "VP8 ") return ok(buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff);
    if (t === "VP8L") { const v = buf.readUInt32LE(21); return ok((v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1); }
  }
  return null;
}
