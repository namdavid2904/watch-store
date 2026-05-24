import { Suspense } from "react";
import { CraftsmanshipSection } from "@/components/craftsmanship-section";
import { FeaturedCollection } from "@/components/featured-collection";
import { HeritageSection } from "@/components/heritage-section";
import { HomeHero } from "@/components/home-hero";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export const revalidate = 60;

export default function HomePage() {
  return (
    <section className="space-y-24 pb-8">
      <HomeHero />

      <RevealOnScroll>
        <HeritageSection />
      </RevealOnScroll>

      <RevealOnScroll delayMs={100}>
        <CraftsmanshipSection />
      </RevealOnScroll>

      <RevealOnScroll delayMs={150}>
        <Suspense fallback={<ProductGridSkeleton />}>
          <FeaturedCollection />
        </Suspense>
      </RevealOnScroll>
    </section>
  );
}
