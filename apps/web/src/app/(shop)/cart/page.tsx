"use client";

import Link from "next/link";
import { Button } from "@watch-store/ui";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/catalog";

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem, clearCart } = useCart();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading cart...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link href="/shop">Browse watches</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <Button variant="outline" onClick={() => clearCart.mutate()} disabled={clearCart.isPending}>
          Clear cart
        </Button>
      </div>

      {cart.warnings.length > 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {cart.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      <div className="space-y-4">
        {cart.items.map((item) => (
          <article key={item.productId} className="border-border grid gap-4 rounded-lg border p-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <Link href={`/shop/${item.productSlug}`} className="text-lg font-semibold hover:underline">
                {item.productName}
              </Link>
              <p className="text-muted-foreground text-sm">{formatPrice(item.unitPrice)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateItem.mutate({ productId: item.productId, quantity: Math.max(item.quantity - 1, 0) })
                }
              >
                -
              </Button>
              <span>{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateItem.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
              >
                +
              </Button>
              <Button variant="ghost" size="sm" onClick={() => removeItem.mutate(item.productId)}>
                Remove
              </Button>
              <span className="min-w-24 text-right font-medium">{formatPrice(item.lineTotal)}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-lg font-semibold">Subtotal</span>
        <span className="text-lg font-semibold">{formatPrice(cart.subtotal)}</span>
      </div>
    </section>
  );
}
