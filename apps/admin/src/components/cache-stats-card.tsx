"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "@/hooks/use-admin-client";

export function CacheStatsCard() {
  const client = useAdminClient();
  const query = useQuery({
    queryKey: ["admin", "cache-stats"],
    queryFn: () => client.getCacheStats(),
  });

  const stats = query.data;

  return (
    <div className="border-border rounded-lg border p-4">
      <h3 className="mb-4 font-medium">Catalog cache telemetry</h3>
      {stats ? (
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Hits</dt>
            <dd className="text-2xl font-semibold">{stats.hits}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Misses</dt>
            <dd className="text-2xl font-semibold">{stats.misses}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Hit ratio</dt>
            <dd className="text-2xl font-semibold">{(stats.hitRatio * 100).toFixed(1)}%</dd>
          </div>
        </dl>
      ) : (
        <p className="text-muted-foreground text-sm">Loading cache stats...</p>
      )}
    </div>
  );
}
