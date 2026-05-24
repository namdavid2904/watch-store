export interface CreateEnquiryRequest {
  name: string;
  email: string;
  mobile?: string;
  message: string;
  productId?: string;
  subject?: string;
  category?: string;
}

export interface EnquirySubmission {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export function createEnquiriesClient(apiBaseUrl: string) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Enquiry request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    createEnquiry: (body: CreateEnquiryRequest) =>
      request<EnquirySubmission>("/api/v1/enquiries", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  };
}

export type EnquiriesClient = ReturnType<typeof createEnquiriesClient>;
