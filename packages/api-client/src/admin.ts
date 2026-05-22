import type { Brand, Category, MovementType, Product, ProductPage } from "./catalog";
import type { Order, OrderStatus } from "./orders";

export interface AdminRequestContext {
  accessToken?: string | null;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  newEnquiries: number;
}

export interface SalesChartPoint {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantityTotal: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
}

export type EnquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  brandId: string;
  categoryId: string;
  color?: string;
  movementType: MovementType;
  caseMaterial?: string;
  caseDimension?: string;
  waterResistance?: string;
  caseThickness?: string;
  powerReserve?: string;
  movementReference?: string;
  initialStock: number;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  brandId?: string;
  categoryId?: string;
  color?: string;
  movementType?: MovementType;
  caseMaterial?: string;
  caseDimension?: string;
  waterResistance?: string;
  caseThickness?: string;
  powerReserve?: string;
  movementReference?: string;
}

function buildHeaders(context?: AdminRequestContext, withJson = false, multipart = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (withJson && !multipart) {
    headers["Content-Type"] = "application/json";
  }
  if (context?.accessToken) {
    headers.Authorization = `Bearer ${context.accessToken}`;
  }
  return headers;
}

export function createAdminClient(apiBaseUrl: string, getContext: () => AdminRequestContext) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const multipart = init.body instanceof FormData;
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        ...buildHeaders(getContext(), init.body !== undefined && !multipart, multipart),
        ...(init.headers ?? {}),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Admin request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  return {
    getDashboardStats: () => request<DashboardStats>("/api/v1/admin/dashboard/stats"),
    getSalesChart: (days = 30) => request<SalesChartPoint[]>(`/api/v1/admin/dashboard/sales-chart?days=${days}`),
    listInventory: (lowStock?: boolean) =>
      request<InventoryItem[]>(`/api/v1/admin/inventory${lowStock ? "?lowStock=true" : ""}`),
    adjustInventory: (productId: string, delta: number) =>
      request<InventoryItem>(`/api/v1/admin/inventory/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ delta }),
      }),
    listProducts: (page = 0, size = 100) =>
      request<ProductPage>(`/api/v1/products?page=${page}&size=${size}`),
    createProduct: (body: CreateProductRequest) =>
      request<Product>("/api/v1/admin/products", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    updateProduct: (id: string, body: UpdateProductRequest) =>
      request<Product>(`/api/v1/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    deleteProduct: (id: string) =>
      request<void>(`/api/v1/admin/products/${id}`, {
        method: "DELETE",
      }),
    uploadProductImage: (id: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<Product>(`/api/v1/admin/products/${id}/images`, {
        method: "POST",
        body: formData,
      });
    },
    listBrands: () => request<Brand[]>("/api/v1/admin/brands"),
    createBrand: (body: { name: string; slug: string }) =>
      request<Brand>("/api/v1/admin/brands", { method: "POST", body: JSON.stringify(body) }),
    updateBrand: (id: string, body: { name?: string; slug?: string }) =>
      request<Brand>(`/api/v1/admin/brands/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteBrand: (id: string) => request<void>(`/api/v1/admin/brands/${id}`, { method: "DELETE" }),
    listCategories: () => request<Category[]>("/api/v1/admin/categories"),
    createCategory: (body: { name: string; slug: string }) =>
      request<Category>("/api/v1/admin/categories", { method: "POST", body: JSON.stringify(body) }),
    updateCategory: (id: string, body: { name?: string; slug?: string }) =>
      request<Category>(`/api/v1/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteCategory: (id: string) => request<void>(`/api/v1/admin/categories/${id}`, { method: "DELETE" }),
    listOrders: () => request<Order[]>("/api/v1/admin/orders"),
    getOrder: (orderId: string) => request<Order>(`/api/v1/admin/orders/${orderId}`),
    updateOrderStatus: (orderId: string, status: OrderStatus) =>
      request<Order>(`/api/v1/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify(status),
      }),
    listEnquiries: (status?: EnquiryStatus) =>
      request<Enquiry[]>(`/api/v1/admin/enquiries${status ? `?status=${status}` : ""}`),
    updateEnquiryStatus: (id: string, status: EnquiryStatus) =>
      request<Enquiry>(`/api/v1/admin/enquiries/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(status),
      }),
    listUsers: () => request<AdminUser[]>("/api/v1/admin/users"),
    updateUserRole: (userId: string, role: AdminUser["role"]) =>
      request<AdminUser>(`/api/v1/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      }),
  };
}

export type AdminClient = ReturnType<typeof createAdminClient>;
