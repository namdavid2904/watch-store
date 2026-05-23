"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@watch-store/ui";
import { useOrder } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/catalog";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60000;

export default function CheckoutConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const { data: order, isLoading, error, refetch } = useOrder(orderId);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  useEffect(() => {
    if (!order || order.status !== "PENDING_PAYMENT") {
      setPollTimedOut(false);
      return;
    }

    const intervalId = window.setInterval(() => {
      void refetch();
    }, POLL_INTERVAL_MS);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      setPollTimedOut(true);
    }, POLL_TIMEOUT_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [order?.status, refetch]);

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

  const isPendingPayment = order.status === "PENDING_PAYMENT";
  const isPaid = order.status === "PAID";
  const isFailed = order.status === "FAILED";

  return (
    <section className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="space-y-2">
        {isPendingPayment ? (
          <>
            <h1 className="text-3xl font-bold">Payment processing</h1>
            <p className="text-muted-foreground">
              {pollTimedOut
                ? "Payment is taking longer than expected. You can refresh this page or check your order history."
                : "Your order was created. Waiting for payment confirmation..."}
            </p>
          </>
        ) : null}
        {isPaid ? (
          <>
            <h1 className="text-3xl font-bold">Order placed</h1>
            <p className="text-muted-foreground">Thank you for your purchase.</p>
          </>
        ) : null}
        {isFailed ? (
          <>
            <h1 className="text-3xl font-bold">Payment failed</h1>
            <p className="text-muted-foreground">Your payment could not be completed. Please try checkout again.</p>
          </>
        ) : null}
        {!isPendingPayment && !isPaid && !isFailed ? (
          <>
            <h1 className="text-3xl font-bold">Order update</h1>
            <p className="text-muted-foreground">Your order status is {order.status.replaceAll("_", " ").toLowerCase()}.</p>
          </>
        ) : null}
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
        {isFailed ? (
          <Button asChild>
            <Link href="/checkout">Try checkout again</Link>
          </Button>
        ) : null}
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
