"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatPrice } from "@/lib/format";

export function BrandTurnoverTable() {
  const client = useAdminClient();
  const query = useQuery({
    queryKey: ["admin", "brand-turnover"],
    queryFn: () => client.getBrandTurnover(30),
  });

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <h3 className="font-medium">High-turnover brands</h3>
      </div>
      <table className="min-w-full text-sm">
        <thead className="bg-muted/30 text-left">
          <tr>
            <th className="px-4 py-2">Brand</th>
            <th className="px-4 py-2">Units</th>
            <th className="px-4 py-2">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {query.data?.map((item) => (
            <tr key={item.brandName} className="border-border/60 border-t">
              <td className="px-4 py-2">{item.brandName}</td>
              <td className="px-4 py-2">{item.unitsSold}</td>
              <td className="px-4 py-2">{formatPrice(item.revenue)}</td>
            </tr>
          )) ?? (
            <tr>
              <td colSpan={3} className="text-muted-foreground px-4 py-6 text-center">
                Loading brand turnover...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
