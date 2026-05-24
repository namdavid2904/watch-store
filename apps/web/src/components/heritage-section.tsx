export function HeritageSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.28em]">Heritage</p>
        <h2 className="font-serif text-4xl font-semibold">A lineage of horological mastery</h2>
        <p className="text-muted-foreground leading-relaxed">
          For over a century, the world&apos;s finest ateliers have pursued a singular obsession: measuring time
          with poetry and precision. Our collection traces that lineage — from Geneva&apos;s haute horlogerie houses
          to Japan&apos;s engineering ateliers — each piece selected for provenance, finishing, and enduring design.
        </p>
      </div>
      <div className="luxury-surface grid gap-4 rounded-2xl border p-8">
        {[
          { year: "1890s", label: "Birth of modern wristwatch complications" },
          { year: "1960s", label: "Integrated bracelet sports icons emerge" },
          { year: "Today", label: "Contemporary finishing meets classic codes" },
        ].map((item) => (
          <div key={item.year} className="border-border/60 border-b pb-4 last:border-0 last:pb-0">
            <p className="font-serif text-2xl">{item.year}</p>
            <p className="text-muted-foreground mt-1 text-sm">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
