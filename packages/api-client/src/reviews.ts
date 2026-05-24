export interface Review {
  id: string;
  productId: string;
  userId: string;
  reviewerName: string;
  rating: number;
  title: string | null;
  body: string;
  wristSizeMm: number | null;
  caseFit: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewPage {
  content: Review[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  averageRating: number;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  body: string;
  wristSizeMm?: number;
  caseFit?: string;
}

export interface ReviewRequestContext {
  accessToken?: string | null;
}

function buildHeaders(context?: ReviewRequestContext, withJson = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (withJson) {
    headers["Content-Type"] = "application/json";
  }
  if (context?.accessToken) {
    headers.Authorization = `Bearer ${context.accessToken}`;
  }
  return headers;
}

export function createReviewsClient(apiBaseUrl: string, getContext: () => ReviewRequestContext) {
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
      throw new Error(`Reviews request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    listReviews: (slug: string, page = 0, size = 10) =>
      request<ReviewPage>(`/api/v1/products/${slug}/reviews?page=${page}&size=${size}`, {
        next: { revalidate: 60 },
      } as RequestInit & { next?: { revalidate?: number } }),

    createReview: (slug: string, body: CreateReviewRequest) =>
      request<Review>(`/api/v1/products/${slug}/reviews`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    checkEligibility: (slug: string) =>
      request<{ canReview: boolean }>(`/api/v1/products/${slug}/reviews/eligibility`),
  };
}

export type ReviewsClient = ReturnType<typeof createReviewsClient>;
