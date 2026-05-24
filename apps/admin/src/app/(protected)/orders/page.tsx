"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus } from "@watch-store/api-client";
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@watch-store/ui";
import { useState } from "react";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatDate, formatPrice } from "@/lib/format";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
];

function statusBadgeVariant(status: OrderStatus): "default" | "secondary" | "accent" | "outline" {
  if (status === "PAID" || status === "DELIVERED") return "accent";
  if (status === "FAILED" || status === "CANCELLED") return "outline";
  return "secondary";
}

export default function OrdersPage() {
  const client = useAdminClient();
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => client.listOrders(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      client.updateOrderStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  const selectedOrder =
    ordersQuery.data?.find((order) => order.id === selectedOrderId) ??
    ordersQuery.data?.[0] ??
    null;

  return (
    <section className="space-y-8">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">Fulfillment</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">Process and update order statuses</p>
      </div>

      <Card className="luxury-surface overflow-hidden border-border/80">
        <CardHeader className="border-border/60 border-b pb-4">
          <CardTitle className="text-base font-medium">Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordersQuery.isLoading ? (
            <div className="space-y-0 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="mb-3 h-12 w-full" />
              ))}
            </div>
          ) : ordersQuery.data?.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/30 text-left">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Order</th>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Status</th>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Total</th>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Placed</th>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersQuery.data?.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-border/60 cursor-pointer border-t transition hover:bg-muted/20 ${
                        selectedOrder?.id === order.id ? "bg-muted/30" : ""
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant(order.status)}>{order.status.replaceAll("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3">{formatPrice(order.totalAmount)}</td>
                      <td className="text-muted-foreground px-4 py-3">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <select
                          className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                          value={order.status}
                          disabled={updateStatus.isPending}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            updateStatus.mutate({ orderId: order.id, status: event.target.value as OrderStatus })
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder ? <OrderDetailPanel order={selectedOrder} /> : null}
    </section>
  );
}

function OrderDetailPanel({ order }: { order: Order }) {
  return (
    <Card className="border-border/80">
      <CardHeader className="border-border/60 flex-row items-start justify-between space-y-0 border-b pb-4">
        <div>
          <CardTitle className="text-base font-medium">Order detail</CardTitle>
          <p className="text-muted-foreground mt-1 font-mono text-xs">{order.id}</p>
        </div>
        <Badge variant={statusBadgeVariant(order.status)}>{order.status.replaceAll("_", " ")}</Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.12em]">Status</p>
            <p className="mt-1 font-medium">{order.status.replaceAll("_", " ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.12em]">Total</p>
            <p className="mt-1 font-serif text-lg font-medium">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
        <ul className="divide-border/60 divide-y text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 first:pt-0">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
