import type { Product } from "@/lib/catalog";

const SPEC_ROWS: Array<{ label: string; key: keyof Product }> = [
  { label: "Movement", key: "movementType" },
  { label: "Movement Reference", key: "movementReference" },
  { label: "Power Reserve", key: "powerReserve" },
  { label: "Case Material", key: "caseMaterial" },
  { label: "Case Dimension", key: "caseDimension" },
  { label: "Case Thickness", key: "caseThickness" },
  { label: "Water Resistance", key: "waterResistance" },
  { label: "Color", key: "color" },
  { label: "Category", key: "categoryName" },
];

export function ProductSpecsTable({ product }: { product: Product }) {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <tbody>
          {SPEC_ROWS.map(({ label, key }) => (
            <tr key={key} className="border-border border-t first:border-t-0">
              <th className="bg-muted/40 w-1/3 px-4 py-3 text-left font-medium">{label}</th>
              <td className="px-4 py-3">{String(product[key] ?? "—")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
