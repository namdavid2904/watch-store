"use client";

import { Button, Input } from "@watch-store/ui";
import type { Brand, Category } from "@watch-store/api-client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo } from "react";

interface FilterPanelProps {
  brands: Brand[];
  categories: Category[];
}

export function FilterPanel({ brands, categories }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaults = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      movementType: searchParams.get("movementType") ?? "",
      brandId: searchParams.get("brandId") ?? "",
      categoryId: searchParams.get("categoryId") ?? "",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      caseMaterial: searchParams.get("caseMaterial") ?? "",
      sort: searchParams.get("sort") ?? "createdAt,desc",
    }),
    [searchParams]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value);
      }
    }

    router.push(`/shop?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/shop");
  }

  return (
    <form className="border-border space-y-4 rounded-lg border p-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Filters</h2>
        <Input name="search" placeholder="Search watches" defaultValue={defaults.search} />
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Movement</span>
        <select
          name="movementType"
          defaultValue={defaults.movementType}
          className="border-input bg-background h-10 w-full rounded-md border px-3"
        >
          <option value="">Any</option>
          <option value="AUTOMATIC">Automatic</option>
          <option value="QUARTZ">Quartz</option>
          <option value="MANUAL">Manual</option>
        </select>
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Brand</span>
        <select
          name="brandId"
          defaultValue={defaults.brandId}
          className="border-input bg-background h-10 w-full rounded-md border px-3"
        >
          <option value="">Any</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Category</span>
        <select
          name="categoryId"
          defaultValue={defaults.categoryId}
          className="border-input bg-background h-10 w-full rounded-md border px-3"
        >
          <option value="">Any</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Min Price</span>
          <Input name="minPrice" type="number" min="0" defaultValue={defaults.minPrice} />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Max Price</span>
          <Input name="maxPrice" type="number" min="0" defaultValue={defaults.maxPrice} />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Case Material</span>
        <Input name="caseMaterial" placeholder="e.g. Oystersteel" defaultValue={defaults.caseMaterial} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Sort</span>
        <select
          name="sort"
          defaultValue={defaults.sort}
          className="border-input bg-background h-10 w-full rounded-md border px-3"
        >
          <option value="createdAt,desc">Newest</option>
          <option value="price,asc">Price: Low to High</option>
          <option value="price,desc">Price: High to Low</option>
          <option value="name,asc">Name: A-Z</option>
        </select>
      </label>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Apply Filters
        </Button>
        <Button type="button" variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </form>
  );
}
