import Link from "next/link";
import { Badge, Button } from "@watch-store/ui";

export function HomeHero() {
  return (
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
            <Link href="/enquire">Private enquiry</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
