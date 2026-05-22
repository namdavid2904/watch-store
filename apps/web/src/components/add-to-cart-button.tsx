"use client";

import { Button } from "@watch-store/ui";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setMessage(null);
    try {
      await addItem.mutateAsync({ productId, quantity: 1 });
      setMessage("Added to cart");
    } catch {
      setMessage("Could not add to cart");
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={disabled || addItem.isPending}>
        {addItem.isPending ? "Adding..." : "Add to Cart"}
      </Button>
      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
    </div>
  );
}
