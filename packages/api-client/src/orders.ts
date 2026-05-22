export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  paymentIntentId: string | null;
  shippingAddress: Record<string, unknown> | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderRequestContext {
  accessToken?: string | null;
}

function buildHeaders(context?: OrderRequestContext): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (context?.accessToken) {
    headers.Authorization = `Bearer ${context.accessToken}`;
  }
  return headers;
}

export function createOrdersClient(apiBaseUrl: string, getContext: () => OrderRequestContext) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        ...buildHeaders(getContext()),
        ...(init.headers ?? {}),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Orders request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    listOrders: () => request<Order[]>("/api/v1/orders"),
    getOrder: (orderId: string) => request<Order>(`/api/v1/orders/${orderId}`),
  };
}

export type OrdersClient = ReturnType<typeof createOrdersClient>;
