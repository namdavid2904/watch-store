"use client";

import {
  createAuthClient,
  clearAuthSession,
  getAccessToken,
  getAuthSession,
  setAuthSession,
  type AuthClient,
  type PublicAuthResponse,
} from "@watch-store/auth";
import { createCartClient } from "@watch-store/api-client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCartSessionId } from "@/lib/cart-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface AuthContextValue {
  client: AuthClient;
  user: ReturnType<typeof getAuthSession>;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  completeOAuthLogin: (response: PublicAuthResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function mergeGuestCartAfterAuth() {
  const cartClient = createCartClient(API_URL, () => ({
    accessToken: getAccessToken(),
    cartSessionId: getCartSessionId(),
  }));
  await cartClient.mergeGuestCart();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(getAuthSession());
  const [loading, setLoading] = useState(true);
  const client = useMemo(() => createAuthClient(API_URL), []);

  useEffect(() => {
    client.refresh().then((ok) => {
      setUser(ok ? getAuthSession() : null);
      setLoading(false);
    });
  }, [client]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await client.login({ email, password }, getCartSessionId());
      setAuthSession(response);
      setUser(getAuthSession());
    },
    [client]
  );

  const register = useCallback(
    async (input: { email: string; password: string; firstName: string; lastName: string }) => {
      const response = await client.register(input, getCartSessionId());
      setAuthSession(response);
      setUser(getAuthSession());
    },
    [client]
  );

  const logout = useCallback(async () => {
    try {
      await client.logout();
    } finally {
      clearAuthSession();
      setUser(null);
    }
  }, [client]);

  const completeOAuthLogin = useCallback(async (response: PublicAuthResponse) => {
    setAuthSession(response);
    setUser(getAuthSession());
    try {
      await mergeGuestCartAfterAuth();
    } catch {
      // Guest cart merge is best-effort after OAuth.
    }
  }, []);

  const value = useMemo(
    () => ({ client, user, loading, login, register, logout, completeOAuthLogin }),
    [client, user, loading, login, register, logout, completeOAuthLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
