import type { PublicAuthResponse, UserProfile } from "./types";

let accessToken: string | null = null;
let session: Omit<PublicAuthResponse, "accessToken"> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getAuthSession() {
  return session;
}

export function setAuthSession(response: PublicAuthResponse): void {
  accessToken = response.accessToken;
  session = {
    userId: response.userId,
    email: response.email,
    role: response.role,
  };
}

export function clearAuthSession(): void {
  accessToken = null;
  session = null;
}

export function createAuthClient(apiBaseUrl: string) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });

    if (response.status === 401 && path !== "/api/v1/auth/refresh") {
      const refreshed = await refreshSession();
      if (refreshed) {
        return request<T>(path, init);
      }
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async function refreshSession(): Promise<boolean> {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      clearAuthSession();
      return false;
    }

    const data = (await response.json()) as PublicAuthResponse;
    setAuthSession(data);
    return true;
  }

  return {
    register: (body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) =>
      request<PublicAuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<PublicAuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    logout: () =>
      request<void>("/api/v1/auth/logout", {
        method: "POST",
      }),
    refresh: refreshSession,
    getProfile: () => request<UserProfile>("/api/v1/account/profile"),
    getGoogleOAuthUrl: () => `${apiBaseUrl}/oauth2/authorization/google`,
  };
}

export type AuthClient = ReturnType<typeof createAuthClient>;
