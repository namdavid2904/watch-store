import { Suspense } from "react";
import Link from "next/link";
import { FilterPanel } from "@/components/filter-panel";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { catalogClient, parseProductSearchParams } from "@/lib/catalog";

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function ShopCatalog({
  params,
}: {
  params: ReturnType<typeof parseProductSearchParams>;
}) {
  const products = await catalogClient.listProducts(params);

  if (products.content.length === 0) {
    return <p className="text-muted-foreground py-12 text-center">No watches match your filters.</p>;
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.content.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t pt-6 text-sm">
          <span className="text-muted-foreground">
            Page {products.page + 1} of {products.totalPages}
          </span>
          <div className="flex gap-4">
            {products.page > 0 ? (
              <Link href={buildPageHref(params, products.page - 1)} className="uppercase tracking-[0.15em] hover:text-accent">
                Previous
              </Link>
            ) : null}
            {products.page + 1 < products.totalPages ? (
              <Link href={buildPageHref(params, products.page + 1)} className="uppercase tracking-[0.15em] hover:text-accent">
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = parseProductSearchParams(await searchParams);
  const [brands, categories] = await Promise.all([catalogClient.listBrands(), catalogClient.listCategories()]);

  return (
    <div className="space-y-10">
      <div className="space-y-3 border-b pb-8">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.28em]">The Collection</p>
        <h1 className="font-serif text-4xl font-semibold md:text-5xl">Shop watches</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Filter by maison, movement, and specification to discover your next statement piece.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={<div className="text-muted-foreground text-sm">Loading filters...</div>}>
          <FilterPanel brands={brands} categories={categories} />
        </Suspense>

        <section className="space-y-8">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ShopCatalog params={params} />
          </Suspense>
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
