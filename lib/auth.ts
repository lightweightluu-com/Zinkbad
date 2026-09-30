import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabase, isMock } from "./env";
import { sessionClient } from "./supabase/server";

export const MOCK_COOKIE = "zb_mock_admin";
const mockToken = () => createHash("sha256").update(`zb:${process.env.MOCK_ADMIN_PASSWORD ?? "zinkbad-dev"}`).digest("hex");

export function mockPasswordOk(pw: string) {
  const a = createHash("sha256").update(`zb:${pw}`).digest();
  return timingSafeEqual(a, Buffer.from(mockToken(), "hex"));
}
export const mockSessionValue = mockToken;

export async function getAdminEmail(): Promise<string | null> {
  if (hasSupabase) {
    const sb = await sessionClient();
    const { data } = await sb.auth.getUser();
    if (!data.user) return null;
    const { data: row } = await sb.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
    return row ? (data.user.email ?? "admin") : null;
  }
  if (isMock) {
    const v = (await cookies()).get(MOCK_COOKIE)?.value;
    return v && v === mockToken() ? "dev-admin" : null;
  }
  return null;
}

/** Jede Admin-Seite und jede Server Action muss das aufrufen. */
export async function requireAdmin(): Promise<string> {
  const who = await getAdminEmail();
  if (!who) redirect("/admin/login");
  return who;
}
