"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@watch-store/ui";
import { useState } from "react";
import { useAdminClient } from "@/hooks/use-admin-client";

export default function InventoryPage() {
  const client = useAdminClient();
  const queryClient = useQueryClient();
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});

  const inventoryQuery = useQuery({
    queryKey: ["admin", "inventory", lowStockOnly],
    queryFn: () => client.listInventory(lowStockOnly),
  });

  const adjustStock = useMutation({
    mutationFn: ({ productId, delta }: { productId: string; delta: number }) =>
      client.adjustInventory(productId, delta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Monitor stock levels and apply manual adjustments</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Low stock only (&lt;= 5)
        </label>
      </div>

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {inventoryQuery.data?.map((item) => (
              <tr key={item.productId} className="border-border border-t">
                <td className="px-4 py-3">{item.productName}</td>
                <td className={`px-4 py-3 ${item.quantityAvailable <= 5 ? "font-semibold text-amber-700" : ""}`}>
                  {item.quantityAvailable}
                </td>
                <td className="px-4 py-3">{item.quantityReserved}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Input
                      className="h-9 w-24"
                      placeholder="+/- qty"
                      value={adjustments[item.productId] ?? ""}
                      onChange={(e) =>
                        setAdjustments((current) => ({ ...current, [item.productId]: e.target.value }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const delta = Number(adjustments[item.productId] ?? 0);
                        if (!Number.isFinite(delta) || delta === 0) return;
                        adjustStock.mutate({ productId: item.productId, delta });
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
