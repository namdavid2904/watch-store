import Link from "next/link";
import { Badge, Button } from "@watch-store/ui";

export default function HomePage() {
  return (
    <section className="space-y-16">
      <div className="luxury-surface relative overflow-hidden rounded-2xl border px-8 py-16 md:px-14 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,148,88,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl space-y-6 text-center md:text-left">
          <Badge variant="accent" className="mx-auto md:mx-0">
            Curated Swiss & Japanese Timepieces
          </Badge>
          <h1 className="font-serif text-5xl font-semibold leading-tight md:text-6xl">
            Precision crafted for the discerning collector
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:mx-0">
            Explore a refined selection of automatic, quartz, and manual watches from heritage maisons —
            authenticated, insured shipping, and concierge support on every order.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row md:items-start">
            <Button asChild size="lg">
              <Link href="/shop">Browse the collection</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Member sign in</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Authenticated inventory", copy: "Every piece is sourced and verified before listing." },
          { title: "White-glove delivery", copy: "Insured shipping with signature confirmation worldwide." },
          { title: "Secure checkout", copy: "Encrypted payments powered by Stripe Test Mode." },
        ].map((item) => (
          <article key={item.title} className="luxury-surface luxury-hover-lift rounded-xl border p-6">
            <h2 className="font-serif text-xl font-medium">{item.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
