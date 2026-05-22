"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@watch-store/ui";
import { useOrder } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/catalog";

export default function CheckoutConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading order confirmation...</p>;
  }

  if (error || !order) {
    return (
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Order not found</h1>
        <Button asChild>
          <Link href="/account">View account</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Order placed</h1>
        <p className="text-muted-foreground">Thank you for your purchase.</p>
      </div>

      <div className="border-border rounded-lg border p-6 text-left">
        <p className="text-sm text-muted-foreground">Order ID</p>
        <p className="font-mono text-sm">{order.id}</p>
        <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">{order.status.replaceAll("_", " ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="font-medium">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button asChild>
          <Link href={`/account/orders/${order.id}`}>View order details</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </section>
  );
}
