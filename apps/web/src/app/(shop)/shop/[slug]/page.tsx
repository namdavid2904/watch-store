import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@watch-store/ui";
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
    <article className="space-y-8">
      <Link href="/shop" className="text-muted-foreground text-sm hover:underline">
        Back to shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-muted flex min-h-[320px] items-center justify-center rounded-lg">
          <span className="text-muted-foreground text-sm">{product.brandName}</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm uppercase tracking-wide">{product.brandName}</p>
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          <p className="text-sm">
            {product.quantityAvailable > 0
              ? `${product.quantityAvailable} in stock`
              : "Currently unavailable"}
          </p>
          <Button disabled={product.quantityAvailable <= 0}>Add to Cart</Button>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Technical Specifications</h2>
        <ProductSpecsTable product={product} />
      </section>
    </article>
  );
}
