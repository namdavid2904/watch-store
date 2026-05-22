"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@watch-store/ui";
import { useOrder } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/catalog";

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { data: order, isLoading, error } = useOrder(params.orderId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading order...</p>;
  }

  if (error || !order) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Order not found</h1>
        <Button asChild variant="outline">
          <Link href="/account">Back to account</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order details</h1>
          <p className="text-muted-foreground font-mono text-sm">{order.id}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/account">Back to account</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border-border rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Status</p>
          <p className="font-semibold">{order.status.replaceAll("_", " ")}</p>
        </div>
        <div className="border-border rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
        </div>
        <div className="border-border rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Placed</p>
          <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="border-border space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span>
              {item.productName} x {item.quantity}
            </span>
            <span>{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
