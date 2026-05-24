import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@watch-store/ui";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductMediaGallery } from "@/components/product-media-gallery";
import { ProductSpecsTable } from "@/components/product-specs-table";
import { catalogClient, formatPrice } from "@/lib/catalog";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await catalogClient.getProduct(slug);
    return {
      title: `${product.name} | Watch Store`,
      description: product.description ?? `${product.brandName} ${product.name}`,
    };
  } catch {
    return { title: "Product Not Found | Watch Store" };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await catalogClient.getProduct(slug);
  } catch {
    notFound();
  }

  return (
    <article className="space-y-12">
      <Link href="/shop" className="text-muted-foreground text-xs uppercase tracking-[0.2em] transition hover:text-accent">
        ← Back to collection
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <ProductMediaGallery
          images={product.images}
          galleryImages={product.galleryImages ?? []}
          model3dUrl={product.model3dUrl}
          productName={product.name}
          brandName={product.brandName}
        />

        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{product.brandName}</Badge>
              <Badge variant="outline">{product.movementType.replaceAll("_", " ")}</Badge>
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">{product.name}</h1>
            <p className="font-serif text-3xl">{formatPrice(product.price)}</p>
          </div>
          <p className="text-muted-foreground text-base leading-relaxed">{product.description}</p>
          <p className="text-sm uppercase tracking-[0.15em]">
            {product.quantityAvailable > 0 ? (
              <span className="text-accent">{product.quantityAvailable} available</span>
            ) : (
              <span className="text-muted-foreground">Currently unavailable</span>
            )}
          </p>
          <AddToCartButton productId={product.id} disabled={product.quantityAvailable <= 0} />
        </div>
      </div>

      <section className="luxury-surface space-y-4 rounded-2xl border p-8">
        <h2 className="font-serif text-3xl">Technical specifications</h2>
        <ProductSpecsTable product={product} />
      </section>
    </article>
  );
}
