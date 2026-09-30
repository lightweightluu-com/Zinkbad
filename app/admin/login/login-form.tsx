"use client";
import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm({ withEmail }: { withEmail: boolean }) {
  const [state, action, pending] = useActionState(login, {});
  const field = "w-full border border-line bg-graphite px-3 py-3 outline-none focus:border-cyan";
  return (
    <form action={action} className="space-y-4">
      {withEmail && <input name="email" type="email" required autoComplete="username" placeholder="E-Mail" className={field} />}
      <input name="password" type="password" required autoComplete="current-password" placeholder="Passwort" className={field} />
      {state.error && <p role="alert" className="text-danger">{state.error}</p>}
      <button disabled={pending} className="w-full bg-cyan px-3 py-3 font-bold text-ink disabled:opacity-50">
        {pending ? "…" : "Einloggen"}
      </button>
    </form>
  );
}
