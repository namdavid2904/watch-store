export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  imageUrl: string | null;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  warnings: string[];
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface CartRequestContext {
  accessToken?: string | null;
  cartSessionId?: string | null;
}

function buildHeaders(context?: CartRequestContext, withJson = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (withJson) {
    headers["Content-Type"] = "application/json";
  }
  if (context?.accessToken) {
    headers.Authorization = `Bearer ${context.accessToken}`;
  }
  if (context?.cartSessionId) {
    headers["X-Cart-Session-Id"] = context.cartSessionId;
  }
  return headers;
}

export function createCartClient(apiBaseUrl: string, getContext: () => CartRequestContext) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        ...buildHeaders(getContext(), init.body !== undefined),
        ...(init.headers ?? {}),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Cart request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  return {
    getCart: () => request<Cart>("/api/v1/cart"),
    addItem: (body: AddCartItemRequest) =>
      request<Cart>("/api/v1/cart/items", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    updateItem: (productId: string, quantity: number) =>
      request<Cart>(`/api/v1/cart/items/${productId}?quantity=${quantity}`, {
        method: "PUT",
      }),
    removeItem: (productId: string) =>
      request<Cart>(`/api/v1/cart/items/${productId}`, {
        method: "DELETE",
      }),
    clearCart: () =>
      request<Cart>("/api/v1/cart", {
        method: "DELETE",
      }),
    mergeGuestCart: () =>
      request<Cart>("/api/v1/cart/merge", {
        method: "POST",
      }),
  };
}

export type CartClient = ReturnType<typeof createCartClient>;
