import { Marquee } from "./marquee";

export function Footer() {
  return (
    <footer className="border-t border-line pt-16">
      <Marquee items={["Z!NKBAD CLUB", "Zürich", "Member Night", "Booking"]} />
      <div className="mt-16 flex flex-wrap justify-between gap-4 px-5 pb-24 label text-zinc md:px-10 md:pb-10">
        <span>© {new Date().getFullYear()} Z!NKBAD — New Innovation GmbH</span>
        <a href="mailto:booking@zinkbad.ch" className="hover:text-cyan">booking@zinkbad.ch</a>
      </div>
    </footer>
  );
}
