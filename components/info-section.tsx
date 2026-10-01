import { Fade } from "./reveal";

const MAPS = "https://www.google.com/maps/search/?api=1&query=Geerenweg+2+8048+Z%C3%BCrich";

export function InfoSection() {
  return (
    <div>
      <div className="mb-10 border-b border-line pb-4">
        <h2 data-split className="display text-[clamp(2.5rem,6vw,5rem)]">Geerenweg 2, 8048 Zürich<span className="text-cyan">.</span></h2>
      </div>
      <Fade className="grid gap-10 md:grid-cols-3">
        <div><h3 className="label mb-4 text-zinc">Öffnungszeiten</h3>
          <p className="text-lg">Je nach Event unterschiedlich.<br />Start und Ende siehst du bei jeder Party unter <a href="#events" className="underline underline-offset-4 hover:text-cyan">Events</a>.</p></div>
        <div><h3 className="label mb-4 text-zinc">Anfahrt</h3>
          <p className="text-lg"><a href={MAPS} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cyan">In Google Maps öffnen ↗</a></p></div>
        <div><h3 className="label mb-4 text-zinc">Kontakt</h3>
          <p className="text-lg"><a href="mailto:booking@zinkbad.ch" className="underline underline-offset-4 hover:text-cyan">booking@zinkbad.ch</a><br />
            <a href="https://www.instagram.com/zinkbad.ch" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cyan">@zinkbad.ch ↗</a></p></div>
      </Fade>
    </div>
  );
}
