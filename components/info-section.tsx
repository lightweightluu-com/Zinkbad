import { Fade, Lines } from "./reveal";

const MAPS = "https://www.google.com/maps/search/?api=1&query=Geerenweg+2+8048+Z%C3%BCrich";

export function InfoSection() {
  return (
    <section id="info" className="border-t border-line px-5 py-40 md:px-10 md:py-56">
      <p className="label mb-10 text-zinc">04 — Info</p>
      <h2 className="display text-[clamp(3.5rem,13vw,13rem)]"><Lines lines={["Geerenweg 2", "8048 Zürich."]} /></h2>
      <Fade className="mt-24 grid gap-14 md:grid-cols-3">
        <div><h3 className="label mb-4 text-zinc">Öffnungszeiten</h3>
          <p className="text-lg">Je nach Event unterschiedlich.<br />Start und Ende siehst du bei jeder Party unter <a href="#events" className="underline underline-offset-4 hover:text-cyan">Events</a>.</p></div>
        <div><h3 className="label mb-4 text-zinc">Anfahrt</h3>
          <p className="text-lg"><a href={MAPS} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cyan">In Google Maps öffnen ↗</a></p></div>
        <div><h3 className="label mb-4 text-zinc">Kontakt</h3>
          <p className="text-lg"><a href="mailto:booking@zinkbad.ch" className="underline underline-offset-4 hover:text-cyan">booking@zinkbad.ch</a><br />
            <a href="https://www.instagram.com/zinkbad.ch" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cyan">@zinkbad.ch ↗</a></p></div>
      </Fade>
    </section>
  );
}
