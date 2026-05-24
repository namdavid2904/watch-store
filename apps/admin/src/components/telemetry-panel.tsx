"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatPrice } from "@/lib/format";

export function TelemetryPanel() {
  const client = useAdminClient();

  const chartQuery = useQuery({
    queryKey: ["admin", "sales-chart", 30],
    queryFn: () => client.getSalesChart(30),
  });

  const turnoverQuery = useQuery({
    queryKey: ["admin", "brand-turnover"],
    queryFn: () => client.getBrandTurnover(30),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="border-border rounded-lg border p-4">
        <h3 className="mb-4 font-medium">Revenue velocity (30 days)</h3>
        <div className="h-64">
          {chartQuery.data ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartQuery.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#b59458" fill="#b5945820" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">Loading revenue chart...</p>
          )}
        </div>
      </div>

      <div className="border-border rounded-lg border p-4">
        <h3 className="mb-4 font-medium">Brand turnover (30 days)</h3>
        {turnoverQuery.data && turnoverQuery.data.length > 0 ? (
          <ul className="space-y-3 text-sm">
            {turnoverQuery.data.slice(0, 8).map((item) => (
              <li key={item.brandName} className="flex items-center justify-between border-b pb-2">
                <span>{item.brandName}</span>
                <span className="text-muted-foreground">
                  {item.unitsSold} units · {formatPrice(item.revenue)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No turnover data yet.</p>
        )}
      </div>
    </div>
  );
}
