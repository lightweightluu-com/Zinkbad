import type { NextConfig } from "next";
import { normalizeSupabaseUrl } from "./lib/supabase-url";

const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;

const config: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};

export default config;
