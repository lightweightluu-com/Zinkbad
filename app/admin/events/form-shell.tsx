"use client";
import { useActionState } from "react";
import type { FormState } from "../actions";

export function FormShell({ action, children }: { action: (s: FormState, fd: FormData) => Promise<FormState>; children: React.ReactNode }) {
  const [state, run, pending] = useActionState(action, {});
  return (
    <form action={run} className="space-y-6">
      {children}
      {state.error && <p role="alert" className="text-danger">{state.error}</p>}
      <button disabled={pending} className="bg-cyan px-6 py-3 font-bold text-ink disabled:opacity-50">{pending ? "Speichern…" : "Speichern"}</button>
    </form>
  );
}

export function DeleteButton() {
  return (
    <button className="text-danger underline" onClick={(e) => { if (!confirm("Event endgültig löschen?")) e.preventDefault(); }}>
      Event löschen
    </button>
  );
}
