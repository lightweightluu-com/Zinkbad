import Link from "next/link";

const links = [["Events", "/#events"], ["Tickets", "/tickets"], ["Member", "/#member"], ["Info", "/#info"]] as const;

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 mix-blend-difference md:px-10">
      <Link href="/" className="display text-2xl text-white" aria-label="Z!NKBAD Startseite">Z!NKBAD</Link>
      <nav className="flex gap-5 label text-white md:gap-10" aria-label="Hauptnavigation">
        {links.map(([t, h]) => <Link key={t} href={h} className="hover:underline underline-offset-4">{t}</Link>)}
      </nav>
    </header>
  );
}
