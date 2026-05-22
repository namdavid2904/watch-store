import { createCatalogClient, type ProductSearchParams } from "@watch-store/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const catalogClient = createCatalogClient(API_URL);

export type { Product, ProductPage, Brand, Category, ProductSearchParams } from "@watch-store/api-client";

export function parseProductSearchParams(
  params: Record<string, string | string[] | undefined>
): ProductSearchParams {
  const value = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  return {
    movementType: value("movementType") as ProductSearchParams["movementType"],
    brandId: value("brandId"),
    categoryId: value("categoryId"),
    minPrice: value("minPrice") ? Number(value("minPrice")) : undefined,
    maxPrice: value("maxPrice") ? Number(value("maxPrice")) : undefined,
    caseMaterial: value("caseMaterial"),
    color: value("color"),
    search: value("search"),
    page: value("page") ? Number(value("page")) : 0,
    size: value("size") ? Number(value("size")) : 12,
    sort: value("sort") ?? "createdAt,desc",
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
