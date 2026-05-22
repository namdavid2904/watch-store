export type MovementType = "AUTOMATIC" | "QUARTZ" | "MANUAL";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  color: string | null;
  images: string[];
  movementType: MovementType;
  caseMaterial: string | null;
  caseDimension: string | null;
  waterResistance: string | null;
  caseThickness: string | null;
  powerReserve: string | null;
  movementReference: string | null;
  quantityAvailable: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPage {
  content: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSearchParams {
  movementType?: MovementType;
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  caseMaterial?: string;
  color?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

function buildQuery(params: ProductSearchParams = {}): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export function createCatalogClient(apiBaseUrl: string) {
  async function request<T>(path: string, init?: NextFetchInit): Promise<T> {
    const requestInit: NextFetchInit = {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      next: init?.next ?? { revalidate: 60 },
    };
    const response = await fetch(`${apiBaseUrl}${path}`, requestInit as RequestInit);

    if (!response.ok) {
      throw new Error(`Catalog request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    listProducts: (params?: ProductSearchParams) =>
      request<ProductPage>(`/api/v1/products${buildQuery(params)}`),
    getProduct: (idOrSlug: string) => request<Product>(`/api/v1/products/${idOrSlug}`),
    listBrands: () => request<Brand[]>("/api/v1/brands"),
    listCategories: () => request<Category[]>("/api/v1/categories"),
  };
}

export type CatalogClient = ReturnType<typeof createCatalogClient>;
