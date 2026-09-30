import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminList } from "@/lib/events";
import { TZ } from "@/lib/time";
import { logout } from "./actions";

const fmt = new Intl.DateTimeFormat("de-CH", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function AdminHome() {
  const who = await requireAdmin();
  const events = await adminList();
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12 flex items-baseline justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <form action={logout} className="text-zinc">{who} · <button className="underline hover:text-cyan">Logout</button></form>
      </header>
      <Link href="/admin/events/new" className="mb-8 inline-block bg-cyan px-4 py-3 font-bold text-ink">+ Neues Event</Link>
      <ul className="divide-y divide-line border-y border-line">
        {events.length === 0 && <li className="py-8 text-zinc">Noch keine Events.</li>}
        {events.map((e) => (
          <li key={e.id}>
            <Link href={`/admin/events/${e.id}`} className="grid grid-cols-[1fr_auto] gap-4 py-5 hover:text-cyan">
              <span><span className="block text-lg">{e.title}</span><span className="text-zinc">{fmt.format(new Date(e.starts_at))}</span></span>
              <span className="self-center uppercase tracking-widest text-zinc">{e.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
