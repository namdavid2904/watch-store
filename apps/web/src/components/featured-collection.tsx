import Link from "next/link";
import { Button } from "@watch-store/ui";
import { catalogClient } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export async function FeaturedCollection() {
  const products = await catalogClient.listProducts({ size: 3, sort: "createdAt,desc" });

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.28em]">Featured</p>
          <h2 className="font-serif text-4xl font-semibold">New arrivals</h2>
        </div>
        <Button asChild variant="outline">
          <Link href="/shop">View full collection</Link>
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.content.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
