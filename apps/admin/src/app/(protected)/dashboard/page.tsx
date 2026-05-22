"use client";

import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatPrice } from "@/lib/format";

export default function DashboardPage() {
  const client = useAdminClient();

  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => client.getDashboardStats(),
  });

  const chartQuery = useQuery({
    queryKey: ["admin", "sales-chart"],
    queryFn: () => client.getSalesChart(30),
  });

  if (statsQuery.isLoading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  const stats = statsQuery.data;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Store performance overview</p>
      </div>

      {stats ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total revenue" value={formatPrice(Number(stats.totalRevenue))} />
          <StatCard label="Total orders" value={String(stats.totalOrders)} />
          <StatCard label="Pending orders" value={String(stats.pendingOrders)} />
          <StatCard label="Products" value={String(stats.totalProducts)} />
          <StatCard label="Low stock items" value={String(stats.lowStockProducts)} />
          <StatCard label="New enquiries" value={String(stats.newEnquiries)} />
        </div>
      ) : null}

      <div className="border-border rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">Sales (last 30 days)</h2>
        <div className="h-72">
          {chartQuery.data ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartQuery.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">Loading chart...</p>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="border-border rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}
