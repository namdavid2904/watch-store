import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { getPrimaryProductImageUrl } from "@/lib/product-image";

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = getPrimaryProductImageUrl(product.images);

  return (
    <article className="border-border flex flex-col rounded-lg border p-4 transition hover:shadow-sm">
      <div className="bg-muted relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-md">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <span className="text-muted-foreground text-sm">{product.brandName}</span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">{product.brandName}</p>
        <h2 className="text-lg font-semibold">
          <Link href={`/shop/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h2>
        <p className="text-muted-foreground line-clamp-2 text-sm">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-medium">{formatPrice(product.price)}</span>
          <span className="text-muted-foreground text-xs">{product.movementType}</span>
        </div>
      </div>
    </article>
  );
}
