"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus } from "@watch-store/api-client";
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
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Process and update order statuses</p>
      </div>

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {ordersQuery.data?.map((order) => (
              <tr
                key={order.id}
                className={`border-border border-t cursor-pointer ${selectedOrder?.id === order.id ? "bg-muted/30" : ""}`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                <td className="px-4 py-3">{order.status.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <select
                    className="border-input bg-background h-9 rounded-md border px-2"
                    value={order.status}
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

      {selectedOrder ? <OrderDetailPanel order={selectedOrder} /> : null}
    </section>
  );
}

function OrderDetailPanel({ order }: { order: Order }) {
  return (
    <aside className="border-border rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Order detail</h2>
      <p className="text-muted-foreground mt-1 font-mono text-xs">{order.id}</p>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
        <p>
          <span className="text-muted-foreground">Status:</span> {order.status.replaceAll("_", " ")}
        </p>
        <p>
          <span className="text-muted-foreground">Total:</span> {formatPrice(order.totalAmount)}
        </p>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between border-t pt-2">
            <span>
              {item.productName} x {item.quantity}
            </span>
            <span>{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
