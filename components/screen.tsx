/**
 * Eine Startseiten-Sektion. Ohne JS / bei reduzierter Bewegung ein normaler Block;
 * im Fullpage-Modus (html.fp) füllt sie genau den Bildschirm (siehe fullpage.tsx).
 * Die drei Wrapper (outer/inner/bg) erzeugen den Wipe-Übergang.
 */
export function Screen({ id, label, hero = false, children }: { id: string; label: string; hero?: boolean; children: React.ReactNode }) {
  const pad = hero ? "" : "border-t border-line px-5 py-20 md:px-10 md:py-28 fp:border-0 fp:p-0";
  const inner = hero ? "h-full" : "fp:flex fp:min-h-full fp:flex-col fp:justify-center fp:px-5 fp:pb-32 fp:pt-20 fp:md:px-10 fp:md:pb-20";
  return (
    <section id={id} data-screen data-label={label} className={pad}>
      <div className="fp-outer">
        <div className="fp-inner">
          <div className="fp-bg">
            <div className={inner}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
