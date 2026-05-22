export interface CheckoutLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutInitiateResponse {
  checkoutId: string;
  totalAmount: number;
  items: CheckoutLineItem[];
  expiresAtEpochSeconds: number;
}

export interface CheckoutConfirmRequest {
  checkoutId: string;
  shippingAddress: Record<string, string>;
}

export interface CheckoutConfirmResponse {
  orderId: string;
  status: string;
  totalAmount: number;
  paymentIntentId: string;
  paymentClientSecret: string;
}

export interface CheckoutRequestContext {
  accessToken?: string | null;
  cartSessionId?: string | null;
}

function buildHeaders(context?: CheckoutRequestContext): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (context?.accessToken) {
    headers.Authorization = `Bearer ${context.accessToken}`;
  }
  if (context?.cartSessionId) {
    headers["X-Cart-Session-Id"] = context.cartSessionId;
  }
  return headers;
}

async function parseError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as { message?: string };
    return new Error(body.message ?? `Checkout request failed: ${response.status}`);
  } catch {
    return new Error(`Checkout request failed: ${response.status}`);
  }
}

export function createCheckoutClient(apiBaseUrl: string, getContext: () => CheckoutRequestContext) {
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
      throw await parseError(response);
    }

    return response.json() as Promise<T>;
  }

  return {
    initiate: () =>
      request<CheckoutInitiateResponse>("/api/v1/checkout/initiate", {
        method: "POST",
      }),
    confirm: (body: CheckoutConfirmRequest) =>
      request<CheckoutConfirmResponse>("/api/v1/checkout/confirm", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  };
}

export type CheckoutClient = ReturnType<typeof createCheckoutClient>;
