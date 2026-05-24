const CRAFTSMANSHIP_PILLARS = [
  {
    title: "Hand-finishing",
    copy: "Anglage, perlage, and polished bevels visible through exhibition casebacks.",
  },
  {
    title: "Material integrity",
    copy: "904L steel, ceramic bezels, and precious metal cases sourced from certified suppliers.",
  },
  {
    title: "Chronometric testing",
    copy: "Each automatic movement verified for rate stability before dispatch.",
  },
];

export function CraftsmanshipSection() {
  return (
    <section className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.28em]">Craftsmanship</p>
        <h2 className="font-serif text-4xl font-semibold">Where engineering meets art</h2>
        <p className="text-muted-foreground leading-relaxed">
          Beyond the dial lies a universe of tolerances measured in microns. We celebrate the craftspeople
          whose hands shape every component — the silent architecture of a great watch.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {CRAFTSMANSHIP_PILLARS.map((item) => (
          <article key={item.title} className="luxury-surface luxury-hover-lift rounded-xl border p-6">
            <h3 className="font-serif text-xl font-medium">{item.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
