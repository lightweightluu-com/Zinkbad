/** Tolerant gegenüber Eingabefehlern in Env-Variablen: Leerzeichen weg, https:// ergänzen, Slash am Ende weg. */
export function normalizeSupabaseUrl(v: string | undefined): string {
  const s = (v ?? "").trim().replace(/\/+$/, "");
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}
