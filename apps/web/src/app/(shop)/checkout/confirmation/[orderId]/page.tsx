"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@watch-store/ui";
import { useOrder } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/catalog";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60000;

function StatusIcon({ status }: { status: "pending" | "paid" | "failed" | "other" }) {
  if (status === "pending") {
    return (
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
        <span className="border-accent h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
        <svg className="text-accent h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/5">
        <svg className="text-destructive h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/40">
      <svg className="text-muted-foreground h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

function statusBadgeVariant(status: string): "default" | "secondary" | "accent" | "outline" {
  if (status === "PAID" || status === "DELIVERED") return "accent";
  if (status === "FAILED" || status === "CANCELLED") return "outline";
  return "secondary";
}

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
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-10 w-72" />
          <Skeleton className="mx-auto h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="flex justify-center gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <section className="mx-auto max-w-lg space-y-6 text-center">
        <StatusIcon status="other" />
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Order not found</h1>
          <p className="text-muted-foreground">We could not locate this order. Check your account for recent purchases.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/account">View account</Link>
        </Button>
      </section>
    );
  }

  const isPendingPayment = order.status === "PENDING_PAYMENT";
  const isPaid = order.status === "PAID";
  const isFailed = order.status === "FAILED";

  const iconStatus = isPendingPayment ? "pending" : isPaid ? "paid" : isFailed ? "failed" : "other";

  let heading = "Order update";
  let subheading = `Your order status is ${order.status.replaceAll("_", " ").toLowerCase()}.`;

  if (isPendingPayment) {
    heading = "Confirming payment";
    subheading = pollTimedOut
      ? "Payment is taking longer than expected. Refresh this page or check your order history shortly."
      : "Your order is secured. We are waiting for payment confirmation from your bank.";
  } else if (isPaid) {
    heading = "Thank you for your order";
    subheading = "Payment received. Our atelier will begin preparing your timepiece for dispatch.";
  } else if (isFailed) {
    heading = "Payment could not be completed";
    subheading = "No charge was finalized. You may return to checkout and try again.";
  }

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-4 text-center">
        <StatusIcon status={iconStatus} />
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">Order confirmation</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">{heading}</h1>
          <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">{subheading}</p>
        </div>
      </div>

      {isPendingPayment && pollTimedOut ? (
        <Alert>
          <AlertDescription>
            If you completed payment, it may still be processing. Your order will update automatically once confirmed.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="luxury-surface border-border/80">
        <CardHeader className="border-border/60 border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="font-serif text-xl font-medium">Order summary</CardTitle>
            <Badge variant={statusBadgeVariant(order.status)}>{order.status.replaceAll("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.15em]">Order reference</p>
            <p className="mt-1 font-mono text-sm">{order.id}</p>
          </div>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.15em]">Status</p>
              <p className="mt-1 font-medium">{order.status.replaceAll("_", " ")}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.15em]">Total</p>
              <p className="mt-1 font-serif text-lg font-medium">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        {isFailed ? (
          <Button asChild size="lg">
            <Link href="/checkout">Try checkout again</Link>
          </Button>
        ) : null}
        <Button asChild size="lg" variant={isFailed ? "outline" : "default"}>
          <Link href={`/account/orders/${order.id}`}>View order details</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </section>
  );
}
