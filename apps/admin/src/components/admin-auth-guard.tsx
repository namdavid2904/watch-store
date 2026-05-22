"use client";

import { createAuthClient, clearAuthSession, getAuthSession } from "@watch-store/auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const client = useMemo(() => createAuthClient(API_URL), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      const refreshed = await client.refresh();
      if (!refreshed) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await client.getProfile();
        if (profile.role !== "ADMIN") {
          clearAuthSession();
          router.replace("/login?error=Access%20denied");
          return;
        }
        setReady(true);
      } catch {
        clearAuthSession();
        router.replace("/login");
      }
    }

    verifyAdmin();
  }, [client, router]);

  if (!ready) {
    return <p className="text-muted-foreground">Verifying admin access...</p>;
  }

  return <>{children}</>;
}

export function useAdminSession() {
  return getAuthSession();
}
