"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@watch-store/ui";
import type { Product } from "@watch-store/api-client";
import { useState } from "react";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatPrice } from "@/lib/format";

export default function ProductsPage() {
  const client = useAdminClient();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => client.listProducts(),
  });

  const brandsQuery = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: () => client.listBrands(),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => client.listCategories(),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => client.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => client.uploadProductImage(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const selected = productsQuery.data?.content.find((product) => product.id === selectedId) ?? null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage catalog items and images</p>
        </div>
      </div>

      <CreateProductForm
        brands={brandsQuery.data ?? []}
        categories={categoriesQuery.data ?? []}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["admin", "products"] })}
      />

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsQuery.data?.content.map((product) => (
              <tr key={product.id} className="border-border border-t">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.brandName}</td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">{product.quantityAvailable}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedId(product.id)}>
                      Edit
                    </Button>
                    <Input
                      type="file"
                      accept="image/*"
                      className="max-w-40"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          uploadImage.mutate({ id: product.id, file });
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete ${product.name}?`)) {
                          deleteProduct.mutate(product.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <EditProductForm
          product={selected}
          brands={brandsQuery.data ?? []}
          categories={categoriesQuery.data ?? []}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
            setSelectedId(null);
          }}
          onCancel={() => setSelectedId(null)}
        />
      ) : null}
    </section>
  );
}

function CreateProductForm({
  brands,
  categories,
  onCreated,
}: {
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  onCreated: () => void;
}) {
  const client = useAdminClient();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "1000",
    brandId: brands[0]?.id ?? "",
    categoryId: categories[0]?.id ?? "",
    initialStock: "1",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await client.createProduct({
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      brandId: form.brandId,
      categoryId: form.categoryId,
      movementType: "AUTOMATIC",
      initialStock: Number(form.initialStock),
    });
    setForm({ name: "", slug: "", price: "1000", brandId: brands[0]?.id ?? "", categoryId: categories[0]?.id ?? "", initialStock: "1" });
    onCreated();
  }

  return (
    <form className="border-border grid gap-3 rounded-lg border p-4 md:grid-cols-3" onSubmit={(event) => void handleSubmit(event)}>
      <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
      <Input placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
      <select
        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        value={form.brandId}
        onChange={(e) => setForm({ ...form, brandId: e.target.value })}
      >
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
      <select
        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        value={form.categoryId}
        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <Input
        placeholder="Initial stock"
        value={form.initialStock}
        onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
        required
      />
      <Button type="submit" className="md:col-span-3 md:w-fit">
        Add product
      </Button>
    </form>
  );
}

function EditProductForm({
  product,
  brands,
  categories,
  onSaved,
  onCancel,
}: {
  product: Product;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const client = useAdminClient();
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    price: String(product.price),
    brandId: product.brandId,
    categoryId: product.categoryId,
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await client.updateProduct(product.id, {
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      brandId: form.brandId,
      categoryId: form.categoryId,
    });
    onSaved();
  }

  return (
    <form className="border-border space-y-3 rounded-lg border p-4" onSubmit={(event) => void handleSubmit(event)}>
      <h2 className="text-lg font-semibold">Edit {product.name}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <select
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          value={form.brandId}
          onChange={(e) => setForm({ ...form, brandId: e.target.value })}
        >
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save changes</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
