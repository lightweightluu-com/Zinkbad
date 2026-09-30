export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Lokaler Dateispeicher + Passwort-Login. Nie in Produktion. */
export const isMock = !hasSupabase && process.env.NODE_ENV !== "production";
