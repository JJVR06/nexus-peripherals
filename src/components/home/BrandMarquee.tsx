const BRANDS = [
  "Razer",
  "Logitech",
  "SteelSeries",
  "ASUS ROG",
  "HyperX",
  "Keychron",
  "Glorious",
  "Corsair",
  "Secretlab",
  "Elgato",
  "Shure",
  "BenQ ZOWIE",
  "8BitDo",
  "Samsung",
];

/**
 * Continuously scrolling brand strip. The track holds two identical copies of
 * the list and `animate-marquee` shifts it by -50%, so the loop lands exactly on
 * the start of the second copy. Spacing lives in each item's padding rather than
 * a flex `gap`, because a gap between the two copies would offset that 50% point
 * and make the loop jump. Pauses on hover (see .animate-marquee in globals.css).
 */
export function BrandMarquee() {
  return (
    <section className="border-y border-border bg-bg-soft py-8">
      <p className="container-nexus mb-5 text-center text-xs font-semibold uppercase tracking-widest text-muted">
        Trusted brands we carry
      </p>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%-5rem),transparent)]">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {BRANDS.map((b) => (
                <span
                  key={b}
                  className="shrink-0 px-6 font-display text-base font-bold whitespace-nowrap text-faint transition-colors hover:text-fg"
                >
                  {b}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
