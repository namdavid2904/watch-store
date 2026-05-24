import Image from "next/image";
import Link from "next/link";
import { Badge } from "@watch-store/ui";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { getPrimaryProductImageUrl } from "@/lib/product-image";

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = getPrimaryProductImageUrl(product.images);

  return (
    <article className="group luxury-hover-lift flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="bg-muted relative aspect-[4/5] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-xs uppercase tracking-[0.25em]">{product.brandName}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-[11px] uppercase tracking-[0.22em]">{product.brandName}</p>
          <Badge variant="outline">{product.movementType.replaceAll("_", " ")}</Badge>
        </div>
        <h2 className="font-serif text-2xl leading-tight">
          <Link href={`/shop/${product.slug}`} className="transition hover:text-accent">
            {product.name}
          </Link>
        </h2>
        <p className="text-muted-foreground line-clamp-2 flex-1 text-sm leading-relaxed">{product.description}</p>
        <div className="border-border flex items-end justify-between border-t pt-4">
          <span className="font-serif text-2xl">{formatPrice(product.price)}</span>
          <Link href={`/shop/${product.slug}`} className="text-xs uppercase tracking-[0.18em] text-accent hover:underline">
            View piece
          </Link>
        </div>
      </div>
    </article>
  );
}
