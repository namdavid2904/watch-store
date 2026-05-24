"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "@/hooks/use-admin-client";

export function InventoryHealthPanel() {
  const client = useAdminClient();
  const query = useQuery({
    queryKey: ["admin", "inventory-health"],
    queryFn: () => client.getInventoryHealth(),
  });

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <h3 className="font-medium">Inventory health forecast</h3>
      </div>
      <table className="min-w-full text-sm">
        <thead className="bg-muted/30 text-left">
          <tr>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Sold (7d)</th>
            <th className="px-4 py-2">Days left</th>
          </tr>
        </thead>
        <tbody>
          {query.data?.slice(0, 10).map((item) => (
            <tr key={item.productId} className="border-border/60 border-t">
              <td className="px-4 py-2">{item.productName}</td>
              <td className="px-4 py-2">{item.quantityAvailable}</td>
              <td className="px-4 py-2">{item.unitsSoldLast7Days}</td>
              <td className="px-4 py-2">{item.daysUntilStockout >= 999 ? "—" : item.daysUntilStockout}</td>
            </tr>
          )) ?? (
            <tr>
              <td colSpan={4} className="text-muted-foreground px-4 py-6 text-center">
                Loading inventory health...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
