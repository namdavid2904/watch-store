"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BrandTurnoverTable } from "@/components/brand-turnover-table";
import { CacheStatsCard } from "@/components/cache-stats-card";
import { CheckoutErrorsChart } from "@/components/checkout-errors-chart";
import { InventoryHealthPanel } from "@/components/inventory-health-panel";
import { TelemetryPanel } from "@/components/telemetry-panel";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatPrice } from "@/lib/format";

type Tab = "overview" | "telemetry";

export default function DashboardPage() {
  const client = useAdminClient();
  const [tab, setTab] = useState<Tab>("overview");

  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => client.getDashboardStats(),
  });

  const telemetryQuery = useQuery({
    queryKey: ["admin", "telemetry-summary"],
    queryFn: () => client.getTelemetrySummary(),
    enabled: tab === "telemetry",
  });

  const stats = statsQuery.data;

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">Operations</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Store performance and system telemetry</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`rounded-md px-4 py-2 text-sm transition ${
              tab === "overview" ? "bg-primary text-primary-foreground" : "border border-border"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setTab("telemetry")}
            className={`rounded-md px-4 py-2 text-sm transition ${
              tab === "telemetry" ? "bg-primary text-primary-foreground" : "border border-border"
            }`}
          >
            Telemetry
          </button>
        </div>
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

      {tab === "overview" ? (
        <div className="space-y-6">
          <TelemetryPanel />
          <InventoryHealthPanel />
        </div>
      ) : (
        <div className="space-y-6">
          {telemetryQuery.data ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Orders created" value={String(telemetryQuery.data.ordersCreated)} />
              <StatCard label="Checkout failures" value={String(telemetryQuery.data.checkoutFailures)} />
              <StatCard label="Inventory conflicts" value={String(telemetryQuery.data.inventoryConflicts)} />
              <StatCard
                label="Cache hit ratio"
                value={`${(telemetryQuery.data.cacheHitRatio * 100).toFixed(1)}%`}
              />
            </div>
          ) : null}
          <div className="grid gap-6 lg:grid-cols-2">
            <CheckoutErrorsChart />
            <CacheStatsCard />
          </div>
          <BrandTurnoverTable />
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="border-border luxury-surface rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}
