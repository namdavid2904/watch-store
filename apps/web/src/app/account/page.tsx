"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { Button } from "@watch-store/ui";
import { useOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/catalog";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  if (loading) {
    return <p className="text-muted-foreground">Loading account...</p>;
  }

  if (!user) {
    return (
      <section className="space-y-4 text-center">
        <p>Please sign in to view your account.</p>
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground">Signed in as {user.email}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Order history</h2>
          <Button asChild variant="outline">
            <Link href="/shop">Shop watches</Link>
          </Button>
        </div>

        {ordersLoading ? <p className="text-muted-foreground">Loading orders...</p> : null}

        {!ordersLoading && (!orders || orders.length === 0) ? (
          <p className="text-muted-foreground rounded-lg border p-6 text-center">You have not placed any orders yet.</p>
        ) : null}

        {orders?.map((order) => (
          <article key={order.id} className="border-border flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">{order.status.replaceAll("_", " ")}</p>
              <p className="text-muted-foreground text-sm">{new Date(order.createdAt).toLocaleString()}</p>
              <p className="text-sm">{order.items.length} item(s)</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
              <Button asChild variant="outline" size="sm">
                <Link href={`/account/orders/${order.id}`}>View</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
