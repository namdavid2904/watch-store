"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

export function CartBadgeLink() {
  const { cart, isLoading } = useCart();
  const count = cart?.itemCount ?? 0;

  return (
    <Link href="/cart" className="relative inline-flex items-center gap-1">
      Cart
      {!isLoading && count > 0 ? (
        <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
