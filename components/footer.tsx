import { Marquee } from "./marquee";

export function Footer() {
  return (
    <footer className="-mx-5 mt-16 border-t border-line pt-12 md:-mx-10">
      <Marquee items={["Z!NKBAD CLUB", "Zürich", "Member Night", "Booking"]} />
      <div className="mt-12 flex flex-wrap justify-between gap-4 px-5 pb-4 label text-zinc md:px-10">
        <span>© {new Date().getFullYear()} Z!NKBAD — New Innovation GmbH</span>
        <a href="mailto:booking@zinkbad.ch" className="hover:text-cyan">booking@zinkbad.ch</a>
      </div>
    </footer>
  );
}
