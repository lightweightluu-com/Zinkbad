import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/auth";
import { hasSupabase, isMock } from "@/lib/env";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getAdminEmail()) redirect("/admin");
  return (
    <main className="mx-auto max-w-sm px-6 py-32">
      <h1 className="mb-10 text-3xl font-bold tracking-tight">Z<span className="text-cyan">!</span>NKBAD / Admin</h1>
      {!hasSupabase && !isMock ? (
        <p className="text-danger">Backend nicht konfiguriert (NEXT_PUBLIC_SUPABASE_URL fehlt).</p>
      ) : (
        <LoginForm withEmail={hasSupabase} />
      )}
    </main>
  );
}
