"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminClient } from "@/hooks/use-admin-client";

export function CheckoutErrorsChart() {
  const client = useAdminClient();
  const query = useQuery({
    queryKey: ["admin", "checkout-errors"],
    queryFn: () => client.getCheckoutErrors(),
  });

  return (
    <div className="border-border rounded-lg border p-4">
      <h3 className="mb-4 font-medium">Checkout error matrix</h3>
      <div className="h-56">
        {query.data ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={query.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#b45309" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm">Loading checkout errors...</p>
        )}
      </div>
    </div>
  );
}
