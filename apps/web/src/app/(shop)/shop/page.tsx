import { Suspense } from "react";
import Link from "next/link";
import { FilterPanel } from "@/components/filter-panel";
import { ProductCard } from "@/components/product-card";
import { catalogClient, parseProductSearchParams } from "@/lib/catalog";

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = parseProductSearchParams(await searchParams);
  const [products, brands, categories] = await Promise.all([
    catalogClient.listProducts(params),
    catalogClient.listBrands(),
    catalogClient.listCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Shop Collection</h1>
        <p className="text-muted-foreground">
          Explore {products.totalElements} premium watches with real-time filtering.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={<div className="text-muted-foreground text-sm">Loading filters...</div>}>
          <FilterPanel brands={brands} categories={categories} />
        </Suspense>

        <section className="space-y-6">
          {products.content.length === 0 ? (
            <p className="text-muted-foreground">No watches match your filters.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {products.totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {products.page + 1} of {products.totalPages}
              </span>
              <div className="flex gap-2">
                {products.page > 0 ? (
                  <Link href={buildPageHref(params, products.page - 1)} className="underline">
                    Previous
                  </Link>
                ) : null}
                {products.page + 1 < products.totalPages ? (
                  <Link href={buildPageHref(params, products.page + 1)} className="underline">
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function buildPageHref(params: ReturnType<typeof parseProductSearchParams>, page: number) {
  const query = new URLSearchParams();
  Object.entries({ ...params, page }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return `/shop?${query.toString()}`;
}
