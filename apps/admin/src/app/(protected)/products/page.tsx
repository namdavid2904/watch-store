"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Skeleton } from "@watch-store/ui";
import type { Product } from "@watch-store/api-client";
import { useState } from "react";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatPrice } from "@/lib/format";

export default function ProductsPage() {
  const client = useAdminClient();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    onSuccess: () => {
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (err) => {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    },
  });

  const selected = productsQuery.data?.content.find((product) => product.id === selectedId) ?? null;
  const isLoading = productsQuery.isLoading || brandsQuery.isLoading || categoriesQuery.isLoading;

  return (
    <section className="space-y-8">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">Catalog</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage catalog items and product imagery</p>
      </div>

      {uploadError ? (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      ) : null}

      <CreateProductForm
        brands={brandsQuery.data ?? []}
        categories={categoriesQuery.data ?? []}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["admin", "products"] })}
      />

      <Card className="luxury-surface overflow-hidden border-border/80">
        <CardHeader className="border-border/60 border-b pb-4">
          <CardTitle className="text-base font-medium">All products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="mb-3 h-12 w-full" />
              ))}
            </div>
          ) : productsQuery.data?.content.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-sm">No products yet. Create your first item above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/30 text-left">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Name</th>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Brand</th>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Price</th>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Stock</th>
                    <th className="text-muted-foreground px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsQuery.data?.content.map((product) => (
                    <tr key={product.id} className="border-border/60 border-t transition hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="text-muted-foreground px-4 py-3">{product.brandName}</td>
                      <td className="px-4 py-3">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={product.quantityAvailable > 0 ? "secondary" : "outline"}>
                          {product.quantityAvailable}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedId(product.id)}>
                            Edit
                          </Button>
                          <Input
                            type="file"
                            accept="image/*"
                            className="max-w-40"
                            disabled={uploadImage.isPending}
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
          )}
        </CardContent>
      </Card>

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
    <Card className="border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">Add product</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={(event) => void handleSubmit(event)}>
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
      </CardContent>
    </Card>
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
    <Card className="border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">Edit {product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
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
      </CardContent>
    </Card>
  );
}
